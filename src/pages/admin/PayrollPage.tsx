import { useState, useEffect } from 'react'
import { Download, ChevronDown, ChevronUp, Banknote, Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { SESSION_RATES, SESSION_ROLE_LABELS, rateForSessionRole } from '../../lib/sessionRates'
import type { Profile, School } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRow {
  id: string
  session_date: string
  session_role: string | null
  clock_in: string
  staff_id: string
  school?: Pick<School, 'id' | 'name'>
}

interface ManualEntry {
  id: string
  staff_id: string
  date: string
  description: string
  hours: number | null
  hourly_rate: number | null
  amount: number
}

interface StaffEntry {
  profile: Pick<Profile, 'id' | 'full_name' | 'role'>
  sessions: SessionRow[]
  manualEntries: ManualEntry[]
  total: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function fmt(p: number) {
  return `£${p.toFixed(2)}`
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(entries: StaffEntry[], monthKey: string) {
  const [year, month] = monthKey.split('-')
  const label = new Date(`${monthKey}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const rows: string[][] = []

  rows.push([`ASO Coaching — Payroll Export — ${label}`])
  rows.push([])
  rows.push(['Staff Name', 'Profile Role', 'Date', 'Day', 'Type', 'Detail', 'Rate (£)', 'Amount (£)'])

  let grandTotal = 0

  entries.forEach(entry => {
    entry.sessions.forEach(s => {
      const d = new Date(s.session_date + 'T12:00:00')
      const day = d.toLocaleDateString('en-GB', { weekday: 'long' })
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const role = s.session_role ?? ''
      const rate = rateForSessionRole(s.session_role)
      rows.push([
        entry.profile.full_name,
        SESSION_ROLE_LABELS[entry.profile.role] ?? entry.profile.role,
        date, day, 'Session',
        `${(s.school as any)?.name ?? ''}${role ? ` · ${SESSION_ROLE_LABELS[role] ?? role}` : ''}`,
        rate.toFixed(2), rate.toFixed(2),
      ])
    })

    entry.manualEntries.forEach(m => {
      const d = new Date(m.date + 'T12:00:00')
      const day = d.toLocaleDateString('en-GB', { weekday: 'long' })
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      rows.push([
        entry.profile.full_name,
        SESSION_ROLE_LABELS[entry.profile.role] ?? entry.profile.role,
        date, day, 'Manual',
        `${m.description}${m.hours ? ` · ${m.hours}h @ £${(m.hourly_rate ?? 0).toFixed(2)}/hr` : ''}`,
        (m.hourly_rate ?? '').toString(), m.amount.toFixed(2),
      ])
    })

    rows.push([
      `SUBTOTAL: ${entry.profile.full_name}`, '', '', '', '',
      `${entry.sessions.length} session${entry.sessions.length !== 1 ? 's' : ''} + ${entry.manualEntries.length} manual`,
      '', entry.total.toFixed(2),
    ])
    grandTotal += entry.total
    rows.push([])
  })

  rows.push(['GRAND TOTAL', '', '', '', '', '', '', grandTotal.toFixed(2)])

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ASO_Payroll_${year}_${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface MonthGroup {
  monthKey: string
  label: string
  entries: StaffEntry[]
  total: number
  sessionCount: number
}

const EMPTY_MANUAL_FORM = { description: '', date: '', hours: '', hourly_rate: '', amount: '' }

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PayrollPage() {
  const [months, setMonths] = useState<MonthGroup[]>([])
  const [staffList, setStaffList] = useState<Pick<Profile, 'id' | 'full_name' | 'role'>[]>([])
  const [loading, setLoading] = useState(true)
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [expandedStaff, setExpandedStaff] = useState<Set<string>>(new Set())

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [addingManualFor, setAddingManualFor] = useState<string | null>(null) // staffKey `${monthKey}:${staffId}`
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL_FORM)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [bulkRoleFor, setBulkRoleFor] = useState<string | null>(null) // staffId currently picking a bulk role
  const [bulkMsg, setBulkMsg] = useState<{ staffId: string; text: string } | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    const [{ data: sessionData }, { data: manualData }, { data: allStaff }] = await Promise.all([
      supabase
        .from('clock_records')
        .select('id, session_date, session_role, clock_in, staff_id, school:schools(id, name), staff:profiles!staff_id(id, full_name, role)')
        .not('session_date', 'is', null)
        .order('session_date', { ascending: false })
        .order('clock_in', { ascending: true }),
      supabase
        .from('manual_pay_entries')
        .select('*, staff:profiles!staff_id(id, full_name, role)')
        .order('date', { ascending: false }),
      supabase.from('profiles').select('id, full_name, role').not('role', 'in', '(parent,school)').order('full_name'),
    ])

    setStaffList((allStaff ?? []) as Pick<Profile, 'id' | 'full_name' | 'role'>[])

    const byMonth: Record<string, Record<string, { profile: Pick<Profile, 'id' | 'full_name' | 'role'>; sessions: SessionRow[]; manualEntries: ManualEntry[] }>> = {}

    ;(sessionData ?? []).forEach((row: any) => {
      if (!row.staff || !row.session_date) return
      const mk = row.session_date.slice(0, 7)
      if (!byMonth[mk]) byMonth[mk] = {}
      const sid = row.staff_id
      if (!byMonth[mk][sid]) byMonth[mk][sid] = { profile: row.staff, sessions: [], manualEntries: [] }
      byMonth[mk][sid].sessions.push(row as SessionRow)
    })

    ;(manualData ?? []).forEach((row: any) => {
      if (!row.staff || !row.date) return
      const mk = row.date.slice(0, 7)
      if (!byMonth[mk]) byMonth[mk] = {}
      const sid = row.staff_id
      if (!byMonth[mk][sid]) byMonth[mk][sid] = { profile: row.staff, sessions: [], manualEntries: [] }
      byMonth[mk][sid].manualEntries.push(row as ManualEntry)
    })

    const result: MonthGroup[] = Object.keys(byMonth)
      .sort((a, b) => b.localeCompare(a))
      .map(mk => {
        const entries: StaffEntry[] = Object.values(byMonth[mk])
          .map(e => ({
            ...e,
            total: e.sessions.reduce((sum, s) => sum + rateForSessionRole(s.session_role), 0)
              + e.manualEntries.reduce((sum, m) => sum + m.amount, 0),
          }))
          .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name))
        return {
          monthKey: mk,
          label: new Date(`${mk}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          entries,
          total: entries.reduce((s, e) => s + e.total, 0),
          sessionCount: entries.reduce((s, e) => s + e.sessions.length, 0),
        }
      })

    setMonths(result)
    if (result.length > 0) setOpenMonths(new Set([result[0].monthKey]))
    setLoading(false)
  }

  function toggleMonth(key: string) {
    setOpenMonths(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }
  function toggleStaff(key: string) {
    setExpandedStaff(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  async function changeSessionRole(sessionId: string, newRole: string) {
    setSaving(true)
    setActionError(null)
    const { error } = await supabase.from('clock_records').update({ session_role: newRole || null }).eq('id', sessionId)
    if (error) setActionError(error.message)
    else await load()
    setEditingSessionId(null)
    setSaving(false)
  }

  async function bulkSetRole(staffId: string, newRole: string) {
    if (!newRole) return
    setSaving(true)
    setBulkMsg(null)
    setActionError(null)
    const { error, count } = await supabase
      .from('clock_records')
      .update({ session_role: newRole }, { count: 'exact' })
      .is('session_role', null)
      .eq('staff_id', staffId)
    if (error) {
      setActionError(error.message)
    } else {
      setBulkMsg({ staffId, text: `Set ${SESSION_ROLE_LABELS[newRole] ?? newRole} on ${count ?? 0} shift${count === 1 ? '' : 's'} with no role — across every month.` })
      await load()
    }
    setBulkRoleFor(null)
    setSaving(false)
  }

  function updateManualForm(patch: Partial<typeof EMPTY_MANUAL_FORM>) {
    setManualForm(prev => {
      const next = { ...prev, ...patch }
      const h = parseFloat(next.hours)
      const r = parseFloat(next.hourly_rate)
      if (!isNaN(h) && !isNaN(r) && ('hours' in patch || 'hourly_rate' in patch)) {
        next.amount = (h * r).toFixed(2)
      }
      return next
    })
  }

  function startAddManual(staffKey: string, monthKey: string) {
    setAddingManualFor(staffKey)
    setManualForm({ ...EMPTY_MANUAL_FORM, date: `${monthKey}-15` })
  }

  async function saveManualEntry(staffId: string) {
    if (!manualForm.description.trim() || !manualForm.date || !manualForm.amount) {
      setActionError('Enter a description, date, and an amount (type it directly, or fill in both Hours and Hourly rate to auto-fill it) before saving.')
      return
    }
    setSaving(true)
    setActionError(null)
    const { error } = await supabase.from('manual_pay_entries').insert({
      staff_id: staffId,
      date: manualForm.date,
      description: manualForm.description.trim(),
      hours: manualForm.hours ? parseFloat(manualForm.hours) : null,
      hourly_rate: manualForm.hourly_rate ? parseFloat(manualForm.hourly_rate) : null,
      amount: parseFloat(manualForm.amount),
    })
    if (error) {
      setActionError(error.message)
    } else {
      await load()
      setAddingManualFor(null)
      setManualForm(EMPTY_MANUAL_FORM)
    }
    setSaving(false)
  }

  async function deleteManualEntry(id: string) {
    setSaving(true)
    setActionError(null)
    const { error } = await supabase.from('manual_pay_entries').delete().eq('id', id)
    if (error) setActionError(error.message)
    else await load()
    setSaving(false)
  }

  return (
    <Layout title="Payroll" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-red-700 mb-0.5">Action failed</p>
            <p className="text-xs text-red-600">{actionError}</p>
            {actionError.toLowerCase().includes('does not exist') && (
              <p className="text-xs text-red-400 mt-1">
                Looks like the manual_pay_entries table hasn't been created yet — run supabase/add_manual_pay_entries.sql in the Supabase SQL editor.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : months.length === 0 ? (
          <div className="text-center py-16">
            <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No payroll data yet</p>
          </div>
        ) : (
          months.map(mg => {
            const isOpen = openMonths.has(mg.monthKey)
            return (
              <div key={mg.monthKey}>
                {/* Month header */}
                <button
                  onClick={() => toggleMonth(mg.monthKey)}
                  className="w-full flex items-center justify-between bg-[#1a3a6b] text-white px-4 py-3 rounded-2xl mb-2"
                >
                  <div className="text-left">
                    <p className="font-extrabold text-sm">{mg.label}</p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {mg.entries.length} staff · {mg.sessionCount} sessions · {fmt(mg.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); exportCSV(mg.entries, mg.monthKey) }}
                      className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download size={13} /> CSV
                    </button>
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-3 mb-2">
                    {mg.entries.map(entry => {
                      const staffKey = `${mg.monthKey}:${entry.profile.id}`
                      const isStaffOpen = expandedStaff.has(staffKey)
                      const isAddingManual = addingManualFor === staffKey
                      return (
                        <div key={staffKey} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleStaff(staffKey)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1a3a6b] text-sm">{entry.profile.full_name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {entry.sessions.length} session{entry.sessions.length !== 1 ? 's' : ''}
                                {entry.manualEntries.length > 0 && ` · ${entry.manualEntries.length} manual`}
                              </p>
                            </div>
                            <p className="font-extrabold text-[#1a3a6b] text-base shrink-0">{fmt(entry.total)}</p>
                            {isStaffOpen
                              ? <ChevronUp size={16} className="text-gray-300 shrink-0" />
                              : <ChevronDown size={16} className="text-gray-300 shrink-0" />
                            }
                          </button>

                          {isStaffOpen && (
                            <div className="border-t border-gray-50">
                              {entry.sessions.length > 0 && (
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Session Breakdown</p>
                                </div>
                              )}

                              {entry.sessions.some(s => !s.session_role) && (
                                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                                  {bulkRoleFor === entry.profile.id ? (
                                    <div className="flex items-center gap-2">
                                      <select
                                        className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm bg-white"
                                        defaultValue=""
                                        disabled={saving}
                                        onChange={e => bulkSetRole(entry.profile.id, e.target.value)}
                                      >
                                        <option value="" disabled>Select a role to apply…</option>
                                        {Object.keys(SESSION_RATES).map(r => (
                                          <option key={r} value={r}>{SESSION_ROLE_LABELS[r]} (£{SESSION_RATES[r]}/session)</option>
                                        ))}
                                      </select>
                                      <button onClick={() => setBulkRoleFor(null)} className="p-2 rounded-xl border border-amber-200 text-amber-700 shrink-0 bg-white">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setBulkRoleFor(entry.profile.id)}
                                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800"
                                    >
                                      <Pencil size={12} /> Set role for all of {entry.profile.full_name.split(' ')[0]}'s shifts with no role (every month)
                                    </button>
                                  )}
                                </div>
                              )}
                              {bulkMsg?.staffId === entry.profile.id && (
                                <p className="px-4 py-2 text-xs text-green-700 bg-green-50 border-b border-green-100">{bulkMsg.text}</p>
                              )}

                              {entry.sessions.map((s, i) => {
                                const role = s.session_role ?? ''
                                const rate = rateForSessionRole(s.session_role)
                                const isEditingRole = editingSessionId === s.id
                                return (
                                  <div key={s.id} className={`px-4 py-3 ${i < entry.sessions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-700">{formatDate(s.session_date)}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">
                                          {(s.school as any)?.name ?? 'Unknown school'}
                                          {role && ` · ${SESSION_ROLE_LABELS[role] ?? role}`}
                                          {!role && <span className="text-red-500"> · No role set</span>}
                                        </p>
                                      </div>
                                      <p className="text-sm font-bold text-gray-700 shrink-0">{fmt(rate)}</p>
                                      <button
                                        onClick={() => setEditingSessionId(isEditingRole ? null : s.id)}
                                        className="p-1.5 rounded-lg text-[#1a3a6b] hover:bg-blue-50 shrink-0"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                    </div>
                                    {isEditingRole && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <select
                                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                          defaultValue={role}
                                          disabled={saving}
                                          onChange={e => changeSessionRole(s.id, e.target.value)}
                                        >
                                          <option value="">— No role —</option>
                                          {Object.keys(SESSION_RATES).map(r => (
                                            <option key={r} value={r}>{SESSION_ROLE_LABELS[r]} (£{SESSION_RATES[r]}/session)</option>
                                          ))}
                                        </select>
                                        <button onClick={() => setEditingSessionId(null)} className="p-2 rounded-xl border border-gray-200 text-gray-500 shrink-0">
                                          <X size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}

                              {entry.manualEntries.length > 0 && (
                                <div className="px-4 py-2 bg-gray-50 border-b border-t border-gray-100">
                                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Manual Entries</p>
                                </div>
                              )}
                              {entry.manualEntries.map((m, i) => (
                                <div key={m.id} className={`px-4 py-3 flex items-center gap-3 ${i < entry.manualEntries.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-700">{m.description}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                      {formatDate(m.date)}
                                      {m.hours != null && ` · ${m.hours}h @ £${(m.hourly_rate ?? 0).toFixed(2)}/hr`}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-gray-700 shrink-0">{fmt(m.amount)}</p>
                                  <button
                                    onClick={() => deleteManualEntry(m.id)}
                                    disabled={saving}
                                    className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}

                              {/* Add manual entry */}
                              {isAddingManual ? (
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                                  <input
                                    type="text" placeholder="Description (e.g. Admin hours — newsletter prep)"
                                    value={manualForm.description}
                                    onChange={e => updateManualForm({ description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={manualForm.date}
                                      onChange={e => updateManualForm({ date: e.target.value })}
                                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                                    <div />
                                    <input type="number" placeholder="Hours" step="0.25" value={manualForm.hours}
                                      onChange={e => updateManualForm({ hours: e.target.value })}
                                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                                    <input type="number" placeholder="Hourly rate (£)" step="0.01" value={manualForm.hourly_rate}
                                      onChange={e => updateManualForm({ hourly_rate: e.target.value })}
                                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                                  </div>
                                  <input type="number" placeholder="Amount (£) — auto-fills from hours × rate, or enter directly" step="0.01"
                                    value={manualForm.amount}
                                    onChange={e => updateManualForm({ amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                                  <div className="flex gap-2 mt-1">
                                    <button onClick={() => { setAddingManualFor(null); setManualForm(EMPTY_MANUAL_FORM) }}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
                                      <X size={14} /> Cancel
                                    </button>
                                    <button onClick={() => saveManualEntry(entry.profile.id)} disabled={saving}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1a3a6b] text-white text-sm font-semibold disabled:opacity-50">
                                      <Check size={14} /> {saving ? 'Saving…' : 'Add'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startAddManual(staffKey, mg.monthKey)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#1a3a6b] border-t border-gray-100"
                                >
                                  <Plus size={13} /> Add manual entry (e.g. admin hours)
                                </button>
                              )}

                              <div className="px-4 py-3 bg-[#1a3a6b]/5 flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1a3a6b]">Subtotal</p>
                                <p className="text-sm font-extrabold text-[#1a3a6b]">{fmt(entry.total)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Add a manual-only entry for staff with no sessions this month */}
                    <ManualOnlyAdd staffList={staffList} existingIds={mg.entries.map(e => e.profile.id)} monthKey={mg.monthKey}
                      onAdd={async (staffId, form) => {
                        setSaving(true)
                        setActionError(null)
                        const { error } = await supabase.from('manual_pay_entries').insert({
                          staff_id: staffId, date: form.date, description: form.description.trim(),
                          hours: form.hours ? parseFloat(form.hours) : null,
                          hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
                          amount: parseFloat(form.amount),
                        })
                        if (error) setActionError(error.message)
                        else await load()
                        setSaving(false)
                      }}
                    />

                    {/* Month total footer */}
                    <div className="bg-[#1a3a6b]/8 rounded-2xl px-5 py-3 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1a3a6b]">{mg.label} total</p>
                      <p className="font-extrabold text-[#1a3a6b]">{fmt(mg.total)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Rate reference card */}
        {!loading && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Session Rates</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SESSION_RATES).filter(r => r !== 'director').map(r => (
                <div key={r} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-[#1a3a6b]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600">{SESSION_ROLE_LABELS[r]}</p>
                    <p className="text-xs text-gray-400">{fmt(SESSION_RATES[r])}/session</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

// ─── Add a manual-only entry (for staff with no sessions logged that month) ────

function ManualOnlyAdd({ staffList, existingIds, monthKey, onAdd }: {
  staffList: Pick<Profile, 'id' | 'full_name' | 'role'>[]
  existingIds: string[]
  monthKey: string
  onAdd: (staffId: string, form: typeof EMPTY_MANUAL_FORM) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [staffId, setStaffId] = useState('')
  const [form, setForm] = useState(EMPTY_MANUAL_FORM)
  const [saving, setSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const existingSet = new Set(existingIds)
  const otherStaff = staffList.filter(s => !existingSet.has(s.id))

  function update(patch: Partial<typeof EMPTY_MANUAL_FORM>) {
    setForm(prev => {
      const next = { ...prev, ...patch }
      const h = parseFloat(next.hours)
      const r = parseFloat(next.hourly_rate)
      if (!isNaN(h) && !isNaN(r) && ('hours' in patch || 'hourly_rate' in patch)) next.amount = (h * r).toFixed(2)
      return next
    })
  }

  async function submit() {
    if (!staffId || !form.description.trim() || !form.date || !form.amount) {
      setValidationError('Select a staff member and enter a description, date, and amount (or fill in Hours + Hourly rate to auto-fill it).')
      return
    }
    setValidationError(null)
    setSaving(true)
    await onAdd(staffId, form)
    setSaving(false)
    setOpen(false)
    setStaffId('')
    setForm(EMPTY_MANUAL_FORM)
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setForm({ ...EMPTY_MANUAL_FORM, date: `${monthKey}-15` }) }}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-[#1a3a6b]/30 hover:text-[#1a3a6b] transition-colors"
      >
        <Plus size={13} /> Add pay for someone not shown above
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-2">
      <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
        <option value="">Select staff member…</option>
        {otherStaff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
      </select>
      <input type="text" placeholder="Description (e.g. Admin hours)" value={form.description}
        onChange={e => update({ description: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={form.date} onChange={e => update({ date: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <div />
        <input type="number" placeholder="Hours" step="0.25" value={form.hours} onChange={e => update({ hours: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input type="number" placeholder="Hourly rate (£)" step="0.01" value={form.hourly_rate} onChange={e => update({ hourly_rate: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <input type="number" placeholder="Amount (£)" step="0.01" value={form.amount} onChange={e => update({ amount: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      {validationError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{validationError}</p>}
      <div className="flex gap-2 mt-1">
        <button onClick={() => setOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">
          <X size={14} /> Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1a3a6b] text-white text-sm font-semibold disabled:opacity-50">
          <Check size={14} /> {saving ? 'Saving…' : 'Add'}
        </button>
      </div>
    </div>
  )
}
