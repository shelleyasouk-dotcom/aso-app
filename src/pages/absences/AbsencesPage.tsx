import { useState, useEffect, useCallback } from 'react'
import { Plus, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { ROLE_LABELS } from '../../lib/roles'
import type { Absence, AbsenceType, AbsenceStatus, Profile } from '../../types'

// ─── Config ───────────────────────────────────────────────────────────────────

const ABSENCE_TYPES: { value: AbsenceType; label: string; color: string }[] = [
  { value: 'sick',         label: 'Sick Leave',     color: 'bg-red-100 text-red-700' },
  { value: 'annual_leave', label: 'Annual Leave',   color: 'bg-blue-100 text-blue-700' },
  { value: 'personal',     label: 'Personal',       color: 'bg-purple-100 text-purple-700' },
  { value: 'emergency',    label: 'Emergency',      color: 'bg-orange-100 text-orange-700' },
  { value: 'training',     label: 'Training',       color: 'bg-green-100 text-green-700' },
  { value: 'other',        label: 'Other',          color: 'bg-gray-100 text-gray-600' },
]

const STATUS_CONFIG: Record<AbsenceStatus, { label: string; chip: string; border: string }> = {
  pending:  { label: 'Pending',  chip: 'bg-amber-100 text-amber-700',  border: 'border-l-amber-400' },
  approved: { label: 'Approved', chip: 'bg-green-100 text-green-700',  border: 'border-l-green-500' },
  rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700',      border: 'border-l-red-400' },
}

function typeChip(type: AbsenceType) {
  const t = ABSENCE_TYPES.find(a => a.value === type)
  return t ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span> : null
}

function statusChip(status: AbsenceStatus) {
  const s = STATUS_CONFIG[status]
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.chip}`}>{s.label}</span>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function dayCount(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  const days = Math.floor(ms / 86400000) + 1
  return days === 1 ? '1 day' : `${days} days`
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

// ─── Absence card ─────────────────────────────────────────────────────────────

function AbsenceCard({
  absence, canReview, onApprove, onReject, showStaff,
}: {
  absence: Absence
  canReview: boolean
  showStaff: boolean
  onApprove: (id: string, note: string) => void
  onReject: (id: string, note: string) => void
}) {
  const [reviewing, setReviewing] = useState(false)
  const [note, setNote] = useState('')
  const s = STATUS_CONFIG[absence.status]

  return (
    <div className={`bg-white rounded-2xl border-l-4 ${s.border} shadow-sm overflow-hidden`}>
      <div className="px-4 py-3">
        {showStaff && absence.staff && (
          <p className="font-bold text-[#1a3a6b] text-sm mb-1">{absence.staff.full_name}
            <span className="text-gray-400 font-normal text-xs ml-2">{ROLE_LABELS[absence.staff.role]}</span>
          </p>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {typeChip(absence.type)}
              {statusChip(absence.status)}
              <span className="text-xs text-gray-400">{dayCount(absence.date_from, absence.date_to)}</span>
            </div>
            <p className="text-xs text-gray-500">
              {formatDate(absence.date_from)}
              {absence.date_from !== absence.date_to && ` – ${formatDate(absence.date_to)}`}
            </p>
            {absence.reason && (
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{absence.reason}</p>
            )}
            {absence.reviewer_note && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
                <span className="font-semibold">Note: </span>{absence.reviewer_note}
              </p>
            )}
          </div>
        </div>

        {/* Approval buttons */}
        {canReview && absence.status === 'pending' && !reviewing && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setReviewing(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold"
            >
              <Check size={13} /> Approve
            </button>
            <button
              onClick={() => { setReviewing(true) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold"
            >
              <X size={13} /> Reject
            </button>
          </div>
        )}

        {canReview && absence.status === 'pending' && reviewing && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              placeholder="Add a note (optional)…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => { setReviewing(false); setNote('') }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
                Cancel
              </button>
              <button onClick={() => onApprove(absence.id, note)}
                className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold flex items-center justify-center gap-1">
                <Check size={12} /> Approve
              </button>
              <button onClick={() => onReject(absence.id, note)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1">
                <X size={12} /> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Weekly view ─────────────────────────────────────────────────────────────

function WeekView({ absences }: { absences: Absence[]; staff: Profile[] }) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay() + 1) // Monday
    return d
  })

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  function prevWeek() { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  function nextWeek() { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }

  const weekLabel = `${days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`

  function absencesOnDay(date: Date) {
    const iso = isoDate(date)
    return absences.filter(a =>
      a.status !== 'rejected' &&
      iso >= a.date_from && iso <= a.date_to
    )
  }

  const today = isoDate(new Date())

  return (
    <div className="flex flex-col gap-3">
      {/* Week nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
        <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <p className="text-sm font-semibold text-[#1a3a6b]">{weekLabel}</p>
        <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Day columns */}
      {days.map(day => {
        const dayAbsences = absencesOnDay(day)
        const iso = isoDate(day)
        const isToday = iso === today
        const isWeekend = day.getDay() === 0 || day.getDay() === 6

        return (
          <div key={iso} className={`rounded-2xl overflow-hidden ${isWeekend ? 'opacity-60' : ''}`}>
            <div className={`px-4 py-2 flex items-center justify-between ${isToday ? 'bg-[#1a3a6b]' : 'bg-white border border-gray-100'}`}>
              <p className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-700'}`}>
                {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              {dayAbsences.length > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isToday ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                  {dayAbsences.length} absent
                </span>
              )}
            </div>
            {dayAbsences.length > 0 ? (
              <div className="bg-white border border-t-0 border-gray-100 rounded-b-2xl divide-y divide-gray-50">
                {dayAbsences.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.staff?.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {typeChip(a.type)}
                        {statusChip(a.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-t-0 border-gray-100 rounded-b-2xl px-4 py-2.5">
                <p className="text-xs text-gray-300">No absences</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'mine' | 'approvals' | 'week'

export function AbsencesPage() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'director' || profile?.role === 'area_lead'
  const canSeeTeam = isManager || profile?.role === 'lead_coach'

  const [tab, setTab] = useState<Tab>('mine')
  const [myAbsences, setMyAbsences] = useState<Absence[]>([])
  const [teamAbsences, setTeamAbsences] = useState<Absence[]>([])
  const [teamStaff, setTeamStaff] = useState<Profile[]>([])
  const [mySchoolIds, setMySchoolIds] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)

  // New absence form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date_from: '', date_to: '', type: 'sick' as AbsenceType, reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Pending count badge
  const pendingCount = teamAbsences.filter(a => a.status === 'pending').length

  // ── Scope ──────────────────────────────────────────────────────────────────
  const initScope = useCallback(async () => {
    if (!profile) return
    if (profile.role === 'director') { setMySchoolIds(null); return }
    const { data } = await supabase
      .from('staff_school_assignments')
      .select('school_id')
      .eq('staff_id', profile.id)
    setMySchoolIds((data ?? []).map((r: { school_id: string }) => r.school_id))
  }, [profile])

  // ── Load my absences ───────────────────────────────────────────────────────
  const loadMine = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('absences')
      .select('*, staff:profiles!absences_staff_id_fkey(*), reviewer:profiles!absences_reviewed_by_fkey(*)')
      .eq('staff_id', profile.id)
      .order('date_from', { ascending: false })
    setMyAbsences((data as Absence[]) ?? [])
  }, [profile])

  // ── Load team absences ─────────────────────────────────────────────────────
  const loadTeam = useCallback(async () => {
    if (!profile || !canSeeTeam) return
    if (profile.role !== 'director' && mySchoolIds === null) return

    let staffIds: string[] = []

    if (profile.role === 'director') {
      const { data } = await supabase.from('profiles').select('id, full_name, role, email, created_at').order('full_name')
      setTeamStaff((data as Profile[]) ?? [])
      staffIds = (data ?? []).map((s: Profile) => s.id)
    } else if (mySchoolIds !== null && mySchoolIds.length > 0) {
      const { data: assignments } = await supabase
        .from('staff_school_assignments')
        .select('staff:profiles(*)')
        .in('school_id', mySchoolIds)
      const seen = new Set<string>()
      const members: Profile[] = []
      for (const row of (assignments ?? []) as unknown as { staff: Profile }[]) {
        if (row.staff && !seen.has(row.staff.id) && row.staff.id !== profile.id) {
          seen.add(row.staff.id)
          members.push(row.staff)
        }
      }
      members.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setTeamStaff(members)
      staffIds = members.map(m => m.id)
    }

    if (staffIds.length === 0) { setLoading(false); return }

    const { data } = await supabase
      .from('absences')
      .select('*, staff:profiles!absences_staff_id_fkey(*), reviewer:profiles!absences_reviewed_by_fkey(*)')
      .in('staff_id', staffIds)
      .order('date_from', { ascending: false })
    setTeamAbsences((data as Absence[]) ?? [])
    setLoading(false)
  }, [profile, canSeeTeam, mySchoolIds])

  useEffect(() => { initScope() }, [initScope])
  useEffect(() => { loadMine() }, [loadMine])
  useEffect(() => {
    if (mySchoolIds !== undefined) loadTeam()
  }, [mySchoolIds, loadTeam])
  useEffect(() => { setLoading(false) }, [myAbsences])

  // ── Submit absence ─────────────────────────────────────────────────────────
  async function submitAbsence() {
    if (!profile || !form.date_from) return
    setSubmitting(true)
    setFormError(null)
    const dateTo = form.date_to || form.date_from
    if (dateTo < form.date_from) { setFormError('End date must be on or after start date'); setSubmitting(false); return }

    const { data: absence, error } = await supabase.from('absences').insert({
      staff_id: profile.id,
      date_from: form.date_from,
      date_to: dateTo,
      type: form.type,
      reason: form.reason.trim() || null,
      status: 'pending',
    }).select().single()

    if (error) { setFormError(error.message); setSubmitting(false); return }

    // Notify relevant area leads
    if (absence && mySchoolIds !== null && mySchoolIds.length > 0) {
      const { data: leads } = await supabase
        .from('staff_school_assignments')
        .select('staff:profiles!staff_school_assignments_staff_id_fkey(id, role)')
        .in('school_id', mySchoolIds)
      const leadIds = [...new Set(
        ((leads ?? []) as unknown as { staff: { id: string; role: string } }[])
          .filter(r => r.staff && (r.staff.role === 'area_lead' || r.staff.role === 'director'))
          .map(r => r.staff.id)
      )]
      if (leadIds.length > 0) {
        await supabase.from('notifications').insert(
          leadIds.map(uid => ({
            user_id: uid,
            title: `Absence request from ${profile.full_name}`,
            body: `${ABSENCE_TYPES.find(t => t.value === form.type)?.label} · ${formatDate(form.date_from)}${dateTo !== form.date_from ? ` – ${formatDate(dateTo)}` : ''}`,
            type: 'absence_request',
            related_id: absence.id,
          }))
        )
      }
    } else if (absence) {
      // Director scope: notify all area leads
      const { data: leads } = await supabase.from('profiles').select('id').in('role', ['area_lead', 'director']).neq('id', profile.id)
      if ((leads ?? []).length > 0) {
        await supabase.from('notifications').insert(
          (leads ?? []).map((l: { id: string }) => ({
            user_id: l.id,
            title: `Absence request from ${profile.full_name}`,
            body: `${ABSENCE_TYPES.find(t => t.value === form.type)?.label} · ${formatDate(form.date_from)}`,
            type: 'absence_request',
            related_id: absence.id,
          }))
        )
      }
    }

    await loadMine()
    setForm({ date_from: '', date_to: '', type: 'sick', reason: '' })
    setShowForm(false)
    setSubmitting(false)
  }

  // ── Approve / Reject ───────────────────────────────────────────────────────
  async function reviewAbsence(id: string, status: 'approved' | 'rejected', note: string) {
    if (!profile) return
    await supabase.from('absences').update({
      status,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      reviewer_note: note.trim() || null,
    }).eq('id', id)

    // Notify the staff member
    const absence = teamAbsences.find(a => a.id === id)
    if (absence) {
      await supabase.from('notifications').insert({
        user_id: absence.staff_id,
        title: `Absence ${status === 'approved' ? 'approved ✓' : 'rejected'}`,
        body: `${formatDate(absence.date_from)}${absence.date_to !== absence.date_from ? ` – ${formatDate(absence.date_to)}` : ''}${note ? ` · ${note}` : ''}`,
        type: 'absence_update',
        related_id: id,
      })
    }

    await loadMine()
    await loadTeam()
  }

  // ─────────────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'mine', label: 'My Absences' },
    ...(canSeeTeam ? [{ key: 'approvals' as Tab, label: 'Team', badge: pendingCount || undefined }] : []),
    ...(canSeeTeam ? [{ key: 'week' as Tab, label: 'This Week' }] : []),
  ]

  return (
    <Layout title="Absences">
      <div className="px-4 pt-6 flex flex-col gap-4 pb-6">

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${tab === t.key ? 'bg-[#1a3a6b] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              {t.badge ? (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── MY ABSENCES ───────────────────────────────────────────────── */}
        {tab === 'mine' && (
          <>
            <Button fullWidth onClick={() => setShowForm(v => !v)}>
              <Plus size={18} /> Log Absence
            </Button>

            {showForm && (
              <Card>
                <p className="font-bold text-[#1a3a6b] mb-3">New Absence Request</p>
                {formError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{formError}</p>}
                <div className="flex flex-col gap-3">
                  <Select label="Type" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as AbsenceType })}>
                    {ABSENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                  <Input label="Start Date *" type="date" value={form.date_from}
                    onChange={e => setForm({ ...form, date_from: e.target.value })} />
                  <Input label="End Date (leave blank if single day)" type="date" value={form.date_to}
                    onChange={e => setForm({ ...form, date_to: e.target.value })} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Reason (optional)</label>
                    <textarea
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      placeholder="Brief description…"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={submitAbsence}
                      disabled={submitting || !form.date_from}>
                      {submitting ? 'Submitting…' : 'Submit Request'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {loading ? (
              <Card><p className="text-sm text-gray-500 text-center py-4">Loading…</p></Card>
            ) : myAbsences.length === 0 ? (
              <Card><p className="text-sm text-gray-500 text-center py-4">No absences logged yet.</p></Card>
            ) : (
              <div className="flex flex-col gap-3">
                {myAbsences.map(a => (
                  <AbsenceCard key={a.id} absence={a} canReview={false} showStaff={false}
                    onApprove={() => {}} onReject={() => {}} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TEAM / APPROVALS ──────────────────────────────────────────── */}
        {tab === 'approvals' && (
          <>
            {pendingCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold text-amber-700">{pendingCount} absence{pendingCount !== 1 ? 's' : ''} awaiting authorisation</p>
              </div>
            )}

            {/* Pending first */}
            {teamAbsences.filter(a => a.status === 'pending').length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Pending Authorisation</p>
                <div className="flex flex-col gap-3">
                  {teamAbsences.filter(a => a.status === 'pending').map(a => (
                    <AbsenceCard key={a.id} absence={a} canReview={isManager} showStaff
                      onApprove={(id, note) => reviewAbsence(id, 'approved', note)}
                      onReject={(id, note) => reviewAbsence(id, 'rejected', note)} />
                  ))}
                </div>
              </>
            )}

            {/* Historical */}
            {teamAbsences.filter(a => a.status !== 'pending').length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mt-2">History</p>
                <div className="flex flex-col gap-3">
                  {teamAbsences.filter(a => a.status !== 'pending').map(a => (
                    <AbsenceCard key={a.id} absence={a} canReview={false} showStaff
                      onApprove={() => {}} onReject={() => {}} />
                  ))}
                </div>
              </>
            )}

            {teamAbsences.length === 0 && (
              <Card><p className="text-sm text-gray-500 text-center py-4">No team absences recorded.</p></Card>
            )}
          </>
        )}

        {/* ── WEEK VIEW ─────────────────────────────────────────────────── */}
        {tab === 'week' && (
          <WeekView absences={teamAbsences} staff={teamStaff} />
        )}

      </div>
    </Layout>
  )
}
