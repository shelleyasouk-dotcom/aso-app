import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Clock, PauseCircle, ChevronRight, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string
  title: string
  description: string | null
  display_order: number
  is_mandatory: boolean
  exclude_from_pct: boolean
}

interface TaskAssignment {
  id: string
  task_id: string
  status: string
  task: { stage_id: string } | null
}

interface Enrollment {
  id: string
  status: string
  enrollment_type: string
  learning_completion_pct: number
  on_hold_reason: string | null
  enrolled_at: string
  last_activity_at: string
}

type StageStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'action_required' | 'completed'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  invited:               'Invited — welcome to Active School',
  not_started:           'Your onboarding is ready. Start when you are.',
  in_progress:           'In progress — keep going.',
  staff_action_required: 'Action required — please check the stages below.',
  awaiting_review:       'Your submissions are being reviewed.',
  documents_outstanding: 'Some documents need attention.',
  ready_for_contract:    'Ready for contract — well done.',
  contract_issued:       'Your contract is ready to sign.',
  contract_signed:       'Contract signed. Awaiting placement.',
  awaiting_placement:    'Awaiting your placement offer.',
  placement_offered:     'You have a placement offer to review.',
  placement_accepted:    'Placement accepted. Awaiting final activation.',
  ready_for_activation:  'All complete — awaiting final activation.',
  active:                'Onboarding complete. Welcome to the team.',
  on_hold:               'Your onboarding is currently on hold.',
  declined:              'Placement declined — speak to your area lead.',
  withdrawn:             'This onboarding has been withdrawn.',
  inactive:              'Account inactive.',
}

function deriveStageStatus(stageId: string, assignments: TaskAssignment[]): StageStatus {
  const mine = assignments.filter(a => a.task?.stage_id === stageId)
  if (mine.length === 0) return 'not_started'
  const statuses = mine.map(a => a.status)
  if (statuses.some(s => s === 'rejected' || s === 'action_required')) return 'action_required'
  if (statuses.some(s => s === 'awaiting_review')) return 'awaiting_review'
  if (statuses.every(s => s === 'completed' || s === 'approved')) return 'completed'
  if (statuses.some(s => s !== 'not_started')) return 'in_progress'
  return 'not_started'
}

function StageStatusChip({ status }: { status: StageStatus }) {
  const map: Record<StageStatus, { label: string; cls: string }> = {
    not_started:     { label: 'Not Started',     cls: 'bg-gray-100 text-gray-500' },
    in_progress:     { label: 'In Progress',      cls: 'bg-blue-50 text-blue-700' },
    awaiting_review: { label: 'Awaiting Review',  cls: 'bg-amber-50 text-amber-700' },
    action_required: { label: 'Action Required',  cls: 'bg-red-50 text-red-700' },
    completed:       { label: 'Completed',         cls: 'bg-green-50 text-green-700' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}

function StageIcon({ num, status }: { num: number; status: StageStatus }) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-green-500" />
  if (status === 'action_required') return <AlertCircle size={16} className="text-red-500" />
  if (status === 'awaiting_review') return <Clock size={16} className="text-amber-500" />
  if (status === 'in_progress') return (
    <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-extrabold text-blue-700">
      {num}
    </span>
  )
  return (
    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
      {num}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [enrollment, setEnrollment] = useState<Enrollment | null | undefined>(undefined)
  const [stages, setStages] = useState<Stage[]>([])
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) load()
  }, [profile?.id])

  async function load() {
    if (!profile) return
    setLoading(true)

    const [{ data: enrollRows }, { data: stageRows }] = await Promise.all([
      supabase
        .from('onboarding_enrollments')
        .select('id, status, enrollment_type, learning_completion_pct, on_hold_reason, enrolled_at, last_activity_at')
        .eq('staff_id', profile.id)
        .eq('enrollment_type', 'initial')
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('onboarding_stages')
        .select('id, title, description, display_order, is_mandatory, exclude_from_pct')
        .eq('is_active', true)
        .order('display_order'),
    ])

    const enroll: Enrollment | null = enrollRows?.[0] ?? null
    setEnrollment(enroll)
    setStages(stageRows ?? [])

    if (enroll) {
      const { data: assignRows } = await supabase
        .from('onboarding_task_assignments')
        .select('id, task_id, status, task:onboarding_tasks!task_id(stage_id)')
        .eq('enrollment_id', enroll.id)
      setAssignments((assignRows as unknown as TaskAssignment[]) ?? [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center">
        <div className="w-7 h-7 border-[3px] border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pct = enrollment?.learning_completion_pct ?? 0
  const statusMessage = enrollment
    ? (ENROLLMENT_STATUS_LABELS[enrollment.status] ?? enrollment.status)
    : 'Your onboarding has not been set up yet. Contact your area lead.'

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-[#f5f7fc] flex flex-col">

      {/* Top bar */}
      <div className="bg-[#1a3a6b] px-4 pt-safe-top">
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white font-extrabold text-sm leading-none">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Active School</p>
              <p className="text-white/50 text-[11px] leading-tight">Staff Onboarding</p>
            </div>
          </div>
          {enrollment && (
            <div className="text-right">
              <p className="text-white/50 text-[11px]">Progress</p>
              <p className="text-white font-extrabold text-base leading-tight">{pct}%</p>
            </div>
          )}
        </div>
        {/* Progress bar */}
        {enrollment && (
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-white/70 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pt-5 pb-16 max-w-lg mx-auto w-full">

        {/* Welcome header */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-[#1a3a6b] leading-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-snug">{statusMessage}</p>
        </div>

        {/* Alert banners */}
        {enrollment?.status === 'on_hold' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
            <PauseCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Onboarding paused</p>
              {enrollment.on_hold_reason && (
                <p className="text-xs text-amber-700 mt-0.5">{enrollment.on_hold_reason}</p>
              )}
              <p className="text-xs text-amber-600 mt-1">Contact your area lead for more information.</p>
            </div>
          </div>
        )}

        {enrollment?.status === 'staff_action_required' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Action required</p>
              <p className="text-xs text-red-600 mt-0.5">Please check the stages below and complete any outstanding items.</p>
            </div>
          </div>
        )}

        {enrollment?.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-800">Onboarding complete</p>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              You have completed your onboarding and have full access to the app. Your stages and documents are shown below for your records.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-[#1a3a6b] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {pct >= 100 && enrollment?.status !== 'active' && enrollment?.status !== 'on_hold' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-800">Training complete!</p>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              You have completed all your training modules. The final step is to fill in your profile details and sign your employment contract.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 bg-[#1a3a6b] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              Complete my profile &amp; sign contract
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* No enrollment */}
        {enrollment === null && (
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#1a3a6b]/5 flex items-center justify-center mx-auto mb-3">
              <Clock size={22} className="text-[#1a3a6b]/40" />
            </div>
            <p className="font-semibold text-gray-500 text-sm">Not set up yet</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Your area lead will set up your onboarding shortly.
              Check back here once you've been notified.
            </p>
          </div>
        )}

        {/* Stage checklist */}
        {enrollment !== null && stages.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">
              Your onboarding stages
            </p>
            {stages.map((stage, i) => {
              const status = deriveStageStatus(stage.id, assignments)
              return (
                <button
                  key={stage.id}
                  onClick={() => navigate(`/onboarding/stage/${stage.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3 w-full text-left active:scale-[0.98] transition-transform"
                >
                  <div className="shrink-0 w-5 flex items-center justify-center">
                    <StageIcon num={i + 1} status={status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-[#1a3a6b] leading-tight">{stage.title}</p>
                      {!stage.is_mandatory && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Optional</span>
                      )}
                      {stage.exclude_from_pct && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Placement</span>
                      )}
                    </div>
                    {stage.description && (
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{stage.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <StageStatusChip status={status} />
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
