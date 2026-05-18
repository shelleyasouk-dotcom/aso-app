import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import type { School, ClubTerm } from '../../types'

interface TermWithCount extends ClubTerm { confirmedCount: number }

const CAPACITIES = [8, 16, 24, 32]

export function ClubTermsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [terms, setTerms] = useState<TermWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<string | null>(null) // school id

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

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [schoolsRes, termsRes] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('club_terms').select('*').order('start_date', { ascending: false }),
    ])
    const termList = (termsRes.data ?? []) as ClubTerm[]

    // Fetch confirmed booking counts for each term
    const counts: Record<string, number> = {}
    if (termList.length > 0) {
      const { data: bookings } = await supabase
        .from('parent_bookings')
        .select('club_term_id')
        .in('club_term_id', termList.map(t => t.id))
        .eq('status', 'confirmed')
      ;(bookings ?? []).forEach((b: any) => {
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
                  {/* Existing terms */}
                  {schoolTerms.map(term => (
                    <div key={term.id} className={`border rounded-xl p-3 ${term.is_active ? 'border-[#1a3a6b]/30 bg-[#1a3a6b]/3' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{term.term_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {' – '}
                            {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{term.num_sessions} sessions
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
                          {term.confirmedCount === 0 && (
                            <button onClick={() => deleteTerm(term.id)}>
                              <Trash2 size={15} className="text-red-400 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
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
