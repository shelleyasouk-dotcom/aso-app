import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2, Users, Pencil, CalendarDays, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import type { School, ClubTerm } from '../../types'

interface TermWithCount extends ClubTerm { confirmedCount: number }

const CAPACITIES = [8, 16, 24, 32]

const DAY_TO_DOW: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSessionDates(startDate: string, endDate: string, sessionDay: string): string[] {
  const targetDow = DAY_TO_DOW[sessionDay]
  if (targetDow === undefined) return []
  const dates: string[] = []
  const end = parseLocalDate(endDate)
  const d = parseLocalDate(startDate)
  while (d <= end) {
    if (d.getDay() === targetDow) dates.push(toDateStr(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function ClubTermsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [terms, setTerms] = useState<TermWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [editingTermId, setEditingTermId] = useState<string | null>(null)
  const [editingDatesTermId, setEditingDatesTermId] = useState<string | null>(null)
  const [localExcluded, setLocalExcluded] = useState<string[]>([])
  const [savingDates, setSavingDates] = useState(false)

  // Form state
  const [termName, setTermName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [numSessions, setNumSessions] = useState('6')
  const [pricePence, setPricePence] = useState('5400')
  const [capacity, setCapacity] = useState('16')
  const [priorityDate, setPriorityDate] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [schoolsRes, termsRes] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('club_terms').select('*').order('start_date', { ascending: false }),
    ])
    const termList = (termsRes.data ?? []) as ClubTerm[]

    const counts: Record<string, number> = {}
    if (termList.length > 0) {
      const { data: bookings } = await supabase
        .from('parent_bookings')
        .select('club_term_id')
        .in('club_term_id', termList.map(t => t.id))
        .eq('status', 'confirmed')
      ;(bookings ?? []).forEach((b: { club_term_id: string }) => {
        counts[b.club_term_id] = (counts[b.club_term_id] ?? 0) + 1
      })
    }

    setSchools((schoolsRes.data ?? []) as School[])
    setTerms(termList.map(t => ({ ...t, confirmedCount: counts[t.id] ?? 0 })))
    setLoading(false)
  }

  function resetForm() {
    setTermName(''); setStartDate(''); setEndDate('')
    setNumSessions('6'); setPricePence('5400'); setCapacity('16')
    setPriorityDate(''); setOpenDate('')
  }

  function startEditing(term: TermWithCount) {
    setEditingTermId(term.id)
    setEditingDatesTermId(null)
    setTermName(term.term_name)
    setStartDate(term.start_date)
    setEndDate(term.end_date)
    setNumSessions(String(term.num_sessions))
    setPricePence(String(term.price_pence))
    setCapacity(String(term.capacity))
    setPriorityDate(term.priority_booking_opens ?? '')
    setOpenDate(term.open_booking_opens ?? '')
    setShowForm(null)
  }

  function startEditingDates(term: TermWithCount) {
    setEditingDatesTermId(term.id)
    setEditingTermId(null)
    setLocalExcluded(term.excluded_dates ?? [])
    resetForm()
  }

  function toggleExcluded(date: string) {
    setLocalExcluded(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    )
  }

  async function saveDates() {
    if (!editingDatesTermId) return
    setSavingDates(true)
    const term = terms.find(t => t.id === editingDatesTermId)!
    const school = schools.find(s => s.id === term.school_id)!
    const allDates = getSessionDates(term.start_date, term.end_date, school.session_day)
    const newNumSessions = allDates.length - localExcluded.length
    const pricePerSession = term.num_sessions > 0 ? term.price_pence / term.num_sessions : 0
    const newPricePence = Math.round(pricePerSession * newNumSessions)

    await supabase.from('club_terms').update({
      excluded_dates: localExcluded,
      num_sessions: newNumSessions,
      price_pence: newPricePence,
    }).eq('id', editingDatesTermId)

    setEditingDatesTermId(null)
    await loadAll()
    setSavingDates(false)
  }

  async function handleUpdate() {
    if (!editingTermId) return
    setSaving(true)
    await supabase.from('club_terms').update({
      term_name: termName,
      start_date: startDate,
      end_date: endDate,
      num_sessions: parseInt(numSessions),
      price_pence: parseInt(pricePence),
      capacity: parseInt(capacity),
      priority_booking_opens: priorityDate || null,
      open_booking_opens: openDate || null,
    }).eq('id', editingTermId)
    setEditingTermId(null)
    resetForm()
    await loadAll()
    setSaving(false)
  }

  async function handleCreate(schoolId: string) {
    setSaving(true)
    await supabase.from('club_terms').insert({
      school_id: schoolId,
      term_name: termName,
      start_date: startDate,
      end_date: endDate,
      num_sessions: parseInt(numSessions),
      price_pence: parseInt(pricePence),
      capacity: parseInt(capacity),
      priority_booking_opens: priorityDate || null,
      open_booking_opens: openDate || null,
      is_active: true,
    })
    resetForm()
    setShowForm(null)
    await loadAll()
    setSaving(false)
  }

  async function toggleActive(term: TermWithCount) {
    await supabase.from('club_terms').update({ is_active: !term.is_active }).eq('id', term.id)
    setTerms(prev => prev.map(t => t.id === term.id ? { ...t, is_active: !t.is_active } : t))
  }

  async function deleteTerm(id: string) {
    if (!confirm('Delete this term? This cannot be undone.')) return
    await supabase.from('club_terms').delete().eq('id', id)
    setTerms(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return (
    <Layout title="Club Terms">
      <div className="px-4 pt-6"><p className="text-gray-400 text-sm">Loading…</p></div>
    </Layout>
  )

  return (
    <Layout title="Club Terms">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">
        <p className="text-sm text-gray-500">Set up booking windows, capacity and pricing for each school's term.</p>

        {schools.map(school => {
          const schoolTerms = terms.filter(t => t.school_id === school.id)
          const isExpanded = expandedSchool === school.id
          const isFormOpen = showForm === school.id

          return (
            <Card key={school.id}>
              {/* School header */}
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setExpandedSchool(isExpanded ? null : school.id)}
              >
                <div>
                  <p className="font-bold text-[#1a3a6b] text-left">{school.name}</p>
                  <p className="text-xs text-gray-400">{schoolTerms.length} term{schoolTerms.length !== 1 ? 's' : ''} · {school.area}</p>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="mt-4 flex flex-col gap-3">
                  {schoolTerms.map(term => (
                    <div key={term.id} className={`border rounded-xl p-3 ${term.is_active ? 'border-[#1a3a6b]/30 bg-[#1a3a6b]/3' : 'border-gray-200 bg-gray-50'}`}>

                      {/* ── Edit term details form ── */}
                      {editingTermId === term.id ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-bold text-[#1a3a6b]">Edit Term</p>
                          <Input id="etn" label="Term name" placeholder="e.g. Spring 1 2026" value={termName} onChange={e => setTermName(e.target.value)} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input id="esd" label="Start date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <Input id="eed" label="End date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Input id="ens" label="Sessions" type="number" value={numSessions} onChange={e => setNumSessions(e.target.value)} />
                            <Input id="epp" label="Price (p)" type="number" value={pricePence} onChange={e => setPricePence(e.target.value)} />
                            <Select label="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)}>
                              {CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input id="epd" label="Priority opens" type="date" value={priorityDate} onChange={e => setPriorityDate(e.target.value)} />
                            <Input id="eod" label="Open booking" type="date" value={openDate} onChange={e => setOpenDate(e.target.value)} />
                          </div>
                          <p className="text-xs text-gray-400">Price in pence: £54 = 5400.</p>
                          <div className="flex gap-2">
                            <Button size="sm" disabled={!termName || !startDate || !endDate || saving} onClick={handleUpdate}>
                              {saving ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => { setEditingTermId(null); resetForm() }}>
                              Cancel
                            </Button>
                          </div>
                        </div>

                      /* ── Edit session dates form ── */
                      ) : editingDatesTermId === term.id ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-[#1a3a6b]">Edit Session Dates</p>
                            <button onClick={() => setEditingDatesTermId(null)}>
                              <X size={16} className="text-gray-400 hover:text-gray-700" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Click a date to mark it as cancelled (e.g. teacher training day). Greyed-out dates are excluded from the count and price.
                          </p>
                          {school.session_day ? (
                            <>
                              <div className="flex flex-wrap gap-2">
                                {getSessionDates(term.start_date, term.end_date, school.session_day).map(date => {
                                  const excluded = localExcluded.includes(date)
                                  const d = parseLocalDate(date)
                                  const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                  return (
                                    <button
                                      key={date}
                                      onClick={() => toggleExcluded(date)}
                                      title={excluded ? 'Click to restore' : 'Click to exclude'}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                        excluded
                                          ? 'bg-red-50 border-red-200 text-red-400 line-through'
                                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  )
                                })}
                              </div>
                              <p className="text-xs text-gray-400">
                                {getSessionDates(term.start_date, term.end_date, school.session_day).length - localExcluded.length} sessions · price auto-adjusts on save
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" disabled={savingDates} onClick={saveDates}>
                                  {savingDates ? 'Saving…' : 'Save Dates'}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setEditingDatesTermId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-amber-600">No session day set for this school. Set it in Schools admin first.</p>
                          )}
                        </div>

                      /* ── Normal term display ── */
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{term.term_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {' – '}
                              {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}{term.num_sessions} sessions
                              {(term.excluded_dates ?? []).length > 0 && (
                                <span className="ml-1 text-amber-600">({term.excluded_dates!.length} excluded)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-[#1a3a6b]">
                                £{(term.price_pence / 100).toFixed(0)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Users size={11} />
                                {term.confirmedCount}/{term.capacity} booked
                              </span>
                              {term.priority_booking_opens && (
                                <span className="text-xs text-blue-600">
                                  Priority: {new Date(term.priority_booking_opens).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {term.open_booking_opens && (
                                <span className="text-xs text-green-600">
                                  Open: {new Date(term.open_booking_opens).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleActive(term)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                term.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {term.is_active ? 'Active' : 'Draft'}
                            </button>
                            <button
                              onClick={() => startEditingDates(term)}
                              title="Edit session dates"
                            >
                              <CalendarDays size={14} className="text-gray-400 hover:text-[#1a3a6b]" />
                            </button>
                            <button onClick={() => startEditing(term)} title="Edit term details">
                              <Pencil size={14} className="text-gray-400 hover:text-[#1a3a6b]" />
                            </button>
                            {term.confirmedCount === 0 && (
                              <button onClick={() => deleteTerm(term.id)}>
                                <Trash2 size={15} className="text-red-400 hover:text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add term form */}
                  {isFormOpen ? (
                    <div className="border border-dashed border-[#1a3a6b]/30 rounded-xl p-4 flex flex-col gap-3">
                      <p className="text-sm font-bold text-[#1a3a6b]">New Term</p>
                      <Input id="tn" label="Term name" placeholder="e.g. Spring 1 2026" value={termName} onChange={e => setTermName(e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input id="sd" label="Start date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <Input id="ed" label="End date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input id="ns" label="Sessions" type="number" value={numSessions} onChange={e => setNumSessions(e.target.value)} />
                        <Input id="pp" label="Price (p)" type="number" value={pricePence} onChange={e => setPricePence(e.target.value)} />
                        <Select label="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)}>
                          {CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input id="pd" label="Priority opens" type="date" value={priorityDate} onChange={e => setPriorityDate(e.target.value)} />
                        <Input id="od" label="Open booking" type="date" value={openDate} onChange={e => setOpenDate(e.target.value)} />
                      </div>
                      <p className="text-xs text-gray-400">Price in pence: £54 = 5400. Capacity: 16 (2 coaches) or 24 (3 coaches).</p>
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!termName || !startDate || !endDate || saving} onClick={() => handleCreate(school.id)}>
                          {saving ? 'Saving…' : 'Create Term'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => { setShowForm(null); resetForm() }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowForm(school.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] border border-dashed border-[#1a3a6b]/30 rounded-xl px-4 py-2.5 hover:bg-[#1a3a6b]/5 transition-colors"
                    >
                      <Plus size={15} /> Add term
                    </button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}
