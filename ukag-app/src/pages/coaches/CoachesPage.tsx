import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import type { Profile, Club } from '../../types'

interface CoachRow extends Profile {
  club?: Club
  has_expiring_licence?: boolean
}

export function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachRow[]>([])
  const [filtered, setFiltered] = useState<CoachRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCoaches()
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(coaches); return }
    const q = search.toLowerCase()
    setFiltered(coaches.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.club?.name.toLowerCase().includes(q)
    ))
  }, [coaches, search])

  async function loadCoaches() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, club:clubs(id, name)')
      .eq('role', 'coach')
      .order('full_name')

    const coachIds = (profiles ?? []).map(p => p.id)
    const today = new Date().toISOString().split('T')[0]
    const in90 = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]

    const { data: expiringLicences } = await supabase
      .from('coach_licences')
      .select('profile_id')
      .in('profile_id', coachIds)
      .eq('status', 'active')
      .gte('expiry_date', today)
      .lte('expiry_date', in90)

    const expiringIds = new Set((expiringLicences ?? []).map(l => l.profile_id))

    setCoaches((profiles ?? []).map(p => ({
      ...p,
      has_expiring_licence: expiringIds.has(p.id),
    })))
    setLoading(false)
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} coach{filtered.length !== 1 ? 'es' : ''}</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search coaches…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 focus:border-ukag-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No coaches found</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map(coach => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.id}`}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4 hover:shadow-sm hover:border-ukag-200 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-ukag-100 flex items-center justify-center font-semibold text-ukag-700 flex-shrink-0">
                  {coach.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {coach.full_name}
                    {coach.has_expiring_licence && (
                      <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{coach.email}</div>
                  {coach.club && (
                    <div className="text-xs text-ukag-600 mt-0.5">{coach.club.name}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
