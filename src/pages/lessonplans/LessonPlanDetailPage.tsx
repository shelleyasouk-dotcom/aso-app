import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  BookOpen, Target, Flame, Dumbbell, Wind, Lightbulb, Package,
  ExternalLink, CheckSquare, Square, Camera, X, Send, CheckCircle, Pencil,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import type { LessonPlan, SessionFeedback, School } from '../../types'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-[#1a3a6b] shrink-0" />
        <h3 className="font-bold text-[#1a3a6b] text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function LessonPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [plan, setPlan] = useState<LessonPlan | null>(null)
  const [mySchools, setMySchools] = useState<School[]>([])
  const [existingFeedback, setExistingFeedback] = useState<SessionFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingFeedback, setEditingFeedback] = useState(false)

  // Feedback form state
  const [schoolId, setSchoolId] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [activitiesDone, setActivitiesDone] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [highlights, setHighlights] = useState('')
  const [challenges, setChallenges] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id || !profile) return
    async function load() {
      const [planRes, schoolRes, feedbackRes] = await Promise.all([
        supabase.from('lesson_plans').select('*').eq('id', id).single(),
        supabase
          .from('staff_school_assignments')
          .select('school:schools(id,name,area)')
          .eq('staff_id', profile!.id),
        supabase
          .from('session_feedback')
          .select('*')
          .eq('lesson_plan_id', id)
          .eq('coach_id', profile!.id)
          .maybeSingle(),
      ])
      setPlan(planRes.data as LessonPlan)
      const schools = (schoolRes.data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((a: any) => a.school)
        .filter(Boolean) as School[]
      setMySchools(schools)
      if (schools.length === 1) setSchoolId(schools[0].id)

      const fb = feedbackRes.data as SessionFeedback | null
      setExistingFeedback(fb)
      if (fb) {
        setSchoolId(fb.school_id)
        setSessionDate(fb.session_date ?? new Date().toISOString().split('T')[0])
        setActivitiesDone(fb.activities_completed ?? [])
        setNotes(fb.overall_notes ?? '')
        setHighlights(fb.highlights ?? '')
        setChallenges(fb.challenges ?? '')
      }
      setLoading(false)
    }
    load()
  }, [id, profile])

  function toggleActivity(act: string) {
    setActivitiesDone(prev =>
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    )
  }

  function addPhotos(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPhotoFiles(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  function removePhoto(idx: number) {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (!profile || !schoolId) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      let feedbackId = existingFeedback?.id

      if (existingFeedback) {
        await supabase.from('session_feedback').update({
          school_id: schoolId,
          session_date: sessionDate,
          activities_completed: activitiesDone,
          overall_notes: notes || null,
          highlights: highlights || null,
          challenges: challenges || null,
        }).eq('id', existingFeedback.id)
      } else {
        const { data: inserted, error } = await supabase.from('session_feedback').insert({
          lesson_plan_id: id,
          school_id: schoolId,
          coach_id: profile.id,
          session_date: sessionDate,
          activities_completed: activitiesDone,
          overall_notes: notes || null,
          highlights: highlights || null,
          challenges: challenges || null,
          photos: [],
        }).select('id').single()
        if (error) throw error
        feedbackId = inserted.id
      }

      // Upload any new photos
      if (photoFiles.length > 0 && feedbackId) {
        const uploadedUrls: string[] = [...(existingFeedback?.photos ?? [])]
        for (const file of photoFiles) {
          const ext = file.name.split('.').pop() ?? 'jpg'
          const path = `feedback/${feedbackId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          const { error: upErr } = await supabase.storage.from('coach-files').upload(path, file, { contentType: file.type })
          if (!upErr) {
            const { data: urlData } = supabase.storage.from('coach-files').getPublicUrl(path)
            uploadedUrls.push(urlData.publicUrl)
          }
        }
        await supabase.from('session_feedback').update({ photos: uploadedUrls }).eq('id', feedbackId)
      }

      // Reload
      const { data: fb } = await supabase.from('session_feedback').select('*').eq('id', feedbackId).single()
      setExistingFeedback(fb as SessionFeedback)
      setPhotoFiles([])
      setPhotoPreviews([])
      setEditingFeedback(false)
    } catch (e) {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading || !plan) return (
    <Layout title="Lesson Plan" showBack>
      <div className="px-4 pt-8 text-center text-gray-400 text-sm">Loading…</div>
    </Layout>
  )

  return (
    <Layout title={`Week ${plan.week_number}`} showBack>
      <div className="px-4 pt-4 pb-12 flex flex-col gap-4">

        {/* Plan header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-5">
          <p className="text-xs font-extrabold text-white/50 uppercase tracking-widest mb-1">
            {plan.semester} · Week {plan.week_number}
          </p>
          <h1 className="text-xl font-extrabold leading-tight">{plan.title}</h1>
          {plan.equipment_needed && (
            <p className="text-xs text-white/60 mt-2 flex items-center gap-1.5">
              <Package size={12} className="text-[#f5c518]" />
              {plan.equipment_needed}
            </p>
          )}
        </div>

        {/* Objectives */}
        {plan.objectives && (
          <Section icon={Target} title="Session Objectives">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.objectives}</p>
          </Section>
        )}

        {/* Warm-up */}
        {plan.warm_up && (
          <Section icon={Flame} title="Warm-Up">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.warm_up}</p>
          </Section>
        )}

        {/* Activities */}
        {plan.activities.length > 0 && (
          <Section icon={Dumbbell} title="Activities">
            <div className="flex flex-col gap-2">
              {plan.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{act}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Cool-down */}
        {plan.cool_down && (
          <Section icon={Wind} title="Cool-Down">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.cool_down}</p>
          </Section>
        )}

        {/* Coaching points */}
        {plan.coaching_points && (
          <Section icon={Lightbulb} title="Coaching Points">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.coaching_points}</p>
          </Section>
        )}

        {/* Resource download */}
        {plan.resource_url && (
          <a
            href={plan.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-xl py-3 text-sm font-semibold text-[#1a3a6b]"
          >
            <BookOpen size={15} /> Download Full Plan <ExternalLink size={13} />
          </a>
        )}

        {/* ─────────── FEEDBACK SECTION ─────────── */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-[#1a3a6b] text-base">Session Feedback</h2>
            {existingFeedback && !editingFeedback && (
              <button
                onClick={() => setEditingFeedback(true)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1a3a6b]"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>

          {/* Already submitted — view mode */}
          {existingFeedback && !editingFeedback ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <p className="text-sm font-semibold text-green-700">Feedback submitted</p>
              </div>

              {existingFeedback.overall_notes && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Your notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingFeedback.overall_notes}</p>
                </div>
              )}

              {existingFeedback.activities_completed.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Activities covered</p>
                  <div className="flex flex-col gap-1">
                    {existingFeedback.activities_completed.map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={13} className="text-green-500 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingFeedback.highlights && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Highlights</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingFeedback.highlights}</p>
                </div>
              )}

              {existingFeedback.challenges && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Challenges</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingFeedback.challenges}</p>
                </div>
              )}

              {existingFeedback.photos.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingFeedback.photos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Session photo ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* Feedback form */
            <div className="flex flex-col gap-4">
              {/* School picker */}
              {mySchools.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">School</label>
                  <div className="flex flex-col gap-2">
                    {mySchools.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSchoolId(s.id)}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          schoolId === s.id
                            ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mySchools.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  You are not assigned to any schools yet. Ask your area lead to assign you before submitting feedback.
                </p>
              )}

              {/* Session date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Session date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                />
              </div>

              {/* Activities tick-off */}
              {plan.activities.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Activities covered this session
                  </label>
                  <div className="flex flex-col gap-2">
                    {plan.activities.map(act => {
                      const done = activitiesDone.includes(act)
                      return (
                        <button
                          key={act}
                          onClick={() => toggleActivity(act)}
                          className={`flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                            done
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          {done
                            ? <CheckSquare size={16} className="text-green-600 shrink-0" />
                            : <Square size={16} className="text-gray-300 shrink-0" />
                          }
                          {act}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  How did the session go?
                </label>
                <textarea
                  rows={3}
                  placeholder="Overall notes about the session..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Children highlights ⭐
                </label>
                <textarea
                  rows={2}
                  placeholder="Any children who stood out or achieved something great..."
                  value={highlights}
                  onChange={e => setHighlights(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
                />
              </div>

              {/* Challenges */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Any challenges or concerns?
                </label>
                <textarea
                  rows={2}
                  placeholder="Anything that didn't go to plan, safeguarding notes, etc..."
                  value={challenges}
                  onChange={e => setChallenges(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Session photos
                </label>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Also show already-saved photos when editing */}
                {editingFeedback && existingFeedback && existingFeedback.photos.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">Previously uploaded</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingFeedback.photos.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl opacity-60" />
                      ))}
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addPhotos(e.target.files)}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-400 hover:border-[#1a3a6b]/30 hover:text-[#1a3a6b] transition-colors"
                >
                  <Camera size={16} /> Add photos
                </button>
              </div>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{submitError}</p>
              )}

              <div className="flex gap-2">
                <Button
                  disabled={!schoolId || submitting}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  {submitting ? 'Submitting…' : (
                    <><Send size={14} className="mr-1.5" />{existingFeedback ? 'Update Feedback' : 'Submit Feedback'}</>
                  )}
                </Button>
                {editingFeedback && (
                  <Button variant="secondary" onClick={() => setEditingFeedback(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
