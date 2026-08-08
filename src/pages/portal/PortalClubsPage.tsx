import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Calendar, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { useSEO } from '../../hooks/useSEO'
import type { School } from '../../types'

export function PortalClubsPage() {
  useSEO({
    title: 'Find a Gymnastics Club Near You',
    description: 'Search for ASO gymnastics and trampolining clubs at schools near you. Find your child\'s club, check session times, and track their UKAG Award Pathway progress.',
    url: 'https://www.activeschool.org.uk/portal/clubs',
  })
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [schools, setSchools] = useState<School[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const search = params.get('q') ?? ''
  const area = params.get('area') ?? ''

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('schools')
        .select('id,name,address,area,region,session_day,session_time,school_type')
        .order('area', { ascending: true })
        .order('name', { ascending: true })

      if (area) query = query.eq('area', area)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data } = await query
      setSchools((data as School[]) ?? [])
      setLoading(false)
    }
    load()
  }, [search, area])

  useEffect(() => {
    supabase
      .from('schools')
      .select('area')
      .not('area', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((r: { area: string }) => r.area).filter(Boolean))]
        setRegions(unique.sort())
      })
  }, [])

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const grouped: Record<string, School[]> = {}
  for (const s of schools) {
    const key = s.area ?? 'Other'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Find a Club</h1>
        <p className="text-gray-500 text-sm mb-6">Browse ASO clubs running at schools across the UK.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search school name…"
              defaultValue={search}
              onKeyDown={e => {
                if (e.key === 'Enter') setFilter('q', (e.target as HTMLInputElement).value)
              }}
              onBlur={e => setFilter('q', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
            />
          </div>
          {/* Region filter */}
          <div className="relative">
            <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={area}
              onChange={e => setFilter('area', e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white appearance-none cursor-pointer"
            >
              <option value="">All regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(search || area) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500">Filters:</span>
            {area && (
              <span className="inline-flex items-center gap-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-medium px-2.5 py-1 rounded-full">
                <MapPin size={11} />
                {area}
                <button onClick={() => setFilter('area', '')} className="ml-0.5 hover:opacity-70">×</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-medium px-2.5 py-1 rounded-full">
                "{search}"
                <button onClick={() => setFilter('q', '')} className="ml-0.5 hover:opacity-70">×</button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MapPin size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clubs found</p>
            <p className="text-sm mt-1">Try adjusting your search or region filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([regionName, clubList]) => (
              <div key={regionName}>
                {/* Only show regional heading when not filtered to a single area or when multiple groups */}
                {Object.keys(grouped).length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={15} className="text-[#1a3a6b]" />
                    <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{regionName}</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{clubList.length} club{clubList.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clubList.map(school => (
                    <button
                      key={school.id}
                      onClick={() => navigate(`/portal/clubs/${school.id}`)}
                      className="text-left bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#1a3a6b] hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#1a3a6b] transition-colors">
                          {school.name}
                        </h3>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] shrink-0 mt-0.5 transition-colors" />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {school.area && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#1a3a6b]" />
                            {school.area}
                          </span>
                        )}
                        {school.session_day && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-[#1a3a6b]" />
                            {school.session_day}
                          </span>
                        )}
                        {school.session_time && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-[#1a3a6b]" />
                            {school.session_time}
                          </span>
                        )}
                      </div>
                      {school.school_type && (
                        <span className="mt-2 inline-block text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                          {school.school_type.replace('_', ' ')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && schools.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Showing {schools.length} club{schools.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </PortalLayout>
  )
}
