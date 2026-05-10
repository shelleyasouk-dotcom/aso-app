import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ClipboardList, Award, Settings, Users, School, KeyRound, Pin, Megaphone, FileText, UserCircle, ReceiptText, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ROLE_LABELS, canClockIn, canManageSchools, canViewRegisters, canViewTimesheets } from '../../lib/roles'
import type { Announcement } from '../../types'

interface QuickAction {
  label: string
  description: string
  icon: React.ElementType
  path: string
  color: string
}

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

  const actions: QuickAction[] = [
    ...(canClockIn(profile.role)
      ? [{
          label: 'Clock In / Out',
          description: 'Record your session time',
          icon: Clock,
          path: '/clock-in',
          color: 'bg-blue-50 text-[#1a3a6b]',
        }]
      : []),
    ...(canViewRegisters(profile.role)
      ? [{
          label: 'Session Register',
          description: 'Take or view attendance',
          icon: ClipboardList,
          path: '/registers',
          color: 'bg-yellow-50 text-[#1a3a6b]',
        }]
      : []),
    {
      label: 'Awards',
      description: 'Track UKAG progress',
      icon: Award,
      path: '/awards',
      color: 'bg-green-50 text-green-800',
    },
    ...(canViewTimesheets(profile.role)
      ? [{
          label: 'Timesheets',
          description: 'View staff hours',
          icon: Users,
          path: '/timesheets',
          color: 'bg-purple-50 text-purple-800',
        }]
      : []),
    {
      label: 'Documents',
      description: 'Policies & handbooks',
      icon: FileText,
      path: '/documents',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'My Profile',
      description: 'Digital ID & certificates',
      icon: UserCircle,
      path: '/profile',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Expenses',
      description: 'Submit travel & mileage',
      icon: ReceiptText,
      path: '/expenses',
      color: 'bg-orange-50 text-orange-700',
    },
    ...(canManageSchools(profile.role) || profile.role === 'area_lead'
      ? [{
          label: 'Admin Panel',
          description: 'Manage schools & staff',
          icon: Settings,
          path: '/admin',
          color: 'bg-gray-50 text-gray-700',
        }]
      : []),
  ]

  return (
    <Layout title="ASO Coaching">
      <div className="px-4 pt-6 pb-4">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a3a6b]">Hi, {firstName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge color="blue">{ROLE_LABELS[profile.role]}</Badge>
          </div>
        </div>

        {/* Announcements */}
        <AnnouncementsSection area={profile.area} isDirector={profile.role === 'director'} />

        {/* Quick actions */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#1a3a6b] text-sm leading-tight">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Change password link */}
        <button
          onClick={() => navigate('/change-password')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1a3a6b] transition-colors mt-2"
        >
          <KeyRound size={14} /> Change my password
        </button>

        {/* School info for coaches */}
        {!canManageSchools(profile.role) && profile.role !== 'area_lead' && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Your School(s)
            </h3>
            <SchoolAssignments staffId={profile.id} />
          </div>
        )}
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
    <div className="mb-6">
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
            <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center">
              <School size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1a3a6b]">{school.name}</p>
              <p className="text-xs text-gray-500">{school.session_day} · {school.session_time}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
