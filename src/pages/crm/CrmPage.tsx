import { useState, useEffect, useCallback } from 'react'
import { Search, Building2, ChevronRight, Upload, AlertCircle, Calendar, Mail, PhoneCall, Ban, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { CrmContact, CrmStatus } from '../../types'

// ─── Status config ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<CrmStatus, string> = {
  prospect: 'Prospect',
  initial_sent: 'Email Sent',
  following_up: 'Following Up',
  interested: 'Interested',
  onboarded: 'Onboarded',
  do_not_contact: 'Do Not Contact',
}

// Excel colour coding: Amber = interested, Green = onboarded, Red = DNC
export const STATUS_BORDER: Record<CrmStatus, string> = {
  prospect: 'border-l-gray-200',
  initial_sent: 'border-l-blue-300',
  following_up: 'border-l-purple-400',
  interested: 'border-l-amber-400',
  onboarded: 'border-l-green-500',
  do_not_contact: 'border-l-red-500',
}

export const STATUS_DOT: Record<CrmStatus, string> = {
  prospect: 'bg-gray-300',
  initial_sent: 'bg-blue-400',
  following_up: 'bg-purple-500',
  interested: 'bg-amber-400',
  onboarded: 'bg-green-500',
  do_not_contact: 'bg-red-500',
}

export const STATUS_CHIP: Record<CrmStatus, string> = {
  prospect: 'bg-gray-100 text-gray-600',
  initial_sent: 'bg-blue-100 text-blue-700',
  following_up: 'bg-purple-100 text-purple-700',
  interested: 'bg-amber-100 text-amber-700',
  onboarded: 'bg-green-100 text-green-700',
  do_not_contact: 'bg-red-100 text-red-700',
}

const STATUSES = Object.keys(STATUS_LABELS) as CrmStatus[]

// RFC 4180-compliant CSV parser — handles quoted fields containing commas
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let i = 0
  while (i <= line.length) {
    if (line[i] === '"') {
      i++
      let val = ''
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else { val += line[i++] }
      }
      result.push(val.trim())
      if (line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) { result.push(line.slice(i).trim()); break }
      result.push(line.slice(i, end).trim())
      i = end + 1
    }
  }
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase())
  return lines.slice(1)
    .map(line => {
      const values = parseCsvLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] ?? '' })
      return row
    })
    .filter(row => Object.values(row).some(v => v !== ''))
}

// Flexible column matcher — handles varied header names from Excel exports
function col(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.entries(row).find(([h]) => h.includes(k))
    if (found && found[1]) return found[1]
  }
  return ''
}

// ─── Contact row ────────────────────────────────────────────────────────────

interface ContactRowProps {
  contact: CrmContact
  onQuickLog: (contact: CrmContact, type: 'email' | 'call') => void
  onDnc: (contact: CrmContact) => void
  onClick: () => void
}

function ContactRow({ contact, onQuickLog, onDnc, onClick }: ContactRowProps) {
  const isOverdue = contact.next_follow_up_date && contact.next_follow_up_date < new Date().toISOString().slice(0, 10)
  const isDnc = contact.status === 'do_not_contact'

  return (
    <div className={`bg-white rounded-2xl border-l-4 border border-gray-100 shadow-sm overflow-hidden ${STATUS_BORDER[contact.status]}`}>
      <button className="w-full text-left px-4 pt-3 pb-2" onClick={onClick}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm truncate ${isDnc ? 'text-gray-400 line-through' : 'text-[#1a3a6b]'}`}>
              {contact.school_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[contact.status]}`}>
                {STATUS_LABELS[contact.status]}
              </span>
              {contact.area && <span className="text-xs text-gray-400">{contact.area}</span>}
              {contact.contact_name && <span className="text-xs text-gray-400">{contact.contact_name}</span>}
            </div>
            {contact.follow_up_number > 0 && !isDnc && (
              <p className="text-xs text-gray-400 mt-0.5">Follow-up #{contact.follow_up_number}</p>
            )}
            {(!contact.email || !contact.phone) && !isDnc && (
              <p className="text-xs text-gray-300 mt-0.5">
                {[!contact.email && 'no email', !contact.phone && 'no phone'].filter(Boolean).join(' · ')}
              </p>
            )}
            {isOverdue && !isDnc && (
              <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                <AlertCircle size={11} /> Follow-up overdue
              </p>
            )}
          </div>
          <ChevronRight size={14} className="text-gray-300 shrink-0 mt-1" />
        </div>
      </button>
      {!isDnc && (
        <div className="flex border-t border-gray-100">
          <button onClick={e => { e.stopPropagation(); onQuickLog(contact, 'email') }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Mail size={13} /> Email sent
          </button>
          <div className="w-px bg-gray-100" />
          <button onClick={e => { e.stopPropagation(); onQuickLog(contact, 'call') }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <PhoneCall size={13} /> Called
          </button>
          <div className="w-px bg-gray-100" />
          <button onClick={e => { e.stopPropagation(); onDnc(contact) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Ban size={13} /> DNC
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────

const SELECT = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
const SCHOOL_TYPES = ['Primary', 'Secondary', 'Special', 'Independent', 'Academy', 'Other']

export function CrmPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [contacts, setContacts] = useState<CrmContact[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'add' | 'import'>('list')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<CrmStatus | ''>('')
  const [filterArea, setFilterArea] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 40

  const [form, setForm] = useState({ school_name: '', contact_name: '', email: '', phone: '', address: '', area: '', school_type: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; skipped: number; errors: string[] } | null>(null)
  const [importPreview, setImportPreview] = useState<Array<{ name: string; area: string; email: string; phone: string; status: string }> | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const loadContacts = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 0 : page
    let query = supabase
      .from('crm_contacts')
      .select('*', { count: 'exact' })
      .order('next_follow_up_date', { ascending: true, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (search) query = query.ilike('school_name', `%${search}%`)
    if (filterStatus) query = query.eq('status', filterStatus)
    if (filterArea) query = query.ilike('area', `%${filterArea}%`)

    const { data, count } = await query
    if (data) {
      setContacts(reset ? data : prev => [...prev, ...data])
      setHasMore((count ?? 0) > (currentPage + 1) * PAGE_SIZE)
      if (reset) setPage(0)
    }
    setLoading(false)
  }, [search, filterStatus, filterArea, page])

  async function loadCounts() {
    const { data } = await supabase.from('crm_contacts').select('status')
    if (data) {
      const c: Record<string, number> = {}
      data.forEach(r => { c[r.status] = (c[r.status] ?? 0) + 1 })
      setCounts(c)
    }
    const { count } = await supabase.from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .not('next_follow_up_date', 'is', null)
      .lte('next_follow_up_date', today)
      .neq('status', 'do_not_contact')
      .neq('status', 'onboarded')
    setOverdueCount(count ?? 0)
  }

  useEffect(() => { loadCounts() }, [])
  useEffect(() => { loadContacts(true) }, [search, filterStatus, filterArea])

  async function addContact() {
    if (!form.school_name.trim() || !profile) return
    setSaving(true)
    const { data } = await supabase.from('crm_contacts').insert({
      school_name: form.school_name.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      area: form.area.trim() || null,
      school_type: form.school_type || null,
      notes: form.notes.trim() || null,
      status: 'prospect',
      follow_up_number: 0,
      created_by: profile.id,
    }).select().single()
    setSaving(false)
    if (data) navigate(`/crm/${data.id}`)
  }

  async function quickLog(contact: CrmContact, type: 'email' | 'call') {
    if (!profile) return
    const nextFollowUp = new Date()
    nextFollowUp.setDate(nextFollowUp.getDate() + 7)
    const newFollowUpNum = contact.follow_up_number + 1
    const newStatus: CrmStatus = contact.status === 'prospect' ? 'initial_sent' : 'following_up'

    await Promise.all([
      supabase.from('crm_interactions').insert({
        contact_id: contact.id,
        staff_id: profile.id,
        type,
        date: today,
        notes: type === 'email'
          ? `Follow-up email #${newFollowUpNum} sent`
          : `Phone call — follow-up #${newFollowUpNum}`,
        outcome: null,
      }),
      supabase.from('crm_contacts').update({
        status: newStatus,
        follow_up_number: newFollowUpNum,
        last_contacted_date: today,
        next_follow_up_date: nextFollowUp.toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      }).eq('id', contact.id),
    ])
    loadContacts(true)
    loadCounts()
  }

  async function markDnc(contact: CrmContact) {
    if (!confirm(`Mark "${contact.school_name}" as Do Not Contact?`)) return
    await supabase.from('crm_contacts').update({
      status: 'do_not_contact',
      next_follow_up_date: null,
      updated_at: new Date().toISOString(),
    }).eq('id', contact.id)
    loadContacts(true)
    loadCounts()
  }

  async function previewCSV(file: File) {
    const text = await file.text()
    const rows = parseCSV(text)
    const preview = rows.slice(0, 5).map(row => {
      const rawStatus = col(row, 'status', 'colour', 'color').toLowerCase()
      let status = 'Prospect'
      if (rawStatus.includes('red') || rawStatus.includes('dnc') || rawStatus.includes('do not')) status = 'Do Not Contact'
      else if (rawStatus.includes('amber') || rawStatus.includes('interest')) status = 'Interested'
      else if (rawStatus.includes('green') || rawStatus.includes('onboard')) status = 'Onboarded'
      else if (rawStatus.includes('follow')) status = 'Following Up'
      else if (rawStatus.includes('sent') || rawStatus.includes('contact')) status = 'Email Sent'
      return {
        name: col(row, 'school name', 'school', 'name') || '(no name)',
        area: col(row, 'area', 'region', 'county', 'district'),
        email: col(row, 'email', 'e-mail'),
        phone: col(row, 'phone', 'tel', 'number'),
        status,
      }
    })
    setImportPreview(preview.length > 0 ? preview : null)
  }

  async function importCSV() {
    if (!importFile || !profile) return
    setImporting(true)
    setImportResult(null)
    const text = await importFile.text()
    const rows = parseCSV(text)
    let success = 0, skipped = 0
    const errors: string[] = []

    for (const row of rows) {
      const name = col(row, 'school name', 'school', 'name')
      if (!name) { skipped++; continue }
      // Map Excel colour/status if present
      const rawStatus = col(row, 'status', 'colour', 'color').toLowerCase()
      let status: CrmStatus = 'prospect'
      if (rawStatus.includes('red') || rawStatus.includes('dnc') || rawStatus.includes('do not')) status = 'do_not_contact'
      else if (rawStatus.includes('amber') || rawStatus.includes('interest')) status = 'interested'
      else if (rawStatus.includes('green') || rawStatus.includes('onboard')) status = 'onboarded'
      else if (rawStatus.includes('follow')) status = 'following_up'
      else if (rawStatus.includes('sent') || rawStatus.includes('contact')) status = 'initial_sent'

      const { error } = await supabase.from('crm_contacts').insert({
        school_name: name,
        contact_name: col(row, 'contact', 'person', 'head', 'name') || null,
        email: col(row, 'email', 'e-mail') || null,
        phone: col(row, 'phone', 'tel', 'number') || null,
        address: col(row, 'address', 'town', 'location', 'city') || null,
        area: col(row, 'area', 'region', 'county', 'district') || null,
        school_type: col(row, 'type', 'school type') || null,
        notes: col(row, 'notes', 'comments', 'note') || null,
        status,
        follow_up_number: parseInt(col(row, 'follow up', 'followup', 'fu')) || 0,
        created_by: profile.id,
      })
      if (error) errors.push(`${name}: ${error.message}`)
      else success++
    }
    setImportResult({ success, skipped, errors })
    setImporting(false)
    if (success > 0) { loadContacts(true); loadCounts() }
  }

  function downloadTemplate() {
    const csv = `School Name,Contact Name,Email,Phone,Address,Area,School Type,Status,Notes\nWestfield Primary,Mrs Johnson,head@westfield.sch.uk,01234 567890,"Basingstoke, Hampshire",Hampshire,Primary,prospect,Called before summer`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'crm_import_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalContacts = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <Layout title="School Outreach" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8">

        {/* Pipeline overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pipeline</p>
            <p className="text-xs text-gray-400">{totalContacts} total schools</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-colors ${
                  filterStatus === s ? 'border-[#1a3a6b] bg-[#1a3a6b]/5' : 'border-gray-100 hover:border-gray-200'
                }`}>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[s]}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1a3a6b] leading-none">{counts[s] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{STATUS_LABELS[s]}</p>
                </div>
              </button>
            ))}
          </div>
          {overdueCount > 0 && (
            <button
              onClick={() => { setFilterStatus(''); setSearch('') }}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl py-2 text-xs font-semibold text-amber-700"
            >
              <Calendar size={13} /> {overdueCount} follow-up{overdueCount !== 1 ? 's' : ''} overdue
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
          {(['list', 'add', 'import'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors capitalize ${
                tab === t ? 'bg-[#1a3a6b] text-white' : 'text-gray-500'
              }`}>
              {t === 'add' ? '+ Add' : t === 'import' ? '↑ Import' : 'Schools'}
            </button>
          ))}
        </div>

        {/* Add school form */}
        {tab === 'add' && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New School Contact</h3>
            <div className="flex flex-col gap-3">
              <Input label="School Name *" value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} />
              <Input label="Contact Name" placeholder="e.g. Mrs Johnson (Head Teacher)" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label="Town / Address" placeholder="e.g. Basingstoke, Hampshire" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <Input label="Area / Region" placeholder="e.g. Hampshire, South East" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">School Type</label>
                <select className={SELECT} value={form.school_type} onChange={e => setForm({ ...form, school_type: e.target.value })}>
                  <option value="">Select…</option>
                  {SCHOOL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none" />
              </div>
              <Button onClick={addContact} disabled={saving || !form.school_name.trim()}>
                {saving ? 'Adding…' : 'Add School'}
              </Button>
            </div>
          </Card>
        )}

        {/* Import tab */}
        {tab === 'import' && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-2">Import from Excel / CSV</h3>
            <p className="text-sm text-gray-500 mb-4">
              Export your Excel spreadsheet as a CSV file and upload it here. The importer recognises flexible column names and maps your colour coding (Red=DNC, Amber=Interested, Green=Onboarded) automatically.
            </p>
            <Button variant="secondary" fullWidth onClick={downloadTemplate}>
              <Download size={16} /> Download CSV template
            </Button>
            <div className="mt-3">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1a3a6b] transition-colors bg-gray-50 mt-2">
                <Upload size={22} className="text-gray-400 mb-1.5" />
                <span className="text-sm text-gray-500">{importFile ? importFile.name : 'Tap to select CSV'}</span>
                <input type="file" accept=".csv" className="hidden" onChange={e => {
                  const f = e.target.files?.[0] ?? null
                  setImportFile(f)
                  setImportResult(null)
                  setImportPreview(null)
                  if (f) previewCSV(f)
                }} />
              </label>
            </div>
            {importPreview && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview (first {importPreview.length} rows)</p>
                {importPreview.map((row, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-[#1a3a6b] truncate">{row.name}</p>
                    <div className="flex gap-3 flex-wrap">
                      {row.area && <span className="text-xs text-gray-500">{row.area}</span>}
                      {row.email ? <span className="text-xs text-green-600">{row.email}</span> : <span className="text-xs text-gray-300">no email</span>}
                      {row.phone ? <span className="text-xs text-green-600">{row.phone}</span> : <span className="text-xs text-gray-300">no phone</span>}
                      <span className="text-xs text-blue-500 font-medium">{row.status}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center">Missing fields can be filled in after import</p>
              </div>
            )}
            {importFile && (
              <Button className="mt-3 w-full" onClick={importCSV} disabled={importing}>
                <Upload size={16} /> {importing ? `Importing…` : `Import ${importFile.name}`}
              </Button>
            )}
            {importResult && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <p className="text-sm font-semibold text-green-700">{importResult.success} schools imported successfully</p>
                  {importResult.skipped > 0 && <p className="text-xs text-green-600">{importResult.skipped} rows skipped (no school name)</p>}
                </div>
                {importResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1">{e}</p>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* School list */}
        {tab === 'list' && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input type="text" placeholder="Search schools…" value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400" />
              </div>
              <input type="text" placeholder="Filter by area / region…" value={filterArea} onChange={e => setFilterArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none" />
            </div>

            {loading && contacts.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Loading…</p>
            ) : contacts.length === 0 ? (
              <Card className="text-center py-8">
                <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No schools found.</p>
              </Card>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {contacts.map(c => (
                    <ContactRow key={c.id} contact={c}
                      onClick={() => navigate(`/crm/${c.id}`)}
                      onQuickLog={quickLog}
                      onDnc={markDnc}
                    />
                  ))}
                </div>
                {hasMore && (
                  <Button variant="secondary" fullWidth onClick={() => { setPage(p => p + 1); loadContacts() }}>
                    Load more
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
