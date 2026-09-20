import { useState, useEffect } from 'react'
import {
  Wallet, ChevronDown, ChevronUp, RefreshCw, Send, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { rateForSessionRole, SESSION_ROLE_LABELS } from '../../lib/sessionRates'
import { estimatePaye } from '../../lib/payeEstimate'
import type { Role } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payslip {
  id: string
  staff_id: string
  period_month: string
  employment_type: 'self_employed' | 'paye'
  session_count: number
  session_gross: number
  salary_gross: number
  gross_pay: number
  expenses_total: number
  tax_deducted: number
  ni_deducted: number
  pension_deducted: number
  net_pay: number
  breakdown: BreakdownItem[] | null
  status: 'draft' | 'released'
  generated_at: string
  released_at: string | null
  staff?: { id: string; full_name: string; role: Role }
}

interface BreakdownItem {
  kind: 'session' | 'expense' | 'salary'
  date: string
  label: string
  amount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `£${n.toFixed(2)}`
}

function monthKeyToRange(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  const start = `${monthKey}-01`
  const endMonth = m === 12 ? 1 : m + 1
  const endYear = m === 12 ? y + 1 : y
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
  return { start, end }
}

function monthLabel(monthKey: string) {
  return new Date(`${monthKey}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function prevMonthKey(): string {
  const now = new Date()
  const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const m = now.getMonth() === 0 ? 12 : now.getMonth()
  return `${y}-${String(m).padStart(2, '0')}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PayslipsAdminPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genMonth, setGenMonth] = useState(prevMonthKey())
  const [genMsg, setGenMsg] = useState<string | null>(null)
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [releasing, setReleasing] = useState<Set<string>>(new Set())

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('payslips')
      .select('*, staff:profiles!staff_id(id, full_name, role)')
      .order('period_month', { ascending: false })
      .order('created_at', { ascending: true })
    setPayslips((data as Payslip[]) ?? [])
    if (data && data.length > 0) {
      const first = (data as Payslip[])[0].period_month.slice(0, 7)
      setOpenMonths(new Set([first]))
    }
    setLoading(false)
  }

  async function generate() {
    setGenerating(true)
    setGenMsg(null)
    const { start, end } = monthKeyToRange(genMonth)

    // 1. All staff profiles (exclude parent/school)
    const { data: staff } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .not('role', 'in', '(parent,school)')

    if (!staff || staff.length === 0) { setGenerating(false); setGenMsg('No staff found.'); return }

    // 2. Employment records
    const { data: employmentRows } = await supabase
      .from('staff_employment')
      .select('*')
      .in('staff_id', staff.map(s => s.id))
    const employmentByStaff = new Map((employmentRows ?? []).map((e: any) => [e.staff_id, e]))

    // 3. Sessions in period
    const { data: sessions } = await supabase
      .from('clock_records')
      .select('id, staff_id, session_date, session_role, school:schools(name)')
      .gte('session_date', start)
      .lt('session_date', end)
      .not('session_date', 'is', null)

    // 4. Approved expenses in period
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, staff_id, date, description, amount')
      .eq('status', 'approved')
      .gte('date', start)
      .lt('date', end)

    const rows: any[] = []

    for (const person of staff) {
      const employment = employmentByStaff.get(person.id)
      const isPaye = employment?.contract_type === 'employee'
      const staffSessions = (sessions ?? []).filter((s: any) => s.staff_id === person.id)
      const staffExpenses = (expenses ?? []).filter((e: any) => e.staff_id === person.id)
      const expensesTotal = staffExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)

      const breakdown: BreakdownItem[] = []
      staffExpenses.forEach((e: any) => breakdown.push({
        kind: 'expense', date: e.date, label: e.description, amount: Number(e.amount),
      }))

      if (isPaye) {
        const monthlyGross = employment?.pay_frequency === 'monthly' ? Number(employment.pay_rate ?? 0) : 0
        if (monthlyGross <= 0 && staffSessions.length === 0) continue // nothing to pay this month

        const estimate = estimatePaye({
          monthlyGross,
          taxCode: employment?.tax_code ?? null,
          niCategory: employment?.ni_category ?? 'A',
          pensionOptedIn: employment?.pension_opted_in ?? true,
          pensionEmployeePercent: Number(employment?.pension_employee_percent ?? 5),
        })

        breakdown.unshift({ kind: 'salary', date: start, label: 'Monthly salary', amount: monthlyGross })

        rows.push({
          staff_id: person.id,
          period_month: start,
          employment_type: 'paye',
          session_count: 0,
          session_gross: 0,
          salary_gross: monthlyGross,
          gross_pay: monthlyGross,
          expenses_total: expensesTotal,
          tax_deducted: estimate.taxDeducted,
          ni_deducted: estimate.niDeducted,
          pension_deducted: estimate.pensionDeducted,
          net_pay: estimate.netPay + expensesTotal,
          breakdown,
          status: 'draft',
          generated_at: new Date().toISOString(),
        })
      } else {
        if (staffSessions.length === 0 && expensesTotal === 0) continue // nothing to pay this month

        let sessionGross = 0
        staffSessions.forEach((s: any) => {
          const rate = rateForSessionRole(s.session_role)
          sessionGross += rate
          breakdown.push({
            kind: 'session',
            date: s.session_date,
            label: `${(s.school as any)?.name ?? 'Session'} · ${SESSION_ROLE_LABELS[s.session_role] ?? s.session_role ?? ''}`,
            amount: rate,
          })
        })

        rows.push({
          staff_id: person.id,
          period_month: start,
          employment_type: 'self_employed',
          session_count: staffSessions.length,
          session_gross: sessionGross,
          salary_gross: 0,
          gross_pay: sessionGross,
          expenses_total: expensesTotal,
          tax_deducted: 0,
          ni_deducted: 0,
          pension_deducted: 0,
          net_pay: sessionGross + expensesTotal,
          breakdown,
          status: 'draft',
          generated_at: new Date().toISOString(),
        })
      }
    }

    if (rows.length === 0) {
      setGenerating(false)
      setGenMsg('No pay activity found for that month.')
      return
    }

    const { error } = await supabase.from('payslips').upsert(rows, { onConflict: 'staff_id,period_month' })
    if (error) {
      setGenMsg(`Error: ${error.message}`)
    } else {
      setGenMsg(`Generated ${rows.length} draft payslip${rows.length !== 1 ? 's' : ''} for ${monthLabel(genMonth)}.`)
      setOpenMonths(prev => new Set([...prev, genMonth]))
      await load()
    }
    setGenerating(false)
  }

  async function release(id: string) {
    setReleasing(prev => new Set(prev).add(id))
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('payslips').update({
      status: 'released',
      released_at: new Date().toISOString(),
      released_by: user?.id ?? null,
    }).eq('id', id)
    if (!error) {
      const slip = payslips.find(p => p.id === id)
      if (slip) {
        await supabase.from('notifications').insert({
          user_id: slip.staff_id,
          title: `Your payslip for ${monthLabel(slip.period_month.slice(0, 7))} is ready`,
          body: `Net pay: ${fmt(slip.net_pay)}`,
          type: 'payslip',
          related_id: slip.id,
          read: false,
        })
      }
      setPayslips(prev => prev.map(p => p.id === id ? { ...p, status: 'released', released_at: new Date().toISOString() } : p))
    }
    setReleasing(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  async function releaseAll(monthKey: string) {
    const drafts = byMonth[monthKey]?.filter(p => p.status === 'draft') ?? []
    for (const p of drafts) await release(p.id)
  }

  function toggleMonth(key: string) {
    setOpenMonths(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }
  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const byMonth = payslips.reduce<Record<string, Payslip[]>>((acc, p) => {
    const key = p.period_month.slice(0, 7)
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})
  const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a))

  return (
    <Layout title="Payslips" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>PAYE tax/NI/pension figures are estimates</strong> using standard rates — verify against Xero
            or with your accountant before final payment. Self-employed earnings statements show gross pay only
            (no deductions), as coaches handle their own tax.
          </p>
        </div>

        {/* Generate panel */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generate Payslips</p>
          <div className="flex gap-2">
            <input
              type="month"
              value={genMonth}
              onChange={e => setGenMonth(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
            />
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60"
            >
              <RefreshCw size={15} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
          {genMsg && <p className="text-xs text-gray-500">{genMsg}</p>}
          <p className="text-[11px] text-gray-400">
            Pulls session earnings + approved expenses for self-employed coaches, and monthly salary + tax/NI/pension
            estimate for PAYE staff (contract type = Employee). Creates drafts — nothing is visible to staff until released.
          </p>
        </div>

        {/* Payslip list */}
        {loading ? (
          <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : monthKeys.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No payslips generated yet</p>
          </div>
        ) : (
          monthKeys.map(mk => {
            const slips = byMonth[mk]
            const isOpen = openMonths.has(mk)
            const draftCount = slips.filter(p => p.status === 'draft').length
            const totalNet = slips.reduce((s, p) => s + p.net_pay, 0)

            return (
              <div key={mk}>
                <button
                  onClick={() => toggleMonth(mk)}
                  className="w-full flex items-center justify-between bg-[#1a3a6b] text-white px-4 py-3 rounded-2xl mb-2"
                >
                  <div className="text-left">
                    <p className="font-extrabold text-sm">{monthLabel(mk)}</p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {slips.length} payslips · {fmt(totalNet)} {draftCount > 0 && `· ${draftCount} draft`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {draftCount > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); releaseAll(mk) }}
                        className="flex items-center gap-1.5 bg-[#f5c518] text-[#1a3a6b] px-3 py-1.5 rounded-xl text-xs font-bold"
                      >
                        <Send size={12} /> Release All
                      </button>
                    )}
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-3 mb-2">
                    {slips.map(p => {
                      const isExp = expanded.has(p.id)
                      const isRel = p.status === 'released'
                      return (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleExpand(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-[#1a3a6b] text-sm">{p.staff?.full_name}</p>
                                {isRel ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={10} /> Released
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <AlertTriangle size={10} /> Draft
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {p.employment_type === 'paye' ? 'PAYE' : 'Self-employed'}
                                {p.session_count > 0 && ` · ${p.session_count} session${p.session_count !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                            <p className="font-extrabold text-[#1a3a6b] text-base shrink-0">{fmt(p.net_pay)}</p>
                            {isExp ? <ChevronUp size={16} className="text-gray-300 shrink-0" /> : <ChevronDown size={16} className="text-gray-300 shrink-0" />}
                          </button>

                          {isExp && (
                            <div className="border-t border-gray-50">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Breakdown</p>
                              </div>
                              {(p.breakdown ?? []).map((b, i) => (
                                <div key={i} className="px-4 py-2.5 flex items-center justify-between border-b border-gray-50 last:border-0">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{b.label}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                  </div>
                                  <p className="text-xs font-bold text-gray-700 shrink-0">{fmt(b.amount)}</p>
                                </div>
                              ))}

                              <div className="px-4 py-3 bg-[#1a3a6b]/5 flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Gross pay</span>
                                  <span className="font-semibold text-gray-700">{fmt(p.gross_pay)}</span>
                                </div>
                                {p.employment_type === 'paye' && (
                                  <>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Tax (est.)</span>
                                      <span className="font-semibold text-red-500">−{fmt(p.tax_deducted)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">NI (est.)</span>
                                      <span className="font-semibold text-red-500">−{fmt(p.ni_deducted)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Pension (est.)</span>
                                      <span className="font-semibold text-red-500">−{fmt(p.pension_deducted)}</span>
                                    </div>
                                  </>
                                )}
                                {p.expenses_total > 0 && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Expenses (reimbursed)</span>
                                    <span className="font-semibold text-green-600">+{fmt(p.expenses_total)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm pt-1.5 border-t border-[#1a3a6b]/10">
                                  <span className="font-bold text-[#1a3a6b]">Net pay</span>
                                  <span className="font-extrabold text-[#1a3a6b]">{fmt(p.net_pay)}</span>
                                </div>
                              </div>

                              {!isRel && (
                                <div className="px-4 py-3">
                                  <button
                                    onClick={() => release(p.id)}
                                    disabled={releasing.has(p.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60"
                                  >
                                    <Send size={14} /> {releasing.has(p.id) ? 'Releasing…' : 'Release to staff'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
