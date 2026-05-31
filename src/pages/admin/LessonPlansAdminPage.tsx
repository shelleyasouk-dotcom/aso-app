import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Eye, EyeOff, BookOpen, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { LessonPlan, SessionFeedback, School, Profile } from '../../types'

interface FeedbackWithRelations extends SessionFeedback {
  school: School
  coach: Profile
}

interface PlanForm {
  semester: string
  week_number: string
  title: string
  objectives: string
  warm_up: string
  activities: string[]
  cool_down: string
  coaching_points: string
  equipment_needed: string
  resource_url: string
}

const EMPTY_FORM: PlanForm = {
  semester: 'Semester 6',
  week_number: '',
  title: '',
  objectives: '',
  warm_up: '',
  activities: [''],
  cool_down: '',
  coaching_points: '',
  equipment_needed: '',
  resource_url: '',
}

export function LessonPlansAdminPage() {
  const [tab, setTab] = useState<'plans' | 'feedback'>('plans')
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [feedback, setFeedback] = useState<FeedbackWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [plansRes, feedbackRes] = await Promise.all([
      supabase.from('lesson_plans').select('*').order('week_number'),
      supabase
        .from('session_feedback')
        .select('*, school:schools(id,name,area), coach:profiles(id,full_name)')
        .order('submitted_at', { ascending: false }),
    ])
    setPlans((plansRes.data ?? []) as LessonPlan[])
    setFeedback((feedbackRes.data ?? []) as FeedbackWithRelations[])
    setLoading(false)
  }

  function field(key: keyof Omit<PlanForm, 'activities'>, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setActivity(idx: number, value: string) {
    setForm(f => ({ ...f, activities: f.activities.map((a, i) => i === idx ? value : a) }))
  }

  function addActivity() {
    setForm(f => ({ ...f, activities: [...f.activities, ''] }))
  }

  function removeActivity(idx: number) {
    setForm(f => ({ ...f, activities: f.activities.filter((_, i) => i !== idx) }))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(plan: LessonPlan) {
    setForm({
      semester: plan.semester,
      week_number: String(plan.week_number),
      title: plan.title,
      objectives: plan.objectives ?? '',
      warm_up: plan.warm_up ?? '',
      activities: plan.activities.length > 0 ? plan.activities : [''],
      cool_down: plan.cool_down ?? '',
      coaching_points: plan.coaching_points ?? '',
      equipment_needed: plan.equipment_needed ?? '',
      resource_url: plan.resource_url ?? '',
    })
    setEditingId(plan.id)
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditingId(null) }

  async function handleSave() {
    setSaving(true)
    const acts = form.activities.filter(a => a.trim() !== '')
    const payload = {
      semester: form.semester,
      week_number: parseInt(form.week_number) || 1,
      title: form.title,
      objectives: form.objectives || null,
      warm_up: form.warm_up || null,
      activities: acts,
      cool_down: form.cool_down || null,
      coaching_points: form.coaching_points || null,
      equipment_needed: form.equipment_needed || null,
      resource_url: form.resource_url || null,
    }
    if (editingId) {
      await supabase.from('lesson_plans').update(payload).eq('id', editingId)
    } else {
      await supabase.from('lesson_plans').insert(payload)
    }
    closeForm()
    await loadAll()
    setSaving(false)
  }

  async function togglePublished(plan: LessonPlan) {
    await supabase.from('lesson_plans').update({ is_published: !plan.is_published }).eq('id', plan.id)
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_published: !p.is_published } : p))
  }

  async function deletePlan(id: string) {
    if (!confirm('Delete this lesson plan? All submitted feedback linked to it will still be kept.')) return
    await supabase.from('lesson_plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  const bySemester = plans.reduce<Record<string, LessonPlan[]>>((acc, p) => {
    acc[p.semester] = [...(acc[p.semester] ?? []), p]
    return acc
  }, {})

  const semesters = Object.keys(bySemester)
  const filteredFeedback = feedbackFilter === 'all'
    ? feedback
    : feedback.filter(f => f.lesson_plan_id === feedbackFilter)

  if (loading) return (
    <Layout title="Lesson Plans">
      <div className="px-4 pt-6 text-sm text-gray-400">Loading…</div>
    </Layout>
  )

  return (
    <Layout title="Lesson Plans">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('plans')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'plans' ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <BookOpen size={14} /> Plans
          </button>
          <button
            onClick={() => setTab('feedback')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'feedback' ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <MessageSquare size={14} /> Feedback
            {feedback.length > 0 && (
              <span className="bg-[#f5c518] text-[#1a3a6b] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {feedback.length}
              </span>
            )}
          </button>
        </div>

        {/* ── PLANS TAB ── */}
        {tab === 'plans' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">Create and publish weekly lesson plans for coaches.</p>
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} className="mr-1" /> Add Plan
              </Button>
            </div>

            {plans.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No plans yet. Add one above.</p>
            ) : (
              semesters.map(sem => (
                <div key={sem}>
                  <p className="text-xs font-extrabold text-[#1a3a6b] uppercase tracking-wider mb-2 px-1">{sem}</p>
                  <div className="flex flex-col gap-3">
                    {bySemester[sem].map(plan => {
                      const feedbackCount = feedback.filter(f => f.lesson_plan_id === plan.id).length
                      return (
                        <Card key={plan.id}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-extrabold text-[#1a3a6b]/50">Week {plan.week_number}</span>
                                {feedbackCount > 0 && (
                                  <button
                                    onClick={() => { setFeedbackFilter(plan.id); setTab('feedback') }}
                                    className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                                  >
                                    {feedbackCount} feedback{feedbackCount !== 1 ? 's' : ''}
                                  </button>
                                )}
                              </div>
                              <p className="font-bold text-gray-800 text-sm truncate">{plan.title}</p>
                              {plan.activities.length > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">{plan.activities.length} activities</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => togglePublished(plan)}
                                className={`flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg transition-colors ${
                                  plan.is_published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {plan.is_published ? <><Eye size={10} /> Live</> : <><EyeOff size={10} /> Draft</>}
                              </button>
                              <button onClick={() => openEdit(plan)}>
                                <Pencil size={14} className="text-gray-400 hover:text-[#1a3a6b]" />
                              </button>
                              <button onClick={() => deletePlan(plan.id)}>
                                <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── FEEDBACK TAB ── */}
        {tab === 'feedback' && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFeedbackFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  feedbackFilter === 'all' ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                All
              </button>
              {plans.filter(p => feedback.some(f => f.lesson_plan_id === p.id)).map(p => (
                <button
                  key={p.id}
                  onClick={() => setFeedbackFilter(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    feedbackFilter === p.id ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Week {p.week_number}
                </button>
              ))}
            </div>

            {filteredFeedback.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No feedback submitted yet.</p>
            ) : (
              filteredFeedback.map(fb => {
                const isExpanded = expandedFeedback === fb.id
                const plan = plans.find(p => p.id === fb.lesson_plan_id)
                return (
                  <Card key={fb.id}>
                    <button
                      className="w-full flex items-start justify-between gap-3"
                      onClick={() => setExpandedFeedback(isExpanded ? null : fb.id)}
                    >
                      <div className="text-left min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{fb.coach?.full_name ?? 'Unknown coach'}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {fb.school?.name ?? 'Unknown school'}
                          {plan && ` · Week ${plan.week_number}`}
                          {fb.session_date && ` · ${new Date(fb.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {fb.photos.length > 0 && (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            {fb.photos.length} photo{fb.photos.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                        {fb.activities_completed.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Activities covered</p>
                            <div className="flex flex-wrap gap-1.5">
                              {fb.activities_completed.map(a => (
                                <span key={a} className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-lg">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {fb.overall_notes && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Session notes</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.overall_notes}</p>
                          </div>
                        )}
                        {fb.highlights && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Highlights</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.highlights}</p>
                          </div>
                        )}
                        {fb.challenges && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Challenges</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.challenges}</p>
                          </div>
                        )}
                        {fb.photos.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Photos</p>
                            <div className="grid grid-cols-3 gap-2">
                              {fb.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          Submitted {new Date(fb.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </>
        )}
      </div>

      {/* ── Create / Edit modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-5 py-4 rounded-t-2xl">
              <p className="font-bold text-[#1a3a6b]">{editingId ? 'Edit Lesson Plan' : 'New Lesson Plan'}</p>
              <button onClick={closeForm}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Input id="lp-sem" label="Semester" placeholder="Semester 6" value={form.semester} onChange={e => field('semester', e.target.value)} />
                <Input id="lp-wk" label="Week number *" type="number" placeholder="1" value={form.week_number} onChange={e => field('week_number', e.target.value)} />
              </div>

              <Input id="lp-title" label="Title *" placeholder="e.g. Balance & Coordination" value={form.title} onChange={e => field('title', e.target.value)} />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Session objectives</label>
                <textarea rows={2} placeholder="What children will learn this week..."
                  value={form.objectives} onChange={e => field('objectives', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Warm-up</label>
                <textarea rows={2} placeholder="Warm-up description..."
                  value={form.warm_up} onChange={e => field('warm_up', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>

              {/* Activities dynamic list */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Activities</label>
                <div className="flex flex-col gap-2">
                  {form.activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Activity ${i + 1}`}
                        value={act}
                        onChange={e => setActivity(i, e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                      />
                      {form.activities.length > 1 && (
                        <button onClick={() => removeActivity(i)} className="shrink-0">
                          <X size={14} className="text-gray-300 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addActivity}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] px-3 py-2 border border-dashed border-[#1a3a6b]/30 rounded-xl hover:bg-[#1a3a6b]/5 transition-colors"
                  >
                    <Plus size={13} /> Add activity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cool-down</label>
                <textarea rows={2} placeholder="Cool-down description..."
                  value={form.cool_down} onChange={e => field('cool_down', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Coaching points</label>
                <textarea rows={2} placeholder="Key coaching cues and reminders..."
                  value={form.coaching_points} onChange={e => field('coaching_points', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>

              <Input id="lp-equip" label="Equipment needed" placeholder="e.g. Mats, beams, hoops" value={form.equipment_needed} onChange={e => field('equipment_needed', e.target.value)} />
              <Input id="lp-url" label="Resource PDF / URL" placeholder="https://..." value={form.resource_url} onChange={e => field('resource_url', e.target.value)} />

              <div className="flex gap-2 pt-1">
                <Button disabled={!form.title || !form.week_number || saving} onClick={handleSave}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Plan'}
                </Button>
                <Button variant="secondary" onClick={closeForm}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
