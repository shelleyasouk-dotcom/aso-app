import { useState, useEffect } from 'react'
import { Plus, Car, Train, ReceiptText, X, Check, Clock, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import type { Expense, ExpenseType } from '../../types'

const MILEAGE_RATE = 0.45 // HMRC approved mileage rate per mile

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

function statusBadge(status: string) {
  if (status === 'approved') return <Badge color="green">Approved</Badge>
  if (status === 'rejected') return <Badge color="red">Rejected</Badge>
  return <Badge color="yellow">Pending</Badge>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Module-level to prevent keyboard dismissal bug
interface ExpenseRowProps {
  expense: Expense
}

function ExpenseRow({ expense }: ExpenseRowProps) {
  const Icon = TYPE_ICONS[expense.type]
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#1a3a6b]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-[#1a3a6b] text-sm truncate">{expense.description}</p>
            <p className="font-bold text-[#1a3a6b] shrink-0">£{expense.amount.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {statusBadge(expense.status)}
            <span className="text-xs text-gray-400">{TYPE_LABELS[expense.type]}</span>
            {expense.miles && <span className="text-xs text-gray-400">{expense.miles} miles</span>}
            <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
          </div>
          {expense.admin_note && (
            <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2 py-1">{expense.admin_note}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export function ExpensesPage() {
  const { profile } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'mileage' as ExpenseType,
    description: '',
    miles: '',
    amount: '',
  })

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('staff_id', profile!.id)
      .order('date', { ascending: false })
    if (data) setExpenses(data)
    setLoading(false)
  }

  function handleTypeChange(type: ExpenseType) {
    setForm(prev => ({
      ...prev,
      type,
      miles: type !== 'mileage' ? '' : prev.miles,
      amount: type !== 'mileage' ? prev.amount : prev.miles ? (parseFloat(prev.miles) * MILEAGE_RATE).toFixed(2) : '',
    }))
  }

  function handleMilesChange(miles: string) {
    const num = parseFloat(miles)
    setForm(prev => ({
      ...prev,
      miles,
      amount: isNaN(num) ? '' : (num * MILEAGE_RATE).toFixed(2),
    }))
  }

  async function submit() {
    if (!profile || !form.description.trim() || !form.date || !form.amount) return
    setSaving(true)
    const { data } = await supabase.from('expenses').insert({
      staff_id: profile.id,
      date: form.date,
      type: form.type,
      description: form.description.trim(),
      miles: form.miles ? parseFloat(form.miles) : null,
      amount: parseFloat(form.amount),
    }).select().single()
    if (data) setExpenses(prev => [data, ...prev])
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'mileage', description: '', miles: '', amount: '' })
    setShowForm(false)
    setSaving(false)
  }

  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0)
  const totalApproved = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0)

  return (
    <Layout title="My Expenses" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8">

        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Submit Expense
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New Expense</h3>
            <div className="flex flex-col gap-3">

              {/* Type selector */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mileage', 'travel', 'other'] as ExpenseType[]).map(t => {
                    const Icon = TYPE_ICONS[t]
                    return (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-colors ${
                          form.type === t
                            ? 'border-[#1a3a6b] bg-[#1a3a6b] text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={18} />
                        {TYPE_LABELS[t]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Input label="Date" type="date"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />

              <Input label="Description" placeholder="e.g. Travel to St Peter's School"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              {form.type === 'mileage' && (
                <Input label={`Miles (at ${(MILEAGE_RATE * 100).toFixed(0)}p/mile HMRC rate)`}
                  type="number" placeholder="e.g. 25"
                  value={form.miles} onChange={e => handleMilesChange(e.target.value)} />
              )}

              <Input
                label={form.type === 'mileage' ? 'Amount (auto-calculated)' : 'Amount (£)'}
                type="number" step="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                readOnly={form.type === 'mileage'}
              />

              {form.type === 'mileage' && form.amount && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                  <Check size={14} className="text-[#1a3a6b] shrink-0" />
                  <p className="text-xs text-[#1a3a6b]">
                    {form.miles} miles × {(MILEAGE_RATE * 100).toFixed(0)}p = <strong>£{parseFloat(form.amount).toFixed(2)}</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  <X size={16} /> Cancel
                </Button>
                <Button onClick={submit} disabled={saving || !form.description.trim() || !form.amount} className="flex-1">
                  {saving ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Summary */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock size={15} className="text-yellow-500" />
                <p className="text-xs font-medium text-gray-500">Pending</p>
              </div>
              <p className="text-xl font-bold text-[#1a3a6b]">£{totalPending.toFixed(2)}</p>
            </Card>
            <Card className="text-center py-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 size={15} className="text-green-500" />
                <p className="text-xs font-medium text-gray-500">Approved</p>
              </div>
              <p className="text-xl font-bold text-[#1a3a6b]">£{totalApproved.toFixed(2)}</p>
            </Card>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : expenses.length === 0 ? (
          <Card className="text-center py-8">
            <ReceiptText size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No expenses submitted yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map(e => <ExpenseRow key={e.id} expense={e} />)}
          </div>
        )}

      </div>
    </Layout>
  )
}
