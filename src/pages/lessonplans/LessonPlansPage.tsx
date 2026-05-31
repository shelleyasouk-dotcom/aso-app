import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, ChevronRight, GraduationCap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { LESSON_PLANS } from '../../data/lessonPlans'

const SEMESTERS = [1, 2, 3, 4, 5, 6]

const WEEK_ROLE_LABELS: Record<number, string> = {
  1: 'coach note', 2: 'coach note', 3: 'lead report',
  4: 'lead report', 5: 'coach note', 6: 'coach note',
}

export function LessonPlansPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [semester, setSemester] = useState(1)
  const [submitted, setSubmitted] = useState<Record<number, Record<number, boolean>>>({})
  const [loading, setLoading] = useState(true)

  const isLead = profile?.role === 'lead_coach' || profile?.role === 'area_lead' || profile?.role === 'director'

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data } = await supabase
        .from('session_feedback')
        .select('semester_number, week_number, feedback_type')
        .eq('coach_id', profile!.id)

      const map: Record<number, Record<number, boolean>> = {}
      for (const row of (data ?? [])) {
        if (!map[row.semester_number]) map[row.semester_number] = {}
        if (isLead) {
          if (row.feedback_type === 'lead') map[row.semester_number][row.week_number] = true
        } else {
          map[row.semester_number][row.week_number] = true
        }
      }
      setSubmitted(map)
      setLoading(false)
    }
    load()
  }, [profile, isLead])

  const semesterSubmitted = submitted[semester] ?? {}
  const doneCount = Object.keys(semesterSubmitted).length

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
            Each semester follows the same 6-week block. Select your current semester, then tap a week to view the plan and submit feedback.
          </p>
        </div>

        {/* Semester selector */}
        <div className="px-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Current Semester</p>
          <div className="flex gap-2">
            {SEMESTERS.map(s => (
              <button
                key={s}
                onClick={() => setSemester(s)}
                className={`flex-1 h-10 rounded-xl text-sm font-extrabold transition-colors ${
                  s === semester ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        {/* Week cards */}
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Semester {semester} · 6 Weeks</p>
            {!loading && <p className="text-xs text-gray-400">{doneCount} of 6 submitted</p>}
          </div>

          {LESSON_PLANS.map(plan => {
            const done = semesterSubmitted[plan.week] === true
            return (
              <button
                key={plan.week}
                onClick={() => navigate(`/lesson-plans/week/${plan.week}?semester=${semester}`)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-opacity shadow-sm"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${plan.pillBg}`}>
                  {plan.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Week {plan.week}</span>
                    {isLead && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize">
                        {WEEK_ROLE_LABELS[plan.week]}
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-gray-800 text-sm leading-tight">{plan.theme}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-1">{plan.focus}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {loading ? (
                    <div className="w-14 h-4 bg-gray-100 rounded animate-pulse" />
                  ) : done ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                      <CheckCircle size={12} /> Done
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-500 whitespace-nowrap">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                  <ChevronRight size={15} className="text-gray-300" />
                </div>
              </button>
            )
          })}
        </div>

        <p className="px-4 text-xs text-gray-400 text-center">
          {isLead
            ? 'Submit your weekly report at the end of each week. Coaches can also add brief session notes.'
            : 'Tap any week to view the session plan and leave a brief note after your session.'}
        </p>
      </div>
    </Layout>
  )
}
