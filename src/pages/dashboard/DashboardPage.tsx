import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ClipboardList, Award, Settings, Users, School } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ROLE_LABELS, canClockIn, canManageSchools, canViewRegisters, canViewTimesheets } from '../../lib/roles'

interface QuickAction {
  label: string
  description: string
  icon: React.ElementType
  path: string
  color: string
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
    ...(canManageSchools(profile.role)
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

        {/* School info for coaches */}
        {!canManageSchools(profile.role) && (
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

function SchoolAssignments({ staffId }: { staffId: string }) {
  const [schools, setSchools] = useState<{ name: string; session_day: string; session_time: string }[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('staff_school_assignments')
      .select('school:schools(name, session_day, session_time)')
      .eq('staff_id', staffId)
      .then(({ data }) => {
        if (data) {
          setSchools(data.map((d: any) => d.school).filter(Boolean))
        }
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
