import { useState, useEffect, useCallback } from 'react'
import { LogIn, LogOut, RefreshCw, Pencil, Check, X, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import type { Profile, School, ClockRecord } from '../../types'
import { ROLE_LABELS } from '../../lib/roles'

interface StaffStatus {
  profile: Profile
  activeRecord: { id: string; clock_in: string } | null
}

interface SchoolGroup {
  school: School
  staff: StaffStatus[]
}

interface HistoryRecord extends ClockRecord {
  staff?: Profile
  school?: School
}

type Tab = 'live' | 'history'

function elapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function formatDuration(clockIn: string, clockOut: string | null) {
  if (!clockOut) return 'Active'
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  if (ms < 0) return '?'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}
function toLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const INPUT = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

export function SessionsPage() {
  const { profile } = useAuth()
  const canEdit = profile?.role === 'area_lead' || profile?.role === 'director'

  const [tab, setTab] = useState<Tab>('live')
  const [mySchoolIds, setMySchoolIds] = useState<string[]>([])
  const [schools, setSchools] = useState<School[]>([])

  // Live tab
  const [groups, setGroups] = useState<SchoolGroup[]>([])
  const [liveLoading, setLiveLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // History tab
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ clock_in: '', clock_out: '', school_id: '' })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ staff_id: '', school_id: '', clock_in: '', clock_out: '' })
  const [staffList, setStaffList] = useState<Profile[]>([])
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Load scope ────────────────────────────────────────────────────────────────
  const initScope = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('staff_school_assignments')
      .select('school_id')
      .eq('staff_id', profile.id)
    const ids = (data ?? []).map((r: { school_id: string }) => r.school_id)
    setMySchoolIds(ids)

    if (ids.length > 0) {
      const { data: sc } = await supabase.from('schools').select('*').in('id', ids).order('name')
      setSchools(sc ?? [])
    }
  }, [profile])

  // ── Live data ─────────────────────────────────────────────────────────────────
  const loadLive = useCallback(async (quiet = false) => {
    if (mySchoolIds.length === 0) { setLiveLoading(false); return }
    if (!quiet) setLiveLoading(true)
    else setRefreshing(true)

    // All staff assigned to my schools
    const { data: assignments } = await supabase
      .from('staff_school_assignments')
      .select('school_id, staff:profiles(*)')
      .in('school_id', mySchoolIds)

    // All active clock records for those staff
    const allStaffIds = [...new Set(
      ((assignments ?? []) as unknown as { staff: Profile }[])
        .filter(a => a.staff)
        .map(a => a.staff.id)
    )]

    let activeSessions: { id: string; staff_id: string; clock_in: string }[] = []
    if (allStaffIds.length > 0) {
      const { data: active } = await supabase
        .from('clock_records')
        .select('id, staff_id, clock_in')
        .in('staff_id', allStaffIds)
        .is('clock_out', null)
      activeSessions = (active ?? []) as typeof activeSessions
    }

    // Build school groups
    const bySchool: Record<string, StaffStatus[]> = {}
    for (const row of (assignments ?? []) as unknown as { school_id: string; staff: Profile }[]) {
      if (!row.staff) continue
      if (!bySchool[row.school_id]) bySchool[row.school_id] = []
      if (!bySchool[row.school_id].find(s => s.profile.id === row.staff.id)) {
        const active = activeSessions.find(s => s.staff_id === row.staff.id)
        bySchool[row.school_id].push({
          profile: row.staff,
          activeRecord: active ? { id: active.id, clock_in: active.clock_in } : null,
        })
      }
    }

    // Sort each group: clocked-in first, then alphabetical
    for (const id of Object.keys(bySchool)) {
      bySchool[id].sort((a, b) => {
        if (!!a.activeRecord !== !!b.activeRecord) return a.activeRecord ? -1 : 1
        return a.profile.full_name.localeCompare(b.profile.full_name)
      })
    }

    const result: SchoolGroup[] = schools
      .filter(s => bySchool[s.id]?.length > 0)
      .map(school => ({ school, staff: bySchool[school.id] ?? [] }))

    setGroups(result)
    setLiveLoading(false)
    setRefreshing(false)

    // Build flat staff list for add-record form
    const flat = Object.values(bySchool).flat().map(s => s.profile)
    const seen = new Set<string>()
    const deduped: Profile[] = []
    for (const p of flat) {
      if (!seen.has(p.id)) { seen.add(p.id); deduped.push(p) }
    }
    deduped.sort((a, b) => a.full_name.localeCompare(b.full_name))
    setStaffList(deduped)
  }, [mySchoolIds, schools])

  // ── History data ──────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (mySchoolIds.length === 0) return
    setHistLoading(true)
    const { data } = await supabase
      .from('clock_records')
      .select('*, staff:profiles(*), school:schools(*)')
      .in('school_id', mySchoolIds)
      .order('clock_in', { ascending: false })
      .limit(300)
    setRecords((data as HistoryRecord[]) ?? [])
    setHistLoading(false)
  }, [mySchoolIds])

  useEffect(() => { initScope() }, [initScope])
  useEffect(() => { if (schools.length > 0) loadLive() }, [schools, loadLive])
  useEffect(() => { if (tab === 'history' && mySchoolIds.length > 0) loadHistory() }, [tab, loadHistory, mySchoolIds])

  // ── Live actions ──────────────────────────────────────────────────────────────
  async function clockIn(staffId: string, schoolId: string) {
    setBusy(staffId)
    setActionError(null)
    const { error } = await supabase.from('clock_records').insert({ staff_id: staffId, school_id: schoolId })
    if (error) { setActionError(error.message); setBusy(null); return }
    await loadLive(true)
    setBusy(null)
  }

  async function clockOut(recordId: string, staffId: string) {
    setBusy(staffId)
    setActionError(null)
    const { error } = await supabase.from('clock_records')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', recordId)
    if (error) { setActionError(error.message); setBusy(null); return }
    await loadLive(true)
    setBusy(null)
  }

  // ── History edit actions ──────────────────────────────────────────────────────
  function startEdit(rec: HistoryRecord) {
    setEditingId(rec.id)
    setConfirmDeleteId(null)
    setActionError(null)
    setEditForm({
      clock_in: toLocal(rec.clock_in),
      clock_out: rec.clock_out ? toLocal(rec.clock_out) : '',
      school_id: rec.school_id ?? '',
    })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setActionError(null)
    const { error } = await supabase.from('clock_records').update({
      clock_in: new Date(editForm.clock_in).toISOString(),
      clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : null,
      school_id: editForm.school_id || null,
    }).eq('id', id)
    if (error) { setActionError(error.message); setSaving(false); return }
    await loadHistory()
    setEditingId(null)
    setSaving(false)
  }

  async function deleteRecord(id: string) {
    setActionError(null)
    const { error } = await supabase.from('clock_records').delete().eq('id', id)
    if (error) { setActionError(error.message); setConfirmDeleteId(null); return }
    setRecords(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
  }

  async function addRecord() {
    if (!addForm.staff_id || !addForm.school_id || !addForm.clock_in) return
    setSaving(true)
    setActionError(null)
    const { error } = await supabase.from('clock_records').insert({
      staff_id: addForm.staff_id,
      school_id: addForm.school_id,
      clock_in: new Date(addForm.clock_in).toISOString(),
      clock_out: addForm.clock_out ? new Date(addForm.clock_out).toISOString() : null,
    })
    if (error) { setActionError(error.message); setSaving(false); return }
    await loadHistory()
    setAddForm({ staff_id: '', school_id: '', clock_in: '', clock_out: '' })
    setShowAdd(false)
    setSaving(false)
  }

  const inCount = groups.reduce((n, g) => n + g.staff.filter(s => s.activeRecord).length, 0)

  return (
    <Layout title="My Sessions">
      <div className="px-4 pt-6 flex flex-col gap-4">

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-red-700 mb-0.5">Action failed</p>
            <p className="text-xs text-red-600">{actionError}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          <button
            onClick={() => setTab('live')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === 'live' ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Live {inCount > 0 && <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">{inCount}</span>}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === 'history' ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History
          </button>
        </div>

        {/* ── LIVE TAB ──────────────────────────────────────────────────────── */}
        {tab === 'live' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {inCount > 0 ? `${inCount} staff currently clocked in` : 'No staff clocked in right now'}
              </p>
              <button
                onClick={() => loadLive(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-medium text-[#1a3a6b] bg-[#1a3a6b]/8 px-3 py-1.5 rounded-xl"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {liveLoading ? (
              <Card><p className="text-sm text-gray-500 text-center py-6">Loading…</p></Card>
            ) : mySchoolIds.length === 0 ? (
              <Card><p className="text-sm text-gray-500 text-center py-6">You have no schools assigned yet.</p></Card>
            ) : groups.length === 0 ? (
              <Card><p className="text-sm text-gray-500 text-center py-6">No staff assigned to your schools yet.</p></Card>
            ) : (
              groups.map(({ school, staff }) => (
                <Card key={school.id}>
                  <p className="font-bold text-[#1a3a6b]">{school.name}</p>
                  <p className="text-xs text-gray-400 mb-3">{school.session_day} · {school.session_time}</p>

                  <div className="flex flex-col gap-2">
                    {staff.map(({ profile: member, activeRecord }) => {
                      const isBusy = busy === member.id
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${activeRecord ? 'bg-green-50' : 'bg-gray-50'}`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeRecord ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{member.full_name}</p>
                            <p className="text-xs text-gray-400">
                              {activeRecord
                                ? `In at ${formatTime(activeRecord.clock_in)} · ${elapsed(activeRecord.clock_in)} ago`
                                : ROLE_LABELS[member.role]}
                            </p>
                          </div>
                          {activeRecord ? (
                            <button
                              onClick={() => clockOut(activeRecord.id, member.id)}
                              disabled={isBusy}
                              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-xl active:bg-red-200 disabled:opacity-50"
                            >
                              <LogOut size={13} />{isBusy ? '…' : 'Out'}
                            </button>
                          ) : (
                            <button
                              onClick={() => clockIn(member.id, school.id)}
                              disabled={isBusy}
                              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl active:bg-green-200 disabled:opacity-50"
                            >
                              <LogIn size={13} />{isBusy ? '…' : 'In'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))
            )}
          </>
        )}

        {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <>
            {canEdit && (
              <Button variant="primary" fullWidth onClick={() => setShowAdd(v => !v)}>
                <Plus size={18} /> Add Missing Record
              </Button>
            )}

            {showAdd && (
              <Card>
                <p className="font-semibold text-[#1a3a6b] mb-3">Add Clock Record</p>
                <div className="flex flex-col gap-3">
                  <Select label="Staff Member" value={addForm.staff_id}
                    onChange={e => setAddForm({ ...addForm, staff_id: e.target.value })}>
                    <option value="">Select…</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </Select>
                  <Select label="School" value={addForm.school_id}
                    onChange={e => setAddForm({ ...addForm, school_id: e.target.value })}>
                    <option value="">Select…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Clock In</label>
                    <input type="datetime-local" className={INPUT}
                      value={addForm.clock_in} onChange={e => setAddForm({ ...addForm, clock_in: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Clock Out</label>
                    <input type="datetime-local" className={INPUT}
                      value={addForm.clock_out} onChange={e => setAddForm({ ...addForm, clock_out: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={addRecord}
                      disabled={saving || !addForm.staff_id || !addForm.school_id || !addForm.clock_in}>
                      {saving ? 'Saving…' : 'Add'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {histLoading ? (
              <Card><p className="text-sm text-gray-500 text-center py-6">Loading…</p></Card>
            ) : records.length === 0 ? (
              <Card><p className="text-sm text-gray-500 text-center py-6">No records yet.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {records.map(rec => (
                  <div key={rec.id}>
                    {editingId === rec.id ? (
                      <Card>
                        <p className="text-xs font-bold text-[#1a3a6b] mb-3">Edit Record — {rec.staff?.full_name}</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">School</label>
                            <select className={INPUT} value={editForm.school_id}
                              onChange={e => setEditForm({ ...editForm, school_id: e.target.value })}>
                              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Clock In</label>
                            <input type="datetime-local" className={INPUT}
                              value={editForm.clock_in} onChange={e => setEditForm({ ...editForm, clock_in: e.target.value })} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Clock Out</label>
                            <input type="datetime-local" className={INPUT}
                              value={editForm.clock_out} onChange={e => setEditForm({ ...editForm, clock_out: e.target.value })} />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => setEditingId(null)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
                              <X size={14} /> Cancel
                            </button>
                            <button onClick={() => saveEdit(rec.id)} disabled={saving}
                              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#1a3a6b] text-white text-sm font-semibold">
                              <Check size={14} /> {saving ? '…' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className={`bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border-l-4 ${rec.clock_out ? 'border-l-green-400' : 'border-l-orange-400'}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{rec.staff?.full_name ?? '—'}</p>
                          <p className="text-xs text-gray-500 truncate">{rec.school?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(rec.clock_in)} · {formatTime(rec.clock_in)}
                            {rec.clock_out ? ` – ${formatTime(rec.clock_out)}` : <span className="text-orange-500"> · no clock-out</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge color={rec.clock_out ? 'green' : 'yellow'}>
                            {formatDuration(rec.clock_in, rec.clock_out)}
                          </Badge>
                          {canEdit && (
                            <>
                              <button onClick={() => startEdit(rec)}
                                className="p-1.5 rounded-lg text-[#1a3a6b] hover:bg-blue-50">
                                <Pencil size={14} />
                              </button>
                              {confirmDeleteId === rec.id ? (
                                <button onClick={() => deleteRecord(rec.id)}
                                  className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">
                                  Delete?
                                </button>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(rec.id)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                                  <X size={14} />
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
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
