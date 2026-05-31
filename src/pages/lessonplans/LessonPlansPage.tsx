import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, ChevronRight, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import type { LessonPlan, SessionFeedback } from '../../types'

export function LessonPlansPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [myFeedback, setMyFeedback] = useState<SessionFeedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const [plansRes, feedbackRes] = await Promise.all([
        supabase.from('lesson_plans').select('*').eq('is_published', true).order('week_number'),
        supabase.from('session_feedback').select('lesson_plan_id').eq('coach_id', profile!.id),
      ])
      setPlans((plansRes.data ?? []) as LessonPlan[])
      setMyFeedback((feedbackRes.data ?? []) as SessionFeedback[])
      setLoading(false)
    }
    load()
  }, [profile])

  // Group plans by semester
  const bySemester = plans.reduce<Record<string, LessonPlan[]>>((acc, p) => {
    acc[p.semester] = [...(acc[p.semester] ?? []), p]
    return acc
  }, {})

  const submittedIds = new Set(myFeedback.map(f => f.lesson_plan_id))

  if (loading) return (
    <Layout title="Lesson Plans" showBack>
      <div className="px-4 pt-8 text-center text-gray-400 text-sm">Loading…</div>
    </Layout>
  )

  return (
    <Layout title="Lesson Plans" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-6">

        {Object.keys(bySemester).length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No lesson plans published yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — your area lead will upload plans before each term.</p>
          </div>
        ) : (
          Object.entries(bySemester).map(([semester, semPlans]) => (
            <div key={semester}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-[#1a3a6b]" />
                <h2 className="font-extrabold text-[#1a3a6b] text-base">{semester}</h2>
                <span className="text-xs text-gray-400">{semPlans.length} week{semPlans.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex flex-col gap-3">
                {semPlans.map(plan => {
                  const done = submittedIds.has(plan.id)
                  return (
                    <Card key={plan.id} onClick={() => navigate(`/lesson-plans/${plan.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-lg ${
                          done ? 'bg-green-100 text-green-700' : 'bg-[#1a3a6b]/10 text-[#1a3a6b]'
                        }`}>
                          {plan.week_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1a3a6b] leading-snug truncate">{plan.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400">Week {plan.week_number}</span>
                            {plan.activities.length > 0 && (
                              <span className="text-xs text-gray-400">{plan.activities.length} activities</span>
                            )}
                            {done ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                <CheckCircle size={11} /> Feedback submitted
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-amber-500">
                                <Clock size={11} /> Feedback pending
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 shrink-0" />
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}

        <p className="text-xs text-gray-400 text-center">
          Submit your weekly feedback after each session to keep your area lead up to date.
        </p>
      </div>
    </Layout>
  )
}
