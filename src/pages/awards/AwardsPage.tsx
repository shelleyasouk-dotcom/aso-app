import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import type { Child, School, Profile } from '../../types'
import { APPARATUS_LIST, APPARATUS_LABELS } from '../../lib/skills'
import type { Apparatus } from '../../lib/skills'
import { canViewAllSchools } from '../../lib/roles'

interface ChildWithProgress extends Child {
  progress: Record<Apparatus, number>
}

export function AwardsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState<ChildWithProgress[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterCoach, setFilterCoach] = useState('')
  const [loading, setLoading] = useState(true)

  const isAdmin = canViewAllSchools(profile?.role ?? 'junior_coach') || profile?.role === 'area_lead'

  useEffect(() => {
    if (!profile) return
    loadChildren()
    if (isAdmin) {
      supabase.from('schools').select('*').order('name').then(({ data }) => setSchools(data ?? []))
      supabase.from('profiles')
        .select('*')
        .in('role', ['lead_coach', 'assistant_coach', 'junior_coach'])
        .order('full_name')
        .then(({ data }) => setCoaches(data ?? []))
    }
  }, [profile])

  async function loadChildren() {
    let query = supabase
      .from('children')
      .select('*, school:schools(id,name), assigned_coach:profiles!assigned_coach_id(id,full_name)')
      .eq('is_active', true)
      .order('full_name')

    if (!isAdmin) {
      // Coaches only see their assigned children
      query = query.eq('assigned_coach_id', profile!.id)
    }

    const { data: childrenData } = await query
    if (!childrenData) { setLoading(false); return }

    const { data: certs } = await supabase
      .from('child_certificates')
      .select('child_id, apparatus, level')
      .in('child_id', childrenData.map(c => c.id))

    const progressMap: Record<string, Record<Apparatus, number>> = {}
    childrenData.forEach(c => {
      progressMap[c.id] = { floor: 0, bars: 0, beam: 0, rebound: 0 }
    })
    certs?.forEach((cert: { child_id: string; apparatus: string; level: number }) => {
      const current = progressMap[cert.child_id]?.[cert.apparatus as Apparatus] ?? 0
      if (cert.level > current) progressMap[cert.child_id][cert.apparatus as Apparatus] = cert.level
    })

    setChildren(childrenData.map(c => ({ ...c, progress: progressMap[c.id] })))
    setLoading(false)
  }

  const filtered = children.filter(c => {
    if (search && !c.full_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSchool && c.school_id !== filterSchool) return false
    if (filterCoach === 'unassigned' && c.assigned_coach_id) return false
    if (filterCoach && filterCoach !== 'unassigned' && c.assigned_coach_id !== filterCoach) return false
    return true
  })

  return (
    <Layout title="Awards">
      <div className="px-4 pt-6 flex flex-col gap-4">

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search children…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        {/* Filters — admin/area lead only */}
        {isAdmin && (schools.length > 0 || coaches.length > 0) && (
          <div className="flex flex-col gap-2">
            {schools.length > 0 && (
              <Select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
                <option value="">All Schools</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            )}
            {coaches.length > 0 && (
              <Select value={filterCoach} onChange={e => setFilterCoach(e.target.value)}>
                <option value="">All Coaches</option>
                <option value="unassigned">Unassigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </Select>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">No children found.</p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">Children are assigned to you in the Children admin.</p>
            )}
          </Card>
        ) : (
          filtered.map(child => (
            <Card key={child.id} onClick={() => navigate(`/awards/${child.id}`)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a3a6b] truncate">{child.full_name}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {child.year_group && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">{child.year_group}</span>
                    )}
                    {(child.school as School)?.name && (
                      <span className="text-xs text-gray-400 truncate">{(child.school as School).name}</span>
                    )}
                  </div>
                  {isAdmin && (child.assigned_coach as Profile)?.full_name && (
                    <p className="text-xs text-gray-400 mt-0.5">Coach: {(child.assigned_coach as Profile).full_name}</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {APPARATUS_LIST.map(app => {
                  const level = child.progress[app]
                  return (
                    <div key={app} className="text-center">
                      <div className={`rounded-lg py-1.5 text-xs font-bold mb-1 ${
                        level === 0 ? 'bg-gray-100 text-gray-400'
                        : level >= 5 ? 'bg-[#f5c518] text-[#1a3a6b]'
                        : 'bg-blue-100 text-[#1a3a6b]'
                      }`}>
                        {level === 0 ? '–' : `L${level}`}
                      </div>
                      <p className="text-xs text-gray-400">{APPARATUS_LABELS[app]}</p>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
