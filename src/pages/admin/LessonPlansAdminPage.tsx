import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, ClipboardList } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { LESSON_PLANS } from '../../data/lessonPlans'
import type { SessionFeedback, Profile, School } from '../../types'

type FeedbackRow = SessionFeedback & { coach?: Profile; school?: School }

const SEMESTERS = [1, 2, 3, 4, 5, 6]

export function LessonPlansAdminPage() {
  const [semester, setSemester] = useState(1)
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'lead' | 'coach'>('all')
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase
        .from('session_feedback')
        .select('*, coach:profiles(*), school:schools(*)')
        .eq('semester_number', semester)
        .order('week_number')
        .order('submitted_at', { ascending: false })

      if (weekFilter !== null) q = q.eq('week_number', weekFilter)
      if (typeFilter !== 'all') q = q.eq('feedback_type', typeFilter)

      const { data } = await q
      setFeedback((data ?? []) as FeedbackRow[])
      setLoading(false)
    }
    load()
  }, [semester, weekFilter, typeFilter])

  const leadCount = feedback.filter(f => f.feedback_type === 'lead').length
  const coachCount = feedback.filter(f => f.feedback_type === 'coach').length

  return (
    <Layout title="Lesson Feedback" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4">

        {/* Info banner */}
        <div className="bg-[#1a3a6b] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-[#f5c518]" />
            <p className="font-extrabold text-sm">Session Feedback Reports</p>
          </div>
          <p className="text-white/70 text-xs leading-relaxed">
            View lead coach weekly reports and coach session notes across all semesters and weeks.
          </p>
        </div>

        {/* Semester selector */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Semester</p>
          <div className="flex gap-1.5">
            {SEMESTERS.map(s => (
              <button
                key={s}
                onClick={() => { setSemester(s); setWeekFilter(null) }}
                className={`flex-1 h-9 rounded-xl text-sm font-extrabold transition-colors ${s === semester ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        {/* Week filter */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Week</p>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setWeekFilter(null)}
              className={`px-3 h-8 rounded-full text-xs font-bold transition-colors ${weekFilter === null ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              All weeks
            </button>
            {LESSON_PLANS.map(plan => (
              <button
                key={plan.week}
                onClick={() => setWeekFilter(plan.week)}
                className={`px-3 h-8 rounded-full text-xs font-bold transition-colors ${weekFilter === plan.week ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {plan.emoji} W{plan.week}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {([['all', `All (${leadCount + coachCount})`], ['lead', `Lead Reports (${leadCount})`], ['coach', `Coach Notes (${coachCount})`]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${typeFilter === val ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feedback list */}
        {loading ? (
          <div className="text-center py-10 text-sm text-gray-400">Loading…</div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No feedback submitted yet</p>
            <p className="text-sm text-gray-400 mt-1">Feedback will appear here once coaches submit their notes or reports.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedback.map(row => {
              const plan = LESSON_PLANS.find(p => p.week === row.week_number)
              const isExpanded = expandedId === row.id
              const isLead = row.feedback_type === 'lead'
              return (
                <div key={row.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  >
                    <div className="text-xl shrink-0">{plan?.emoji ?? '📋'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">S{row.semester_number} W{row.week_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLead ? 'bg-[#1a3a6b]/10 text-[#1a3a6b]' : 'bg-gray-100 text-gray-500'}`}>
                          {isLead ? 'Lead Report' : 'Coach Note'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 truncate">{row.coach?.full_name ?? 'Unknown coach'}</p>
                      <p className="text-xs text-gray-400 truncate">{row.school?.name ?? ''} · {new Date(row.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
                      {isLead && row.days_worked.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5">Days Worked</p>
                          <div className="flex flex-wrap gap-1.5">
                            {row.days_worked.map(d => <span key={d} className="bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-semibold px-2.5 py-1 rounded-full">{d}</span>)}
                          </div>
                        </div>
                      )}
                      {isLead && row.skills_covered.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Skills Covered</p>
                          {row.skills_covered.map(s => <p key={s} className="text-sm text-gray-700">· {s}</p>)}
                        </div>
                      )}
                      {isLead && row.award_sign_offs && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Award Sign-offs</p>
                          <p className="text-sm text-gray-700">{row.award_sign_offs}</p>
                        </div>
                      )}
                      {row.highlights && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Highlights</p>
                          <p className="text-sm text-gray-700">{row.highlights}</p>
                        </div>
                      )}
                      {row.challenges && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Challenges</p>
                          <p className="text-sm text-gray-700">{row.challenges}</p>
                        </div>
                      )}
                      {row.overall_notes && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1">Notes</p>
                          <p className="text-sm text-gray-700">{row.overall_notes}</p>
                        </div>
                      )}
                      {row.photos.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400 mb-1.5">Photos</p>
                          <div className="grid grid-cols-3 gap-2">
                            {row.photos.map(url => <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
