import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { Child } from '../../types'
import { APPARATUS_LIST, APPARATUS_LABELS } from '../../lib/skills'
import type { Apparatus } from '../../lib/skills'
import { canViewAllSchools } from '../../lib/roles'

interface ChildWithProgress extends Child {
  // current level per apparatus (0 = not started)
  progress: Record<Apparatus, number>
}

export function AwardsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState<ChildWithProgress[]>([])
  const [filtered, setFiltered] = useState<ChildWithProgress[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadChildren()
  }, [profile])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? children.filter(c => c.full_name.toLowerCase().includes(q)) : children)
  }, [search, children])

  async function loadChildren() {
    let query = supabase
      .from('children')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (!canViewAllSchools(profile!.role) && profile!.role !== 'area_lead') {
      const { data: assignments } = await supabase
        .from('staff_school_assignments')
        .select('school_id')
        .eq('staff_id', profile!.id)
      const ids = assignments?.map((a: any) => a.school_id) ?? []
      if (ids.length > 0) query = query.in('school_id', ids)
    }

    const { data: childrenData } = await query
    if (!childrenData) { setLoading(false); return }

    // Load certificates to determine current level per apparatus
    const { data: certs } = await supabase
      .from('child_certificates')
      .select('child_id, apparatus, level')
      .in('child_id', childrenData.map(c => c.id))

    // Find highest completed level per child per apparatus
    const progressMap: Record<string, Record<Apparatus, number>> = {}
    childrenData.forEach(c => {
      progressMap[c.id] = { floor: 0, bars: 0, beam: 0, rebound: 0 }
    })
    certs?.forEach((cert: any) => {
      const current = progressMap[cert.child_id]?.[cert.apparatus as Apparatus] ?? 0
      if (cert.level > current) {
        progressMap[cert.child_id][cert.apparatus as Apparatus] = cert.level
      }
    })

    setChildren(childrenData.map(c => ({ ...c, progress: progressMap[c.id] })))
    setLoading(false)
  }

  return (
    <Layout title="Awards">
      <div className="px-4 pt-6 flex flex-col gap-4">
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

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">No children found.</p>
          </Card>
        ) : (
          filtered.map(child => (
            <Card
              key={child.id}
              onClick={() => navigate(`/awards/${child.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a3a6b] truncate">{child.full_name}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>

              {/* Apparatus progress grid */}
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
