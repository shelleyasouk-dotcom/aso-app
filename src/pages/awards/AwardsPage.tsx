import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Search, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { Child, AwardLevel } from '../../types'
import { AWARD_LEVEL_LABELS } from '../../types'
import { canViewAllSchools } from '../../lib/roles'

interface ChildWithAward extends Child {
  current_level?: AwardLevel
}

const LEVEL_COLORS: Record<AwardLevel, 'gray' | 'blue' | 'green' | 'yellow' | 'purple' | 'red'> = {
  none: 'gray',
  ukag_level_1: 'blue',
  ukag_level_2: 'green',
  ukag_level_3: 'yellow',
  ukag_level_4: 'purple',
  ukag_level_5: 'red',
}

export function AwardsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState<ChildWithAward[]>([])
  const [filtered, setFiltered] = useState<ChildWithAward[]>([])
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
    let childQuery = supabase
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
      if (ids.length > 0) childQuery = childQuery.in('school_id', ids)
    }

    const { data: childrenData } = await childQuery

    if (!childrenData) { setLoading(false); return }

    // Get latest award for each child
    const { data: awards } = await supabase
      .from('child_awards')
      .select('child_id, level, awarded_at')
      .in('child_id', childrenData.map(c => c.id))
      .order('awarded_at', { ascending: false })

    const latestAward: Record<string, AwardLevel> = {}
    awards?.forEach((a: any) => {
      if (!latestAward[a.child_id]) latestAward[a.child_id] = a.level
    })

    setChildren(childrenData.map(c => ({ ...c, current_level: latestAward[c.id] ?? 'none' })))
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
            <Award size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No children found.</p>
          </Card>
        ) : (
          filtered.map(child => (
            <Card
              key={child.id}
              onClick={() => navigate(`/awards/${child.id}`)}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">
                  {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a3a6b] truncate">{child.full_name}</p>
                <Badge color={LEVEL_COLORS[child.current_level ?? 'none']}>
                  {AWARD_LEVEL_LABELS[child.current_level ?? 'none']}
                </Badge>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
