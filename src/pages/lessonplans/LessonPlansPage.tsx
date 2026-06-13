import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, ChevronRight, GraduationCap, Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { LESSON_PLANS } from '../../data/lessonPlans'
import type { AcademicSemester } from '../../types'

const WEEK_ROLE_LABELS: Record<number, string> = {
  1: 'coach note', 2: 'coach note', 3: 'lead report',
  4: 'lead report', 5: 'coach note', 6: 'coach note',
}

export function LessonPlansPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [semesters, setSemesters] = useState<AcademicSemester[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [showArchive, setShowArchive] = useState(false)

  const isLead = profile?.role === 'lead_coach' || profile?.role === 'area_lead' || profile?.role === 'director'

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data } = await supabase
        .from('academic_semesters')
        .select('*')
        .order('academic_year', { ascending: false })
        .order('semester_number')
      const rows = (data ?? []) as AcademicSemester[]
      setSemesters(rows)

      // Default to current semester
      const current = rows.find(s => s.is_current) ?? rows[0]
      if (current) setSelectedId(current.id)

      setLoading(false)
    }
    load()
  }, [profile])

  const selected = semesters.find(s => s.id === selectedId)

  // Load feedback status whenever selected semester changes
  useEffect(() => {
    if (!profile || !selected) return
    async function loadFeedback() {
      const { data } = await supabase
        .from('session_feedback')
        .select('week_number, feedback_type')
        .eq('coach_id', profile!.id)
        .eq('semester_number', selected!.semester_number)
        .eq('academic_year', selected!.academic_year)

      const map: Record<number, boolean> = {}
      for (const row of data ?? []) {
        if (isLead) {
          if (row.feedback_type === 'lead') map[row.week_number] = true
        } else {
          map[row.week_number] = true
        }
      }
      setSubmitted(map)
    }
    loadFeedback()
  }, [profile, selected, isLead])

  // Group semesters: current year active vs archived years
  const currentYear = semesters.find(s => s.is_current)?.academic_year
  const currentYearSemesters = semesters.filter(s => s.academic_year === currentYear)
  const archivedYears = Array.from(
    new Set(semesters.filter(s => s.academic_year !== currentYear).map(s => s.academic_year))
  )

  const doneCount = Object.keys(submitted).length

  if (loading) {
    return (
      <Layout title="Lesson Plans" showBack>
        <div className="px-4 pt-10 text-center text-sm text-gray-400">Loading…</div>
      </Layout>
    )
  }

  return (
    <Layout title="Lesson Plans" showBack>
      <div className="pb-10 flex flex-col gap-4">

        {/* Banner */}
        <div className="bg-[#1a3a6b] px-4 py-5 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap size={18} className="text-[#f5c518]" />
            <p className="font-extrabold text-base">ASO 6-Week Programme</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Each semester follows the same 6-week block. Select your current semester to view the plan and submit feedback.
          </p>
        </div>

        {/* Current year semester pills */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{currentYear ?? 'Academic Year'}</p>
            {selected?.is_current && (
              <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wide">Current year</span>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {currentYearSemesters.map(sem => {
              const isActive = sem.id === selectedId
              const isArchived = sem.is_archived
              const isCurrent = sem.is_current
              return (
                <button
                  key={sem.id}
                  onClick={() => setSelectedId(sem.id)}
                  className={`flex items-center gap-1 px-3 h-10 rounded-xl text-xs font-extrabold transition-colors ${
                    isActive
                      ? isCurrent
                        ? 'bg-[#1a3a6b] text-white'
                        : 'bg-gray-700 text-white'
                      : isArchived
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {isArchived && !isActive && <Lock size={10} />}
                  S{sem.semester_number}
                  {isCurrent && <span className="text-[8px] font-bold opacity-70 ml-0.5">NOW</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected semester info banner */}
        {selected && (
          <div className="px-4">
            <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
              selected.is_archived
                ? 'bg-gray-100 border border-gray-200'
                : 'bg-[#1a3a6b]/5 border border-[#1a3a6b]/15'
            }`}>
              {selected.is_archived ? (
                <Lock size={16} className="text-gray-400 shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-extrabold ${selected.is_archived ? 'text-gray-600' : 'text-[#1a3a6b]'}`}>
                  {selected.label ?? `Semester ${selected.semester_number}`} · {selected.academic_year}
                </p>
                <p className="text-xs text-gray-400">
                  {selected.is_archived
                    ? 'This semester is archived — feedback is read-only'
                    : selected.is_current
                      ? 'Active semester — submit your feedback after each week'
                      : 'Upcoming semester'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Director / area lead: link to staff reports */}
        {(profile?.role === 'director' || profile?.role === 'area_lead') && (
          <div className="px-4">
            <button
              onClick={() => navigate('/weekly-reports')}
              className="w-full flex items-center gap-3 bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-2xl px-4 py-3 text-left hover:bg-[#1a3a6b]/10 transition-colors"
            >
              <FileText size={18} className="text-[#1a3a6b] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-[#1a3a6b]">View Staff Reports</p>
                <p className="text-xs text-gray-500">See all weekly reports submitted by your coaches</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 shrink-0" />
            </button>
          </div>
        )}

        {/* Week cards */}
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">6 Weeks</p>
            {!loading && !selected?.is_archived && (
              <p className="text-xs text-gray-400">{doneCount} of 6 submitted</p>
            )}
          </div>

          {LESSON_PLANS.map(plan => {
            const done = submitted[plan.week] === true
            const isArchived = selected?.is_archived ?? false
            return (
              <button
                key={plan.week}
                onClick={() => navigate(`/lesson-plans/week/${plan.week}?semId=${selectedId}`)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-opacity shadow-sm"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${isArchived ? 'opacity-60' : ''} ${plan.pillBg}`}>
                  {plan.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Week {plan.week}</span>
                    {isLead && !isArchived && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize">
                        {WEEK_ROLE_LABELS[plan.week]}
                      </span>
                    )}
                    {isArchived && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock size={8} /> Archived
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-gray-800 text-sm leading-tight">{plan.theme}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-1">{plan.focus}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {done ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                      <CheckCircle size={12} /> Done
                    </span>
                  ) : !isArchived ? (
                    <span className="flex items-center gap-1 text-xs text-amber-500 whitespace-nowrap">
                      <Clock size={12} /> Pending
                    </span>
                  ) : null}
                  <ChevronRight size={15} className="text-gray-300" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Previous academic years archive */}
        {archivedYears.length > 0 && (
          <div className="px-4">
            <button
              onClick={() => setShowArchive(v => !v)}
              className="w-full flex items-center justify-between py-3 border-t border-gray-100"
            >
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Previous academic years</span>
              {showArchive ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {showArchive && (
              <div className="flex flex-col gap-2 mt-1">
                {archivedYears.map(year => (
                  <div key={year}>
                    <p className="text-xs font-bold text-gray-400 mb-1.5">{year}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {semesters.filter(s => s.academic_year === year).map(sem => (
                        <button
                          key={sem.id}
                          onClick={() => setSelectedId(sem.id)}
                          className={`flex items-center gap-1 px-3 h-9 rounded-xl text-xs font-extrabold transition-colors ${
                            sem.id === selectedId
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Lock size={10} />
                          S{sem.semester_number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="px-4 text-xs text-gray-400 text-center">
          {isLead
            ? 'Submit your weekly report at the end of each week. Coaches can also add brief session notes.'
            : 'Tap any week to view the session plan and leave a brief note after your session.'}
        </p>
      </div>
    </Layout>
  )
}
