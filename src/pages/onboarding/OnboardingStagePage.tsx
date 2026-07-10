import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string
  title: string
  description: string | null
}

interface Task {
  id: string
  title: string
  type: string
  display_order: number
  is_mandatory: boolean
}

interface TaskAssignment {
  id: string
  task_id: string
  status: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  content:     'Learning module',
  quiz:        'Knowledge check',
  upload:      'Document upload',
  declaration: 'Declaration',
  contract:    'Contract',
  placement:   'Placement',
}

function taskStatusIcon(status: string | undefined) {
  if (!status || status === 'not_started') return <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200" />
  if (status === 'completed' || status === 'approved') return <CheckCircle2 size={20} className="text-green-500" />
  if (status === 'rejected' || status === 'action_required') return <AlertCircle size={20} className="text-red-500" />
  if (status === 'awaiting_review') return <Clock size={20} className="text-amber-500" />
  return <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300" />
}

function taskStatusLabel(status: string | undefined): { text: string; cls: string } {
  switch (status) {
    case 'completed':
    case 'approved':       return { text: 'Completed',      cls: 'text-green-600' }
    case 'awaiting_review': return { text: 'Awaiting review', cls: 'text-amber-600' }
    case 'rejected':
    case 'action_required': return { text: 'Action required', cls: 'text-red-600' }
    case 'in_progress':    return { text: 'In progress',    cls: 'text-blue-600' }
    default:               return { text: 'Not started',    cls: 'text-gray-400' }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingStagePage() {
  const { stageId } = useParams<{ stageId: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [stage, setStage] = useState<Stage | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && stageId) load()
  }, [profile?.id, stageId])

  async function load() {
    if (!profile || !stageId) return
    setLoading(true)

    const [{ data: stageRow }, { data: taskRows }, { data: enrollRow }] = await Promise.all([
      supabase
        .from('onboarding_stages')
        .select('id, title, description')
        .eq('id', stageId)
        .single(),
      supabase
        .from('onboarding_tasks')
        .select('id, title, type, display_order, is_mandatory')
        .eq('stage_id', stageId)
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('onboarding_enrollments')
        .select('id')
        .eq('staff_id', profile.id)
        .eq('enrollment_type', 'initial')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ])

    setStage(stageRow)
    setTasks(taskRows ?? [])
    const eid = enrollRow?.id ?? null
    setEnrollmentId(eid)

    if (eid && taskRows && taskRows.length > 0) {
      const { data: assignRows } = await supabase
        .from('onboarding_task_assignments')
        .select('id, task_id, status')
        .eq('enrollment_id', eid)
        .in('task_id', taskRows.map(t => t.id))
      setAssignments(assignRows ?? [])
    }

    setLoading(false)
  }

  const assignmentMap = Object.fromEntries(assignments.map(a => [a.task_id, a]))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center">
        <div className="w-7 h-7 border-[3px] border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stage) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm">Stage not found.</p>
      </div>
    )
  }

  const completedCount = tasks.filter(t => {
    const s = assignmentMap[t.id]?.status
    return s === 'completed' || s === 'approved'
  }).length

  return (
    <div className="min-h-screen bg-[#f5f7fc] flex flex-col">

      {/* Top bar */}
      <div className="bg-[#1a3a6b] px-4 pt-safe-top">
        <div className="flex items-center gap-3 py-3.5">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{stage.title}</p>
            <p className="text-white/50 text-[11px]">
              {tasks.length > 0 ? `${completedCount} of ${tasks.length} complete` : 'No tasks yet'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-16 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Description */}
        {stage.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{stage.description}</p>
        )}

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-8 text-center">
            <Lock size={20} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-400">Tasks coming soon</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Your area lead is setting up the content for this stage.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Tasks</p>
            {tasks.map(task => {
              const assignment = assignmentMap[task.id]
              const { text, cls } = taskStatusLabel(assignment?.status)
              const isDone = assignment?.status === 'completed' || assignment?.status === 'approved'
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border shadow-sm px-4 py-3.5 flex items-center gap-3 ${
                    isDone ? 'border-green-100' : 'border-gray-100'
                  }`}
                >
                  <div className="shrink-0">
                    {taskStatusIcon(assignment?.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${isDone ? 'text-gray-400' : 'text-[#1a3a6b]'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-semibold">
                        {TYPE_LABELS[task.type] ?? task.type}
                      </span>
                      {!task.is_mandatory && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-semibold">Optional</span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs font-semibold shrink-0 ${cls}`}>{text}</p>
                </div>
              )
            })}
          </div>
        )}

        {!enrollmentId && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-700">
            You don't have an active enrollment. Contact your area lead.
          </div>
        )}

      </div>
    </div>
  )
}
