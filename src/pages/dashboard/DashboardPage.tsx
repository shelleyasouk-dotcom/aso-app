import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { School, Pin, Megaphone, ChevronRight, ChevronRight as ArrowRight, UserCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ROLE_LABELS, canManageSchools, clocksInAnywhere } from '../../lib/roles'
import type { Announcement } from '../../types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  if (!profile) return null

  const firstName = profile.full_name.split(' ')[0]
  const showSchools = !canManageSchools(profile.role) && profile.role !== 'area_lead' && !clocksInAnywhere(profile.role)

  return (
    <Layout title="ASO Coaching">
      <div className="px-4 pt-6 pb-4 flex flex-col gap-6">

        {/* Profile tile */}
        <Card onClick={() => navigate('/profile')} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a3a6b] flex items-center justify-center shrink-0 overflow-hidden">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1a3a6b] text-base leading-tight truncate">Hi, {firstName}</p>
            <div className="mt-1">
              <Badge color="blue">{ROLE_LABELS[profile.role]}</Badge>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 shrink-0" />
        </Card>

        {/* Clock In section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {showSchools ? 'Your Schools This Week' : 'Clock In'}
            </h3>
            <button
              onClick={() => navigate('/clock-in')}
              className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b]"
            >
              Open <ChevronRight size={14} />
            </button>
          </div>
          {showSchools ? (
            <SchoolAssignments staffId={profile.id} />
          ) : (
            <Card onClick={() => navigate('/clock-in')} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center shrink-0">
                <School size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1a3a6b] text-sm">Clock In / Out</p>
                <p className="text-xs text-gray-400 mt-0.5">Record your session time</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Card>
          )}
        </div>

        {/* Announcements */}
        <AnnouncementsSection area={profile.area} isDirector={profile.role === 'director'} />

        {/* My Area CTA */}
        <button
          onClick={() => navigate('/my-area')}
          className="w-full flex items-center justify-between bg-[#1a3a6b] text-white px-5 py-4 rounded-2xl shadow-md active:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <UserCircle size={22} />
            <div className="text-left">
              <p className="font-bold text-base leading-tight">My Area</p>
              <p className="text-xs text-white/70 mt-0.5">Timesheet, expenses, documents & more</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-white/60" />
        </button>

      </div>
    </Layout>
  )
}

function AnnouncementsSection({ area, isDirector }: { area?: string; isDirector: boolean }) {
  const [pinned, setPinned] = useState<Announcement[]>([])
  const [hasUnpinned, setHasUnpinned] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isDirector) {
      if (area) {
        query = query.or(`area.is.null,area.eq.${area}`)
      } else {
        query = query.is('area', null)
      }
    }

    query.then(({ data }) => {
      if (data) {
        setPinned(data.filter(a => a.is_pinned))
        setHasUnpinned(data.some(a => !a.is_pinned))
      }
      setLoaded(true)
    })
  }, [area, isDirector])

  if (!loaded || (pinned.length === 0 && !hasUnpinned)) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Megaphone size={15} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Announcements</h3>
        </div>
        <button
          onClick={() => navigate('/announcements')}
          className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b]"
        >
          View all <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {pinned.map(a => (
          <div key={a.id} className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
            <div className="flex items-start gap-2">
              <Pin size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a3a6b] text-sm">{a.title}</p>
                {a.body && (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-snug">{a.body}</p>
                )}
                {a.link_url && (
                  <a
                    href={a.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-semibold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-lg"
                  >
                    {a.link_label || 'Open Link'}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">{timeAgo(a.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
        {pinned.length === 0 && hasUnpinned && (
          <button
            onClick={() => navigate('/announcements')}
            className="w-full text-left bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3.5 flex items-center justify-between"
          >
            <p className="text-sm font-medium text-[#1a3a6b]">New announcements available</p>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  )
}

function SchoolAssignments({ staffId }: { staffId: string }) {
  const [schools, setSchools] = useState<{ name: string; session_day: string; session_time: string }[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('staff_school_assignments')
      .select('school:schools(name, session_day, session_time)')
      .eq('staff_id', staffId)
      .then(({ data }) => {
        if (data) setSchools(data.map((d: any) => d.school).filter(Boolean))
      })
  }, [staffId])

  if (schools.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-sm">No schools assigned yet. Contact your Area Lead.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {schools.map((school) => (
        <Card key={school.name} onClick={() => navigate('/clock-in')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center shrink-0">
              <School size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1a3a6b] truncate">{school.name}</p>
              <p className="text-xs text-gray-500">{school.session_day} · {school.session_time}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  )
}
