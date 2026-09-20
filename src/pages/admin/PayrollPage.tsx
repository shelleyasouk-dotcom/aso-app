import { useState, useEffect } from 'react'
import { Download, ChevronDown, ChevronUp, Banknote } from 'lucide-react'
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

function exportCSV(entries: StaffEntry[], monthKey: string) {
  const [year, month] = monthKey.split('-')
  const label = new Date(`${monthKey}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const rows: string[][] = []

  rows.push([`ASO Coaching — Payroll Export — ${label}`])
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
      `SUBTOTAL: ${entry.profile.full_name}`, '', '', '',
      `${entry.sessions.length} session${entry.sessions.length !== 1 ? 's' : ''}`,
      '', entry.total.toFixed(2),
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
  a.download = `ASO_Payroll_${year}_${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface MonthGroup {
  monthKey: string
  label: string
  entries: StaffEntry[]
  total: number
  sessionCount: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PayrollPage() {
  const [months, setMonths] = useState<MonthGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [expandedStaff, setExpandedStaff] = useState<Set<string>>(new Set())

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    const { data } = await supabase
      .from('clock_records')
      .select('id, session_date, session_role, clock_in, staff_id, school:schools(id, name), staff:profiles!staff_id(id, full_name, role)')
      .not('session_date', 'is', null)
      .order('session_date', { ascending: false })
      .order('clock_in', { ascending: true })

    if (!data) { setLoading(false); return }

    // Group by month key
    const byMonth: Record<string, Record<string, { profile: Pick<Profile, 'id' | 'full_name' | 'role'>; sessions: SessionRow[] }>> = {}
    data.forEach((row: any) => {
      if (!row.staff || !row.session_date) return
      const mk = row.session_date.slice(0, 7) // YYYY-MM
      if (!byMonth[mk]) byMonth[mk] = {}
      const sid = row.staff_id
      if (!byMonth[mk][sid]) byMonth[mk][sid] = { profile: row.staff, sessions: [] }
      byMonth[mk][sid].sessions.push(row as SessionRow)
    })

    const result: MonthGroup[] = Object.keys(byMonth)
      .sort((a, b) => b.localeCompare(a))
      .map(mk => {
        const entries: StaffEntry[] = Object.values(byMonth[mk])
          .map(e => ({ ...e, total: e.sessions.reduce((sum, s) => sum + rateFor(s.session_role), 0) }))
          .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name))
        return {
          monthKey: mk,
          label: new Date(`${mk}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          entries,
          total: entries.reduce((s, e) => s + e.total, 0),
          sessionCount: entries.reduce((s, e) => s + e.sessions.length, 0),
        }
      })

    setMonths(result)
    // Open most recent month by default
    if (result.length > 0) setOpenMonths(new Set([result[0].monthKey]))
    setLoading(false)
  }

  function toggleMonth(key: string) {
    setOpenMonths(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }
  function toggleStaff(key: string) {
    setExpandedStaff(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  return (
    <Layout title="Payroll" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : months.length === 0 ? (
          <div className="text-center py-16">
            <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No payroll data yet</p>
          </div>
        ) : (
          months.map(mg => {
            const isOpen = openMonths.has(mg.monthKey)
            return (
              <div key={mg.monthKey}>
                {/* Month header */}
                <button
                  onClick={() => toggleMonth(mg.monthKey)}
                  className="w-full flex items-center justify-between bg-[#1a3a6b] text-white px-4 py-3 rounded-2xl mb-2"
                >
                  <div className="text-left">
                    <p className="font-extrabold text-sm">{mg.label}</p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {mg.entries.length} staff · {mg.sessionCount} sessions · {fmt(mg.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); exportCSV(mg.entries, mg.monthKey) }}
                      className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download size={13} /> CSV
                    </button>
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-3 mb-2">
                    {mg.entries.map(entry => {
                      const staffKey = `${mg.monthKey}:${entry.profile.id}`
                      const isStaffOpen = expandedStaff.has(staffKey)
                      return (
                        <div key={staffKey} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleStaff(staffKey)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1a3a6b] text-sm">{entry.profile.full_name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {entry.sessions.length} session{entry.sessions.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <p className="font-extrabold text-[#1a3a6b] text-base shrink-0">{fmt(entry.total)}</p>
                            {isStaffOpen
                              ? <ChevronUp size={16} className="text-gray-300 shrink-0" />
                              : <ChevronDown size={16} className="text-gray-300 shrink-0" />
                            }
                          </button>

                          {isStaffOpen && (
                            <div className="border-t border-gray-50">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Session Breakdown</p>
                              </div>
                              {entry.sessions.map((s, i) => {
                                const role = s.session_role ?? ''
                                const rate = rateFor(s.session_role)
                                return (
                                  <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i < entry.sessions.length - 1 ? 'border-b border-gray-50' : ''}`}>
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

                    {/* Month total footer */}
                    <div className="bg-[#1a3a6b]/8 rounded-2xl px-5 py-3 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1a3a6b]">{mg.label} total</p>
                      <p className="font-extrabold text-[#1a3a6b]">{fmt(mg.total)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Rate reference card */}
        {!loading && (
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
        )}

      </div>
    </Layout>
  )
}
