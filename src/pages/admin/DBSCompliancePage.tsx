import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info, Download, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'

interface StaffRecord {
  id: string
  full_name: string
  role: string
  dbs_number: string | null
  dbs_expiry: string | null
  anaphylaxis_completed_at: string | null
}

const DBS_REQUIREMENTS: Record<string, { level: 'enhanced_barred' | 'enhanced'; label: string }> = {
  junior_coach:    { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  assistant_coach: { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  lead_coach:      { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  area_lead:       { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  director:        { level: 'enhanced_barred', label: 'Enhanced + Barred List' },
  outreach_worker: { level: 'enhanced',        label: 'Enhanced DBS' },
  media_tech:      { level: 'enhanced',        label: 'Enhanced DBS' },
}

const ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Area Lead',
  director:        'Operations Manager',
  outreach_worker: 'Outreach Manager',
  media_tech:      'Marketing Coordinator',
}

function dbsStatus(s: StaffRecord): 'ok' | 'expiring' | 'expired' | 'missing' {
  if (!s.dbs_number || !s.dbs_expiry) return 'missing'
  const days = Math.floor((new Date(s.dbs_expiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'expired'
  if (days < 90) return 'expiring'
  return 'ok'
}

function anaStatus(completedAt: string | null): 'ok' | 'expiring' | 'expired' | 'missing' {
  if (!completedAt) return 'missing'
  const expiry = new Date(completedAt)
  expiry.setFullYear(expiry.getFullYear() + 1)
  const days = Math.floor((expiry.getTime() - Date.now()) / 86400000)
  if (days < 0) return 'expired'
  if (days < 60) return 'expiring'
  return 'ok'
}

function fmtDate(iso: string | null, fallback = '—') {
  if (!iso) return fallback
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function anaExpiry(completedAt: string | null) {
  if (!completedAt) return null
  const d = new Date(completedAt)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

async function downloadComplianceReport(staff: StaffRecord[]) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const navy = [26, 58, 107] as const
  const gold = [245, 197, 24] as const
  const pageW = doc.internal.pageSize.getWidth()  // 297
  const pageH = doc.internal.pageSize.getHeight() // 210
  const margin = 14
  const now = new Date()

  // ── Header bar ──
  doc.setFillColor(...navy)
  doc.rect(0, 0, pageW, 22, 'F')
  doc.setTextColor(...gold)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('ACTIVE SCHOOL ORGANISATION', margin, 10)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.text('Staff Anaphylaxis Training — Compliance Report', margin, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 210, 230)
  doc.text(`Generated: ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Active School Organisation Ltd · Company No. 16668889`, pageW - margin, 18, { align: 'right' })

  // ── Sub-header ──
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Benedict's Law (September 2026) — Anaphylaxis training required annually for all staff working with children`, margin, 28)

  // ── Table ──
  const cols = [
    { label: 'Name',              w: 52 },
    { label: 'Role',              w: 36 },
    { label: 'Anaphylaxis Cert',  w: 34 },
    { label: 'Valid Until',       w: 30 },
    { label: 'Ana Status',        w: 28 },
    { label: 'DBS Number',        w: 32 },
    { label: 'DBS Expiry',        w: 28 },
    { label: 'DBS Status',        w: 28 },
  ]

  const tableTop = 33
  const rowH = 8
  const headerH = 9
  let x = margin

  // Column headers
  doc.setFillColor(240, 243, 250)
  doc.rect(margin, tableTop, pageW - margin * 2, headerH, 'F')
  doc.setTextColor(...navy)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  cols.forEach(col => {
    doc.text(col.label, x + 2, tableTop + 6)
    x += col.w
  })

  // Rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  let y = tableTop + headerH
  const maxY = pageH - 18

  staff.forEach((s, idx) => {
    if (y + rowH > maxY) {
      doc.addPage()
      y = 15
    }
    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(250, 251, 255)
      doc.rect(margin, y, pageW - margin * 2, rowH, 'F')
    }

    const dbs = dbsStatus(s)
    const ana = anaStatus(s.anaphylaxis_completed_at)

    const statusColor = (st: string): [number, number, number] => {
      if (st === 'ok') return [22, 163, 74]
      if (st === 'expiring') return [180, 120, 0]
      if (st === 'expired') return [185, 28, 28]
      return [150, 80, 80]
    }

    const statusLabel = (st: string) => {
      if (st === 'ok') return 'Valid'
      if (st === 'expiring') return 'Due Soon'
      if (st === 'expired') return 'Expired'
      return 'Missing'
    }

    const cells = [
      { text: s.full_name,                       color: [30, 30, 30] as [number,number,number] },
      { text: ROLE_LABELS[s.role] ?? s.role,     color: [80, 80, 80] as [number,number,number] },
      { text: fmtDate(s.anaphylaxis_completed_at), color: [60, 60, 60] as [number,number,number] },
      { text: fmtDate(anaExpiry(s.anaphylaxis_completed_at)), color: [60,60,60] as [number,number,number] },
      { text: statusLabel(ana),                  color: statusColor(ana) },
      { text: s.dbs_number ?? '—',               color: [60, 60, 60] as [number,number,number] },
      { text: fmtDate(s.dbs_expiry),             color: [60, 60, 60] as [number,number,number] },
      { text: statusLabel(dbs),                  color: statusColor(dbs) },
    ]

    x = margin
    cells.forEach((cell, ci) => {
      doc.setTextColor(...cell.color)
      doc.setFont('helvetica', ci === 4 || ci === 7 ? 'bold' : 'normal')
      doc.text(cell.text, x + 2, y + 5.5)
      x += cols[ci].w
    })

    // Row divider
    doc.setDrawColor(230, 230, 235)
    doc.line(margin, y + rowH, pageW - margin, y + rowH)

    y += rowH
  })

  // ── Summary line ──
  y += 4
  if (y + 10 > maxY) { doc.addPage(); y = 15 }
  const compliant = staff.filter(s => anaStatus(s.anaphylaxis_completed_at) === 'ok' && dbsStatus(s) === 'ok').length
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...navy)
  doc.text(`Summary: ${compliant} of ${staff.length} staff fully compliant · ${staff.length - compliant} require action`, margin, y)

  // ── Footer ──
  doc.setFillColor(...navy)
  doc.rect(0, pageH - 10, pageW, 10, 'F')
  doc.setTextColor(180, 195, 220)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Active School Organisation Ltd · Company No. 16668889 · safeguarding@activeschool.org.uk · www.activeschool.org.uk', margin, pageH - 3.5)
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageW - margin, pageH - 3.5, { align: 'right' })

  const fileName = `ASO_Anaphylaxis_Compliance_Report_${now.toISOString().slice(0, 10)}.pdf`

  // Mobile: share; desktop: download
  if (navigator.share && navigator.canShare) {
    const blob = doc.output('blob')
    const file = new File([blob], fileName, { type: 'application/pdf' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'ASO Compliance Report' })
      return
    }
  }
  doc.save(fileName)
}

export function DBSCompliancePage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'issues'>('all')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: certs }] = await Promise.all([
        supabase.from('profiles')
          .select('id, full_name, role, dbs_number, dbs_expiry')
          .in('role', Object.keys(DBS_REQUIREMENTS))
          .order('full_name'),
        supabase.from('course_certificates')
          .select('user_id, completed_at')
          .eq('course_id', 'anaphylaxis_v1'),
      ])
      const certMap = new Map((certs ?? []).map((c: any) => [c.user_id, c.completed_at]))
      setStaff((profiles ?? []).map((p: any) => ({
        ...p,
        anaphylaxis_completed_at: certMap.get(p.id) ?? null,
      })))
      setLoading(false)
    }
    load()
  }, [])

  const displayed = filter === 'issues'
    ? staff.filter(s => dbsStatus(s) !== 'ok' || anaStatus(s.anaphylaxis_completed_at) !== 'ok')
    : staff

  const issueCount = staff.filter(s => dbsStatus(s) !== 'ok' || anaStatus(s.anaphylaxis_completed_at) !== 'ok').length

  async function handleDownload() {
    setDownloading(true)
    try { await downloadComplianceReport(staff) } catch (e) { console.error(e) }
    setDownloading(false)
  }

  return (
    <Layout title="DBS Compliance" showBack>
      <div className="flex flex-col gap-4 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white px-4 pt-5 pb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#f5c518] mb-1">Admin · Safeguarding</p>
              <h1 className="text-xl font-extrabold leading-tight">DBS & Compliance Dashboard</h1>
              <p className="text-white/70 text-xs mt-1">September 2026 regulated activity rules apply</p>
            </div>
            <ShieldCheck size={28} className="text-[#f5c518] shrink-0 mt-1" />
          </div>
          <div className="flex gap-2 mt-3">
            {([['all', 'All staff'], ['issues', `Issues only (${issueCount})`]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === val ? 'bg-white text-[#1a3a6b]' : 'bg-white/15 text-white/80 hover:bg-white/25'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Download report */}
        <div className="px-4">
          <button
            onClick={handleDownload}
            disabled={downloading || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-50"
          >
            {downloading
              ? <><Loader2 size={15} className="animate-spin" /> Generating PDF…</>
              : <><Download size={15} /> Download Compliance Report (PDF)</>
            }
          </button>
        </div>

        {/* September 2026 notice */}
        <div className="px-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold text-amber-900 mb-0.5">September 2026 — Supervision exemption removed</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Assistant coaches and junior coaches can no longer rely on supervision to avoid regulated activity classification.
                All coaching roles now require <strong>Enhanced DBS with Children's Barred List</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Role matrix */}
        <div className="px-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Required checks by role</p>
          <Card>
            {Object.entries(DBS_REQUIREMENTS).map(([role, req]) => (
              <div key={role} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{ROLE_LABELS[role] ?? role}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  req.level === 'enhanced_barred' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>{req.label}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Staff list */}
        <div className="px-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {filter === 'issues' ? `${displayed.length} staff with issues` : `${displayed.length} staff members`}
          </p>

          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading…</p>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle size={32} className="text-green-500" />
              <p className="font-bold text-green-800 text-sm">All staff compliant</p>
              <p className="text-xs text-gray-400">No DBS or training issues found</p>
            </div>
          ) : (
            displayed.map(s => {
              const dbs = dbsStatus(s)
              const ana = anaStatus(s.anaphylaxis_completed_at)
              const req = DBS_REQUIREMENTS[s.role]
              return (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-extrabold text-gray-800 text-sm">{s.full_name}</p>
                      <p className="text-xs text-gray-400">{ROLE_LABELS[s.role] ?? s.role}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      req.level === 'enhanced_barred' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req?.label ?? '—'}
                    </span>
                  </div>

                  {/* DBS row */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">DBS check</span>
                    <div className="flex items-center gap-1.5">
                      {dbs === 'ok' && <><CheckCircle size={13} className="text-green-500" /><span className="text-xs font-semibold text-green-700">Valid · exp {fmtDate(s.dbs_expiry)}</span></>}
                      {dbs === 'expiring' && <><AlertTriangle size={13} className="text-amber-500" /><span className="text-xs font-semibold text-amber-700">Expiring · {fmtDate(s.dbs_expiry)}</span></>}
                      {dbs === 'expired' && <><ShieldAlert size={13} className="text-red-500" /><span className="text-xs font-semibold text-red-700">Expired · {fmtDate(s.dbs_expiry)}</span></>}
                      {dbs === 'missing' && <><ShieldAlert size={13} className="text-red-500" /><span className="text-xs font-semibold text-red-700">Missing</span></>}
                    </div>
                  </div>

                  {/* Anaphylaxis row */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">Anaphylaxis (annual)</span>
                    <div className="flex items-center gap-1.5">
                      {ana === 'ok' && <><CheckCircle size={13} className="text-green-500" /><span className="text-xs font-semibold text-green-700">Valid · exp {fmtDate(anaExpiry(s.anaphylaxis_completed_at))}</span></>}
                      {ana === 'expiring' && <><AlertTriangle size={13} className="text-amber-500" /><span className="text-xs font-semibold text-amber-700">Due soon · exp {fmtDate(anaExpiry(s.anaphylaxis_completed_at))}</span></>}
                      {ana === 'expired' && <><ShieldAlert size={13} className="text-red-500" /><span className="text-xs font-semibold text-red-700">Overdue · exp {fmtDate(anaExpiry(s.anaphylaxis_completed_at))}</span></>}
                      {ana === 'missing' && <><ShieldAlert size={13} className="text-red-500" /><span className="text-xs font-semibold text-red-700">Not completed</span></>}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <div className="px-4 flex flex-col gap-1 text-xs text-gray-400">
          <p className="text-center">DBS numbers and expiry dates are entered on each coach's profile. Update them via Staff Admin → Edit.</p>
          <p className="text-center">Anaphylaxis training must be renewed <strong>annually</strong> (ASO policy). Benedict's Law minimum is every 3 years.</p>
        </div>
      </div>
    </Layout>
  )
}
