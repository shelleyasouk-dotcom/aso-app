import { useState, useEffect } from 'react'
import { Download, Users, Baby, UserCheck } from 'lucide-react'
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
    </Layout>
  )
}
