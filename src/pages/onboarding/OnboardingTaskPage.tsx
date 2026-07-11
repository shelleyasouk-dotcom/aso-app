import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { OnboardingTask, OnboardingTaskAssignment, OnboardingEnrollment } from '../../types/onboarding'
import { ContentTask } from './tasks/ContentTask'
import { QuizTask } from './tasks/QuizTask'
import { UploadTask } from './tasks/UploadTask'
import { DeclarationTask } from './tasks/DeclarationTask'

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingTaskPage() {
  const { stageId, taskId } = useParams<{ stageId: string; taskId: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [task, setTask] = useState<OnboardingTask | null>(null)
  const [assignment, setAssignment] = useState<OnboardingTaskAssignment | null>(null)
  const [enrollment, setEnrollment] = useState<OnboardingEnrollment | null>(null)
  const [nextTaskId, setNextTaskId] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (profile && taskId) load() }, [profile?.id, taskId])

  async function load() {
    if (!profile || !taskId) return
    setLoading(true)
    setError(null)

    // Load task + enrollment in parallel
    const [{ data: taskRow, error: taskErr }, { data: enrollRow }] = await Promise.all([
      supabase.from('onboarding_tasks').select(`
        id, stage_id, title, type, display_order, is_mandatory, version,
        content_json, pass_threshold_pct, questions_per_attempt,
        max_attempts, retry_delay_seconds, show_correct_answers,
        required_doc_category, required_doc_label,
        requires_expiry_date, requires_issue_date, requires_provider,
        requires_cert_number, requires_completion_date, requires_approval,
        allowed_file_types, max_file_size_mb,
        declaration_text, requires_typed_name
      `).eq('id', taskId).single(),
      supabase.from('onboarding_enrollments')
        .select('id, status, learning_completion_pct')
        .eq('staff_id', profile.id).eq('enrollment_type', 'initial')
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])

    if (taskErr || !taskRow) { setError('Task not found.'); setLoading(false); return }
    if (!enrollRow) { setError('No active enrollment found.'); setLoading(false); return }

    setTask(taskRow as OnboardingTask)
    setEnrollment(enrollRow as OnboardingEnrollment)

    // Compute next task in this stage for auto-advance
    const { data: stageTasks } = await supabase
      .from('onboarding_tasks')
      .select('id')
      .eq('stage_id', taskRow.stage_id)
      .order('display_order', { ascending: true })
    const idx = (stageTasks ?? []).findIndex(t => t.id === taskId)
    setNextTaskId(idx >= 0 && idx < (stageTasks ?? []).length - 1 ? (stageTasks![idx + 1].id) : null)

    // Check prerequisites
    const { data: prereqs } = await supabase
      .from('onboarding_task_prerequisites')
      .select('required_task_id')
      .eq('task_id', taskId)

    if (prereqs && prereqs.length > 0) {
      const requiredIds = prereqs.map(p => p.required_task_id)
      const { data: completedAssignments } = await supabase
        .from('onboarding_task_assignments')
        .select('task_id, status')
        .eq('enrollment_id', enrollRow.id)
        .in('task_id', requiredIds)

      const completedSet = new Set(
        (completedAssignments ?? [])
          .filter(a => a.status === 'completed' || a.status === 'approved')
          .map(a => a.task_id)
      )
      const isLocked = requiredIds.some(rid => !completedSet.has(rid))
      if (isLocked) { setLocked(true); setLoading(false); return }
    }

    // Get or create assignment
    let { data: existing } = await supabase
      .from('onboarding_task_assignments')
      .select('*')
      .eq('enrollment_id', enrollRow.id)
      .eq('task_id', taskId)
      .maybeSingle()

    if (!existing) {
      const { data: created } = await supabase
        .from('onboarding_task_assignments')
        .insert({
          enrollment_id: enrollRow.id,
          task_id: taskId,
          task_version: taskRow.version,
          display_order: taskRow.display_order,
          status: 'not_started',
        })
        .select()
        .single()
      existing = created
    }

    setAssignment(existing as OnboardingTaskAssignment)
    setLoading(false)
  }

  function goBack() {
    navigate(`/onboarding/stage/${stageId}`)
  }

  function handleComplete() {
    if (nextTaskId) {
      navigate(`/onboarding/stage/${stageId}/task/${nextTaskId}`)
    } else {
      goBack()
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center">
      <div className="w-7 h-7 border-[3px] border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (locked) return (
    <div className="min-h-screen bg-[#f5f7fc] flex flex-col">
      <div className="bg-[#1a3a6b] px-4 pt-safe-top">
        <div className="flex items-center gap-3 py-3.5">
          <button onClick={goBack} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={16} className="text-white" />
          </button>
          <p className="text-white font-bold text-sm">{task?.title ?? 'Task'}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Lock size={22} className="text-gray-400" />
        </div>
        <div>
          <p className="font-bold text-[#1a3a6b]">Task locked</p>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Complete the required tasks before this one becomes available.
          </p>
        </div>
        <button onClick={goBack} className="text-sm font-bold text-[#1a3a6b]">← Back to stage</button>
      </div>
    </div>
  )

  if (error || !task || !assignment || !enrollment) return (
    <div className="min-h-screen bg-[#f5f7fc] flex flex-col items-center justify-center px-4 gap-4">
      <p className="text-sm text-gray-400">{error ?? 'Something went wrong.'}</p>
      <button onClick={goBack} className="text-sm font-bold text-[#1a3a6b]">← Go back</button>
    </div>
  )

  const sharedProps = {
    task, assignment, enrollment,
    profileName: profile!.full_name,
    profileId: profile!.id,
    onComplete: handleComplete,
    onRefresh: load,
  }

  const taskContent = (() => {
    switch (task.type) {
      case 'content':     return <ContentTask     {...sharedProps} />
      case 'quiz':        return <QuizTask        {...sharedProps} />
      case 'upload':      return <UploadTask      {...sharedProps} />
      case 'declaration': return <DeclarationTask {...sharedProps} />
      default:
        return (
          <div className="flex-1 flex items-center justify-center px-6">
            <p className="text-sm text-gray-400 text-center">
              This task type ({task.type}) is not yet available. Contact your area lead.
            </p>
          </div>
        )
    }
  })()

  return (
    <div className="min-h-screen bg-[#f5f7fc] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#1a3a6b] px-4 pt-safe-top">
        <div className="flex items-center gap-3 py-3.5">
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{task.title}</p>
            <p className="text-white/50 text-[11px]">
              {task.type === 'content' ? 'Learning module' :
               task.type === 'quiz' ? 'Knowledge check' :
               task.type === 'upload' ? 'Document upload' :
               task.type === 'declaration' ? 'Declaration' : task.type}
            </p>
          </div>
        </div>
      </div>

      {taskContent}
    </div>
  )
}
