import { useState, useEffect } from 'react'
import { Plus, Copy, Check, Trash2, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'

interface DiscountCode {
  id: string
  created_at: string
  code: string
  description: string | null
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number | null
  uses: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_by: string | null
}

interface CreateForm {
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: string
  max_uses: string
  valid_from: string
  valid_until: string
  is_active: boolean
}

const EMPTY_FORM: CreateForm = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  max_uses: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
}

function formatValue(code: DiscountCode): string {
  if (code.type === 'percentage') return `${code.value}% off`
  return `£${(code.value / 100).toFixed(2)} off`
}

function formatUses(code: DiscountCode): string {
  return `${code.uses} / ${code.max_uses ?? '∞'}`
}

function formatValidUntil(code: DiscountCode): string {
  if (!code.valid_until) return 'No expiry'
  return new Date(code.valid_until).toLocaleDateString('en-GB')
}

export function DiscountCodesAdminPage() {
  const { profile } = useAuth()
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  async function loadCodes() {
    setLoading(true)
    setGlobalError(null)
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setGlobalError(error.message)
    } else {
      setCodes(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { loadCodes() }, [])

  function setField<K extends keyof CreateForm>(key: K, value: CreateForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const code = form.code.trim().toUpperCase()
    if (!code) { setFormError('Code is required.'); return }
    const value = parseFloat(form.value)
    if (!form.value || isNaN(value) || value <= 0) {
      setFormError('Value must be a positive number.')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('discount_codes').insert({
      code,
      description: form.description.trim() || null,
      type: form.type,
      value,
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
      created_by: profile?.id ?? null,
    })
    setSaving(false)

    if (error) {
      setFormError(error.message)
    } else {
      setFormSuccess(`Code "${code}" created successfully.`)
      setForm(EMPTY_FORM)
      setShowForm(false)
      loadCodes()
    }
  }

  async function handleToggleActive(code: DiscountCode) {
    setToggleLoading(code.id)
    const { error } = await supabase
      .from('discount_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id)
    setToggleLoading(null)
    if (error) {
      setGlobalError(error.message)
    } else {
      setCodes(prev =>
        prev.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c)
      )
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('discount_codes').delete().eq('id', id)
    if (error) {
      setGlobalError(error.message)
    } else {
      setCodes(prev => prev.filter(c => c.id !== id))
      setConfirmDelete(null)
    }
  }

  function handleCopy(code: DiscountCode) {
    navigator.clipboard.writeText(code.code)
    setCopiedId(code.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag className="text-[#1a3a6b]" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a6b]">Discount Codes</h1>
              <p className="text-sm text-gray-500">{codes.length} code{codes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setShowForm(v => !v); setFormError(null); setFormSuccess(null) }}
          >
            <Plus size={16} />
            {showForm ? 'Cancel' : 'Add Code'}
          </Button>
        </div>

        {globalError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        )}

        {formSuccess && !showForm && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            {formSuccess}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <Card className="mb-6 p-5">
            <h2 className="text-lg font-bold text-[#1a3a6b] mb-4">New Discount Code</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Code"
                  placeholder="e.g. SIBLING10"
                  value={form.code}
                  onChange={e => setField('code', e.target.value.toUpperCase())}
                  required
                />
                <Input
                  label="Description"
                  placeholder="e.g. Sibling discount 10%"
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={form.type}
                  onChange={e => setField('type', e.target.value as 'percentage' | 'fixed')}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </Select>
                <Input
                  label={form.type === 'percentage' ? 'Value (%)' : 'Value (pence — 100 = £1)'}
                  type="number"
                  min="1"
                  step={form.type === 'percentage' ? '1' : '1'}
                  placeholder={form.type === 'percentage' ? 'e.g. 10' : 'e.g. 200'}
                  value={form.value}
                  onChange={e => setField('value', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Max uses (optional)"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Leave blank for unlimited"
                  value={form.max_uses}
                  onChange={e => setField('max_uses', e.target.value)}
                />
                <Input
                  label="Valid from (optional)"
                  type="date"
                  value={form.valid_from}
                  onChange={e => setField('valid_from', e.target.value)}
                />
                <Input
                  label="Valid until (optional)"
                  type="date"
                  value={form.valid_until}
                  onChange={e => setField('valid_until', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setField('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a3a6b] focus:ring-[#1a3a6b]"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Active (can be used immediately)
                </label>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Code'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null) }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* List */}
        {loading ? (
          <Card className="p-8 text-center text-gray-400 text-sm">Loading codes…</Card>
        ) : codes.length === 0 ? (
          <Card className="p-8 text-center text-gray-400 text-sm">No discount codes yet. Click "Add Code" to create one.</Card>
        ) : (
          <Card className="overflow-hidden p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Discount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Uses</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Valid until</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {codes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1a3a6b] bg-[#1a3a6b]/5 px-2 py-0.5 rounded">
                            {code.code}
                          </span>
                          <button
                            onClick={() => handleCopy(code)}
                            className="text-gray-400 hover:text-[#1a3a6b] transition-colors"
                            title="Copy code"
                          >
                            {copiedId === code.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{code.description ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{formatValue(code)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatUses(code)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatValidUntil(code)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(code)}
                          disabled={toggleLoading === code.id}
                          title={code.is_active ? 'Deactivate' : 'Activate'}
                          className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            transition-colors disabled:opacity-50
                            ${code.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                          `}
                        >
                          {toggleLoading === code.id ? '…' : code.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {confirmDelete === code.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs text-gray-500">Are you sure?</span>
                            <Button
                              variant="danger"
                              size="sm"
                              className="py-1 px-2 text-xs"
                              onClick={() => handleDelete(code.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="py-1 px-2 text-xs"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(code.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            title="Delete code"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {codes.map(code => (
                <div key={code.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1a3a6b] bg-[#1a3a6b]/5 px-2 py-0.5 rounded text-sm">
                        {code.code}
                      </span>
                      <button onClick={() => handleCopy(code)} className="text-gray-400 hover:text-[#1a3a6b]">
                        {copiedId === code.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleActive(code)}
                      disabled={toggleLoading === code.id}
                      className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors
                        ${code.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                      `}
                    >
                      {toggleLoading === code.id ? '…' : code.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  {code.description && <p className="text-xs text-gray-500">{code.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{formatValue(code)}</span>
                    <span>{formatUses(code)} uses</span>
                    <span>{formatValidUntil(code)}</span>
                  </div>
                  {confirmDelete === code.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-gray-500">Are you sure?</span>
                      <Button variant="danger" size="sm" className="py-1 px-2 text-xs" onClick={() => handleDelete(code.id)}>
                        Delete
                      </Button>
                      <Button variant="ghost" size="sm" className="py-1 px-2 text-xs" onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(code.id)}
                      className="self-start text-gray-300 hover:text-red-500 transition-colors pt-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
