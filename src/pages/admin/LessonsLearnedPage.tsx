import { useState, useEffect } from 'react'
import { Plus, BookOpen, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonEntry {
  id: string
  reference: string
  date_of_entry: string
  school_area: string | null
  outcome: string | null
  category: string
  entered_by_id: string | null
  what_happened: string
  root_cause: string
  immediate_action: string
  permanent_change: string
  prevention: string | null
  reflection: string | null
  linked_sops: string | null
  created_at: string
  entered_by?: { full_name: string } | null
}

type EntryForm = {
  date_of_entry: string
  school_area: string
  outcome: string
  category: string
  what_happened: string
  root_cause: string
  immediate_action: string
  permanent_change: string
  prevention: string
  reflection: string
  linked_sops: string
}

const CATEGORIES = [
  'School loss',
  'Serious incident',
  'Near miss',
  'Complaint',
  'Staffing failure',
  'System failure',
  'Communication failure',
  'Other',
]

const emptyForm: EntryForm = {
  date_of_entry: new Date().toISOString().slice(0, 10),
  school_area: '',
  outcome: '',
  category: 'School loss',
  what_happened: '',
  root_cause: '',
  immediate_action: '',
  permanent_change: '',
  prevention: '',
  reflection: '',
  linked_sops: '',
}

// ─── Field block ──────────────────────────────────────────────────────────────

function FieldBlock({ label, value, onChange, rows = 3, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
      />
    </div>
  )
}

// ─── Entry card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, canEdit, onEdit }: {
  entry: LessonEntry
  canEdit: boolean
  onEdit: (e: LessonEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const categoryColor: Record<string, string> = {
    'School loss':           'bg-red-100 text-red-700',
    'Serious incident':      'bg-red-100 text-red-700',
    'Near miss':             'bg-orange-100 text-orange-700',
    'Complaint':             'bg-amber-100 text-amber-700',
    'Staffing failure':      'bg-purple-100 text-purple-700',
    'System failure':        'bg-blue-100 text-blue-700',
    'Communication failure': 'bg-indigo-100 text-indigo-700',
    'Other':                 'bg-gray-100 text-gray-600',
  }
  const chipColor = categoryColor[entry.category] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button className="w-full flex items-start justify-between px-4 py-3.5 text-left gap-3"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-extrabold text-[#1a3a6b] bg-[#1a3a6b]/10 px-2 py-0.5 rounded-lg">{entry.reference}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chipColor}`}>{entry.category}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-snug truncate">
            {entry.outcome || entry.what_happened.slice(0, 80)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(entry.date_of_entry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {entry.school_area ? ` · ${entry.school_area}` : ''}
            {entry.entered_by ? ` · ${entry.entered_by.full_name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {canEdit && (
            <button onClick={e => { e.stopPropagation(); onEdit(entry) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/8 transition-colors">
              <Pencil size={14} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {[
            { label: 'What Happened', value: entry.what_happened },
            { label: 'Root Cause', value: entry.root_cause },
            { label: 'Immediate Action Taken', value: entry.immediate_action },
            { label: 'Permanent Change', value: entry.permanent_change },
            ...(entry.prevention ? [{ label: 'What Would Have Prevented This', value: entry.prevention }] : []),
            ...(entry.reflection ? [{ label: 'Director / Area Lead Reflection', value: entry.reflection }] : []),
            ...(entry.linked_sops ? [{ label: 'Linked SOPs Updated', value: entry.linked_sops }] : []),
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-extrabold text-[#1a3a6b] uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LessonsLearnedPage() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState<LessonEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<LessonEntry | null>(null)
  const [form, setForm] = useState<EntryForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDirector = profile?.role === 'director'
  const canEdit = isDirector

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('lessons_learned')
      .select('*, entered_by:profiles!entered_by_id(full_name)')
      .order('reference', { ascending: false })
    setEntries((data ?? []) as LessonEntry[])
    setLoading(false)
  }

  function startNew() {
    setEditEntry(null)
    setForm(emptyForm)
    setShowForm(true)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startEdit(entry: LessonEntry) {
    setEditEntry(entry)
    setForm({
      date_of_entry: entry.date_of_entry,
      school_area: entry.school_area ?? '',
      outcome: entry.outcome ?? '',
      category: entry.category,
      what_happened: entry.what_happened,
      root_cause: entry.root_cause,
      immediate_action: entry.immediate_action,
      permanent_change: entry.permanent_change,
      prevention: entry.prevention ?? '',
      reflection: entry.reflection ?? '',
      linked_sops: entry.linked_sops ?? '',
    })
    setShowForm(true)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save() {
    if (!form.what_happened.trim() || !form.root_cause.trim()) {
      setError('What Happened and Root Cause are required.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      date_of_entry: form.date_of_entry,
      school_area: form.school_area.trim() || null,
      outcome: form.outcome.trim() || null,
      category: form.category,
      what_happened: form.what_happened.trim(),
      root_cause: form.root_cause.trim(),
      immediate_action: form.immediate_action.trim(),
      permanent_change: form.permanent_change.trim(),
      prevention: form.prevention.trim() || null,
      reflection: form.reflection.trim() || null,
      linked_sops: form.linked_sops.trim() || null,
      entered_by_id: profile!.id,
    }

    if (editEntry) {
      const { error: err } = await supabase.from('lessons_learned').update(payload).eq('id', editEntry.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      // Auto-generate reference
      const nextNum = (entries.length + 1).toString().padStart(3, '0')
      const { error: err } = await supabase.from('lessons_learned').insert({ ...payload, reference: `LL-${nextNum}` })
      if (err) { setError(err.message); setSaving(false); return }
    }

    await load()
    setShowForm(false)
    setEditEntry(null)
    setSaving(false)
  }

  function setF(key: keyof EntryForm) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  return (
    <Layout title="Lessons Learned" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Header context */}
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-2xl px-4 py-3">
          <p className="text-xs text-[#1a3a6b] leading-relaxed">
            <span className="font-bold">Lessons Learned Log.</span> Every significant failure is captured here — what happened, why, and what permanently changed. A lesson without a process change is just a record of a mistake.
          </p>
        </div>

        {canEdit && (
          <Button fullWidth onClick={startNew}>
            <Plus size={18} /> Add Entry
          </Button>
        )}

        {showForm && canEdit && (
          <Card>
            <h3 className="font-bold text-[#1a3a6b] mb-4">{editEntry ? `Edit ${editEntry.reference}` : 'New Lessons Learned Entry'}</h3>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Date of Entry" type="date" value={form.date_of_entry}
                  onChange={e => setF('date_of_entry')(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select value={form.category} onChange={e => setF('category')(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Input label="School / Area" value={form.school_area}
                onChange={e => setF('school_area')(e.target.value)}
                placeholder="e.g. Bath — school name withheld from public docs" />
              <Input label="Outcome summary" value={form.outcome}
                onChange={e => setF('outcome')(e.target.value)}
                placeholder="e.g. School partnership terminated" />
              <FieldBlock label="What Happened *" value={form.what_happened} onChange={setF('what_happened')}
                placeholder="Describe the event in detail…" rows={4} />
              <FieldBlock label="Root Cause *" value={form.root_cause} onChange={setF('root_cause')}
                placeholder="Why did this happen — not who caused it…" rows={3} />
              <FieldBlock label="Immediate Action Taken" value={form.immediate_action} onChange={setF('immediate_action')}
                placeholder="What was done immediately after the event…" rows={3} />
              <FieldBlock label="Permanent Change" value={form.permanent_change} onChange={setF('permanent_change')}
                placeholder="What process has changed and who owns it…" rows={3} />
              <FieldBlock label="What Would Have Prevented This" value={form.prevention} onChange={setF('prevention')}
                placeholder="The missing thing that, if it had existed, would have prevented this…" rows={2} />
              <FieldBlock label="Director / Area Lead Reflection" value={form.reflection} onChange={setF('reflection')}
                placeholder="Personal reflection on the event and what it means for the organisation…" rows={3} />
              <FieldBlock label="Linked SOPs / Checklists Updated" value={form.linked_sops} onChange={setF('linked_sops')}
                placeholder="e.g. New School Launch Checklist | Incident Communication SOP" rows={2} />
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setShowForm(false); setEditEntry(null) }}>Cancel</Button>
                <Button className="flex-1" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : editEntry ? 'Save Changes' : 'Add Entry'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : entries.length === 0 ? (
          <Card className="text-center py-8">
            <BookOpen size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No entries yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(e => (
              <EntryCard key={e.id} entry={e} canEdit={canEdit} onEdit={startEdit} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
