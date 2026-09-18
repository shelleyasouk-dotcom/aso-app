import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp, Banknote } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import type { Profile, School } from '../../types'

// ─── Rates ────────────────────────────────────────────────────────────────────

const SESSION_RATES: Record<string, number> = {
  junior_coach:    10,
  assistant_coach: 15,
  lead_coach:      30,
  area_lead:       35,
  director:        35,
}

const SESSION_ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Super Lead',
  director:        'Director',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRow {
  id: string
  session_date: string
  session_role: string | null
  clock_in: string
  staff_id: string
  school?: Pick<School, 'id' | 'name'>
}

interface StaffEntry {
  profile: Pick<Profile, 'id' | 'full_name' | 'role'>
  sessions: SessionRow[]
  total: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function rateFor(sessionRole: string | null): number {
  if (!sessionRole) return 0
  return SESSION_RATES[sessionRole] ?? 0
}

function fmt(p: number) {
  return `£${p.toFixed(2)}`
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(entries: StaffEntry[], year: number, month: number) {
  const rows: string[][] = []

  rows.push([`ASO Coaching — Payroll Export — ${monthLabel(year, month)}`])
  rows.push([])
  rows.push(['Staff Name', 'Profile Role', 'Session Date', 'Day', 'School', 'Session Role', 'Rate (£)'])

  let grandTotal = 0

  entries.forEach(entry => {
    entry.sessions.forEach(s => {
      const d = new Date(s.session_date + 'T12:00:00')
      const day = d.toLocaleDateString('en-GB', { weekday: 'long' })
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const role = s.session_role ?? ''
      const rate = rateFor(s.session_role)
      rows.push([
        entry.profile.full_name,
        SESSION_ROLE_LABELS[entry.profile.role] ?? entry.profile.role,
        date,
        day,
        (s.school as any)?.name ?? '',
        SESSION_ROLE_LABELS[role] ?? role,
        rate.toFixed(2),
      ])
    })

    rows.push([
      `SUBTOTAL: ${entry.profile.full_name}`,
      '',
      '',
      '',
      `${entry.sessions.length} session${entry.sessions.length !== 1 ? 's' : ''}`,
      '',
      entry.total.toFixed(2),
    ])
    grandTotal += entry.total
    rows.push([])
  })

  rows.push(['GRAND TOTAL', '', '', '', '', '', grandTotal.toFixed(2)])

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ASO_Payroll_${year}_${String(month).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PayrollPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [entries, setEntries] = useState<StaffEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => { load() }, [year, month])

  async function load() {
    setLoading(true)

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    const { data } = await supabase
      .from('clock_records')
      .select('id, session_date, session_role, clock_in, staff_id, school:schools(id, name), staff:profiles!staff_id(id, full_name, role)')
      .gte('session_date', startDate)
      .lt('session_date', endDate)
      .order('session_date', { ascending: true })
      .order('clock_in', { ascending: true })

    if (!data) { setLoading(false); return }

    // Group by staff
    const byStaff: Record<string, { profile: Pick<Profile, 'id' | 'full_name' | 'role'>; sessions: SessionRow[] }> = {}
    data.forEach((row: any) => {
      if (!row.staff) return
      const sid = row.staff_id
      if (!byStaff[sid]) byStaff[sid] = { profile: row.staff, sessions: [] }
      byStaff[sid].sessions.push(row as SessionRow)
    })

    const result: StaffEntry[] = Object.values(byStaff)
      .map(e => ({
        ...e,
        total: e.sessions.reduce((sum, s) => sum + rateFor(s.session_role), 0),
      }))
      .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name))

    setEntries(result)
    setLoading(false)
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1
    if (isCurrent) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1

  const grandTotal = entries.reduce((s, e) => s + e.total, 0)
  const totalSessions = entries.reduce((s, e) => s + e.sessions.length, 0)

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Layout title="Payroll" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-5 max-w-2xl mx-auto w-full">

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
              disabled={isCurrent}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {!loading && entries.length > 0 && (
          <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] rounded-2xl p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">{monthLabel(year, month)}</p>
              <p className="text-3xl font-extrabold">{fmt(grandTotal)}</p>
              <p className="text-white/50 text-xs mt-1">{totalSessions} sessions · {entries.length} staff</p>
            </div>
            <button
              onClick={() => exportCSV(entries, year, month)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        )}

        {/* Staff list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No sessions logged this month</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(entry => {
              const isOpen = expanded.has(entry.profile.id)
              return (
                <div key={entry.profile.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  {/* Staff summary row */}
                  <button
                    onClick={() => toggleExpand(entry.profile.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a3a6b] text-sm">{entry.profile.full_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.sessions.length} session{entry.sessions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="font-extrabold text-[#1a3a6b] text-base shrink-0">{fmt(entry.total)}</p>
                    {isOpen
                      ? <ChevronUp size={16} className="text-gray-300 shrink-0" />
                      : <ChevronDown size={16} className="text-gray-300 shrink-0" />
                    }
                  </button>

                  {/* Session breakdown */}
                  {isOpen && (
                    <div className="border-t border-gray-50">
                      {/* Rate reference */}
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Session Breakdown</p>
                      </div>
                      {entry.sessions.map((s, i) => {
                        const role = s.session_role ?? ''
                        const rate = rateFor(s.session_role)
                        return (
                          <div
                            key={s.id}
                            className={`px-4 py-3 flex items-center gap-3 ${i < entry.sessions.length - 1 ? 'border-b border-gray-50' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700">{formatDate(s.session_date)}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {(s.school as any)?.name ?? 'Unknown school'}
                                {role && ` · ${SESSION_ROLE_LABELS[role] ?? role}`}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-700 shrink-0">{fmt(rate)}</p>
                          </div>
                        )
                      })}
                      <div className="px-4 py-3 bg-[#1a3a6b]/5 flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1a3a6b]">Subtotal</p>
                        <p className="text-sm font-extrabold text-[#1a3a6b]">{fmt(entry.total)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Grand total footer */}
            <div className="bg-[#1a3a6b] rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-semibold">Grand Total</p>
                <p className="text-white/60 text-[11px] mt-0.5">{totalSessions} sessions · {entries.length} staff</p>
              </div>
              <p className="text-white text-2xl font-extrabold">{fmt(grandTotal)}</p>
            </div>
          </div>
        )}

        {/* Rate reference card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Session Rates</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Junior Coach', rate: 10, color: 'bg-green-600' },
              { label: 'Assistant Coach', rate: 15, color: 'bg-purple-600' },
              { label: 'Lead Coach', rate: 30, color: 'bg-[#1a3a6b]' },
              { label: 'Super Lead', rate: 35, color: 'bg-amber-600' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.color}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-600">{r.label}</p>
                  <p className="text-xs text-gray-400">{fmt(r.rate)}/session</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
