import { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Settings, Users, History, Check, Send, Download, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School, Child, InvoiceSettings, PpInvoice, PpInvoiceStatus } from '../../types'

function fmt(p: number) {
  return `£${p.toFixed(2)}`
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function defaultPeriod() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

interface PreviewLine { child_id: string; child_name: string; sessions_count: number; rate: number; amount: number }

const STATUS_CHIP: Record<PpInvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

export function PupilPremiumInvoicesPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<'generate' | 'history' | 'children' | 'settings'>('generate')
  const [schools, setSchools] = useState<School[]>([])
  const [settings, setSettings] = useState<InvoiceSettings | null>(null)

  // Generate tab
  const [genSchoolId, setGenSchoolId] = useState('')
  const [period, setPeriod] = useState(defaultPeriod())
  const [rate, setRate] = useState('')
  const [preview, setPreview] = useState<PreviewLine[] | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // History tab
  const [invoices, setInvoices] = useState<PpInvoice[]>([])
  const [viewingInvoice, setViewingInvoice] = useState<PpInvoice | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  // Funded children tab
  const [childSchoolId, setChildSchoolId] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [childEdits, setChildEdits] = useState<Record<string, { is_funded_place: boolean; funded_reason: string; funded_rate: string }>>({})

  // Settings tab
  const [settingsForm, setSettingsForm] = useState<Partial<InvoiceSettings>>({})
  const [savingSettings, setSavingSettings] = useState(false)

  const loadBase = useCallback(async () => {
    const [{ data: schoolData }, { data: settingsData }] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase.from('invoice_settings').select('*').eq('id', 1).single(),
    ])
    setSchools((schoolData ?? []) as School[])
    if (settingsData) { setSettings(settingsData); setSettingsForm(settingsData); setRate(String(settingsData.default_rate)) }
  }, [])

  useEffect(() => { loadBase() }, [loadBase])

  useEffect(() => {
    if (tab !== 'history') return
    supabase.from('pp_invoices').select('*, school:schools(id, name, address)').order('created_at', { ascending: false })
      .then(({ data }) => setInvoices((data ?? []) as PpInvoice[]))
  }, [tab])

  useEffect(() => {
    if (!childSchoolId) { setChildren([]); return }
    supabase.from('children').select('*').eq('school_id', childSchoolId).eq('is_active', true).order('full_name')
      .then(({ data }) => {
        const list = (data ?? []) as Child[]
        setChildren(list)
        setChildEdits(Object.fromEntries(list.map(c => [c.id, {
          is_funded_place: c.is_funded_place ?? false,
          funded_reason: c.funded_reason ?? '',
          funded_rate: c.funded_rate != null ? String(c.funded_rate) : '',
        }])))
      })
  }, [childSchoolId])

  async function previewInvoice() {
    if (!genSchoolId) return
    setPreviewing(true)
    setGenError(null)
    setPreview(null)

    const { data: fundedChildren } = await supabase.from('children')
      .select('id, full_name, funded_rate').eq('school_id', genSchoolId).eq('is_funded_place', true)
    const funded = fundedChildren ?? []
    if (funded.length === 0) {
      setGenError('No funded children set up for this school yet — add them under the Funded Children tab.')
      setPreviewing(false)
      return
    }

    const { data: registers } = await supabase.from('session_registers')
      .select('id, session_date, entries:register_entries(child_id, present)')
      .eq('school_id', genSchoolId)
      .gte('session_date', period.start)
      .lte('session_date', period.end)

    const sessionCounts = new Map<string, number>()
    for (const reg of registers ?? []) {
      for (const entry of (reg as any).entries ?? []) {
        if (entry.present) sessionCounts.set(entry.child_id, (sessionCounts.get(entry.child_id) ?? 0) + 1)
      }
    }

    const defaultRate = parseFloat(rate) || settings?.default_rate || 9.5
    const lines: PreviewLine[] = funded
      .map(c => {
        const count = sessionCounts.get(c.id) ?? 0
        const r = c.funded_rate != null ? Number(c.funded_rate) : defaultRate
        return { child_id: c.id, child_name: c.full_name, sessions_count: count, rate: r, amount: count * r }
      })
      .filter(l => l.sessions_count > 0)

    if (lines.length === 0) {
      setGenError('None of the funded children attended a session in this period.')
      setPreviewing(false)
      return
    }
    setPreview(lines)
    setPreviewing(false)
  }

  async function generateInvoice() {
    if (!genSchoolId || !preview || !profile) return
    setGenerating(true)
    setGenError(null)

    const { count } = await supabase.from('pp_invoices').select('*', { count: 'exact', head: true })
    const invoiceNumber = `ASO-PP-${String((count ?? 0) + 1).padStart(4, '0')}`
    const total = preview.reduce((s, l) => s + l.amount, 0)

    const { data: invoice, error } = await supabase.from('pp_invoices').insert({
      school_id: genSchoolId,
      invoice_number: invoiceNumber,
      period_start: period.start,
      period_end: period.end,
      rate_per_session: parseFloat(rate) || settings?.default_rate || 9.5,
      total_amount: total,
      status: 'draft',
      created_by: profile.id,
    }).select().single()

    if (error || !invoice) { setGenError(error?.message ?? 'Failed to create invoice'); setGenerating(false); return }

    await supabase.from('pp_invoice_lines').insert(preview.map(l => ({
      invoice_id: invoice.id, child_id: l.child_id, child_name: l.child_name,
      sessions_count: l.sessions_count, rate: l.rate, amount: l.amount,
    })))

    setPreview(null)
    setGenSchoolId('')
    setGenerating(false)
    setTab('history')
  }

  async function openInvoice(inv: PpInvoice) {
    const { data: lines } = await supabase.from('pp_invoice_lines').select('*').eq('invoice_id', inv.id)
    setViewingInvoice({ ...inv, lines: lines ?? [] })
  }

  async function setStatus(inv: PpInvoice, status: PpInvoiceStatus) {
    const updates: Record<string, unknown> = { status }
    if (status === 'sent') updates.sent_at = new Date().toISOString()
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    await supabase.from('pp_invoices').update(updates).eq('id', inv.id)
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, ...updates } as PpInvoice : i))
    if (viewingInvoice?.id === inv.id) setViewingInvoice(prev => prev ? { ...prev, ...updates } as PpInvoice : prev)
  }

  async function downloadInvoicePdf() {
    if (!invoiceRef.current || !viewingInvoice) return
    setPdfBusy(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const imgW = pageW - 20
      const imgH = (canvas.height / canvas.width) * imgW
      pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH)
      pdf.save(`${viewingInvoice.invoice_number}.pdf`)
    } finally {
      setPdfBusy(false)
    }
  }

  function updateChildEdit(id: string, patch: Partial<{ is_funded_place: boolean; funded_reason: string; funded_rate: string }>) {
    setChildEdits(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  async function saveChild(childId: string) {
    const edit = childEdits[childId]
    if (!edit) return
    await supabase.from('children').update({
      is_funded_place: edit.is_funded_place,
      funded_reason: edit.funded_reason.trim() || null,
      funded_rate: edit.funded_rate.trim() ? parseFloat(edit.funded_rate) : null,
    }).eq('id', childId)
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, is_funded_place: edit.is_funded_place, funded_reason: edit.funded_reason || null, funded_rate: edit.funded_rate ? parseFloat(edit.funded_rate) : null } : c))
  }

  async function saveSettings() {
    setSavingSettings(true)
    await supabase.from('invoice_settings').update({
      company_name: settingsForm.company_name || 'Active School Organisation Ltd',
      company_number: settingsForm.company_number || null,
      registered_address: settingsForm.registered_address || null,
      bank_account_name: settingsForm.bank_account_name || null,
      bank_sort_code: settingsForm.bank_sort_code || null,
      bank_account_number: settingsForm.bank_account_number || null,
      default_rate: settingsForm.default_rate ?? 9.5,
      footer_note: settingsForm.footer_note || null,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    setSavingSettings(false)
    await loadBase()
  }

  const previewTotal = preview?.reduce((s, l) => s + l.amount, 0) ?? 0

  return (
    <Layout title="Pupil Premium Invoices" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-10">

        <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
          {([
            { k: 'generate', label: 'Generate', icon: FileText },
            { k: 'history', label: 'History', icon: History },
            { k: 'children', label: 'Funded Children', icon: Users },
            { k: 'settings', label: 'Settings', icon: Settings },
          ] as const).map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                tab === k ? 'bg-[#1a3a6b] text-white' : 'text-gray-500'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === 'generate' && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-3">Generate an invoice</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">School</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base bg-white" value={genSchoolId} onChange={e => { setGenSchoolId(e.target.value); setPreview(null); setGenError(null) }}>
                  <option value="">Select a school…</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Period start" type="date" value={period.start} onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))} />
                <Input label="Period end" type="date" value={period.end} onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))} />
              </div>
              <Input label="Default rate per session (£)" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} />
              {genError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{genError}</p>}
              <Button onClick={previewInvoice} disabled={!genSchoolId || previewing}>
                {previewing ? 'Checking registers…' : 'Preview'}
              </Button>

              {preview && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</p>
                  {preview.map(l => (
                    <div key={l.child_id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{l.child_name}</span>
                      <span className="text-gray-500">{l.sessions_count} × {fmt(l.rate)} = <span className="font-semibold text-gray-800">{fmt(l.amount)}</span></span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 mt-1">
                    <span className="font-bold text-[#1a3a6b]">Total</span>
                    <span className="font-extrabold text-[#1a3a6b] text-lg">{fmt(previewTotal)}</span>
                  </div>
                  <Button onClick={generateInvoice} disabled={generating}>
                    {generating ? 'Generating…' : 'Generate invoice'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {tab === 'history' && (
          <div className="flex flex-col gap-3">
            {invoices.length === 0 ? (
              <Card className="text-center py-8">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No invoices generated yet.</p>
              </Card>
            ) : invoices.map(inv => (
              <Card key={inv.id}>
                <button className="w-full text-left" onClick={() => openInvoice(inv)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1a3a6b]">{inv.school?.name}</p>
                      <p className="text-xs text-gray-400">{inv.invoice_number} · {fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CHIP[inv.status]}`}>{inv.status}</span>
                  </div>
                  <p className="text-lg font-extrabold text-[#1a3a6b] mt-1">{fmt(inv.total_amount)}</p>
                </button>
              </Card>
            ))}
          </div>
        )}

        {tab === 'children' && (
          <>
            <Card>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">School</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base bg-white" value={childSchoolId} onChange={e => setChildSchoolId(e.target.value)}>
                  <option value="">Select a school…</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </Card>
            {children.map(child => {
              const edit = childEdits[child.id]
              if (!edit) return null
              return (
                <Card key={child.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800">{child.full_name}</p>
                    <button type="button" onClick={() => updateChildEdit(child.id, { is_funded_place: !edit.is_funded_place })}
                      className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${edit.is_funded_place ? 'bg-[#1a3a6b]' : 'bg-gray-300'}`}>
                      <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: edit.is_funded_place ? 'translateX(20px)' : 'translateX(2px)' }} />
                    </button>
                  </div>
                  {edit.is_funded_place && (
                    <div className="flex flex-col gap-2 mt-3">
                      <Input label="Reason" placeholder="e.g. Pupil Premium" value={edit.funded_reason} onChange={e => updateChildEdit(child.id, { funded_reason: e.target.value })} />
                      <Input label="Rate override (£, leave blank for default)" type="number" step="0.01" value={edit.funded_rate} onChange={e => updateChildEdit(child.id, { funded_rate: e.target.value })} />
                    </div>
                  )}
                  <Button className="mt-3 w-full" variant="secondary" onClick={() => saveChild(child.id)}>Save</Button>
                </Card>
              )
            })}
          </>
        )}

        {tab === 'settings' && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-3">Invoice details</h3>
            <p className="text-sm text-gray-500 mb-3">Shown on every invoice PDF sent to schools.</p>
            <div className="flex flex-col gap-3">
              <Input label="Company name" value={settingsForm.company_name ?? ''} onChange={e => setSettingsForm(f => ({ ...f, company_name: e.target.value }))} />
              <Input label="Company number" value={settingsForm.company_number ?? ''} onChange={e => setSettingsForm(f => ({ ...f, company_number: e.target.value }))} />
              <Input label="Registered address" value={settingsForm.registered_address ?? ''} onChange={e => setSettingsForm(f => ({ ...f, registered_address: e.target.value }))} />
              <Input label="Bank account name" value={settingsForm.bank_account_name ?? ''} onChange={e => setSettingsForm(f => ({ ...f, bank_account_name: e.target.value }))} />
              <Input label="Sort code" value={settingsForm.bank_sort_code ?? ''} onChange={e => setSettingsForm(f => ({ ...f, bank_sort_code: e.target.value }))} />
              <Input label="Account number" value={settingsForm.bank_account_number ?? ''} onChange={e => setSettingsForm(f => ({ ...f, bank_account_number: e.target.value }))} />
              <Input label="Default rate per session (£)" type="number" step="0.01" value={settingsForm.default_rate ?? ''} onChange={e => setSettingsForm(f => ({ ...f, default_rate: parseFloat(e.target.value) || 0 }))} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Footer note</label>
                <textarea rows={2} value={settingsForm.footer_note ?? ''} onChange={e => setSettingsForm(f => ({ ...f, footer_note: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base resize-none" />
              </div>
              <Button onClick={saveSettings} disabled={savingSettings}>{savingSettings ? 'Saving…' : 'Save'}</Button>
            </div>
          </Card>
        )}

        {/* Invoice viewer / PDF */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setViewingInvoice(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <p className="font-bold text-[#1a3a6b]">{viewingInvoice.invoice_number}</p>
                <button onClick={() => setViewingInvoice(null)} className="p-1 text-gray-300 hover:text-gray-500"><X size={18} /></button>
              </div>

              <div className="p-5">
                <div ref={invoiceRef} className="bg-white p-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="font-extrabold text-xl text-[#1a3a6b]">{settings?.company_name}</p>
                      {settings?.registered_address && <p className="text-xs text-gray-500 whitespace-pre-wrap mt-1">{settings.registered_address}</p>}
                      {settings?.company_number && <p className="text-xs text-gray-400 mt-1">Company no. {settings.company_number}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">INVOICE</p>
                      <p className="text-xs text-gray-500">{viewingInvoice.invoice_number}</p>
                      <p className="text-xs text-gray-500">{fmtDate(viewingInvoice.created_at.slice(0, 10))}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill to</p>
                    <p className="font-semibold text-gray-800">{viewingInvoice.school?.name}</p>
                    {viewingInvoice.school?.address && <p className="text-xs text-gray-500">{viewingInvoice.school.address}</p>}
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Pupil Premium / school-funded places — {fmtDate(viewingInvoice.period_start)} to {fmtDate(viewingInvoice.period_end)}
                  </p>

                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-400 uppercase">
                        <th className="py-1.5">Child</th>
                        <th className="py-1.5 text-right">Sessions</th>
                        <th className="py-1.5 text-right">Rate</th>
                        <th className="py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.lines?.map(l => (
                        <tr key={l.id} className="border-b border-gray-50">
                          <td className="py-1.5">{l.child_name}</td>
                          <td className="py-1.5 text-right">{l.sessions_count}</td>
                          <td className="py-1.5 text-right">{fmt(l.rate)}</td>
                          <td className="py-1.5 text-right font-medium">{fmt(l.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total due</p>
                      <p className="font-extrabold text-xl text-[#1a3a6b]">{fmt(viewingInvoice.total_amount)}</p>
                    </div>
                  </div>

                  {(settings?.bank_account_name || settings?.bank_sort_code) && (
                    <div className="text-xs text-gray-500 border-t border-gray-100 pt-3 mb-2">
                      <p className="font-semibold text-gray-700 mb-0.5">Payment details</p>
                      {settings?.bank_account_name && <p>Account name: {settings.bank_account_name}</p>}
                      {settings?.bank_sort_code && <p>Sort code: {settings.bank_sort_code}</p>}
                      {settings?.bank_account_number && <p>Account number: {settings.bank_account_number}</p>}
                    </div>
                  )}
                  {settings?.footer_note && <p className="text-xs text-gray-400 mt-2">{settings.footer_note}</p>}
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-2">
                <Button onClick={downloadInvoicePdf} disabled={pdfBusy}>
                  <Download size={14} /> {pdfBusy ? 'Preparing…' : 'Download PDF'}
                </Button>
                <div className="flex gap-2">
                  {viewingInvoice.status === 'draft' && (
                    <Button variant="secondary" className="flex-1" onClick={() => setStatus(viewingInvoice, 'sent')}>
                      <Send size={14} /> Mark sent
                    </Button>
                  )}
                  {viewingInvoice.status !== 'paid' && (
                    <Button variant="secondary" className="flex-1" onClick={() => setStatus(viewingInvoice, 'paid')}>
                      <Check size={14} /> Mark paid
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
