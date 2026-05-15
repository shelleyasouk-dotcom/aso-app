import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ClipboardList,
  Calendar,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { useSchoolId, useIsAdminView } from '../../hooks/useSchoolId'
import type { School } from '../../types'

function nextOccurrence(dayName: string): string {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const target = days.indexOf(dayName)
  if (target < 0) return ''
  const today = new Date()
  const diff = (target - today.getDay() + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

interface Stat { label: string; value: string | number }

export function SchoolPortalPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const schoolId = useSchoolId()
  const isAdminView = useIsAdminView()
  const [school, setSchool] = useState<School | null>(null)
  const [childCount, setChildCount] = useState<number>(0)
  const [sessionCount, setSessionCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    async function load() {
      const [schoolRes, childRes, sessionRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId!).single(),
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!).eq('is_active', true),
        supabase.from('session_registers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId!),
      ])
      if (schoolRes.data) setSchool(schoolRes.data)
      setChildCount(childRes.count ?? 0)
      setSessionCount(sessionRes.count ?? 0)
      setLoading(false)
    }
    load()
  }, [profile?.school_id])

  if (!profile) return null
  if (!schoolId && !loading) {
    return (
      <SchoolLayout title="School Portal">
        <div className="px-4 pt-8 text-center">
          <p className="text-gray-500 text-sm">No school linked to this account.</p>
        </div>
      </SchoolLayout>
    )
  }
  if (loading) {
    return (
      <SchoolLayout title="School Portal">
        <div className="px-4 pt-8 flex flex-col gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </SchoolLayout>
    )
  }

  const stats: Stat[] = [
    { label: 'Pupils enrolled', value: childCount },
    { label: 'Sessions delivered', value: sessionCount },
  ]

  const qs = isAdminView ? `?schoolId=${params.get('schoolId')}` : ''
  const tiles = [
    { label: 'Weekly Register',     icon: ClipboardList,  path: `/school-portal/register${qs}`,     desc: 'View attendance records' },
    { label: 'Club Schedule',       icon: Calendar,       path: `/school-portal/club${qs}`,          desc: 'Upcoming sessions' },
    { label: 'Safeguarding',        icon: ShieldCheck,    path: `/school-portal/safeguarding${qs}`,  desc: 'DSL & DDSL contacts' },
    { label: 'Impact Reports',      icon: FileText,       path: `/school-portal/reports${qs}`,       desc: 'Termly reports' },
    { label: 'Facility Assessment', icon: ClipboardCheck, path: `/school-portal/facility${qs}`,      desc: school?.facility_form_completed ? 'View submitted form' : 'Action required' },
  ]

  return (
    <SchoolLayout title={school?.name ?? 'School Portal'}>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-5">

        {/* Admin viewing banner */}
        {isAdminView && (
          <button
            onClick={() => navigate(`/admin/school-portal/${params.get('schoolId')}`)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#1a3a6b] text-white text-xs font-semibold"
          >
            ← Admin view — tap to return to school admin panel
          </button>
        )}

        {/* Welcome */}
        <div>
          <p className="text-2xl font-bold text-[#1a3a6b]">Welcome</p>
          <p className="text-lg font-semibold text-gray-700">{school?.name ?? ''}</p>
          {school?.session_day && school?.session_time && (
            <p className="text-sm text-gray-500 mt-1">
              Your session: <span className="font-medium text-[#1a3a6b]">{school.session_day}s at {school.session_time}</span>
            </p>
          )}
        </div>

        {/* Facility form banner */}
        {school && !school.facility_form_completed && (
          <Card className="bg-amber-50 border border-amber-200" onClick={() => navigate(`/school-portal/facility${qs}`)}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Action required</p>
                <p className="text-xs text-amber-700 mt-0.5">Please complete your facility assessment to activate your club.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Next session */}
        {school?.session_day && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-[#1a3a6b]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Next Session</p>
                <p className="font-bold text-[#1a3a6b] text-sm">{nextOccurrence(school.session_day)}</p>
                {school.session_time && <p className="text-xs text-gray-500">{school.session_time}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Card key={s.label} className="text-center py-4">
              <p className="text-2xl font-black text-[#1a3a6b]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Navigation tiles */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Your Portal</p>
          <div className="flex flex-col gap-3">
            {tiles.map(({ label, icon: Icon, path, desc }) => {
              const isAction = label === 'Facility Assessment' && !school?.facility_form_completed
              return (
                <Card key={path} onClick={() => navigate(path)} className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isAction ? 'bg-amber-100' : 'bg-[#1a3a6b]/10'}`}>
                    <Icon size={22} className={isAction ? 'text-amber-600' : 'text-[#1a3a6b]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a3a6b] text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  {label === 'Facility Assessment' && school?.facility_form_completed && (
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                  )}
                  {isAction && (
                    <Users size={18} className="text-amber-500 shrink-0" />
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 pb-2 text-center">
          <p className="text-xs text-gray-400">Questions? Contact your ASO coordinator</p>
          <a href="mailto:info@activeschool.org.uk" className="text-xs text-[#1a3a6b] font-semibold">
            info@activeschool.org.uk
          </a>
        </div>

      </div>
    </SchoolLayout>
  )
}
