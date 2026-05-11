import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
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

const DT_CLASS = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

export function TimesheetsPage() {
  useAuth()
  const [records, setRecords] = useState<EnrichedRecord[]>([])
  const [staff, setStaff] = useState<Profile[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [filterStaff, setFilterStaff] = useState('')
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ clock_in: '', clock_out: '', school_id: '' })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ staff_id: '', school_id: '', clock_in: '', clock_out: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('*').order('full_name').then(({ data }) => setStaff(data ?? []))
    supabase.from('schools').select('*').order('name').then(({ data }) => setSchools(data ?? []))
  }, [])

  const loadRecords = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('clock_records')
      .select('*, staff:profiles(*), school:schools(*)')
      .order('clock_in', { ascending: false })
      .limit(500)
    if (filterStaff) q = q.eq('staff_id', filterStaff)
    const { data } = await q
    setRecords((data as EnrichedRecord[]) ?? [])
    setLoading(false)
  }, [filterStaff])

  useEffect(() => { loadRecords() }, [loadRecords])

  function startEdit(rec: EnrichedRecord) {
    setEditingId(rec.id)
    setConfirmDeleteId(null)
    setEditForm({
      clock_in: toLocal(rec.clock_in),
      clock_out: rec.clock_out ? toLocal(rec.clock_out) : '',
      school_id: rec.school_id ?? '',
    })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await supabase.from('clock_records').update({
      clock_in: new Date(editForm.clock_in).toISOString(),
      clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : null,
      school_id: editForm.school_id || null,
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

  const grouped = records.reduce<Record<string, EnrichedRecord[]>>((acc, rec) => {
    if (!acc[rec.staff_id]) acc[rec.staff_id] = []
    acc[rec.staff_id].push(rec)
    return acc
  }, {})

  const totalStaff = Object.keys(grouped).length

  return (
    <Layout title="Timesheets" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">

        <div className="bg-[#1a3a6b]/8 rounded-2xl px-4 py-3">
          <p className="text-sm text-[#1a3a6b] font-medium">
            Payroll reference — {totalStaff} staff · {records.filter(r => r.clock_out).length} completed sessions
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={() => setShowAdd(v => !v)}>
          <Plus size={20} /> Add Missing Clock Record
        </Button>

        {showAdd && (
          <Card>
            <p className="font-semibold text-[#1a3a6b] mb-4">Add Clock Record</p>
            <div className="flex flex-col gap-3">
              <Select label="Staff Member" value={addForm.staff_id}
                onChange={e => setAddForm({ ...addForm, staff_id: e.target.value })}>
                <option value="">Select…</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </Select>
              <Select label="School" value={addForm.school_id}
                onChange={e => setAddForm({ ...addForm, school_id: e.target.value })}>
                <option value="">Select…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Clock In</label>
                <input type="datetime-local" className={DT_CLASS}
                  value={addForm.clock_in} onChange={e => setAddForm({ ...addForm, clock_in: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Clock Out</label>
                <input type="datetime-local" className={DT_CLASS}
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

        <Select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
          <option value="">All staff</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </Select>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : records.length === 0 ? (
          <Card><p className="text-gray-500 text-center py-4">No records found.</p></Card>
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
                    <p className="font-bold text-[#1a3a6b] text-lg">{totalHours}h</p>
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
                              value={editForm.clock_in} onChange={e => setEditForm({ ...editForm, clock_in: e.target.value })} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Clock Out</label>
                            <input type="datetime-local" className={DT_CLASS}
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
                            <button onClick={() => { startEdit(rec); setConfirmDeleteId(null) }}
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
                                className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50">
                                <Trash2 size={14} />
                              </button>
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
      </div>
    </Layout>
  )
}
