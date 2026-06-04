import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Calendar, User, UserPlus, Trash2, ChevronDown, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { SessionRegister, RegisterEntry, Child, Profile, School } from '../../types'

interface ChildSummary {
  id: string
  full_name: string
  year_group: string | null
}

interface EntryWithChild extends RegisterEntry {
  child?: Child & { assigned_coach?: Profile }
}

interface FullRegister extends SessionRegister {
  school?: School
  lead_coach?: Profile
  entries?: EntryWithChild[]
}

export function ViewRegisterPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [register, setRegister] = useState<FullRegister | null>(null)
  const [entries, setEntries] = useState<EntryWithChild[]>([])
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [allChildren, setAllChildren] = useState<ChildSummary[]>([])
  const [notes, setNotes] = useState('')
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [addingChild, setAddingChild] = useState(false)
  const [addChildId, setAddChildId] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [loading, setLoading] = useState(true)

  const role = profile?.role
  const isAdmin = role === 'director' || role === 'area_lead'
  const isLead = isAdmin || role === 'lead_coach'

  useEffect(() => {
    if (id) loadRegister(id)
  }, [id])

  async function loadRegister(registerId: string) {
    const { data } = await supabase
      .from('session_registers')
      .select('*, school:schools(*), lead_coach:profiles(*)')
      .eq('id', registerId)
      .single()

    if (!data) { setLoading(false); return }
    setRegister(data)
    setNotes(data.notes ?? '')
    setNewDate(data.session_date)

    const [{ data: entriesData }, { data: coachesData }, { data: childrenData }] = await Promise.all([
      supabase
        .from('register_entries')
        .select('*, child:children(*, assigned_coach:profiles(*))')
        .eq('register_id', registerId)
        .order('child(full_name)'),
      supabase
        .from('staff_school_assignments')
        .select('staff:profiles(id, full_name)')
        .eq('school_id', data.school_id),
      supabase
        .from('children')
        .select('id, full_name, year_group')
        .eq('school_id', data.school_id)
        .eq('is_active', true)
        .order('full_name'),
    ])

    setEntries(entriesData ?? [])
    setCoaches((coachesData ?? []).map((c: any) => c.staff).filter(Boolean))
    setAllChildren(childrenData ?? [])
    setLoading(false)
  }

  async function togglePresent(entry: EntryWithChild) {
    const newVal = !entry.present
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, present: newVal } : e))
    await supabase.from('register_entries').update({ present: newVal }).eq('id', entry.id)
  }

  async function assignCoach(childId: string, coachId: string | null) {
    await supabase.from('children').update({ assigned_coach_id: coachId || null }).eq('id', childId)
    setEntries(prev => prev.map(e =>
      e.child?.id === childId
        ? { ...e, child: { ...e.child!, assigned_coach: coaches.find(c => c.id === coachId) } }
        : e
    ))
  }

  async function removeChild(entryId: string) {
    setEntries(prev => prev.filter(e => e.id !== entryId))
    await supabase.from('register_entries').delete().eq('id', entryId)
  }

  async function addChild() {
    if (!addChildId || !id) return
    const { data } = await supabase
      .from('register_entries')
      .insert({ register_id: id, child_id: addChildId, present: false })
      .select('*, child:children(*, assigned_coach:profiles(*))')
      .single()
    if (data) {
      setEntries(prev => [...prev, data].sort((a, b) =>
        (a.child?.full_name ?? '').localeCompare(b.child?.full_name ?? '')
      ))
    }
    setAddChildId('')
    setAddingChild(false)
  }

  async function saveDate() {
    await supabase.from('session_registers').update({ session_date: newDate }).eq('id', id)
    setRegister(prev => prev ? { ...prev, session_date: newDate } : prev)
    setEditingDate(false)
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase.from('session_registers').update({ notes: notes || null }).eq('id', id)
    setSavingNotes(false)
  }

  if (loading) return <Layout title="Register" showBack><div className="p-8 text-center text-gray-400">Loading…</div></Layout>
  if (!register) return <Layout title="Register" showBack><div className="p-8 text-center text-gray-400">Register not found.</div></Layout>

  const present = entries.filter(e => e.present)
  const absent = entries.filter(e => !e.present)
  const registeredChildIds = new Set(entries.map(e => e.child?.id))
  const availableToAdd = allChildren.filter(c => !registeredChildIds.has(c.id))

  return (
    <Layout title={register.school?.name ?? 'Register'} showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4">

        {/* Session info */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {editingDate ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                  <button onClick={saveDate} className="text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-lg">Save</button>
                  <button onClick={() => setEditingDate(false)} className="text-xs text-gray-400">Cancel</button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(register.session_date).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {isAdmin && (
                    <button onClick={() => setEditingDate(true)} className="text-[10px] font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-2 py-0.5 rounded-full ml-1">
                      Edit date
                    </button>
                  )}
                </p>
              )}
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User size={11} /> {register.lead_coach?.full_name ?? 'No coach assigned'}
              </p>
            </div>
            {/* Summary */}
            <div className="flex gap-3 text-center shrink-0">
              <div>
                <p className="text-xl font-extrabold text-green-600">{present.length}</p>
                <p className="text-[10px] text-gray-400">Here</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-red-500">{absent.length}</p>
                <p className="text-[10px] text-gray-400">Away</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#1a3a6b]">{entries.length}</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</p>
            {isAdmin && (
              <button
                onClick={() => setAddingChild(!addingChild)}
                className="flex items-center gap-1 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-full"
              >
                <UserPlus size={12} /> Add child
              </button>
            )}
          </div>

          {/* Add child panel */}
          {addingChild && availableToAdd.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex gap-2">
              <select
                value={addChildId}
                onChange={e => setAddChildId(e.target.value)}
                className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
              >
                <option value="">— Select child —</option>
                {availableToAdd.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
              <button
                onClick={addChild}
                disabled={!addChildId}
                className="bg-[#1a3a6b] text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40"
              >
                Add
              </button>
            </div>
          )}

          {entries.length === 0 ? (
            <Card><p className="text-sm text-gray-400 text-center py-2">No children on this register yet.</p></Card>
          ) : (
            entries.map(entry => {
              const child = entry.child
              const assignedCoach = child?.assigned_coach
              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl border-2 transition-colors ${
                    entry.present ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Attendance toggle */}
                    <button
                      onClick={() => togglePresent(entry)}
                      className="shrink-0"
                    >
                      {entry.present
                        ? <CheckCircle size={26} className="text-green-500" />
                        : <XCircle size={26} className="text-red-400" />
                      }
                    </button>

                    {/* Name + year */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{child?.full_name}</p>
                      {child?.year_group && (
                        <p className="text-xs text-gray-400">{child.year_group}</p>
                      )}
                    </div>

                    {/* Coach assignment (lead+) */}
                    {isLead && (
                      <div className="relative">
                        <select
                          value={assignedCoach?.id ?? ''}
                          onChange={e => child && assignCoach(child.id, e.target.value || null)}
                          className="appearance-none bg-white/70 border border-gray-200 rounded-xl pl-2 pr-6 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 cursor-pointer"
                        >
                          <option value="">No coach</option>
                          {coaches.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name}</option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    )}

                    {/* Remove (admin only) */}
                    {isAdmin && (
                      <button
                        onClick={() => removeChild(entry.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Session notes</label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 bg-white"
            rows={3}
            placeholder="Any notes from this session…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="self-end flex items-center gap-1.5 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-4 py-2 rounded-xl disabled:opacity-50"
          >
            <Save size={13} /> {savingNotes ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
