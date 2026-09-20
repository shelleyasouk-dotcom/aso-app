import { useState, useEffect } from 'react'
import { Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

interface BreakdownItem {
  kind: 'session' | 'expense' | 'salary'
  date: string
  label: string
  amount: number
}

interface Payslip {
  id: string
  period_month: string
  employment_type: 'self_employed' | 'paye'
  session_count: number
  gross_pay: number
  expenses_total: number
  tax_deducted: number
  ni_deducted: number
  pension_deducted: number
  net_pay: number
  breakdown: BreakdownItem[] | null
  released_at: string | null
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`
}
function monthLabel(monthKey: string) {
  return new Date(`${monthKey}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function MyPayslipsPage() {
  const { profile } = useAuth()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .eq('staff_id', profile!.id)
      .eq('status', 'released')
      .order('period_month', { ascending: false })
    setPayslips((data as Payslip[]) ?? [])
    setLoading(false)
  }

  function toggle(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <Layout title="My Payslips" showBack>
      <div className="px-4 pt-6 flex flex-col gap-3 pb-8 max-w-2xl mx-auto w-full">

        {loading ? (
          <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No payslips yet</p>
            <p className="text-gray-400 text-xs mt-1">They'll appear here once released, usually around the 10th of each month.</p>
          </div>
        ) : (
          payslips.map(p => {
            const monthKey = p.period_month.slice(0, 7)
            const isOpen = expanded.has(p.id)
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(p.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a3a6b] text-sm">{monthLabel(monthKey)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.employment_type === 'paye' ? 'PAYE payslip' : 'Earnings statement'}
                      {p.session_count > 0 && ` · ${p.session_count} session${p.session_count !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <p className="font-extrabold text-[#1a3a6b] text-lg shrink-0">{fmt(p.net_pay)}</p>
                  {isOpen ? <ChevronUp size={16} className="text-gray-300 shrink-0" /> : <ChevronDown size={16} className="text-gray-300 shrink-0" />}
                </button>

                {isOpen && (
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
                            <span className="text-gray-500">Tax</span>
                            <span className="font-semibold text-red-500">−{fmt(p.tax_deducted)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">National Insurance</span>
                            <span className="font-semibold text-red-500">−{fmt(p.ni_deducted)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Pension</span>
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
                    <div className="px-4 py-3">
                      <button
                        onClick={() => window.print()}
                        className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500"
                      >
                        Print / Save as PDF
                      </button>
                    </div>
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
