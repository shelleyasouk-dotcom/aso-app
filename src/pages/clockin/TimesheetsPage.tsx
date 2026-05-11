import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, Check, X, LogIn, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import type { ClockRecord, Profile, School } from '../../types'
import { ROLE_LABELS } from '../../lib/roles'

interface EnrichedRecord extends ClockRecord {
  staff?: Profile
  school?: School
}

interface StaffAtSchool {
  school: School
  members: Profile[]
}

interface ActiveSession {
  staff_id: string
  record_id: string
  clock_in: string
}

type Tab = 'live' | 'history'

function toLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatDuration(clockIn: string, clockOut: string | null) {
  if (!clockOut) return 'No clock-out'
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  if (ms < 0) return 'Invalid'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}
function elapsed(clockIn: string) {
  const ms = Date.now() - new Date(clockIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const DT_CLASS = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

// ─── Live tab ─────────────────────────────────────────────────────────────────

function LiveTab({ staffAtSchools, activeSessions, onClockIn, onClockOut, busy }: {
  staffAtSchools: StaffAtSchool[]
  activeSessions: ActiveSession[]
  onClockIn: (staffId: string, schoolId: string) => Promise<void>
  onClockOut: (recordId: string) => Promise<void>
  busy: string | null
}) {
  if (staffAtSchools.length === 0) {
    return <Card><p className="text-sm text-gray-500 text-center py-4">No schools or staff assigned yet.</p></Card>
  }

  return (
    <div className="flex flex-col gap-4">
      {staffAtSchools.map(({ school, members }) => (
        <Card key={school.id}>
          <p className="font-bold text-[#1a3a6b] mb-1">{school.name}</p>
          <p className="text-xs text-gray-400 mb-3">{school.session_day} · {school.session_time}</p>
          <div className="flex flex-col gap-2">
            {members.map(member => {
              const session = activeSessions.find(s => s.staff_id === member.id)
              const isIn = !!session
              const isBusy = busy === member.id

              return (
                <div key={member.id} className={`flex items-center gap-3 p-3 rounded-xl ${isIn ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isIn ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{member.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {isIn
                        ? `In since ${formatTime(session.clock_in)} · ${elapsed(session.clock_in)}`
                        : ROLE_LABELS[member.role]}
                    </p>
                  </div>
                  {isIn ? (
                    <button
                      onClick={() => onClockOut(session.record_id)}
                      disabled={isBusy}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-xl disabled:opacity-50"
                    >
                      <LogOut size={13} /> {isBusy ? '…' : 'Clock Out'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onClockIn(member.id, school.id)}
                      disabled={isBusy}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl disabled:opacity-50"
                    >
                      <LogIn size={13} /> {isBusy ? '…' : 'Clock In'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function TimesheetsPage() {
  const { profile } = useAuth()
  const isDirector = profile?.role === 'director'
  const canEdit = profile?.role === 'director' || profile?.role === 'area_lead'

  const [tab, setTab] = useState<Tab>('live')

  // Shared scope
  const [mySchoolIds, setMySchoolIds] = useState<string[] | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [staff, setStaff] = useState<Profile[]>([])

  // Live tab
  const [staffAtSchools, setStaffAtSchools] = useState<StaffAtSchool[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [liveBusy, setLiveBusy] = useState<string | null>(null)

  // History tab
  const [records, setRecords] = useState<EnrichedRecord[]>([])
  const [filterStaff, setFilterStaff] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ clock_in: '', clock_out: '', school_id: '' })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ staff_id: '', school_id: '', clock_in: '', clock_out: '' })
  const [saving, setSaving] = useState(false)

  // ── Resolve scope ────────────────────────────────────────────────────────────
  const initScope = useCallback(async () => {
    if (!profile) return
    if (isDirector) { setMySchoolIds(null); return }
    const { data } = await supabase
      .from('staff_school_assignments')
      .select('school_id')
      .eq('staff_id', profile.id)
    setMySchoolIds((data ?? []).map((r: { school_id: string }) => r.school_id))
  }, [profile, isDirector])

  const loadSchools = useCallback(async () => {
    if (isDirector) {
      const { data } = await supabase.from('schools').select('*').order('name')
      setSchools(data ?? [])
    } else if (mySchoolIds !== null) {
      if (mySchoolIds.length === 0) { setSchools([]); return }
      const { data } = await supabase.from('schools').select('*').in('id', mySchoolIds).order('name')
      setSchools(data ?? [])
    }
  }, [isDirector, mySchoolIds])

  const loadStaff = useCallback(async () => {
    if (isDirector) {
      const { data } = await supabase.from('profiles').select('*').order('full_name')
      setStaff(data ?? [])
    } else if (mySchoolIds !== null) {
      if (mySchoolIds.length === 0) { setStaff([]); return }
      const { data } = await supabase
        .from('staff_school_assignments')
        .select('staff:profiles(*)')
        .in('school_id', mySchoolIds)
      const seen = new Set<string>()
      const members: Profile[] = []
      for (const row of (data ?? []) as unknown as { staff: Profile }[]) {
        if (row.staff && !seen.has(row.staff.id)) {
          seen.add(row.staff.id)
          members.push(row.staff)
        }
      }
      members.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setStaff(members)
    }
  }, [isDirector, mySchoolIds])

  // ── Live tab data ─────────────────────────────────────────────────────────────
  const loadLive = useCallback(async () => {
    if (schools.length === 0) return

    // Build per-school staff lists
    const schoolIds = schools.map(s => s.id)
    const { data: assignments } = await supabase
      .from('staff_school_assignments')
      .select('school_id, staff:profiles(*)')
      .in('school_id', schoolIds)

    const bySchool: Record<string, Profile[]> = {}
    for (const row of (assignments ?? []) as unknown as { school_id: string; staff: Profile }[]) {
      if (!bySchool[row.school_id]) bySchool[row.school_id] = []
      if (row.staff && !bySchool[row.school_id].find(m => m.id === row.staff.id)) {
        bySchool[row.school_id].push(row.staff)
      }
    }

    const result: StaffAtSchool[] = schools
      .map(school => ({
        school,
        members: (bySchool[school.id] ?? []).sort((a, b) => a.full_name.localeCompare(b.full_name)),
      }))
      .filter(s => s.members.length > 0)

    setStaffAtSchools(result)

    // Active sessions for all relevant staff IDs
    const allStaffIds = [...new Set(Object.values(bySchool).flat().map(m => m.id))]
    if (allStaffIds.length > 0) {
      const { data: active } = await supabase
        .from('clock_records')
        .select('id, staff_id, clock_in')
        .in('staff_id', allStaffIds)
        .is('clock_out', null)
      setActiveSessions(
        (active ?? []).map((r: { id: string; staff_id: string; clock_in: string }) => ({
          staff_id: r.staff_id,
          record_id: r.id,
          clock_in: r.clock_in,
        }))
      )
    }
  }, [schools])

  async function handleManualClockIn(staffId: string, schoolId: string) {
    setLiveBusy(staffId)
    await supabase.from('clock_records').insert({ staff_id: staffId, school_id: schoolId })
    await loadLive()
    setLiveBusy(null)
  }

  async function handleManualClockOut(recordId: string) {
    const session = activeSessions.find(s => s.record_id === recordId)
    if (session) setLiveBusy(session.staff_id)
    await supabase.from('clock_records').update({ clock_out: new Date().toISOString() }).eq('id', recordId)
    await loadLive()
    setLiveBusy(null)
  }

  // ── History tab data ──────────────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    if (!profile) return
    if (!isDirector && mySchoolIds === null) return

    let query = supabase
      .from('clock_records')
      .select('*, staff:profiles(*), school:schools(*)')
      .order('clock_in', { ascending: false })
      .limit(500)

    if (!isDirector && mySchoolIds !== null) {
      if (mySchoolIds.length === 0) { setRecords([]); setLoading(false); return }
      query = query.in('school_id', mySchoolIds)
    }
    if (filterStaff) query = query.eq('staff_id', filterStaff)

    const { data } = await query
    setRecords((data as EnrichedRecord[]) ?? [])
    setLoading(false)
  }, [profile, isDirector, mySchoolIds, filterStaff])

  function startEdit(rec: EnrichedRecord) {
    setEditingId(rec.id)
    setEditForm({
      clock_in: toLocal(rec.clock_in),
      clock_out: rec.clock_out ? toLocal(rec.clock_out) : '',
      school_id: rec.school_id ?? '',
    })
  }

  async function saveEdit(id: string) {
    if (!editForm.clock_in) return
    setSaving(true)
    await supabase.from('clock_records').update({
      clock_in: new Date(editForm.clock_in).toISOString(),
      clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : null,
      school_id: editForm.school_id,
    }).eq('id', id)
    await loadRecords()
    setEditingId(null)
    setSaving(false)
  }

  async function deleteRecord(id: string) {
    await supabase.from('clock_records').delete().eq('id', id)
    setRecords(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
  }

  async function addRecord() {
    if (!addForm.staff_id || !addForm.school_id || !addForm.clock_in) return
    setSaving(true)
    await supabase.from('clock_records').insert({
      staff_id: addForm.staff_id,
      school_id: addForm.school_id,
      clock_in: new Date(addForm.clock_in).toISOString(),
      clock_out: addForm.clock_out ? new Date(addForm.clock_out).toISOString() : null,
    })
    await loadRecords()
    setAddForm({ staff_id: '', school_id: '', clock_in: '', clock_out: '' })
    setShowAdd(false)
    setSaving(false)
  }

  // ── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => { initScope() }, [initScope])
  useEffect(() => {
    if (mySchoolIds !== undefined) { loadSchools(); loadStaff() }
  }, [mySchoolIds, loadSchools, loadStaff])
  useEffect(() => { if (schools.length > 0) loadLive() }, [schools, loadLive])
  useEffect(() => { loadRecords() }, [loadRecords])

  const grouped = records.reduce<Record<string, EnrichedRecord[]>>((acc, rec) => {
    if (!acc[rec.staff_id]) acc[rec.staff_id] = []
    acc[rec.staff_id].push(rec)
    return acc
  }, {})

  return (
    <Layout title="Timesheets" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {([['live', 'Live View'], ['history', 'History']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === key ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Live tab ─────────────────────────────────────────────────────── */}
        {tab === 'live' && (
          <LiveTab
            staffAtSchools={staffAtSchools}
            activeSessions={activeSessions}
            onClockIn={handleManualClockIn}
            onClockOut={handleManualClockOut}
            busy={liveBusy}
          />
        )}

        {/* ── History tab ──────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <>
            {canEdit && (
              <Button variant="primary" size="lg" fullWidth onClick={() => setShowAdd(!showAdd)}>
                <Plus size={20} /> Add Missing Clock Record
              </Button>
            )}

            {showAdd && (
              <Card>
                <h3 className="font-semibold text-[#1a3a6b] mb-4">Add Clock Record</h3>
                <div className="flex flex-col gap-3">
                  <Select label="Staff Member" value={addForm.staff_id}
                    onChange={e => setAddForm({ ...addForm, staff_id: e.target.value })}>
                    <option value="">Select staff member…</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </Select>
                  <Select label="School" value={addForm.school_id}
                    onChange={e => setAddForm({ ...addForm, school_id: e.target.value })}>
                    <option value="">Select school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Clock In</label>
                    <input type="datetime-local" className={DT_CLASS}
                      value={addForm.clock_in} onChange={e => setAddForm({ ...addForm, clock_in: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Clock Out (leave blank if still active)</label>
                    <input type="datetime-local" className={DT_CLASS}
                      value={addForm.clock_out} onChange={e => setAddForm({ ...addForm, clock_out: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
                    <Button onClick={addRecord} disabled={saving || !addForm.staff_id || !addForm.school_id || !addForm.clock_in} className="flex-1">
                      {saving ? 'Saving…' : 'Add Record'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
              <option value="">All staff</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>

            {loading ? (
              <p className="text-center text-gray-400 py-8">Loading…</p>
            ) : records.length === 0 ? (
              <Card><p className="text-gray-500 text-center py-4">No clock records found.</p></Card>
            ) : (
              Object.entries(grouped).map(([staffId, recs]) => {
                const member = recs[0].staff
                const totalMs = recs
                  .filter(r => r.clock_out)
                  .reduce((sum, r) => sum + (new Date(r.clock_out!).getTime() - new Date(r.clock_in).getTime()), 0)
                const totalHours = (totalMs / 3600000).toFixed(1)

                return (
                  <Card key={staffId}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-[#1a3a6b]">{member?.full_name}</p>
                        <Badge color="blue">{member ? ROLE_LABELS[member.role] : ''}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total logged</p>
                        <p className="font-bold text-[#1a3a6b]">{totalHours}h</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      {recs.map(rec => (
                        <div key={rec.id}>
                          {editingId === rec.id ? (
                            <div className="bg-[#f4f6f9] rounded-2xl p-3 flex flex-col gap-2 my-1">
                              <p className="text-xs font-bold text-[#1a3a6b] mb-1">Edit Record</p>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-600">School</label>
                                <select className={DT_CLASS} value={editForm.school_id}
                                  onChange={e => setEditForm({ ...editForm, school_id: e.target.value })}>
                                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-600">Clock In</label>
                                <input type="datetime-local" className={DT_CLASS}
                                  value={editForm.clock_in}
                                  onChange={e => setEditForm({ ...editForm, clock_in: e.target.value })} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-600">Clock Out</label>
                                <input type="datetime-local" className={DT_CLASS}
                                  value={editForm.clock_out}
                                  onChange={e => setEditForm({ ...editForm, clock_out: e.target.value })} />
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button onClick={() => setEditingId(null)}
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
                                  <X size={14} /> Cancel
                                </button>
                                <button onClick={() => saveEdit(rec.id)} disabled={saving}
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#1a3a6b] text-white text-sm font-medium">
                                  <Check size={14} /> {saving ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between py-2 border-t border-gray-100 gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {rec.school?.name ?? rec.location_override ?? '—'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(rec.clock_in)} · {formatTime(rec.clock_in)}
                                  {rec.clock_out
                                    ? ` – ${formatTime(rec.clock_out)}`
                                    : <span className="text-orange-500"> · No clock-out</span>}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge color={rec.clock_out ? 'green' : 'yellow'}>
                                  {formatDuration(rec.clock_in, rec.clock_out)}
                                </Badge>
                                {canEdit && (
                                  <>
                                    <button onClick={() => { startEdit(rec); setConfirmDeleteId(null) }}
                                      className="p-1.5 rounded-lg text-[#1a3a6b] hover:bg-blue-50">
                                      <Pencil size={14} />
                                    </button>
                                    {confirmDeleteId === rec.id ? (
                                      <button onClick={() => deleteRecord(rec.id)}
                                        className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">
                                        Confirm
                                      </button>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteId(rec.id)}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              })
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
