import { useState, useEffect, useCallback } from 'react'
import { Upload, Download, Check, AlertTriangle, FileText, Settings, Banknote, Trash2, X, Plus, Landmark } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School, SchoolHireTerm, SchoolInvoice } from '../../types'

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function fmt(p: number) {
  return `£${p.toFixed(2)}`
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthKeyFrom(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function refFromMonthKey(key: string): string {
  const [year, month] = key.split('-')
  return `${MONTH_ABBR[parseInt(month, 10) - 1]}${year.slice(2)}`
}

function digitsOnly(value: string | null | undefined, padTo: number): string {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.padStart(padTo, '0')
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

const today = new Date().toISOString().slice(0, 10)

type TermForm = { label: string; start_date: string; end_date: string; hire_days: string; weeks_confirmed: string; rate: string }
const EMPTY_TERM_FORM: TermForm = { label: '', start_date: '', end_date: '', hire_days: '', weeks_confirmed: '', rate: '' }

export function SchoolInvoicesPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<'invoices' | 'setup'>('invoices')
  const [search, setSearch] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [terms, setTerms] = useState<SchoolHireTerm[]>([])
  const [invoices, setInvoices] = useState<SchoolInvoice[]>([])
  const [loading, setLoading] = useState(true)

  // Per-term upload form state
  const [uploadFor, setUploadFor] = useState<string | null>(null) // hire_term_id
  const [uploadAmount, setUploadAmount] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadNotes, setUploadNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Setup tab — school default rate + bank details
  const [setupEdit, setSetupEdit] = useState<Record<string, { hire_charge: string; bank_account_name: string; bank_sort_code: string; bank_account_number: string }>>({})
  const [setupSaving, setSetupSaving] = useState<string | null>(null)

  // Setup tab — hire terms add/edit
  const [termFormFor, setTermFormFor] = useState<string | null>(null) // school_id
  const [termForm, setTermForm] = useState<TermForm>(EMPTY_TERM_FORM)
  const [editingTermId, setEditingTermId] = useState<string | null>(null)
  const [termSaving, setTermSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: schoolData }, { data: termData }, { data: invoiceData }] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('school_hire_terms').select('*').order('start_date', { ascending: false }),
      supabase.from('school_invoices').select('*, school:schools(id, name, bank_account_name, bank_sort_code, bank_account_number), reviewer:profiles!reviewed_by(full_name)'),
    ])
    setSchools((schoolData ?? []) as School[])
    setTerms((termData ?? []) as SchoolHireTerm[])
    setInvoices((invoiceData ?? []) as SchoolInvoice[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const hireSchools = schools
    .filter(s => s.hire_charge != null)
    .filter(s => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase()))
  const termsBySchool = new Map<string, SchoolHireTerm[]>()
  terms.forEach(t => termsBySchool.set(t.school_id, [...(termsBySchool.get(t.school_id) ?? []), t]))
  const invoiceByTerm = new Map(invoices.filter(i => i.hire_term_id).map(i => [i.hire_term_id as string, i]))

  // ── Invoice upload ──────────────────────────────────────────────────────

  function startUpload(termId: string) {
    setUploadFor(termId)
    setUploadAmount('')
    setUploadFile(null)
    setUploadNotes('')
    setError(null)
  }

  async function saveUpload(school: School, term: SchoolHireTerm) {
    if (!profile || !uploadAmount.trim()) return
    setSaving(true)
    setError(null)

    // Cross-reference against what actually happened: count sessions
    // registered at this school within the term's dates.
    const { count: sessionsHeld, error: countErr } = await supabase
      .from('session_registers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .gte('session_date', term.start_date)
      .lte('session_date', term.end_date)

    if (countErr) { setError(countErr.message); setSaving(false); return }

    const rate = term.rate ?? school.hire_charge ?? 0
    const expectedAmount = rate * (sessionsHeld ?? 0)

    let filePath: string | null = null
    if (uploadFile) {
      const ext = uploadFile.name.split('.').pop()
      filePath = `${school.id}/${term.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('school-invoices').upload(filePath, uploadFile)
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setSaving(false); return }
    }

    const invoiced = parseFloat(uploadAmount)
    const { error: insErr } = await supabase.from('school_invoices').insert({
      school_id: school.id,
      hire_term_id: term.id,
      month: monthKeyFrom(term.start_date),
      period_start: term.start_date,
      period_end: term.end_date,
      sessions_held: sessionsHeld ?? 0,
      sessions_agreed: term.weeks_confirmed ?? null,
      expected_amount: expectedAmount,
      invoiced_amount: invoiced,
      approved_amount: expectedAmount || invoiced,
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

  const approvedInvoices = invoices.filter(i => i.status === 'approved')
  const approvedTotal = approvedInvoices.reduce((sum, i) => sum + i.approved_amount, 0)

  async function exportToStarling() {
    const rows: string[][] = []
    rows.push(['DO NOT ALTER THIS TEMPLATE'])
    rows.push(['Sort Code', 'Account Number', 'First Name', 'Last Name', 'Business Name', 'Reference', 'Amount (GBP)'])

    const missingBank: string[] = []
    approvedInvoices.forEach(inv => {
      const school = inv.school
      const sortCode = digitsOnly(school?.bank_sort_code, 6)
      const accountNumber = digitsOnly(school?.bank_account_number, 8)
      if (!sortCode || !accountNumber) { missingBank.push(school?.name ?? 'Unknown school'); return }
      rows.push([
        sortCode, accountNumber, '', '',
        school?.bank_account_name || school?.name || '',
        `ASO HALLHIRE ${refFromMonthKey(inv.month)}`,
        inv.approved_amount.toFixed(2),
      ])
    })

    if (missingBank.length > 0) {
      alert(`Missing bank details for: ${missingBank.join(', ')}. Add their sort code and account number under the Setup tab first — they've been left out of this export.`)
    }
    if (rows.length <= 2) return

    downloadCSV(rows, `ASO_BankHallHire_${today}.csv`)

    const payable = approvedInvoices.filter(inv => {
      const sortCode = digitsOnly(inv.school?.bank_sort_code, 6)
      const accountNumber = digitsOnly(inv.school?.bank_account_number, 8)
      return !!sortCode && !!accountNumber
    })
    if (payable.length > 0 && confirm(`Mark ${payable.length} invoice${payable.length !== 1 ? 's' : ''} (${fmt(payable.reduce((s, i) => s + i.approved_amount, 0))}) as paid now?`)) {
      await Promise.all(payable.map(inv => supabase.from('school_invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', inv.id)))
      await load()
    }
  }

  // ── Setup: default rate + bank details ──────────────────────────────────

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

  // ── Setup: hire terms (semesters / summer holiday blocks) ───────────────

  function startAddTerm(schoolId: string) {
    setTermFormFor(schoolId)
    setEditingTermId(null)
    setTermForm(EMPTY_TERM_FORM)
  }

  function startEditTerm(term: SchoolHireTerm) {
    setTermFormFor(term.school_id)
    setEditingTermId(term.id)
    setTermForm({
      label: term.label,
      start_date: term.start_date,
      end_date: term.end_date,
      hire_days: term.hire_days ?? '',
      weeks_confirmed: term.weeks_confirmed != null ? String(term.weeks_confirmed) : '',
      rate: term.rate != null ? String(term.rate) : '',
    })
  }

  async function saveTerm(schoolId: string) {
    if (!termForm.label.trim() || !termForm.start_date || !termForm.end_date) return
    setTermSaving(true)
    const payload = {
      school_id: schoolId,
      label: termForm.label.trim(),
      start_date: termForm.start_date,
      end_date: termForm.end_date,
      hire_days: termForm.hire_days.trim() || null,
      weeks_confirmed: termForm.weeks_confirmed.trim() ? parseInt(termForm.weeks_confirmed, 10) : null,
      rate: termForm.rate.trim() ? parseFloat(termForm.rate) : null,
    }
    if (editingTermId) {
      await supabase.from('school_hire_terms').update(payload).eq('id', editingTermId)
    } else {
      await supabase.from('school_hire_terms').insert(payload)
    }
    setTermFormFor(null)
    setTermSaving(false)
    await load()
  }

  async function deleteTerm(term: SchoolHireTerm) {
    if (invoiceByTerm.has(term.id)) {
      alert('This term already has an invoice against it — delete the invoice first if you need to remove this term.')
      return
    }
    if (!confirm(`Delete the hire term "${term.label}"?`)) return
    await supabase.from('school_hire_terms').delete().eq('id', term.id)
    await load()
  }

  function renderInvoicePanel(school: School, term: SchoolHireTerm, invoice: SchoolInvoice | undefined) {
    const amountMismatch = invoice && invoice.expected_amount != null && invoice.invoiced_amount !== invoice.expected_amount
    const sessionsMismatch = invoice && invoice.sessions_agreed != null && invoice.sessions_held != null && invoice.sessions_held !== invoice.sessions_agreed

    if (!invoice) {
      return uploadFor === term.id ? (
        <div className="flex flex-col gap-2 mt-2 bg-gray-50 rounded-xl p-3">
          <Input label="Amount invoiced (£)" type="number" step="0.01" value={uploadAmount} onChange={e => setUploadAmount(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Invoice file (optional)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="text-sm" />
          </div>
          <Input label="Notes (optional)" value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setUploadFor(null)}>Cancel</Button>
            <Button className="flex-1" disabled={saving || !uploadAmount.trim()} onClick={() => saveUpload(school, term)}>
              {saving ? 'Checking registers…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => startUpload(term.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500 mt-2">
          <Upload size={14} /> Upload invoice for this term
        </button>
      )
    }

    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-3 text-sm">
          <p className="text-gray-600">Invoiced: <span className="font-semibold text-gray-800">{fmt(invoice.invoiced_amount)}</span></p>
          {invoice.file_path && (
            <button onClick={() => viewFile(invoice.file_path!)} className="text-xs font-semibold text-[#1a3a6b] underline">View file</button>
          )}
        </div>
        {invoice.sessions_held != null && (
          <p className="text-xs text-gray-500">
            Used the hall {invoice.sessions_held} session{invoice.sessions_held !== 1 ? 's' : ''}
            {invoice.sessions_agreed != null && ` (agreed ${invoice.sessions_agreed})`}
            {invoice.expected_amount != null && ` → expected ${fmt(invoice.expected_amount)}`}
          </p>
        )}
        {sessionsMismatch && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              {invoice.sessions_held} session{invoice.sessions_held !== 1 ? 's' : ''} held, but {invoice.sessions_agreed} were agreed for this term — check before approving.
            </p>
          </div>
        )}
        {amountMismatch && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700">
              Invoiced {fmt(invoice.invoiced_amount)} ≠ expected {fmt(invoice.expected_amount!)} based on sessions used — check before approving.
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
          <button onClick={() => unapproveInvoice(invoice)} className="text-xs text-gray-400 text-center">Undo approval</button>
        )}
        {invoice.status === 'paid' && (
          <p className="text-xs text-green-600 font-medium">
            Paid {invoice.paid_at ? fmtDate(invoice.paid_at.slice(0, 10)) : ''} · {fmt(invoice.approved_amount)}
          </p>
        )}
      </div>
    )
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
                <input type="text" placeholder="Search schools…" value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" />
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Ready to pay</p>
                  <p className="text-xl font-extrabold text-[#1a3a6b]">{fmt(approvedTotal)}</p>
                  <p className="text-xs text-gray-400">{approvedInvoices.length} invoice{approvedInvoices.length !== 1 ? 's' : ''} approved</p>
                </div>
              </div>
              {approvedInvoices.length > 0 && (
                <Button className="mt-3 w-full" onClick={exportToStarling}>
                  <Download size={16} /> Export approved invoices to Starling
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
                  const schoolTerms = termsBySchool.get(school.id) ?? []
                  return (
                    <Card key={school.id}>
                      <p className="font-semibold text-[#1a3a6b]">{school.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 mb-3">
                        <Landmark size={12} className="shrink-0" />
                        {school.bank_account_name ? (
                          <span>{school.bank_account_name} · {school.bank_sort_code || '—'} · {school.bank_account_number || '—'}</span>
                        ) : (
                          <span className="text-amber-600">No bank details on file — add under Setup</span>
                        )}
                      </div>

                      {schoolTerms.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          No hire terms set up yet.{' '}
                          <button onClick={() => setTab('setup')} className="font-semibold text-[#1a3a6b]">Add one under Setup →</button>
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {schoolTerms.map(term => {
                            const invoice = invoiceByTerm.get(term.id)
                            return (
                              <div key={term.id} className="border border-gray-100 rounded-xl p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">{term.label}</p>
                                    <p className="text-xs text-gray-400">
                                      {fmtDate(term.start_date)} – {fmtDate(term.end_date)}
                                      {term.hire_days && ` · ${term.hire_days}`}
                                      {term.weeks_confirmed != null && ` · ${term.weeks_confirmed} weeks confirmed`}
                                      {` · ${fmt(term.rate ?? school.hire_charge ?? 0)}/session`}
                                    </p>
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
                                {renderInvoicePanel(school, term, invoice)}
                              </div>
                            )
                          })}
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
              Set a default rate and bank details for any school that charges ASO for hall hire, then add a hire term for each
              semester (or summer holiday block) you've agreed with them — each with its own days, confirmed weeks and rate if it differs.
              When you upload an invoice against a term, we check how many sessions were actually registered in that window before you approve it.
            </p>
            {schools
              .filter(s => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase()))
              .map(school => {
                const editing = setupEdit[school.id]
                const schoolTerms = termsBySchool.get(school.id) ?? []
                return (
                  <Card key={school.id}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#1a3a6b]">{school.name}</p>
                        {school.hire_charge != null && !editing && (
                          <p className="text-xs text-gray-400">
                            {fmt(school.hire_charge)}/session default · {school.bank_account_name || 'no bank details yet'}
                          </p>
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
                        <Input label="Default hire charge (£/session, leave blank if N/A)" type="number" step="0.01" value={editing.hire_charge}
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

                    {school.hire_charge != null && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hire terms</p>
                        <div className="flex flex-col gap-2 mb-2">
                          {schoolTerms.map(term => (
                            <div key={term.id} className="flex items-start justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{term.label}</p>
                                <p className="text-xs text-gray-400">
                                  {fmtDate(term.start_date)} – {fmtDate(term.end_date)}
                                  {term.hire_days && ` · ${term.hire_days}`}
                                  {term.weeks_confirmed != null && ` · ${term.weeks_confirmed} weeks`}
                                  {term.rate != null && ` · ${fmt(term.rate)}/session`}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEditTerm(term)} className="text-xs font-medium text-[#1a3a6b] px-2 py-1">Edit</button>
                                <button onClick={() => deleteTerm(term)} className="text-xs font-medium text-red-400 px-2 py-1">Delete</button>
                              </div>
                            </div>
                          ))}
                          {schoolTerms.length === 0 && <p className="text-xs text-gray-400">No terms added yet.</p>}
                        </div>

                        {termFormFor === school.id ? (
                          <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3">
                            <Input label="Label" placeholder="e.g. Semester 1 2026/27, Summer Holiday 2026" value={termForm.label}
                              onChange={e => setTermForm(f => ({ ...f, label: e.target.value }))} />
                            <div className="grid grid-cols-2 gap-2">
                              <Input label="Start date" type="date" value={termForm.start_date} onChange={e => setTermForm(f => ({ ...f, start_date: e.target.value }))} />
                              <Input label="End date" type="date" value={termForm.end_date} onChange={e => setTermForm(f => ({ ...f, end_date: e.target.value }))} />
                            </div>
                            <Input label="Day(s) hired" placeholder="e.g. Tuesday" value={termForm.hire_days} onChange={e => setTermForm(f => ({ ...f, hire_days: e.target.value }))} />
                            <Input label="Weeks confirmed" type="number" value={termForm.weeks_confirmed} onChange={e => setTermForm(f => ({ ...f, weeks_confirmed: e.target.value }))} />
                            <Input label="Rate override (£/session, leave blank to use the default above)" type="number" step="0.01" value={termForm.rate}
                              onChange={e => setTermForm(f => ({ ...f, rate: e.target.value }))} />
                            <div className="flex gap-2">
                              <Button variant="secondary" className="flex-1" onClick={() => setTermFormFor(null)}>Cancel</Button>
                              <Button className="flex-1" disabled={termSaving || !termForm.label.trim() || !termForm.start_date || !termForm.end_date} onClick={() => saveTerm(school.id)}>
                                {termSaving ? 'Saving…' : editingTermId ? 'Save changes' : 'Add term'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => startAddTerm(school.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500">
                            <Plus size={14} /> Add a hire term
                          </button>
                        )}
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
