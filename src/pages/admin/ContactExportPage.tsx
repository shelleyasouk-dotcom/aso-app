import { useState } from 'react'
import { Download, Users, UserCheck, UsersRound, CheckSquare, Square } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'

interface ContactRow {
  first_name: string
  last_name: string
  email: string
  phone: string
  source: string
}

function splitName(full: string): { first: string; last: string } {
  const trimmed = full.trim()
  const idx = trimmed.indexOf(' ')
  if (idx === -1) return { first: trimmed, last: '' }
  return {
    first: trimmed.slice(0, idx),
    last: trimmed.slice(idx + 1).trim(),
  }
}

function toBrevoCSV(rows: ContactRow[]): string {
  const lines: string[] = []
  lines.push('No.,School Name,Contact First Name,Contact Last Name,Email Address,Telephone Number')
  lines.push(',,,,,')
  rows.forEach((r, i) => {
    const no = i + 1
    const escape = (v: string) => v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
    lines.push([no, '', escape(r.first_name), escape(r.last_name), escape(r.email), escape(r.phone)].join(','))
  })
  return lines.join('\r\n')
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ContactExportPage() {
  const [includeStaff, setIncludeStaff] = useState(true)
  const [includeCoachPool, setIncludeCoachPool] = useState(true)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ContactRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchContacts(): Promise<ContactRow[]> {
    const rows: ContactRow[] = []

    if (includeStaff) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .not('role', 'in', '(parent,school)')
        .not('full_name', 'is', null)
        .order('full_name')

      if (error) throw new Error(error.message)
      for (const p of data ?? []) {
        if (!p.full_name) continue
        const { first, last } = splitName(p.full_name)
        rows.push({
          first_name: first,
          last_name: last,
          email: p.email ?? '',
          phone: p.phone ?? '',
          source: 'Staff',
        })
      }
    }

    if (includeCoachPool) {
      const { data, error } = await supabase
        .from('coach_pool')
        .select('full_name, email, phone')
        .not('full_name', 'is', null)
        .order('full_name')

      if (error) throw new Error(error.message)
      for (const p of data ?? []) {
        if (!p.full_name) continue
        const { first, last } = splitName(p.full_name)
        rows.push({
          first_name: first,
          last_name: last,
          email: p.email ?? '',
          phone: p.phone ?? '',
          source: 'Coach Pool',
        })
      }
    }

    // Sort combined list by last name then first name
    rows.sort((a, b) =>
      a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
    )

    return rows
  }

  async function handlePreview() {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchContacts()
      setPreview(rows)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load contacts')
    }
    setLoading(false)
  }

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchContacts()
      const csv = toBrevoCSV(rows)
      const date = new Date().toISOString().slice(0, 10)
      const label = includeStaff && includeCoachPool
        ? 'staff-and-coachpool'
        : includeStaff ? 'staff' : 'coach-pool'
      downloadCSV(csv, `aso-contacts-${label}-${date}.csv`)
      setPreview(rows)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to export contacts')
    }
    setLoading(false)
  }

  const noneSelected = !includeStaff && !includeCoachPool

  function Toggle({ checked, onChange, label, icon: Icon, count }: {
    checked: boolean
    onChange: () => void
    label: string
    icon: React.ElementType
    count?: number
  }) {
    return (
      <button
        onClick={onChange}
        className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border-2 text-left transition-colors ${
          checked
            ? 'border-[#1a3a6b] bg-[#1a3a6b]/5'
            : 'border-gray-200 bg-white'
        }`}
      >
        {checked
          ? <CheckSquare size={18} className="text-[#1a3a6b] shrink-0" />
          : <Square size={18} className="text-gray-300 shrink-0" />}
        <Icon size={18} className={checked ? 'text-[#1a3a6b] shrink-0' : 'text-gray-400 shrink-0'} />
        <span className={`text-sm font-semibold flex-1 ${checked ? 'text-[#1a3a6b]' : 'text-gray-500'}`}>
          {label}
        </span>
        {count !== undefined && (
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <Layout title="Export Contacts" showBack>
      <div className="px-4 pt-5 pb-10 max-w-lg mx-auto flex flex-col gap-5">

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-blue-800 font-medium leading-relaxed">
            Exports a Brevo-compatible CSV with first name, last name, email and phone number.
          </p>
        </div>

        {/* Source selection */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Include contacts from</p>
          <Toggle
            checked={includeStaff}
            onChange={() => setIncludeStaff(v => !v)}
            label="Active staff"
            icon={UserCheck}
          />
          <Toggle
            checked={includeCoachPool}
            onChange={() => setIncludeCoachPool(v => !v)}
            label="Coach pool"
            icon={UsersRound}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            disabled={loading || noneSelected}
            className="flex-1 py-3 rounded-2xl border-2 border-[#1a3a6b] text-[#1a3a6b] text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Users size={16} />
            Preview
          </button>
          <button
            onClick={handleExport}
            disabled={loading || noneSelected}
            className="flex-1 py-3 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {loading ? 'Loading…' : 'Download CSV'}
          </button>
        </div>

        {/* Preview table */}
        {preview && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
              {preview.length} contact{preview.length !== 1 ? 's' : ''}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">#</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">First Name</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">Last Name</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">Email</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">Phone</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{r.first_name}</td>
                      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{r.last_name}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.email || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.phone || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.source === 'Staff'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-violet-50 text-violet-700'
                        }`}>{r.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
