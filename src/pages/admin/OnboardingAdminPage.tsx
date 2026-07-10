import { useState, useEffect } from 'react'
import {
  CheckCircle2, AlertCircle, Clock, PauseCircle, ChevronDown, ChevronUp,
  UserPlus, X, Search,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrolledStaff {
  id: string
  full_name: string
  role: string
  area: string | null
  enrollment: {
    id: string
    status: string
    learning_completion_pct: number
    on_hold_reason: string | null
    enrolled_at: string
    last_activity_at: string
    activation_recommended_by: string | null
  }
}

interface Stage {
  id: string
  title: string
  display_order: number
}

interface TaskAssignment {
  id: string
  task_id: string
  status: string
  task: { stage_id: string } | null
}

interface UnenrolledProfile {
  id: string
  full_name: string
  role: string
  area: string | null
}

type FilterTab = 'all' | 'in_progress' | 'awaiting_review' | 'action_required' | 'active'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  invited:               { label: 'Invited',            cls: 'bg-gray-100 text-gray-500' },
  not_started:           { label: 'Not Started',        cls: 'bg-gray-100 text-gray-500' },
  in_progress:           { label: 'In Progress',        cls: 'bg-blue-50 text-blue-700' },
  staff_action_required: { label: 'Action Required',    cls: 'bg-red-50 text-red-700' },
  awaiting_review:       { label: 'Awaiting Review',    cls: 'bg-amber-50 text-amber-700' },
  documents_outstanding: { label: 'Docs Outstanding',   cls: 'bg-amber-50 text-amber-700' },
  ready_for_contract:    { label: 'Ready for Contract', cls: 'bg-purple-50 text-purple-700' },
  contract_issued:       { label: 'Contract Issued',    cls: 'bg-purple-50 text-purple-700' },
  contract_signed:       { label: 'Contract Signed',    cls: 'bg-purple-50 text-purple-700' },
  awaiting_placement:    { label: 'Awaiting Placement', cls: 'bg-blue-50 text-blue-700' },
  placement_offered:     { label: 'Placement Offered',  cls: 'bg-blue-50 text-blue-700' },
  placement_accepted:    { label: 'Placement Accepted', cls: 'bg-blue-50 text-blue-700' },
  ready_for_activation:  { label: 'Ready to Activate',  cls: 'bg-green-50 text-green-700' },
  active:                { label: 'Active',             cls: 'bg-green-100 text-green-800' },
  on_hold:               { label: 'On Hold',            cls: 'bg-amber-50 text-amber-700' },
  declined:              { label: 'Declined',           cls: 'bg-red-50 text-red-700' },
  withdrawn:             { label: 'Withdrawn',          cls: 'bg-gray-200 text-gray-500' },
  inactive:              { label: 'Inactive',           cls: 'bg-gray-200 text-gray-500' },
}

type StageStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'action_required' | 'completed'

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

function roleLabel(role: string) {
  const map: Record<string, string> = {
    lead_coach: 'Lead Coach', assistant_coach: 'Assistant Coach',
    junior_coach: 'Junior Coach', area_lead: 'Area Lead',
    director: 'Director', outreach_worker: 'Outreach Worker',
    media_tech: 'Media & Tech',
  }
  return map[role] ?? role
}

function StatusChip({ status }: { status: string }) {
  const chip = STATUS_CHIP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${chip.cls}`}>
      {chip.label}
    </span>
  )
}

// ─── Stage status icon row ────────────────────────────────────────────────────

const STAGE_STATUS_ICONS: Record<StageStatus, React.ReactNode> = {
  completed:       <CheckCircle2 size={13} className="text-green-500" />,
  action_required: <AlertCircle size={13} className="text-red-500" />,
  awaiting_review: <Clock size={13} className="text-amber-500" />,
  in_progress:     <div className="w-3 h-3 rounded-full bg-blue-300" />,
  not_started:     <div className="w-3 h-3 rounded-full bg-gray-200" />,
}

// ─── Hold modal ───────────────────────────────────────────────────────────────

function HoldModal({ name, onConfirm, onCancel }: {
  name: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-safe-bottom">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#1a3a6b]">Put {name} on hold</p>
          <button onClick={onCancel}><X size={18} className="text-gray-400" /></button>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Reason (shown to staff)</label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Awaiting DBS update before we can proceed."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
          >
            Put on Hold
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Recommend modal ──────────────────────────────────────────────────────────

function RecommendModal({ name, onConfirm, onCancel }: {
  name: string
  onConfirm: (note: string) => void
  onCancel: () => void
}) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-safe-bottom">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#1a3a6b]">Recommend {name} for activation</p>
          <button onClick={onCancel}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          This confirms you are satisfied with this person's onboarding. A director will complete final activation.
        </p>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Note (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any notes for the director…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-bold"
          >
            Recommend
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Enroll modal ─────────────────────────────────────────────────────────────

function EnrollModal({ unenrolled, actorId, onDone, onCancel }: {
  unenrolled: UnenrolledProfile[]
  actorId: string
  onDone: () => void
  onCancel: () => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UnenrolledProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const filtered = unenrolled.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  )

  async function enroll() {
    if (!selected) return
    setSaving(true)
    setEnrollError(null)
    const now = new Date().toISOString()

    const { data: enrollment, error } = await supabase
      .from('onboarding_enrollments')
      .insert({
        staff_id: selected.id,
        enrollment_type: 'initial',
        status: 'not_started',
        enrolled_by: actorId,
        enrolled_at: now,
        last_activity_at: now,
      })
      .select('id')
      .single()

    if (error || !enrollment) {
      setEnrollError(error?.message ?? 'Insert failed — check Supabase RLS policies on onboarding_enrollments.')
      setSaving(false)
      return
    }

    await Promise.all([
      supabase.from('profiles').update({ onboarding_status: 'not_started' }).eq('id', selected.id),
      supabase.from('onboarding_audit_log').insert({
        enrollment_id: enrollment.id,
        staff_id: selected.id,
        actor_id: actorId,
        actor_role: 'admin',
        event_type: 'enrollment_created',
        payload: { enrollment_type: 'initial' },
      }),
    ])

    setSaving(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-safe-bottom">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#1a3a6b]">Enrol staff member</p>
          <button onClick={onCancel}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
          />
        </div>
        <div className="overflow-y-auto flex flex-col gap-1 flex-1">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No unenrolled staff found.</p>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                selected?.id === p.id
                  ? 'border-[#1a3a6b] bg-[#1a3a6b]/5'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-semibold text-[#1a3a6b]">{p.full_name}</p>
              <p className="text-xs text-gray-400">{roleLabel(p.role)}{p.area ? ` · ${p.area}` : ''}</p>
            </button>
          ))}
        </div>
        {enrollError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{enrollError}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            disabled={!selected || saving}
            onClick={enroll}
            className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {saving ? 'Enrolling…' : 'Enrol'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Staff row ────────────────────────────────────────────────────────────────

function StaffRow({ staff, stages, actorId, actorRole, onRefresh }: {
  staff: EnrolledStaff
  stages: Stage[]
  actorId: string
  actorRole: string
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(false)
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showHold, setShowHold] = useState(false)
  const [showRecommend, setShowRecommend] = useState(false)

  const e = staff.enrollment
  const isDirector = actorRole === 'director'
  const isAreaLead = actorRole === 'area_lead'

  async function loadAssignments() {
    setLoadingAssign(true)
    const { data } = await supabase
      .from('onboarding_task_assignments')
      .select('id, task_id, status, task:onboarding_tasks!task_id(stage_id)')
      .eq('enrollment_id', e.id)
    setAssignments((data as unknown as TaskAssignment[]) ?? [])
    setLoadingAssign(false)
  }

  function toggle() {
    if (!open && assignments.length === 0) loadAssignments()
    setOpen(v => !v)
  }

  async function writeLog(event_type: string, payload?: Record<string, unknown>) {
    await supabase.from('onboarding_audit_log').insert({
      enrollment_id: e.id,
      staff_id: staff.id,
      actor_id: actorId,
      actor_role: actorRole,
      event_type,
      payload,
    })
  }

  async function putOnHold(reason: string) {
    setSaving(true)
    await Promise.all([
      supabase.from('onboarding_enrollments').update({
        status: 'on_hold',
        on_hold_reason: reason,
        on_hold_at: new Date().toISOString(),
        on_hold_by: actorId,
        pre_hold_status: e.status,
      }).eq('id', e.id),
      writeLog('enrollment_put_on_hold', { reason }),
    ])
    setSaving(false)
    setShowHold(false)
    onRefresh()
  }

  async function removeHold() {
    setSaving(true)
    await Promise.all([
      supabase.from('onboarding_enrollments').update({
        status: 'in_progress',
        on_hold_reason: null,
        on_hold_at: null,
        on_hold_by: null,
        pre_hold_status: null,
      }).eq('id', e.id),
      writeLog('enrollment_hold_removed'),
    ])
    setSaving(false)
    onRefresh()
  }

  async function withdraw() {
    if (!confirm(`Withdraw ${staff.full_name}'s onboarding? This cannot be undone.`)) return
    setSaving(true)
    await Promise.all([
      supabase.from('onboarding_enrollments').update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        withdrawn_by: actorId,
      }).eq('id', e.id),
      supabase.from('profiles').update({ onboarding_status: 'withdrawn' }).eq('id', staff.id),
      writeLog('enrollment_withdrawn'),
    ])
    setSaving(false)
    onRefresh()
  }

  async function recommendForActivation(note: string) {
    setSaving(true)
    await Promise.all([
      supabase.from('onboarding_enrollments').update({
        activation_recommended_by: actorId,
        activation_recommended_at: new Date().toISOString(),
        activation_recommendation_note: note || null,
      }).eq('id', e.id),
      writeLog('activation_recommended', { note }),
    ])
    setSaving(false)
    setShowRecommend(false)
    onRefresh()
  }

  async function activate() {
    if (!confirm(`Activate ${staff.full_name}? This will grant full app access.`)) return
    setSaving(true)
    const now = new Date().toISOString()
    await Promise.all([
      supabase.from('onboarding_enrollments').update({
        status: 'active',
        activated_at: now,
        activated_by: actorId,
      }).eq('id', e.id),
      supabase.from('profiles').update({
        onboarding_status: 'active',
        onboarding_required: false,
      }).eq('id', staff.id),
      writeLog('enrollment_activated'),
    ])
    setSaving(false)
    onRefresh()
  }

  const canRecommend = isAreaLead && e.status !== 'active' && e.status !== 'withdrawn' && !e.activation_recommended_by
  const canActivate = isDirector && e.activation_recommended_by != null && e.status !== 'active' && e.status !== 'withdrawn'
  const isOnHold = e.status === 'on_hold'
  const isWithdrawn = e.status === 'withdrawn' || e.status === 'inactive'

  return (
    <>
      {showHold && (
        <HoldModal
          name={staff.full_name.split(' ')[0]}
          onConfirm={putOnHold}
          onCancel={() => setShowHold(false)}
        />
      )}
      {showRecommend && (
        <RecommendModal
          name={staff.full_name.split(' ')[0]}
          onConfirm={recommendForActivation}
          onCancel={() => setShowRecommend(false)}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={toggle}>
          <div className="w-9 h-9 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {staff.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#1a3a6b] text-sm leading-tight">{staff.full_name}</p>
              <StatusChip status={e.status} />
            </div>
            <p className="text-xs text-gray-400">{roleLabel(staff.role)}{staff.area ? ` · ${staff.area}` : ''}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-[#1a3a6b] rounded-full transition-all" style={{ width: `${e.learning_completion_pct}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-500 w-8">{e.learning_completion_pct}%</span>
          </div>
          {open ? <ChevronUp size={15} className="text-gray-300 shrink-0" /> : <ChevronDown size={15} className="text-gray-300 shrink-0" />}
        </button>

        {open && (
          <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
            {/* Stage checklist */}
            <div>
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide mb-2">Stages</p>
              {loadingAssign ? (
                <p className="text-xs text-gray-400">Loading…</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {stages.map(stage => {
                    const status = deriveStageStatus(stage.id, assignments)
                    return (
                      <div key={stage.id} className="flex items-center gap-2 py-1">
                        <div className="w-4 flex items-center justify-center shrink-0">
                          {STAGE_STATUS_ICONS[status]}
                        </div>
                        <p className={`text-xs flex-1 leading-tight ${
                          status === 'completed' ? 'text-gray-600' :
                          status === 'action_required' ? 'text-red-600 font-semibold' :
                          'text-gray-500'
                        }`}>{stage.title}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recommendation badge */}
            {e.activation_recommended_by && e.status !== 'active' && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                <p className="text-xs text-green-700 font-semibold">Recommended for activation by area lead</p>
              </div>
            )}

            {/* Actions */}
            {!isWithdrawn && (
              <div className="flex flex-wrap gap-2">
                {canActivate && (
                  <button
                    onClick={activate}
                    disabled={saving}
                    className="px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Activate
                  </button>
                )}
                {canRecommend && (
                  <button
                    onClick={() => setShowRecommend(true)}
                    disabled={saving}
                    className="px-3 py-2 bg-[#1a3a6b] text-white rounded-xl text-xs font-bold hover:bg-[#1a3a6b]/90 transition-colors disabled:opacity-50"
                  >
                    Recommend
                  </button>
                )}
                {!isOnHold && !isWithdrawn && (
                  <button
                    onClick={() => setShowHold(true)}
                    disabled={saving}
                    className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <PauseCircle size={12} className="inline mr-1" />Put on Hold
                  </button>
                )}
                {isOnHold && (
                  <button
                    onClick={removeHold}
                    disabled={saving}
                    className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    Remove Hold
                  </button>
                )}
                {isDirector && (
                  <button
                    onClick={withdraw}
                    disabled={saving}
                    className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingAdminPage() {
  const { profile } = useAuth()
  const [enrolled, setEnrolled] = useState<EnrolledStaff[]>([])
  const [unenrolled, setUnenrolled] = useState<UnenrolledProfile[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showEnroll, setShowEnroll] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    const [{ data: enrollRows }, { data: stageRows }, { data: allProfiles }] = await Promise.all([
      supabase
        .from('onboarding_enrollments')
        .select(`
          id, status, learning_completion_pct, on_hold_reason,
          enrolled_at, last_activity_at, activation_recommended_by,
          staff:profiles!staff_id(id, full_name, role, area)
        `)
        .eq('enrollment_type', 'initial')
        .order('enrolled_at', { ascending: false }),
      supabase
        .from('onboarding_stages')
        .select('id, title, display_order')
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('profiles')
        .select('id, full_name, role, area')
        .not('role', 'in', '(parent,school)')
        .order('full_name'),
    ])

    const enrolledIds = new Set(
      (enrollRows ?? [])
        .map((r: Record<string, unknown>) => (r.staff as { id: string } | null)?.id)
        .filter(Boolean) as string[]
    )

    const enrolledList: EnrolledStaff[] = (enrollRows ?? []).map((r: Record<string, unknown>) => {
      const s = r.staff as { id: string; full_name: string; role: string; area: string | null }
      return {
        id: s.id,
        full_name: s.full_name,
        role: s.role,
        area: s.area,
        enrollment: {
          id: r.id as string,
          status: r.status as string,
          learning_completion_pct: r.learning_completion_pct as number,
          on_hold_reason: r.on_hold_reason as string | null,
          enrolled_at: r.enrolled_at as string,
          last_activity_at: r.last_activity_at as string,
          activation_recommended_by: r.activation_recommended_by as string | null,
        },
      }
    })

    const unenrolledList: UnenrolledProfile[] = (allProfiles ?? [])
      .filter((p: { id: string }) => !enrolledIds.has(p.id))
      .map((p: { id: string; full_name: string; role: string; area: string | null }) => p)

    setEnrolled(enrolledList)
    setUnenrolled(unenrolledList)
    setStages(stageRows ?? [])
    setLoading(false)
  }

  const filtered = enrolled.filter(e => {
    if (filter === 'in_progress') return ['invited', 'not_started', 'in_progress', 'staff_action_required'].includes(e.enrollment.status)
    if (filter === 'awaiting_review') return ['awaiting_review', 'documents_outstanding'].includes(e.enrollment.status)
    if (filter === 'action_required') return e.enrollment.status === 'staff_action_required'
    if (filter === 'active') return e.enrollment.status === 'active'
    return true
  })

  const stats = {
    enrolled: enrolled.length,
    inProgress: enrolled.filter(e => ['invited', 'not_started', 'in_progress'].includes(e.enrollment.status)).length,
    awaitingReview: enrolled.filter(e => ['awaiting_review', 'documents_outstanding'].includes(e.enrollment.status)).length,
    readyToActivate: enrolled.filter(e => e.enrollment.status === 'ready_for_activation' || (e.enrollment.activation_recommended_by && e.enrollment.status !== 'active')).length,
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'awaiting_review', label: 'Review' },
    { key: 'active', label: 'Active' },
  ]

  return (
    <Layout title="Staff Onboarding" showBack>
      {showEnroll && profile && (
        <EnrollModal
          unenrolled={unenrolled}
          actorId={profile.id}
          onDone={() => { setShowEnroll(false); load() }}
          onCancel={() => setShowEnroll(false)}
        />
      )}

      <div className="px-4 pt-5 pb-10 flex flex-col gap-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Enrolled', value: stats.enrolled, cls: 'bg-[#1a3a6b]/5 text-[#1a3a6b]' },
            { label: 'In Progress', value: stats.inProgress, cls: 'bg-blue-50 text-blue-700' },
            { label: 'Review', value: stats.awaitingReview, cls: 'bg-amber-50 text-amber-700' },
            { label: 'Ready', value: stats.readyToActivate, cls: 'bg-green-50 text-green-700' },
          ].map(s => (
            <div key={s.label} className={`${s.cls} rounded-2xl p-2.5 text-center`}>
              <p className="text-xl font-extrabold leading-none">{s.value}</p>
              <p className="text-[10px] font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Enrol button */}
        <Button
          onClick={() => setShowEnroll(true)}
          className="flex items-center justify-center gap-2 w-full"
        >
          <UserPlus size={15} />
          Enrol staff member
        </Button>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {filterTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === t.key ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-[3px] border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400">
              {enrolled.length === 0 ? 'No staff enrolled yet. Use the button above to enrol someone.' : 'No results for this filter.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(s => (
              <StaffRow
                key={s.id}
                staff={s}
                stages={stages}
                actorId={profile!.id}
                actorRole={profile!.role}
                onRefresh={load}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
