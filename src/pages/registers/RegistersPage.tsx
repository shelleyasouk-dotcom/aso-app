import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Calendar, Upload, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { SessionRegister, School } from '../../types'

interface RegisterWithMeta extends SessionRegister {
  school?: School
  lead_coach?: { full_name: string }
  present_count?: number
  total_count?: number
}

export function RegistersPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [upcoming, setUpcoming] = useState<RegisterWithMeta[]>([])
  const [past, setPast] = useState<RegisterWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const role = profile?.role
  const isAdmin = role === 'director' || role === 'area_lead'
  const canImport = isAdmin || role === 'lead_coach'

  useEffect(() => {
    if (!profile) return
    loadRegisters()
  }, [profile])

  async function loadRegisters() {
    const today = new Date().toISOString().split('T')[0]

    let baseQuery = supabase
      .from('session_registers')
      .select('*, school:schools(*), lead_coach:profiles(full_name)')

    // Coaches only see their assigned schools
    if (role !== 'director' && role !== 'area_lead') {
      const { data: assignments } = await supabase
        .from('staff_school_assignments')
        .select('school_id')
        .eq('staff_id', profile!.id)
      const schoolIds = assignments?.map((a: any) => a.school_id) ?? []
      if (schoolIds.length > 0) {
        baseQuery = baseQuery.in('school_id', schoolIds)
      } else {
        setLoading(false)
        return
      }
    }

    const [{ data: upcomingData }, { data: pastData }] = await Promise.all([
      baseQuery.gte('session_date', today).order('session_date', { ascending: true }).limit(50),
      baseQuery.lt('session_date', today).order('session_date', { ascending: false }).limit(50),
    ])

    // Attach entry counts to past registers
    const enriched = await Promise.all(
      (pastData ?? []).map(async reg => {
        const { data: entriesData } = await supabase
          .from('register_entries')
          .select('present')
          .eq('register_id', reg.id)
        const total = entriesData?.length ?? 0
        const present = entriesData?.filter((e: any) => e.present).length ?? 0
        return { ...reg, total_count: total, present_count: present }
      })
    )

    // Attach total child count to upcoming registers
    const enrichedUpcoming = await Promise.all(
      (upcomingData ?? []).map(async reg => {
        const { count } = await supabase
          .from('register_entries')
          .select('id', { count: 'exact', head: true })
          .eq('register_id', reg.id)
        return { ...reg, total_count: count ?? 0 }
      })
    )

    setUpcoming(enrichedUpcoming)
    setPast(enriched)
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Layout title="Registers">
      <div className="px-4 pt-5 flex flex-col gap-4 pb-8">

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/registers/new')}>
            <Plus size={20} /> New Register
          </Button>
          {canImport && (
            <Button variant="secondary" size="lg" onClick={() => navigate('/registers/import')}>
              <Upload size={18} />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-400'
              }`}
            >
              {t === 'upcoming' ? `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ''}` : 'Past'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
        ) : tab === 'upcoming' ? (
          upcoming.length === 0 ? (
            <Card className="text-center py-8">
              <ClipboardList size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming sessions.</p>
              <p className="text-xs text-gray-400 mt-1">Import a Wix CSV to create sessions in advance, or tap New Register.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(reg => {
                const isToday = reg.session_date === today
                return (
                  <Card key={reg.id} onClick={() => navigate(`/registers/${reg.id}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isToday && (
                            <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">TODAY</span>
                          )}
                          <p className="font-bold text-[#1a3a6b] truncate">{reg.school?.name}</p>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(reg.session_date).toLocaleDateString('en-GB', {
                            weekday: 'long', day: 'numeric', month: 'long',
                          })}
                        </p>
                        {reg.lead_coach?.full_name && (
                          <p className="text-xs text-gray-400 mt-0.5">{reg.lead_coach.full_name}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-extrabold text-[#1a3a6b]">{reg.total_count}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
                          <Users size={10} /> booked
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        ) : (
          past.length === 0 ? (
            <Card className="text-center py-8">
              <ClipboardList size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No past registers yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {past.map(reg => (
                <Card key={reg.id} onClick={() => navigate(`/registers/${reg.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a3a6b] truncate">{reg.school?.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {new Date(reg.session_date).toLocaleDateString('en-GB', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                      {reg.lead_coach?.full_name && (
                        <p className="text-xs text-gray-400 mt-0.5">{reg.lead_coach.full_name}</p>
                      )}
                    </div>
                    {reg.total_count !== undefined && reg.total_count > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-green-600">{reg.present_count}</p>
                        <p className="text-xs text-gray-400">of {reg.total_count}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  )
}
