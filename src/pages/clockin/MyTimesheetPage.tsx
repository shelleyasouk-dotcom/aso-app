import { useState, useEffect } from 'react'
import { Calendar, MapPin, Plus, ChevronLeft, ChevronRight, X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { SESSION_ROLE_LABELS } from '../../lib/sessionRates'
import type { ClockRecord, School } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionEntry = ClockRecord & { school?: School }

interface MonthConfirmation {
  id: string
  month: string
  confirmed_at: string | null
  confirmed_note: string | null
  has_issue: boolean
  authorized_by: string | null
  authorized_at: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = SESSION_ROLE_LABELS

const ROLE_COLORS: Record<string, string> = {
  area_lead:       'bg-amber-600 text-white',
  lead_coach:      'bg-[#1a3a6b] text-white',
  assistant_lead:  'bg-teal-600 text-white',
  assistant_coach: 'bg-purple-600 text-white',
  junior_coach:    'bg-green-600 text-white',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sessionDateOf(r: SessionEntry): string {
  // Use session_date (logical date) if set, fall back to clock_in date
  return r.session_date ?? r.clock_in.split('T')[0]
}

function formatDayShort(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Returns the Monday of a week as YYYY-MM-DD
function weekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekLabel(key: string): string {
  const mon = new Date(key + 'T12:00:00')
  const sun = new Date(key + 'T12:00:00')
  sun.setDate(sun.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MyTimesheetPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [records, setRecords] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [confirmation, setConfirmation] = useState<MonthConfirmation | null>(null)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueNote, setIssueNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null)

  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    if (profile) load()
  }, [profile?.id, year, month])

  async function load() {
    setLoading(true)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    // Fetch by session_date first (new records), then also catch old records by clock_in date
    const [{ data }, { data: confirmData }] = await Promise.all([
      supabase
        .from('clock_records')
        .select('*, school:schools(id, name, area)')
        .eq('staff_id', profile!.id)
        .gte('session_date', startDate)
        .lt('session_date', endDate)
        .order('session_date', { ascending: false })
        .order('clock_in', { ascending: false }),
      supabase
        .from('timesheet_month_confirmations')
        .select('*')
        .eq('staff_id', profile!.id)
        .eq('month', startDate)
        .maybeSingle(),
    ])
    setRecords((data as SessionEntry[]) ?? [])
    setConfirmation((confirmData as MonthConfirmation) ?? null)
    setShowIssueForm(false)
    setIssueNote('')
    setConfirmMsg(null)
    setLoading(false)
  }

  async function deleteRecord(id: string) {
    await supabase.from('clock_records').delete().eq('id', id)
    setRecords(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
  }

  async function confirmHours() {
    if (!profile) return
    setConfirming(true)
    const startDate = `${monthKey}-01`
    const { error } = await supabase.from('timesheet_month_confirmations').upsert({
      staff_id: profile.id,
      month: startDate,
      confirmed_at: new Date().toISOString(),
      confirmed_note: null,
      has_issue: false,
    }, { onConflict: 'staff_id,month' })
    if (!error) {
      await load()
      setConfirmMsg('Thanks — your hours are confirmed.')
    }
    setConfirming(false)
  }

  async function submitIssue() {
    if (!profile || !issueNote.trim()) return
    setConfirming(true)
    const startDate = `${monthKey}-01`
    const { error } = await supabase.from('timesheet_month_confirmations').upsert({
      staff_id: profile.id,
      month: startDate,
      confirmed_at: null,
      confirmed_note: issueNote.trim(),
      has_issue: true,
    }, { onConflict: 'staff_id,month' })
    if (!error) {
      const { data: admins } = await supabase
        .from('profiles').select('id')
        .in('role', ['director', 'operations_manager'])
      if (admins && admins.length > 0) {
        await supabase.from('notifications').insert(
          admins.map((a: { id: string }) => ({
            user_id: a.id,
            title: `${profile.full_name} flagged an issue with their ${monthLabel(year, month)} timesheet`,
            body: issueNote.trim().slice(0, 150),
            type: 'timesheet_issue',
            related_id: null,
            read: false,
          }))
        )
      }
      await load()
      setConfirmMsg('Sent — the admin team will follow up on this.')
    }
    setConfirming(false)
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
    if (isCurrentMonth) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  // Group by week
  const weeks: Record<string, SessionEntry[]> = {}
  records.forEach(r => {
    const key = weekKey(sessionDateOf(r))
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(r)
  })
  const weekKeys = Object.keys(weeks).sort((a, b) => b.localeCompare(a))

  // Summary counts by role
  const roleCounts: Record<string, number> = {}
  records.forEach(r => {
    const role = r.session_role ?? 'unknown'
    roleCounts[role] = (roleCounts[role] ?? 0) + 1
  })

  if (!profile) return null

  return (
    <Layout title="My Timesheet" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-5 max-w-lg mx-auto w-full">

        {/* Month picker */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-4 py-3.5">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:bg-gray-100"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <p className="font-extrabold text-[#1a3a6b] text-base">{monthLabel(year, month)}</p>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] rounded-2xl p-4 text-white">
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-3">{monthLabel(year, month)}</p>
          <div className="flex gap-5 mb-3">
            <div>
              <p className="text-3xl font-extrabold">{records.length}</p>
              <p className="text-white/50 text-xs mt-0.5">Sessions</p>
            </div>
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role}>
                <p className="text-3xl font-extrabold">{count}</p>
                <p className="text-white/50 text-xs mt-0.5">{ROLE_LABELS[role] ?? role}</p>
              </div>
            ))}
          </div>
          {records.length === 0 && (
            <p className="text-white/30 text-sm">No sessions logged this month</p>
          )}
        </div>

        {/* Confirmation card */}
        {!loading && records.length > 0 && (
          <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${
            confirmation?.authorized_at ? 'bg-green-50 border-green-200'
            : confirmation?.confirmed_at ? 'bg-blue-50 border-blue-200'
            : confirmation?.has_issue ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-gray-100 shadow-sm'
          }`}>
            {confirmation?.authorized_at ? (
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">Authorized for payroll</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Confirmed by you on {new Date(confirmation.confirmed_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })},
                    authorized on {new Date(confirmation.authorized_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.
                  </p>
                </div>
              </div>
            ) : confirmation?.confirmed_at ? (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800">You've confirmed these hours</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Confirmed {new Date(confirmation.confirmed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — waiting on the admin team to authorize.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-[#1a3a6b]">Please review and confirm your hours</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Check every date above is correct, including anything added on your behalf, then confirm — or let us know if something needs fixing.
                  </p>
                </div>

                {confirmation?.has_issue && confirmation.confirmed_note && (
                  <div className="bg-amber-100 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">You flagged: "{confirmation.confirmed_note}" — the admin team has been notified.</p>
                  </div>
                )}

                {confirmMsg && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">{confirmMsg}</p>}

                {showIssueForm ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={issueNote}
                      onChange={e => setIssueNote(e.target.value)}
                      placeholder="What needs fixing? e.g. 'Missing my session on the 12th at St Peter's'"
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowIssueForm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
                        Cancel
                      </button>
                      <button
                        onClick={submitIssue}
                        disabled={confirming || !issueNote.trim()}
                        className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        {confirming ? 'Sending…' : 'Send to admin'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowIssueForm(true)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                    >
                      Something's wrong
                    </button>
                    <button
                      onClick={confirmHours}
                      disabled={confirming}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a3a6b] text-white text-sm font-bold disabled:opacity-60"
                    >
                      {confirming ? 'Confirming…' : 'Confirm hours are correct'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Add session button */}
        <button
          onClick={() => navigate('/clock-in')}
          className="flex items-center justify-center gap-2 bg-white border border-[#1a3a6b] text-[#1a3a6b] font-bold text-sm py-3 rounded-2xl active:bg-blue-50"
        >
          <Plus size={16} />
          Log a session
        </button>

        {/* Records grouped by week */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : weekKeys.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No sessions logged</p>
            <p className="text-gray-300 text-xs mt-1">Use "Log a session" above to add one</p>
          </div>
        ) : (
          weekKeys.map(key => {
            const weekRecords = weeks[key]
            const currentWeek = weekKey(
              new Date().toISOString().split('T')[0]
            )
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">
                      {key === currentWeek ? 'This week' : weekLabel(key)}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#1a3a6b]">
                    {weekRecords.length} session{weekRecords.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  {weekRecords.map((r, i) => {
                    const role = r.session_role
                    const sDate = sessionDateOf(r)
                    const isConfirming = confirmDeleteId === r.id

                    return (
                      <div
                        key={r.id}
                        className={`px-4 py-3.5 ${i < weekRecords.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        {isConfirming ? (
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-gray-600 font-medium">Remove this session?</p>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => deleteRecord(r.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="text-sm font-bold text-gray-700">{formatDayShort(sDate)}</p>
                                {role && (
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {ROLE_LABELS[role] ?? role}
                                  </span>
                                )}
                              </div>
                              {(r.school || r.location_override) && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <MapPin size={11} className="shrink-0" />
                                  <p className="text-xs truncate">
                                    {(r.school as any)?.name ?? r.location_override}
                                  </p>
                                </div>
                              )}
                              <p className="text-[11px] text-gray-300 mt-0.5">
                                Logged {formatTime(r.clock_in)}
                              </p>
                            </div>
                            <button
                              onClick={() => setConfirmDeleteId(r.id)}
                              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5"
                            >
                              <X size={14} className="text-gray-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {/* Add session at bottom too when there are records */}
        {!loading && records.length > 0 && (
          <button
            onClick={() => navigate('/clock-in')}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1a3a6b] py-2"
          >
            <Plus size={16} />
            Log another session
          </button>
        )}
      </div>
    </Layout>
  )
}
