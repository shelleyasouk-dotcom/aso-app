import { useState, useEffect } from 'react'
import { Calendar, MapPin, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { ClockRecord, School } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionEntry = ClockRecord & { school?: School }

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  lead_coach:      'Lead Coach',
  assistant_coach: 'Assistant Coach',
  junior_coach:    'Junior Coach',
}

const ROLE_COLORS: Record<string, string> = {
  lead_coach:      'bg-[#1a3a6b] text-white',
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
    const { data } = await supabase
      .from('clock_records')
      .select('*, school:schools(id, name, area)')
      .eq('staff_id', profile!.id)
      .gte('session_date', startDate)
      .lt('session_date', endDate)
      .order('session_date', { ascending: false })
      .order('clock_in', { ascending: false })
    setRecords((data as SessionEntry[]) ?? [])
    setLoading(false)
  }

  async function deleteRecord(id: string) {
    await supabase.from('clock_records').delete().eq('id', id)
    setRecords(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
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
