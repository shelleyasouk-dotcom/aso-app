import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ClipboardList,
  Calendar,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  FolderOpen,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ArrowLeftRight,
  Briefcase,
  Phone,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { useSchoolId, useIsAdminView, setActiveSchoolId, getActiveSchoolId } from '../../hooks/useSchoolId'
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

interface Assignment { school_id: string; label: string | null; school?: School }
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
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showPicker, setShowPicker] = useState(false)

  // For school role: fetch all their assignments
  useEffect(() => {
    if (profile?.role !== 'school') return
    async function loadAssignments() {
      const { data } = await supabase
        .from('school_portal_assignments')
        .select('school_id, label, school:schools(id,name,session_day,session_time,area)')
        .eq('user_id', profile!.id)
      if (!data || data.length === 0) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list: Assignment[] = data.map((r: any) => ({
        school_id: r.school_id,
        label: r.label,
        school: Array.isArray(r.school) ? r.school[0] : r.school,
      }))
      setAssignments(list)

      // If no active selection yet, auto-select if only one school
      if (!getActiveSchoolId()) {
        if (list.length === 1) {
          setActiveSchoolId(list[0].school_id)
        } else {
          // Multiple — show picker
          setShowPicker(true)
          setLoading(false)
        }
      }
    }
    loadAssignments()
  }, [profile?.id, profile?.role])

  useEffect(() => {
    if (showPicker) return
    if (!schoolId) {
      setLoading(false)
      return
    }
    setLoading(true)
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
  }, [schoolId, showPicker])

  function pickSchool(id: string) {
    setActiveSchoolId(id)
    setShowPicker(false)
    setLoading(true)
  }

  if (!profile) return null

  // School picker screen
  if (showPicker && assignments.length > 0) {
    return (
      <SchoolLayout title="Select Club">
        <div className="px-4 pt-8 flex flex-col gap-4">
          <div className="text-center mb-2">
            <p className="text-xl font-bold text-[#1a3a6b]">Which club?</p>
            <p className="text-sm text-gray-500 mt-1">Select a club to view its portal</p>
          </div>
          {assignments.map(a => (
            <Card
              key={a.school_id}
              onClick={() => pickSchool(a.school_id)}
              className="flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                <Users size={22} className="text-[#1a3a6b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a3a6b]">{a.school?.name ?? a.school_id}</p>
                {a.label && <p className="text-xs font-semibold text-[#f5c518]">{a.label}</p>}
                {a.school?.session_day && (
                  <p className="text-xs text-gray-500 mt-0.5">{a.school.session_day}s · {a.school.session_time}</p>
                )}
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </Card>
          ))}
        </div>
      </SchoolLayout>
    )
  }

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
    { label: 'Weekly Register',  icon: ClipboardList,  path: `/school-portal/register${qs}`,    desc: 'View attendance records' },
    { label: 'Class Roster',     icon: Users,          path: `/school-portal/roster${qs}`,       desc: 'Children booked this term' },
    { label: 'Club Schedule',    icon: Calendar,       path: `/school-portal/club${qs}`,         desc: 'Upcoming sessions' },
    { label: 'Documents',        icon: FolderOpen,     path: `/school-portal/documents${qs}`,    desc: 'Policies & shared files' },
    { label: 'Safeguarding',     icon: ShieldCheck,    path: `/school-portal/safeguarding${qs}`, desc: 'DSL & DDSL contacts' },
    { label: 'Impact Reports',   icon: FileText,       path: `/school-portal/reports${qs}`,      desc: 'Termly reports' },
    { label: 'School Info Form', icon: ClipboardCheck, path: `/school-portal/info${qs}`,         desc: school?.facility_form_completed ? 'View submitted form' : 'Action required' },
    { label: 'Useful Contacts',  icon: Phone,          path: `/school-portal/contacts${qs}`,      desc: 'Key contacts & ASO team' },
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

        {/* Switch school button (multi-school users only) */}
        {!isAdminView && assignments.length > 1 && (
          <button
            onClick={() => { setActiveSchoolId(null); setShowPicker(true) }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[#1a3a6b]/30 text-[#1a3a6b] text-xs font-semibold"
          >
            <ArrowLeftRight size={14} /> Switch club
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
          <Card className="bg-amber-50 border border-amber-200" onClick={() => navigate(`/school-portal/info${qs}`)}>
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
              const isAction = label === 'School Info Form' && !school?.facility_form_completed
              return (
                <Card key={path} onClick={() => navigate(path)} className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isAction ? 'bg-amber-100' : 'bg-[#1a3a6b]/10'}`}>
                    <Icon size={22} className={isAction ? 'text-amber-600' : 'text-[#1a3a6b]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a3a6b] text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  {label === 'School Info Form' && school?.facility_form_completed && (
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                  )}
                  {isAction && (
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Work With Us */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-[#f5c518]" />
            <p className="font-bold text-sm">Know someone who'd make a great coach?</p>
          </div>
          <p className="text-white/70 text-xs leading-relaxed mb-4">
            We're always looking for passionate sports coaches in your area. Share our careers page with parents, staff, or anyone who loves working with young people.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="/portal/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#f5c518] text-[#1a3a6b] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              View vacancies <ChevronRight size={12} />
            </a>
            <a
              href="/portal/coach-pool"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Join the coach pool <ChevronRight size={12} />
            </a>
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
