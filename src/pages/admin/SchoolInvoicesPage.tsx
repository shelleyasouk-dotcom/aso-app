import { useState, useEffect, useCallback } from 'react'
import { Upload, Download, Check, AlertTriangle, FileText, Settings, Banknote, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School, SchoolInvoice } from '../../types'

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function monthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-')
  return new Date(`${y}-${m}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function refMonthYear(key: string): string {
  const [year, month] = key.split('-')
  return `${MONTH_ABBR[parseInt(month, 10) - 1]}${year.slice(2)}`
}

function digitsOnly(value: string | null | undefined, padTo: number): string {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.padStart(padTo, '0')
}

function fmt(p: number) {
  return `£${p.toFixed(2)}`
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function SchoolInvoicesPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<'invoices' | 'setup'>('invoices')
  const [month, setMonth] = useState(monthKey())
  const [schools, setSchools] = useState<School[]>([])
  const [invoices, setInvoices] = useState<SchoolInvoice[]>([])
  const [loading, setLoading] = useState(true)

  // Per-school upload form state
  const [uploadFor, setUploadFor] = useState<string | null>(null)
  const [uploadAmount, setUploadAmount] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadNotes, setUploadNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Setup tab inline edit
  const [setupEdit, setSetupEdit] = useState<Record<string, { hire_charge: string; bank_account_name: string; bank_sort_code: string; bank_account_number: string }>>({})
  const [setupSaving, setSetupSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: schoolData }, { data: invoiceData }] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('school_invoices').select('*, school:schools(id, name, bank_account_name, bank_sort_code, bank_account_number), reviewer:profiles!reviewed_by(full_name)').eq('month', month),
    ])
    setSchools((schoolData ?? []) as School[])
    setInvoices((invoiceData ?? []) as SchoolInvoice[])
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  const hireSchools = schools.filter(s => s.hire_charge != null)
  const invoiceBySchool = new Map(invoices.map(i => [i.school_id, i]))

  function startUpload(schoolId: string, expected: number | null) {
    setUploadFor(schoolId)
    setUploadAmount(expected != null ? expected.toFixed(2) : '')
    setUploadFile(null)
    setUploadNotes('')
    setError(null)
  }

  async function saveUpload(school: School) {
    if (!profile || !uploadAmount.trim()) return
    setSaving(true)
    setError(null)

    let filePath: string | null = null
    if (uploadFile) {
      const ext = uploadFile.name.split('.').pop()
      filePath = `${school.id}/${month}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('school-invoices').upload(filePath, uploadFile)
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setSaving(false); return }
    }

    const invoiced = parseFloat(uploadAmount)
    const { error: insErr } = await supabase.from('school_invoices').insert({
      school_id: school.id,
      month,
      expected_amount: school.hire_charge ?? null,
      invoiced_amount: invoiced,
      approved_amount: school.hire_charge ?? invoiced,
      status: 'pending',
      file_path: filePath,
      notes: uploadNotes.trim() || null,
      uploaded_by: profile.id,
    })

    if (insErr) { setError(insErr.message); setSaving(false); return }
    setUploadFor(null)
    await load()
    setSaving(false)
  }

  async function updateApprovedAmount(invoice: SchoolInvoice, value: string) {
    const amount = parseFloat(value)
    if (isNaN(amount)) return
    await supabase.from('school_invoices').update({ approved_amount: amount }).eq('id', invoice.id)
    setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, approved_amount: amount } : i))
  }

  async function approveInvoice(invoice: SchoolInvoice) {
    if (!profile) return
    await supabase.from('school_invoices').update({
      status: 'approved', reviewed_by: profile.id, reviewed_at: new Date().toISOString(),
    }).eq('id', invoice.id)
    await load()
  }

  async function unapproveInvoice(invoice: SchoolInvoice) {
    await supabase.from('school_invoices').update({ status: 'pending', reviewed_by: null, reviewed_at: null }).eq('id', invoice.id)
    await load()
  }

  async function deleteInvoice(invoice: SchoolInvoice) {
    if (!confirm('Delete this uploaded invoice? This cannot be undone.')) return
    if (invoice.file_path) await supabase.storage.from('school-invoices').remove([invoice.file_path])
    await supabase.from('school_invoices').delete().eq('id', invoice.id)
    await load()
  }

  async function viewFile(filePath: string) {
    const { data } = await supabase.storage.from('school-invoices').createSignedUrl(filePath, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const approvedThisMonth = invoices.filter(i => i.status === 'approved')
  const approvedTotal = approvedThisMonth.reduce((sum, i) => sum + i.approved_amount, 0)

  async function exportToStarling() {
    const rows: string[][] = []
    rows.push(['DO NOT ALTER THIS TEMPLATE'])
    rows.push(['Sort Code', 'Account Number', 'First Name', 'Last Name', 'Business Name', 'Reference', 'Amount (GBP)'])

    const missingBank: string[] = []
    approvedThisMonth.forEach(inv => {
      const school = inv.school
      const sortCode = digitsOnly(school?.bank_sort_code, 6)
      const accountNumber = digitsOnly(school?.bank_account_number, 8)
      if (!sortCode || !accountNumber) { missingBank.push(school?.name ?? 'Unknown school'); return }
      rows.push([
        sortCode, accountNumber, '', '',
        school?.bank_account_name || school?.name || '',
        `ASO HALLHIRE ${refMonthYear(month)}`,
        inv.approved_amount.toFixed(2),
      ])
    })

    if (missingBank.length > 0) {
      alert(`Missing bank details for: ${missingBank.join(', ')}. Add their sort code and account number under the Setup tab first — they've been left out of this export.`)
    }
    if (rows.length <= 2) return

    const [year, m] = month.split('-')
    downloadCSV(rows, `ASO_BankHallHire_${year}_${m}.csv`)

    const payable = approvedThisMonth.filter(inv => {
      const sortCode = digitsOnly(inv.school?.bank_sort_code, 6)
      const accountNumber = digitsOnly(inv.school?.bank_account_number, 8)
      return !!sortCode && !!accountNumber
    })
    if (payable.length > 0 && confirm(`Mark ${payable.length} invoice${payable.length !== 1 ? 's' : ''} (${fmt(payable.reduce((s, i) => s + i.approved_amount, 0))}) as paid now?`)) {
      await Promise.all(payable.map(inv => supabase.from('school_invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', inv.id)))
      await load()
    }
  }

  function startSetupEdit(school: School) {
    setSetupEdit(prev => ({
      ...prev,
      [school.id]: {
        hire_charge: school.hire_charge != null ? String(school.hire_charge) : '',
        bank_account_name: school.bank_account_name ?? '',
        bank_sort_code: school.bank_sort_code ?? '',
        bank_account_number: school.bank_account_number ?? '',
      },
    }))
  }

  async function saveSetup(school: School) {
    const form = setupEdit[school.id]
    if (!form) return
    setSetupSaving(school.id)
    await supabase.from('schools').update({
      hire_charge: form.hire_charge.trim() ? parseFloat(form.hire_charge) : null,
      bank_account_name: form.bank_account_name.trim() || null,
      bank_sort_code: form.bank_sort_code.trim() || null,
      bank_account_number: form.bank_account_number.trim() || null,
    }).eq('id', school.id)
    setSetupEdit(prev => { const next = { ...prev }; delete next[school.id]; return next })
    setSetupSaving(null)
    await load()
  }

  return (
    <Layout title="School Invoices" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-10">

        <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
          {(['invoices', 'setup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                tab === t ? 'bg-[#1a3a6b] text-white' : 'text-gray-500'
              }`}>
              {t === 'invoices' ? <><FileText size={14} /> Invoices</> : <><Settings size={14} /> Hall Hire Setup</>}
            </button>
          ))}
        </div>

        {tab === 'invoices' && (
          <>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Month</label>
                  <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Ready to pay</p>
                  <p className="text-xl font-extrabold text-[#1a3a6b]">{fmt(approvedTotal)}</p>
                  <p className="text-xs text-gray-400">{approvedThisMonth.length} school{approvedThisMonth.length !== 1 ? 's' : ''} approved</p>
                </div>
              </div>
              {approvedThisMonth.length > 0 && (
                <Button className="mt-3 w-full" onClick={exportToStarling}>
                  <Download size={16} /> Export to Starling — {monthLabel(month)}
                </Button>
              )}
            </Card>

            {loading ? (
              <p className="text-center text-gray-400 py-8">Loading…</p>
            ) : hireSchools.length === 0 ? (
              <Card className="text-center py-8">
                <Banknote size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hall-hire schools set up yet.</p>
                <button onClick={() => setTab('setup')} className="text-sm font-semibold text-[#1a3a6b] mt-2">Set one up →</button>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {hireSchools.map(school => {
                  const invoice = invoiceBySchool.get(school.id)
                  const expected = school.hire_charge ?? 0
                  const mismatch = invoice && invoice.invoiced_amount !== expected
                  return (
                    <Card key={school.id}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-[#1a3a6b]">{school.name}</p>
                          <p className="text-xs text-gray-400">Expected hire charge: {fmt(expected)}/month</p>
                        </div>
                        {invoice && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700'
                              : invoice.status === 'approved' ? 'bg-teal-100 text-teal-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {invoice.status === 'paid' ? 'Paid' : invoice.status === 'approved' ? 'Approved' : 'Pending review'}
                          </span>
                        )}
                      </div>

                      {!invoice ? (
                        uploadFor === school.id ? (
                          <div className="flex flex-col gap-2 mt-2 bg-gray-50 rounded-xl p-3">
                            <Input label="Amount invoiced (£)" type="number" step="0.01" value={uploadAmount} onChange={e => setUploadAmount(e.target.value)} />
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-semibold text-gray-700">Invoice file (optional)</label>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                                className="text-sm" />
                            </div>
                            <Input label="Notes (optional)" value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} />
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            <div className="flex gap-2">
                              <Button variant="secondary" className="flex-1" onClick={() => setUploadFor(null)}>Cancel</Button>
                              <Button className="flex-1" disabled={saving || !uploadAmount.trim()} onClick={() => saveUpload(school)}>
                                {saving ? 'Saving…' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => startUpload(school.id, school.hire_charge ?? null)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500 mt-2">
                            <Upload size={14} /> Upload invoice
                          </button>
                        )
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 text-sm">
                            <p className="text-gray-600">Invoiced: <span className="font-semibold text-gray-800">{fmt(invoice.invoiced_amount)}</span></p>
                            {invoice.file_path && (
                              <button onClick={() => viewFile(invoice.file_path!)} className="text-xs font-semibold text-[#1a3a6b] underline">View file</button>
                            )}
                          </div>
                          {mismatch && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
                              <AlertTriangle size={14} className="text-red-500 shrink-0" />
                              <p className="text-xs text-red-700">
                                Invoiced {fmt(invoice.invoiced_amount)} ≠ expected {fmt(expected)} — check before approving.
                              </p>
                            </div>
                          )}
                          {invoice.notes && <p className="text-xs text-gray-500">{invoice.notes}</p>}

                          {invoice.status !== 'paid' && (
                            <Input label="Amount to pay (£)" type="number" step="0.01"
                              value={invoice.approved_amount} disabled={invoice.status === 'approved'}
                              onChange={e => updateApprovedAmount(invoice, e.target.value)} />
                          )}

                          {invoice.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => deleteInvoice(invoice)} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400">
                                <Trash2 size={14} />
                              </button>
                              <Button className="flex-1" onClick={() => approveInvoice(invoice)}>
                                <Check size={14} /> Approve — ready to pay
                              </Button>
                            </div>
                          )}
                          {invoice.status === 'approved' && (
                            <button onClick={() => unapproveInvoice(invoice)} className="text-xs text-gray-400 text-center">
                              Undo approval
                            </button>
                          )}
                          {invoice.status === 'paid' && (
                            <p className="text-xs text-green-600 font-medium">
                              Paid {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} · {fmt(invoice.approved_amount)}
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'setup' && (
          <>
            <p className="text-sm text-gray-500 -mt-1">
              Set a monthly hire charge and bank details only for schools that charge ASO for hall hire. Leave the charge blank for schools that don't.
            </p>
            {schools.map(school => {
              const editing = setupEdit[school.id]
              return (
                <Card key={school.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1a3a6b]">{school.name}</p>
                      {school.hire_charge != null && !editing && (
                        <p className="text-xs text-gray-400">{fmt(school.hire_charge)}/month · {school.bank_account_name || 'no bank details yet'}</p>
                      )}
                    </div>
                    {!editing && (
                      <button onClick={() => startSetupEdit(school)} className="text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
                        {school.hire_charge != null ? 'Edit' : 'Set up hire charge'}
                      </button>
                    )}
                  </div>
                  {editing && (
                    <div className="flex flex-col gap-2 mt-3">
                      <Input label="Hire charge (£/month, leave blank if N/A)" type="number" step="0.01" value={editing.hire_charge}
                        onChange={e => setSetupEdit(prev => ({ ...prev, [school.id]: { ...prev[school.id], hire_charge: e.target.value } }))} />
                      <Input label="Bank account name" value={editing.bank_account_name}
                        onChange={e => setSetupEdit(prev => ({ ...prev, [school.id]: { ...prev[school.id], bank_account_name: e.target.value } }))} />
                      <Input label="Sort code" value={editing.bank_sort_code}
                        onChange={e => setSetupEdit(prev => ({ ...prev, [school.id]: { ...prev[school.id], bank_sort_code: e.target.value } }))} />
                      <Input label="Account number" value={editing.bank_account_number}
                        onChange={e => setSetupEdit(prev => ({ ...prev, [school.id]: { ...prev[school.id], bank_account_number: e.target.value } }))} />
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setSetupEdit(prev => { const next = { ...prev }; delete next[school.id]; return next })}>
                          <X size={14} /> Cancel
                        </Button>
                        <Button className="flex-1" disabled={setupSaving === school.id} onClick={() => saveSetup(school)}>
                          {setupSaving === school.id ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </>
        )}
      </div>
    </Layout>
  )
}
