import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, ClipboardList, Archive, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { LESSON_PLANS } from '../../data/lessonPlans'
import type { SessionFeedback, Profile, School, AcademicSemester } from '../../types'

type FeedbackRow = SessionFeedback & { coach?: Profile; school?: School }

export function LessonPlansAdminPage() {
  const [semesters, setSemesters] = useState<AcademicSemester[]>([])
  const [selectedSemId, setSelectedSemId] = useState<string | null>(null)
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'lead' | 'coach'>('all')
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const loadSemesters = useCallback(async () => {
    const { data } = await supabase
      .from('academic_semesters')
      .select('*')
      .order('academic_year', { ascending: false })
      .order('semester_number')
    const rows = (data ?? []) as AcademicSemester[]
    setSemesters(rows)
    const current = rows.find(s => s.is_current)
    if (current && !selectedSemId) setSelectedSemId(current.id)
  }, [selectedSemId])

  useEffect(() => { loadSemesters() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSem = semesters.find(s => s.id === selectedSemId)

  useEffect(() => {
    if (!selectedSem) return
    async function load() {
      setLoading(true)
      let q = supabase
        .from('session_feedback')
        .select('*, coach:profiles(*), school:schools(*)')
        .eq('semester_number', selectedSem!.semester_number)
        .eq('academic_year', selectedSem!.academic_year)
        .order('week_number')
        .order('submitted_at', { ascending: false })

      if (weekFilter !== null) q = q.eq('week_number', weekFilter)
      if (typeFilter !== 'all') q = q.eq('feedback_type', typeFilter)

      const { data } = await q
      setFeedback((data ?? []) as FeedbackRow[])
      setLoading(false)
    }
    load()
  }, [selectedSem, weekFilter, typeFilter])

  async function archiveAndAdvance() {
    if (!selectedSem) return
    setArchiving(true)
    try {
      // Archive current semester
      await supabase
        .from('academic_semesters')
        .update({ is_current: false, is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', selectedSem.id)

      // Find or create next semester
      const nextSemNum = selectedSem.semester_number === 6 ? 1 : selectedSem.semester_number + 1
      const nextYear = selectedSem.semester_number === 6
        ? advanceAcademicYear(selectedSem.academic_year)
        : selectedSem.academic_year

      // Check if next semester already exists
      const { data: existing } = await supabase
        .from('academic_semesters')
        .select('id')
        .eq('academic_year', nextYear)
        .eq('semester_number', nextSemNum)
        .single()

      if (existing) {
        await supabase
          .from('academic_semesters')
          .update({ is_current: true, is_archived: false })
          .eq('id', existing.id)
      } else {
        await supabase.from('academic_semesters').insert({
          academic_year: nextYear,
          semester_number: nextSemNum,
          label: `Semester ${nextSemNum}`,
          is_current: true,
          is_archived: false,
        })
      }

      setShowArchiveConfirm(false)
      await loadSemesters()
    } finally {
      setArchiving(false)
    }
  }

  function advanceAcademicYear(year: string): string {
    const parts = year.split('/')
    if (parts.length === 2) {
      const start = parseInt(parts[0]) + 1
      const end = parseInt(parts[1]) + 1
      return `${start}/${end}`
    }
    return year
  }

  const currentSem = semesters.find(s => s.is_current)
  const leadCount = feedback.filter(f => f.feedback_type === 'lead').length
  const coachCount = feedback.filter(f => f.feedback_type === 'coach').length

  // Check if all 6 lead reports submitted for selected semester
  const leadWeeksSubmitted = new Set(feedback.filter(f => f.feedback_type === 'lead').map(f => f.week_number)).size
  const allLeadFeedbackIn = leadWeeksSubmitted >= 6

  return (
    <Layout title="Lesson Feedback" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4">

        {/* Semester Management Card */}
        <div className="bg-[#1a3a6b] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-[#f5c518]" />
            <p className="font-extrabold text-sm">Semester Management</p>
          </div>
          {currentSem ? (
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-white/70 text-xs">Currently active</p>
                <p className="font-extrabold text-base">{currentSem.label ?? `Semester ${currentSem.semester_number}`}</p>
                <p className="text-white/60 text-xs">{currentSem.academic_year}</p>
              </div>
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                <Archive size={13} /> Archive & Advance
              </button>
            </div>
          ) : (
            <p className="text-white/60 text-sm mt-1">No active semester — all archived.</p>
          )}
        </div>

        {/* Archive & Advance confirmation modal */}
        {showArchiveConfirm && currentSem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 flex flex-col gap-4">
              <p className="font-extrabold text-gray-800 text-lg">Archive this semester?</p>
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Archiving</p>
                    <p className="font-extrabold text-[#1a3a6b] text-sm">{currentSem.label ?? `Sem ${currentSem.semester_number}`}</p>
                    <p className="text-xs text-gray-400">{currentSem.academic_year}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 shrink-0" />
                  <div className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Next active</p>
                    <p className="font-extrabold text-green-700 text-sm">
                      Sem {currentSem.semester_number === 6 ? 1 : currentSem.semester_number + 1}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentSem.semester_number === 6 ? advanceAcademicYear(currentSem.academic_year) : currentSem.academic_year}
                    </p>
                  </div>
                </div>
                {!allLeadFeedbackIn && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠️ Only {leadWeeksSubmitted}/6 lead reports submitted. You can still archive, but consider chasing missing reports first.
                  </p>
                )}
                {allLeadFeedbackIn && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <CheckCircle size={13} /> All 6 lead reports submitted — ready to archive.
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                This will mark Semester {currentSem.semester_number} as archived (read-only) and activate the next semester. This cannot be undone automatically.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={archiveAndAdvance}
                  disabled={archiving}
                  className="flex-1 bg-[#1a3a6b] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Archive size={14} />
                  {archiving ? 'Archiving…' : 'Archive & Advance'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Semester selector */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">View feedback for</p>
          <div className="flex flex-wrap gap-1.5">
            {semesters.map(sem => (
              <button
                key={sem.id}
                onClick={() => { setSelectedSemId(sem.id); setWeekFilter(null) }}
                className={`px-3 h-9 rounded-xl text-xs font-extrabold transition-colors ${
                  sem.id === selectedSemId
                    ? 'bg-[#1a3a6b] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                S{sem.semester_number}
                {sem.academic_year !== semesters[0]?.academic_year && (
                  <span className="text-[10px] opacity-70 ml-1">{sem.academic_year.slice(2, 4)}/{sem.academic_year.slice(7, 9)}</span>
                )}
                {sem.is_current && <span className="text-[10px] ml-1">●</span>}
              </button>
            ))}
          </div>
          {selectedSem && (
            <p className="text-xs text-gray-400 mt-1.5">
              {selectedSem.label ?? `Semester ${selectedSem.semester_number}`} · {selectedSem.academic_year}
              {selectedSem.is_archived && ' · Archived'}
              {selectedSem.is_current && ' · Active'}
            </p>
          )}
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
          {([['all', `All (${leadCount + coachCount})`], ['lead', `Lead (${leadCount})`], ['coach', `Notes (${coachCount})`]] as const).map(([val, label]) => (
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
            <p className="font-semibold text-gray-500">No feedback for this selection</p>
            <p className="text-sm text-gray-400 mt-1">Feedback will appear here once coaches submit notes or reports.</p>
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
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                          {row.academic_year} · S{row.semester_number} W{row.week_number}
                        </span>
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
