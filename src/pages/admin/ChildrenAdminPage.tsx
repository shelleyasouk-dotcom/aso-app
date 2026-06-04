import { useState, useEffect } from 'react'
import { Plus, BookOpen, ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import { canManageSchools } from '../../lib/roles'
import type { Child, School, Profile } from '../../types'

interface ChildWithRefs extends Child {
  school?: School
  assigned_coach?: Profile | null
}

// Extract a numeric sort key from a year group string
function yearSortKey(yg: string): number {
  if (!yg) return 99
  const lower = yg.toLowerCase()
  if (lower.includes('nursery') || lower.includes('n')) return -1
  if (lower.includes('reception') || /\br\b/.test(lower)) return 0
  const num = parseInt(lower.match(/\d+/)?.[0] ?? '99')
  return num
}

function normaliseYear(yg: string | null): string {
  return yg?.trim() || 'No class recorded'
}

export function ChildrenAdminPage() {
  const { profile } = useAuth()
  const [children, setChildren] = useState<ChildWithRefs[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [coachesBySchool, setCoachesBySchool] = useState<Map<string, Profile[]>>(new Map())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', school_id: '', year_group: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterSchool, setFilterSchool] = useState('')
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const isDirector = canManageSchools(profile?.role ?? '')

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
    const { data } = await supabase
      .from('staff_school_assignments')
      .select('school_id, staff:profiles!staff_id(id, full_name, role)')
    if (!data) return
    const map = new Map<string, Profile[]>()
    for (const row of data) {
      const staff = row.staff as any
      if (!staff) continue
      const list = map.get(row.school_id) ?? []
      list.push(staff)
      map.set(row.school_id, list)
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
      // Auto-expand all groups when first loaded or filter changes
      const keys = new Set<string>()
      for (const c of data) {
        const schoolKey = filterSchool ? '' : (c.school_id ?? '')
        keys.add(`${schoolKey}__${normaliseYear(c.year_group)}`)
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
    setChildren(prev => prev.map(c => {
      if (c.id !== childId) return c
      const allCoaches = Array.from(coachesBySchool.values()).flat()
      return { ...c, assigned_coach_id: coachId || null, assigned_coach: allCoaches.find(a => a.id === coachId) ?? null }
    }))
  }

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Build grouped structure
  // If filtering by school: { [yearGroup]: children[] }
  // If all schools: { [schoolId]: { school, groups: { [yearGroup]: children[] } } }
  const grouped = (() => {
    if (filterSchool) {
      const byYear = new Map<string, ChildWithRefs[]>()
      for (const c of children) {
        const yg = normaliseYear(c.year_group)
        const list = byYear.get(yg) ?? []
        list.push(c)
        byYear.set(yg, list)
      }
      return [{ schoolId: filterSchool, school: schools.find(s => s.id === filterSchool), yearGroups: byYear }]
    } else {
      const bySchool = new Map<string, { school?: School; yearGroups: Map<string, ChildWithRefs[]> }>()
      for (const c of children) {
        if (!bySchool.has(c.school_id)) {
          bySchool.set(c.school_id, { school: c.school, yearGroups: new Map() })
        }
        const yg = normaliseYear(c.year_group)
        const schoolEntry = bySchool.get(c.school_id)!
        const list = schoolEntry.yearGroups.get(yg) ?? []
        list.push(c)
        schoolEntry.yearGroups.set(yg, list)
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
              <Input
                label="Full Name"
                placeholder="e.g. Emma Johnson"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label="Date of Birth (optional)"
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
              />
              <Input
                label="Year / Class (optional)"
                placeholder="e.g. Year 2 / Class 5"
                value={form.year_group}
                onChange={e => setForm({ ...form, year_group: e.target.value })}
              />
              <Select
                label="School"
                value={form.school_id}
                onChange={e => setForm({ ...form, school_id: e.target.value })}
              >
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
        <Select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
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
                {/* School header (only shown when all schools) */}
                {!filterSchool && (
                  <div className="flex items-center gap-2 px-1 mb-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-[#1a3a6b] shrink-0" />
                    <p className="font-bold text-[#1a3a6b] text-sm">{school?.name}</p>
                    <span className="text-xs text-gray-400">
                      {Array.from(yearGroups.values()).flat().length} children
                    </span>
                  </div>
                )}

                {/* Year group sections */}
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

                        {/* Children in this year group */}
                        {isOpen && (
                          <div className="border-t border-gray-50 divide-y divide-gray-50">
                            {kids.map(child => (
                              <div key={child.id} className="px-4 py-3">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold text-[10px]">
                                      {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{child.full_name}</p>
                                    {child.date_of_birth && (
                                      <p className="text-xs text-gray-400">
                                        {new Date(child.date_of_birth).toLocaleDateString('en-GB')}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Badge color={child.is_active ? 'green' : 'gray'}>
                                      {child.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <button onClick={() => toggleActive(child)} className="text-gray-300 p-0.5">
                                      {child.is_active
                                        ? <ToggleRight size={20} className="text-green-500" />
                                        : <ToggleLeft size={20} />
                                      }
                                    </button>
                                  </div>
                                </div>

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
                                      : <option disabled>No coaches assigned to this school</option>
                                    }
                                  </select>
                                </div>
                              </div>
                            ))}
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
