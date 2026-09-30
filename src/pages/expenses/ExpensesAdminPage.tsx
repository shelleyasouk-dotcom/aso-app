import { useState, useEffect } from 'react'
import { Car, Train, ReceiptText, Check, X, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import type { Expense, ExpenseType } from '../../types'

type EnrichedExpense = Omit<Expense, 'staff'> & {
  staff?: { full_name: string; role: string }
}

interface MonthConfirmation {
  month: string
  confirmed_by: string | null
  confirmed_at: string
  total_amount: number
  confirmer?: { full_name: string }
}

const TYPE_LABELS: Record<ExpenseType, string> = {
  mileage: 'Mileage',
  travel: 'Travel',
  other: 'Other',
}

const TYPE_ICONS: Record<ExpenseType, React.ElementType> = {
  mileage: Car,
  travel: Train,
  other: ReceiptText,
}

interface GroupedStaff {
  staffId: string
  staffName: string
  expenses: EnrichedExpense[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthLabel(monthKey: string) {
  return new Date(`${monthKey}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function statusBadge(status: string) {
  if (status === 'approved') return <Badge color="green">Approved</Badge>
  if (status === 'rejected') return <Badge color="red">Rejected</Badge>
  return <Badge color="yellow">Pending</Badge>
}

interface ExpenseAdminRowProps {
  expense: EnrichedExpense
  onApprove: (id: string, note: string) => void
  onReject: (id: string, note: string) => void
  saving: boolean
}

function ExpenseAdminRow({ expense, onApprove, onReject, saving }: ExpenseAdminRowProps) {
  const [expanded, setExpanded] = useState(expense.status === 'pending')
  const [note, setNote] = useState('')
  const Icon = TYPE_ICONS[expense.type]

  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <button
        className="w-full text-left flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#1a3a6b]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-[#1a3a6b] truncate">{expense.description}</p>
            <p className="font-bold text-[#1a3a6b] shrink-0">£{expense.amount.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {statusBadge(expense.status)}
            <span className="text-xs text-gray-400">{TYPE_LABELS[expense.type]}</span>
            {expense.miles && <span className="text-xs text-gray-400">{expense.miles} miles</span>}
            <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
          </div>
        </div>
        {expense.status === 'pending'
          ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
          : <ChevronUp size={16} className="text-gray-400 shrink-0" />
        }
      </button>

      {expanded && expense.status === 'pending' && (
        <div className="mt-3 pl-12 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Note (optional)…"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onReject(expense.id, note)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
            >
              <X size={14} /> Reject
            </button>
            <button
              onClick={() => onApprove(expense.id, note)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1a3a6b] text-white text-sm font-medium"
            >
              <Check size={14} /> Approve
            </button>
          </div>
        </div>
      )}
      {expanded && expense.status !== 'pending' && expense.admin_note && (
        <p className="mt-2 pl-12 text-xs text-gray-500">{expense.admin_note}</p>
      )}
    </div>
  )
}

export function ExpensesAdminPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'director' || profile?.role === 'operations_manager'
  const [expenses, setExpenses] = useState<EnrichedExpense[]>([])
  const [confirmations, setConfirmations] = useState<Record<string, MonthConfirmation>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending')
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('expenses')
      .select('*, staff:profiles!staff_id(full_name, role)')
      .order('date', { ascending: false })
    if (data) setExpenses(data)

    if (isAdmin) {
      const { data: confirmData } = await supabase
        .from('expense_month_confirmations')
        .select('*, confirmer:profiles!confirmed_by(full_name)')
      const map: Record<string, MonthConfirmation> = {}
      for (const row of confirmData ?? []) {
        map[(row as any).month.slice(0, 7)] = row as MonthConfirmation
      }
      setConfirmations(map)
    }
    setLoading(false)
  }

  async function approve(id: string, note: string) {
    if (!profile) return
    setSaving(true)
    await supabase.from('expenses').update({
      status: 'approved',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      admin_note: note || null,
    }).eq('id', id)
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved', admin_note: note || null } : e))
    setSaving(false)
  }

  async function reject(id: string, note: string) {
    if (!profile) return
    setSaving(true)
    await supabase.from('expenses').update({
      status: 'rejected',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      admin_note: note || null,
    }).eq('id', id)
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected', admin_note: note || null } : e))
    setSaving(false)
  }

  async function confirmMonth(monthKey: string, total: number) {
    if (!profile) return
    setConfirming(monthKey)
    const { error } = await supabase.from('expense_month_confirmations').upsert({
      month: `${monthKey}-01`,
      confirmed_by: profile.id,
      confirmed_at: new Date().toISOString(),
      total_amount: total,
    }, { onConflict: 'month' })
    if (!error) {
      setConfirmations(prev => ({
        ...prev,
        [monthKey]: {
          month: `${monthKey}-01`,
          confirmed_by: profile.id,
          confirmed_at: new Date().toISOString(),
          total_amount: total,
          confirmer: { full_name: profile.full_name },
        },
      }))
    }
    setConfirming(null)
  }

  function toggleMonth(key: string) {
    setOpenMonths(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  const filtered = filterStatus ? expenses.filter(e => e.status === filterStatus) : expenses

  const grouped = filtered.reduce<Record<string, GroupedStaff>>((acc, e) => {
    if (!acc[e.staff_id]) {
      acc[e.staff_id] = { staffId: e.staff_id, staffName: (e.staff as any)?.full_name ?? 'Unknown', expenses: [] }
    }
    acc[e.staff_id].expenses.push(e)
    return acc
  }, {})

  const pendingCount = expenses.filter(e => e.status === 'pending').length
  const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0)

  // ── Admin-only: approved expenses grouped by month → staff ──────────────────
  const approvedByMonth = expenses
    .filter(e => e.status === 'approved')
    .reduce<Record<string, EnrichedExpense[]>>((acc, e) => {
      const key = e.date.slice(0, 7)
      if (!acc[key]) acc[key] = []
      acc[key].push(e)
      return acc
    }, {})
  const monthKeys = Object.keys(approvedByMonth).sort((a, b) => b.localeCompare(a))

  return (
    <Layout title="Expenses" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8">

        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="font-semibold text-amber-800 text-sm">
              {pendingCount} pending expense{pendingCount !== 1 ? 's' : ''} · £{pendingTotal.toFixed(2)} total
            </p>
          </div>
        )}

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']] as [string, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val as typeof filterStatus)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === val ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <Card className="text-center py-8">
            <ReceiptText size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No expenses found.</p>
          </Card>
        ) : (
          Object.values(grouped).map(group => (
            <Card key={group.staffId}>
              <p className="font-bold text-[#1a3a6b] mb-1">{group.staffName}</p>
              <p className="text-xs text-gray-400 mb-3">
                £{group.expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)} · {group.expenses.length} item{group.expenses.length !== 1 ? 's' : ''}
              </p>
              {group.expenses.map(e => (
                <ExpenseAdminRow key={e.id} expense={e} onApprove={approve} onReject={reject} saving={saving} />
              ))}
            </Card>
          ))
        )}

        {/* ── Admin-only: Monthly Tally ── */}
        {isAdmin && !loading && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Tally — Admin Only</p>
            </div>
            <p className="text-xs text-gray-400 -mt-2">
              Approved expenses by month. Confirm a month once it's final — the total then feeds into that month's payslips.
            </p>

            {monthKeys.length === 0 ? (
              <Card className="text-center py-6">
                <p className="text-sm text-gray-400">No approved expenses yet.</p>
              </Card>
            ) : (
              monthKeys.map(mk => {
                const monthExpenses = approvedByMonth[mk]
                const isOpen = openMonths.has(mk)
                const total = monthExpenses.reduce((s, e) => s + e.amount, 0)
                const confirmation = confirmations[mk]
                const isConfirmed = !!confirmation

                const byStaff = monthExpenses.reduce<Record<string, GroupedStaff>>((acc, e) => {
                  if (!acc[e.staff_id]) acc[e.staff_id] = { staffId: e.staff_id, staffName: (e.staff as any)?.full_name ?? 'Unknown', expenses: [] }
                  acc[e.staff_id].expenses.push(e)
                  return acc
                }, {})

                return (
                  <div key={mk}>
                    <button
                      onClick={() => toggleMonth(mk)}
                      className="w-full flex items-center justify-between bg-[#1a3a6b] text-white px-4 py-3 rounded-2xl mb-2"
                    >
                      <div className="text-left">
                        <p className="font-extrabold text-sm">{monthLabel(mk)}</p>
                        <p className="text-white/60 text-xs mt-0.5">
                          {Object.keys(byStaff).length} staff · £{total.toFixed(2)}
                          {isConfirmed && ' · Confirmed'}
                        </p>
                      </div>
                      <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-2 mb-2">
                        {isConfirmed ? (
                          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                            <p className="text-xs text-green-800">
                              Confirmed by {confirmation.confirmer?.full_name ?? 'admin'} on{' '}
                              {new Date(confirmation.confirmed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' — '}£{confirmation.total_amount.toFixed(2)} owed
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmMonth(mk, total)}
                            disabled={confirming === mk}
                            className="w-full flex items-center justify-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold py-2.5 rounded-2xl text-sm disabled:opacity-60"
                          >
                            <CheckCircle2 size={15} /> {confirming === mk ? 'Confirming…' : `Confirm ${monthLabel(mk)} — £${total.toFixed(2)} owed`}
                          </button>
                        )}

                        {Object.values(byStaff).map(g => (
                          <Card key={g.staffId} className="flex items-center justify-between py-3">
                            <div>
                              <p className="font-semibold text-[#1a3a6b] text-sm">{g.staffName}</p>
                              <p className="text-xs text-gray-400">{g.expenses.length} item{g.expenses.length !== 1 ? 's' : ''}</p>
                            </div>
                            <p className="font-bold text-[#1a3a6b]">£{g.expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}</p>
                          </Card>
                        ))}

                        <div className="bg-[#1a3a6b]/8 rounded-2xl px-4 py-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1a3a6b]">{monthLabel(mk)} total owed</p>
                          <p className="font-extrabold text-[#1a3a6b]">£{total.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
