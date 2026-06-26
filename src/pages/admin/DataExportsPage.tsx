import { useState, useEffect } from 'react'
import { Download, Users, Baby, UserCheck, Clock, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

// ─── CSV helper ────────────────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) { alert('No data to export.'); return }
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      const str = String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(','))
  ].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StaffProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string | null
  area: string | null
  dbs_number: string | null
  dbs_expiry: string | null
  safeguarding_expiry: string | null
  first_aid_expiry: string | null
}

interface ParentProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  created_at: string | null
}

interface ChildRecord {
  id: string
  full_name: string | null
  date_of_birth: string | null
  year_group: string | null
  class_name: string | null
  additional_needs: string | null
  photo_consent: boolean | null
  walk_home_alone: boolean | null
  collection_person: string | null
  parent_name: string | null
  parent_phone: string | null
  address_line1: string | null
  city: string | null
  postcode: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_2_name: string | null
  emergency_contact_2_phone: string | null
  parent_id: string | null
  profiles?: { full_name: string | null; email: string | null } | null
}

interface ClockRecord {
  id: string
  clock_in: string
  clock_out: string | null
  location_override: string | null
  profiles: { full_name: string | null; email: string | null; role: string | null } | null
  schools: { name: string | null } | null
  staff_employment: { pay_rate: number | null; pay_frequency: string | null }[] | null
}

// ─── Timesheet helpers ──────────────────────────────────────────────────────────

function hoursFromRecord(r: ClockRecord): number {
  if (!r.clock_out) return 0
  return (new Date(r.clock_out).getTime() - new Date(r.clock_in).getTime()) / 3_600_000
}

function fmtHours(h: number): string {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`
}

function defaultPeriod() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

// ─── Section component ─────────────────────────────────────────────────────────

interface ExportSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  recordCount: number | null
  countLoading: boolean
  onDownload: () => Promise<void>
  downloadLoading: boolean
}

function ExportSection({
  icon,
  title,
  description,
  recordCount,
  countLoading,
  onDownload,
  downloadLoading,
}: ExportSectionProps) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#1a3a6b]">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[#1a3a6b]">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            {countLoading
              ? 'Counting records…'
              : recordCount !== null
                ? `${recordCount} record${recordCount !== 1 ? 's' : ''} available`
                : 'Count unavailable'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownload}
          disabled={downloadLoading}
          className="shrink-0"
        >
          <Download size={15} />
          {downloadLoading ? 'Preparing…' : 'Download CSV'}
        </Button>
      </div>
    </Card>
  )
}

// ─── Payroll export card ────────────────────────────────────────────────────────

interface PayrollCardProps {
  icon: React.ReactNode
  title: string
  description: string
  start: string
  end: string
  onDownload: () => Promise<void>
  loading: boolean
}

function PayrollCard({ icon, title, description, start, end, onDownload, loading }: PayrollCardProps) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#1a3a6b]">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[#1a3a6b]">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            Period: {start ? new Date(start + 'T00:00:00').toLocaleDateString('en-GB') : '—'}
            {' – '}
            {end ? new Date(end + 'T00:00:00').toLocaleDateString('en-GB') : '—'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownload}
          disabled={loading || !start || !end}
          className="shrink-0"
        >
          <Download size={15} />
          {loading ? 'Preparing…' : 'Download CSV'}
        </Button>
      </div>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function DataExportsPage() {
  // Counts
  const [staffCount, setStaffCount] = useState<number | null>(null)
  const [parentCount, setParentCount] = useState<number | null>(null)
  const [childrenCount, setChildrenCount] = useState<number | null>(null)

  // Download loading states
  const [staffLoading, setStaffLoading] = useState(false)
  const [parentsLoading, setParentsLoading] = useState(false)
  const [childrenLoading, setChildrenLoading] = useState(false)
  const [payrollSummaryLoading, setPayrollSummaryLoading] = useState(false)
  const [payrollDetailLoading, setPayrollDetailLoading] = useState(false)

  // Payroll period
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start)
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end)

  // Error
  const [error, setError] = useState<string | null>(null)

  // Load counts on mount
  useEffect(() => {
    async function loadCounts() {
      const [staffRes, parentRes, childrenRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .not('role', 'in', '("parent")'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'parent'),
        supabase
          .from('parent_children')
          .select('id', { count: 'exact', head: true }),
      ])
      if (!staffRes.error) setStaffCount(staffRes.count ?? 0)
      if (!parentRes.error) setParentCount(parentRes.count ?? 0)
      if (!childrenRes.error) setChildrenCount(childrenRes.count ?? 0)
    }
    loadCounts()
  }, [])

  // ── Staff download ───────────────────────────────────────────────────────────

  async function handleDownloadStaff() {
    setStaffLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, area, dbs_number, dbs_expiry, safeguarding_expiry, first_aid_expiry')
      .not('role', 'in', '("parent")')
      .order('full_name')
    setStaffLoading(false)
    if (err) { setError(err.message); return }
    const rows = (data as StaffProfile[]).map(p => ({
      'Full Name': p.full_name ?? '',
      'Email': p.email ?? '',
      'Phone': p.phone ?? '',
      'Role': p.role ?? '',
      'Area': p.area ?? '',
      'DBS Number': p.dbs_number ?? '',
      'DBS Date of Issue': p.dbs_expiry ?? '',
      'Safeguarding Date': p.safeguarding_expiry ?? '',
      'First Aid Date': p.first_aid_expiry ?? '',
    }))
    downloadCSV(`aso-staff-contacts-${todayString()}.csv`, rows)
  }

  // ── Parent download ──────────────────────────────────────────────────────────

  async function handleDownloadParents() {
    setParentsLoading(true)
    setError(null)

    const [profilesRes, childCountRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at')
        .eq('role', 'parent')
        .order('full_name'),
      supabase
        .from('parent_children')
        .select('parent_id'),
    ])

    setParentsLoading(false)

    if (profilesRes.error) { setError(profilesRes.error.message); return }
    if (childCountRes.error) { setError(childCountRes.error.message); return }

    // Build child count map
    const countMap: Record<string, number> = {}
    for (const row of (childCountRes.data ?? []) as Array<{ parent_id: string }>) {
      if (row.parent_id) {
        countMap[row.parent_id] = (countMap[row.parent_id] ?? 0) + 1
      }
    }

    const rows = (profilesRes.data as ParentProfile[]).map(p => ({
      'Full Name': p.full_name ?? '',
      'Email': p.email ?? '',
      'Phone': p.phone ?? '',
      'Registered': p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '',
      'Number of Children': countMap[p.id] ?? 0,
    }))
    downloadCSV(`aso-parent-contacts-${todayString()}.csv`, rows)
  }

  // ── Children download ────────────────────────────────────────────────────────

  async function handleDownloadChildren() {
    setChildrenLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('parent_children')
      .select(`
        id,
        full_name,
        date_of_birth,
        year_group,
        class_name,
        additional_needs,
        photo_consent,
        walk_home_alone,
        collection_person,
        parent_name,
        parent_phone,
        address_line1,
        city,
        postcode,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_2_name,
        emergency_contact_2_phone,
        parent_id,
        profiles!parent_id ( full_name, email )
      `)
      .order('full_name')

    setChildrenLoading(false)

    if (err) { setError(err.message); return }

    const rows = (data as unknown as ChildRecord[]).map(c => {
      const parentProfile = c.profiles
      return {
        'Child Full Name': c.full_name ?? '',
        'Date of Birth': c.date_of_birth ?? '',
        'Year Group': c.year_group ?? '',
        'Class': c.class_name ?? '',
        'Additional Needs': c.additional_needs ?? '',
        'Photo Consent': c.photo_consent === true ? 'Yes' : c.photo_consent === false ? 'No' : '',
        'Walk Home Alone': c.walk_home_alone === true ? 'Yes' : c.walk_home_alone === false ? 'No' : '',
        'Collection Person': c.collection_person ?? '',
        'Parent Name': c.parent_name ?? '',
        'Parent Phone': c.parent_phone ?? '',
        'Address Line 1': c.address_line1 ?? '',
        'City': c.city ?? '',
        'Postcode': c.postcode ?? '',
        'Emergency Contact Name': c.emergency_contact_name ?? '',
        'Emergency Contact Phone': c.emergency_contact_phone ?? '',
        'Emergency Contact 2 Name': c.emergency_contact_2_name ?? '',
        'Emergency Contact 2 Phone': c.emergency_contact_2_phone ?? '',
        'Parent Account Name': parentProfile?.full_name ?? '',
        'Parent Account Email': parentProfile?.email ?? '',
      }
    })
    downloadCSV(`aso-children-${todayString()}.csv`, rows)
  }

  // ── Shared clock records fetch ────────────────────────────────────────────────

  async function fetchClockRecords(): Promise<ClockRecord[] | null> {
    const from = periodStart + 'T00:00:00'
    const to   = periodEnd   + 'T23:59:59'
    const { data, error: err } = await supabase
      .from('clock_records')
      .select(`
        id, clock_in, clock_out, location_override,
        profiles!staff_id ( full_name, email, role ),
        schools ( name ),
        staff_employment ( pay_rate, pay_frequency )
      `)
      .not('clock_out', 'is', null)
      .gte('clock_in', from)
      .lte('clock_in', to)
      .order('clock_in')
    if (err) { setError(err.message); return null }
    return data as unknown as ClockRecord[]
  }

  // ── Payroll summary download ──────────────────────────────────────────────────

  async function handleDownloadPayrollSummary() {
    setPayrollSummaryLoading(true)
    setError(null)
    const records = await fetchClockRecords()
    setPayrollSummaryLoading(false)
    if (!records) return

    // Aggregate by staff member
    const map = new Map<string, {
      name: string; email: string; role: string
      payRate: number | null; payFreq: string | null
      totalHours: number; sessions: number
    }>()

    for (const r of records) {
      const name  = r.profiles?.full_name ?? 'Unknown'
      const email = r.profiles?.email ?? ''
      const role  = r.profiles?.role ?? ''
      const payRate = r.staff_employment?.[0]?.pay_rate ?? null
      const payFreq = r.staff_employment?.[0]?.pay_frequency ?? null
      const hours = hoursFromRecord(r)
      const key = email || name
      const existing = map.get(key)
      if (existing) {
        existing.totalHours += hours
        existing.sessions++
      } else {
        map.set(key, { name, email, role, payRate, payFreq, totalHours: hours, sessions: 1 })
      }
    }

    const rows = [...map.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => {
        const totalPay = s.payRate !== null && s.payFreq === 'hourly'
          ? (s.totalHours * s.payRate).toFixed(2)
          : s.payRate !== null && s.payFreq === 'per_session'
            ? (s.sessions * s.payRate).toFixed(2)
            : ''
        return {
          'Staff Name': s.name,
          'Email': s.email,
          'Role': s.role,
          'Pay Rate (£)': s.payRate ?? '',
          'Pay Type': s.payFreq ?? '',
          'Sessions': s.sessions,
          'Total Hours': fmtHours(s.totalHours),
          'Total Hours (decimal)': s.totalHours.toFixed(2),
          'Total Pay (£)': totalPay,
          'Period': `${periodStart} to ${periodEnd}`,
        }
      })

    downloadCSV(`aso-payroll-summary-${periodStart}-to-${periodEnd}.csv`, rows)
  }

  // ── Payroll detail download ───────────────────────────────────────────────────

  async function handleDownloadPayrollDetail() {
    setPayrollDetailLoading(true)
    setError(null)
    const records = await fetchClockRecords()
    setPayrollDetailLoading(false)
    if (!records) return

    const rows = [...records]
      .sort((a, b) => (a.profiles?.full_name ?? '').localeCompare(b.profiles?.full_name ?? ''))
      .map(r => {
        const hours = hoursFromRecord(r)
        const payRate = r.staff_employment?.[0]?.pay_rate ?? null
        const payFreq = r.staff_employment?.[0]?.pay_frequency ?? null
        const sessionPay = payRate !== null && payFreq === 'hourly'
          ? (hours * payRate).toFixed(2)
          : payRate !== null && payFreq === 'per_session'
            ? payRate.toFixed(2)
            : ''
        return {
          'Staff Name': r.profiles?.full_name ?? '',
          'Email': r.profiles?.email ?? '',
          'Role': r.profiles?.role ?? '',
          'Date': new Date(r.clock_in).toLocaleDateString('en-GB'),
          'Clock In': new Date(r.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          'Clock Out': r.clock_out ? new Date(r.clock_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
          'Duration': fmtHours(hours),
          'Hours (decimal)': hours.toFixed(2),
          'Location': r.schools?.name ?? r.location_override ?? '',
          'Pay Rate (£)': payRate ?? '',
          'Pay Type': payFreq ?? '',
          'Session Pay (£)': sessionPay,
        }
      })

    downloadCSV(`aso-timesheet-detail-${periodStart}-to-${periodEnd}.csv`, rows)
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Data Exports</h1>
          <p className="text-sm text-gray-500 mt-1">Download contact lists and profiles as CSV files.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Payroll exports ── */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Payroll & Timesheets</h2>

          {/* Date range picker */}
          <Card className="p-4 mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select pay period</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={e => setPeriodStart(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={e => setPeriodEnd(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
                />
              </div>
              <div className="flex gap-2 mt-4">
                {[
                  { label: 'This month', fn: () => { const p = defaultPeriod(); setPeriodStart(p.start); setPeriodEnd(p.end) } },
                  { label: 'Last month', fn: () => {
                    const now = new Date()
                    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    const e = new Date(now.getFullYear(), now.getMonth(), 0)
                    setPeriodStart(s.toISOString().slice(0, 10))
                    setPeriodEnd(e.toISOString().slice(0, 10))
                  }},
                ].map(({ label, fn }) => (
                  <button key={label} onClick={fn}
                    className="text-xs font-semibold text-[#1a3a6b] bg-[#1a3a6b]/8 hover:bg-[#1a3a6b]/15 px-3 py-1.5 rounded-lg transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <PayrollCard
              icon={<FileSpreadsheet size={22} />}
              title="Payroll Summary"
              description="One row per staff member — total hours, pay rate, and amount due for the period. Ready for Xero entry or bank transfer, sorted A–Z."
              start={periodStart}
              end={periodEnd}
              onDownload={handleDownloadPayrollSummary}
              loading={payrollSummaryLoading}
            />
            <PayrollCard
              icon={<Clock size={22} />}
              title="Timesheet Detail"
              description="Every clock-in and clock-out session with duration, location, and session pay. Full audit trail sorted by staff name."
              start={periodStart}
              end={periodEnd}
              onDownload={handleDownloadPayrollDetail}
              loading={payrollDetailLoading}
            />
          </div>
        </div>

        {/* ── Contact exports ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Contact Lists</h2>
          <div className="flex flex-col gap-4">
          <ExportSection
            icon={<UserCheck size={22} />}
            title="Staff Contacts"
            description="All staff profiles (coaches, area leads, directors) with DBS and certification dates."
            recordCount={staffCount}
            countLoading={staffCount === null}
            onDownload={handleDownloadStaff}
            downloadLoading={staffLoading}
          />

          <ExportSection
            icon={<Users size={22} />}
            title="Parent Contacts"
            description="All registered parent accounts with contact details and number of children."
            recordCount={parentCount}
            countLoading={parentCount === null}
            onDownload={handleDownloadParents}
            downloadLoading={parentsLoading}
          />

          <ExportSection
            icon={<Baby size={22} />}
            title="Children Profiles"
            description="Full child records including emergency contacts, consent, and linked parent account details."
            recordCount={childrenCount}
            countLoading={childrenCount === null}
            onDownload={handleDownloadChildren}
            downloadLoading={childrenLoading}
          />
          </div>
        </div>
      </div>
    </Layout>
  )
}
