import { useState, useEffect } from 'react'
import { Plus, BookOpen, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Phone, Mail, User, AlertCircle, Info, Camera, HeartPulse } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import type { Child, School, Profile } from '../../types'

interface ChildWithRefs extends Child {
  school?: School
  assigned_coach?: Profile
}

function yearSortKey(yg: string): number {
  if (!yg) return 99
  const lower = yg.toLowerCase()
  if (lower.includes('nursery')) return -1
  if (lower.includes('reception') || /\br\b/.test(lower)) return 0
  const num = parseInt(lower.match(/\d+/)?.[0] ?? '99')
  return isNaN(num) ? 99 : num
}

function normaliseYear(yg: string | null): string {
  return yg?.trim() || 'No class recorded'
}

export function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithRefs[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [coachesBySchool, setCoachesBySchool] = useState<Map<string, Profile[]>>(new Map())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', school_id: '', year_group: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterSchool, setFilterSchool] = useState('')
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const [expandedChildIds, setExpandedChildIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSchools()
    loadCoaches()
  }, [])

  useEffect(() => {
    loadChildren()
  }, [filterSchool])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('name')
    if (data) {
      setSchools(data)
      if (data.length === 1) setForm(f => ({ ...f, school_id: data[0].id }))
    }
  }

  async function loadCoaches() {
    // Two-step: get assignments first, then fetch profiles — avoids join issues
    const { data: assignments } = await supabase
      .from('staff_school_assignments')
      .select('school_id, staff_id')
    if (!assignments || assignments.length === 0) return

    const staffIds = [...new Set(assignments.map((a: any) => a.staff_id))]
    const { data: staffData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', staffIds)
    if (!staffData) return

    const staffMap = new Map(staffData.map((s: any) => [s.id, s]))
    const map = new Map<string, Profile[]>()
    for (const { school_id, staff_id } of assignments as any[]) {
      const staff = staffMap.get(staff_id) as Profile | undefined
      if (!staff) continue
      const list = map.get(school_id) ?? []
      if (!list.find(s => s.id === staff.id)) list.push(staff)
      map.set(school_id, list)
    }
    setCoachesBySchool(map)
  }

  async function loadChildren() {
    let query = supabase
      .from('children')
      .select('*, school:schools(*), assigned_coach:profiles!assigned_coach_id(*)')
      .order('full_name')
    if (filterSchool) query = query.eq('school_id', filterSchool)
    const { data } = await query
    if (data) {
      setChildren(data)
      // Auto-expand all year-group sections
      const keys = new Set<string>()
      for (const c of data) {
        keys.add(`${filterSchool ? '' : c.school_id}__${normaliseYear(c.year_group)}`)
      }
      setOpenGroups(keys)
    }
    setLoading(false)
  }

  async function addChild() {
    if (!form.full_name || !form.school_id) return
    setSaving(true)
    const { error } = await supabase.from('children').insert({
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || null,
      school_id: form.school_id,
      year_group: form.year_group || null,
      is_active: true,
    })
    if (!error) {
      await loadChildren()
      setForm({ full_name: '', date_of_birth: '', school_id: schools.length === 1 ? schools[0].id : '', year_group: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function toggleActive(child: ChildWithRefs) {
    await supabase.from('children').update({ is_active: !child.is_active }).eq('id', child.id)
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, is_active: !c.is_active } : c))
  }

  async function assignCoach(childId: string, coachId: string) {
    await supabase.from('children').update({ assigned_coach_id: coachId || null }).eq('id', childId)

    // Sync class_children so the awards tracker reflects the new coach
    if (coachId) {
      const { data: sem } = await supabase
        .from('academic_semesters')
        .select('academic_year, semester_number')
        .eq('is_current', true)
        .single()
      if (sem) {
        await supabase
          .from('class_children')
          .update({ added_by: coachId })
          .eq('child_id', childId)
          .eq('academic_year', sem.academic_year)
          .eq('semester_number', sem.semester_number)
      }
    }

    setChildren(prev => prev.map(c => {
      if (c.id !== childId) return c
      const allCoaches = Array.from(coachesBySchool.values()).flat()
      return { ...c, assigned_coach_id: coachId || null, assigned_coach: allCoaches.find(a => a.id === coachId) }
    }))
  }

  function toggleGroup(key: string) {
    setOpenGroups(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function toggleChildDetails(id: string) {
    setExpandedChildIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Group children: by school (if showing all), then by year group within each school
  const grouped = (() => {
    if (filterSchool) {
      const byYear = new Map<string, ChildWithRefs[]>()
      for (const c of children) {
        const yg = normaliseYear(c.year_group)
        const list = byYear.get(yg) ?? []; list.push(c); byYear.set(yg, list)
      }
      return [{ schoolId: filterSchool, school: schools.find(s => s.id === filterSchool), yearGroups: byYear }]
    } else {
      const bySchool = new Map<string, { school?: School; yearGroups: Map<string, ChildWithRefs[]> }>()
      for (const c of children) {
        if (!bySchool.has(c.school_id)) bySchool.set(c.school_id, { school: c.school, yearGroups: new Map() })
        const yg = normaliseYear(c.year_group)
        const entry = bySchool.get(c.school_id)!
        const list = entry.yearGroups.get(yg) ?? []; list.push(c); entry.yearGroups.set(yg, list)
      }
      return Array.from(bySchool.entries()).map(([schoolId, val]) => ({ schoolId, ...val }))
    }
  })()

  return (
    <Layout title="Children" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4">

        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Child
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New Child</h3>
            <div className="flex flex-col gap-3">
              <Input label="Full Name" placeholder="e.g. Emma Johnson" value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })} />
              <Input label="Date of Birth (optional)" type="date" value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              <Input label="Year / Class (optional)" placeholder="e.g. Year 2 / Class 5" value={form.year_group}
                onChange={e => setForm({ ...form, year_group: e.target.value })} />
              <Select label="School" value={form.school_id}
                onChange={e => setForm({ ...form, school_id: e.target.value })}>
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={addChild} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Add Child'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* School filter */}
        <Select value={filterSchool} onChange={e => { setFilterSchool(e.target.value); setLoading(true) }}>
          <option value="">All Schools ({children.length} children)</option>
          {schools.map(s => {
            const count = children.filter(c => c.school_id === s.id).length
            return <option key={s.id} value={s.id}>{s.name} ({count})</option>
          })}
        </Select>

        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
        ) : children.length === 0 ? (
          <Card className="text-center py-8">
            <BookOpen size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No children registered yet.</p>
          </Card>
        ) : (
          grouped.map(({ schoolId, school, yearGroups }) => {
            const schoolCoaches = coachesBySchool.get(schoolId) ?? []
            const sortedYears = Array.from(yearGroups.entries())
              .sort(([a], [b]) => yearSortKey(a) - yearSortKey(b))

            return (
              <div key={schoolId}>
                {!filterSchool && (
                  <div className="flex items-center gap-2 px-1 mb-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-[#1a3a6b] shrink-0" />
                    <p className="font-bold text-[#1a3a6b] text-sm">{school?.name}</p>
                    <span className="text-xs text-gray-400">
                      {Array.from(yearGroups.values()).flat().length} children
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {sortedYears.map(([yearGroup, kids]) => {
                    const groupKey = `${filterSchool ? '' : schoolId}__${yearGroup}`
                    const isOpen = openGroups.has(groupKey)

                    return (
                      <div key={yearGroup} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Year group header */}
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {isOpen
                              ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
                              : <ChevronRight size={16} className="text-gray-400 shrink-0" />
                            }
                            <p className="font-semibold text-[#1a3a6b] text-sm">{yearGroup}</p>
                          </div>
                          <span className="text-xs font-bold bg-[#1a3a6b]/10 text-[#1a3a6b] px-2 py-0.5 rounded-full">
                            {kids.length}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="border-t border-gray-50 divide-y divide-gray-50">
                            {kids.map(child => {
                              const detailsOpen = expandedChildIds.has(child.id)
                              const hasContact = child.contact_phone || child.contact_email || child.parent_name
                              const hasNeeds = child.additional_needs && child.additional_needs.toLowerCase() !== 'no'

                              return (
                                <div key={child.id} className="px-4 py-3">
                                  {/* Name row */}
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                                      <span className="text-white font-bold text-[10px]">
                                        {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{child.full_name}</p>
                                        {hasNeeds && (
                                          <AlertCircle size={13} className="text-amber-500 shrink-0" />
                                        )}
                                      </div>
                                      {child.date_of_birth && (
                                        <p className="text-xs text-gray-400">
                                          DOB: {new Date(child.date_of_birth).toLocaleDateString('en-GB')}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* Details toggle */}
                                      <button
                                        onClick={() => toggleChildDetails(child.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${detailsOpen ? 'bg-[#1a3a6b]/10 text-[#1a3a6b]' : 'text-gray-300'}`}
                                        title="View contact details"
                                      >
                                        <Info size={15} />
                                      </button>
                                      <Badge color={child.is_active ? 'green' : 'gray'}>
                                        {child.is_active ? 'Active' : 'Off'}
                                      </Badge>
                                      <button onClick={() => toggleActive(child)} className="text-gray-300 p-0.5">
                                        {child.is_active
                                          ? <ToggleRight size={20} className="text-green-500" />
                                          : <ToggleLeft size={20} />
                                        }
                                      </button>
                                    </div>
                                  </div>

                                  {/* Permission strip */}
                                  {(child.photo_permission !== null || child.first_aid_consent !== null) && (
                                    <div className="flex items-center gap-2 mb-2">
                                      {child.photo_permission !== null && (
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${child.photo_permission ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                          <Camera size={10} />
                                          {child.photo_permission ? 'Photo: Y' : 'Photo: N'}
                                        </div>
                                      )}
                                      {child.first_aid_consent !== null && (
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${child.first_aid_consent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                          <HeartPulse size={10} />
                                          {child.first_aid_consent ? 'First Aid: Y' : 'First Aid: N'}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Expandable contact details */}
                                  {detailsOpen && (
                                    <div className="mb-3 bg-[#f4f6f9] rounded-xl p-3 flex flex-col gap-2">
                                      {/* Primary contact */}
                                      {child.parent_name && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <User size={13} className="text-gray-400 shrink-0" />
                                          <div>
                                            <span className="text-gray-700 font-medium">{child.parent_name}</span>
                                            {child.parent_relationship && (
                                              <span className="text-xs text-gray-400 ml-1">({child.parent_relationship})</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {child.contact_phone && (
                                        <a href={`tel:${child.contact_phone}`} className="flex items-center gap-2 text-sm text-[#1a3a6b] font-medium">
                                          <Phone size={13} className="shrink-0" />
                                          {child.contact_phone}
                                        </a>
                                      )}
                                      {child.contact_email && (
                                        <a href={`mailto:${child.contact_email}`} className="flex items-center gap-2 text-sm text-[#1a3a6b] font-medium truncate">
                                          <Mail size={13} className="shrink-0" />
                                          {child.contact_email}
                                        </a>
                                      )}
                                      {hasNeeds && (
                                        <div className="flex items-start gap-2 text-sm">
                                          <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                                          <div>
                                            <p className="text-xs font-bold text-amber-700 mb-0.5">Additional needs</p>
                                            <p className="text-gray-700 text-xs leading-snug">{child.additional_needs}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Secondary contact */}
                                      {child.secondary_contact_name && (
                                        <div className="pt-1 border-t border-gray-200">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact 2</p>
                                          <div className="flex items-center gap-2 text-sm">
                                            <User size={13} className="text-gray-400 shrink-0" />
                                            <span className="text-gray-700 font-medium">{child.secondary_contact_name}</span>
                                            {child.secondary_contact_relationship && (
                                              <span className="text-xs text-gray-400">({child.secondary_contact_relationship})</span>
                                            )}
                                          </div>
                                          {child.secondary_contact_phone && (
                                            <a href={`tel:${child.secondary_contact_phone}`} className="flex items-center gap-2 text-sm text-[#1a3a6b] font-medium mt-1">
                                              <Phone size={13} className="shrink-0" />
                                              {child.secondary_contact_phone}
                                            </a>
                                          )}
                                        </div>
                                      )}

                                      {/* Tertiary contact */}
                                      {child.tertiary_contact_name && (
                                        <div className="pt-1 border-t border-gray-200">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact 3</p>
                                          <div className="flex items-center gap-2 text-sm">
                                            <User size={13} className="text-gray-400 shrink-0" />
                                            <span className="text-gray-700 font-medium">{child.tertiary_contact_name}</span>
                                            {child.tertiary_contact_relationship && (
                                              <span className="text-xs text-gray-400">({child.tertiary_contact_relationship})</span>
                                            )}
                                          </div>
                                          {child.tertiary_contact_phone && (
                                            <a href={`tel:${child.tertiary_contact_phone}`} className="flex items-center gap-2 text-sm text-[#1a3a6b] font-medium mt-1">
                                              <Phone size={13} className="shrink-0" />
                                              {child.tertiary_contact_phone}
                                            </a>
                                          )}
                                        </div>
                                      )}

                                      {!hasContact && !hasNeeds && !child.secondary_contact_name && (
                                        <p className="text-xs text-gray-400 text-center py-1">No contact details recorded.</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Coach assignment — only shows coaches at this school */}
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                      Assigned Coach
                                    </label>
                                    <select
                                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 bg-[#f4f6f9]"
                                      value={child.assigned_coach_id ?? ''}
                                      onChange={e => assignCoach(child.id, e.target.value)}
                                    >
                                      <option value="">No coach assigned</option>
                                      {schoolCoaches.length > 0
                                        ? schoolCoaches.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name}</option>
                                          ))
                                        : <option disabled>No coaches at this school yet</option>
                                      }
                                    </select>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
