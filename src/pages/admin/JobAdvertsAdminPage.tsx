import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, EyeOff, Trash2, X, Check, Globe, MapPin, Clock, Briefcase } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobAdvert {
  id: string
  title: string
  role_type: string
  location: string
  area: string | null
  contract_type: string
  hours_desc: string | null
  salary_desc: string | null
  description: string
  requirements: string | null
  is_published: boolean
  closes_at: string | null
  created_at: string
}

const ROLE_OPTIONS = [
  { value: 'coach', label: 'Sports Coach' },
  { value: 'lead_coach', label: 'Lead Coach' },
  { value: 'assistant', label: 'Assistant Coach' },
  { value: 'admin', label: 'Administration' },
  { value: 'other', label: 'Other' },
]

const CONTRACT_OPTIONS = [
  { value: 'part_time', label: 'Part Time' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'casual', label: 'Casual / Flexible' },
  { value: 'volunteer', label: 'Volunteer' },
]

const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLE_OPTIONS.map(o => [o.value, o.label]))
const CONTRACT_LABELS: Record<string, string> = Object.fromEntries(CONTRACT_OPTIONS.map(o => [o.value, o.label]))

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  role_type: string
  location: string
  area: string
  contract_type: string
  hours_desc: string
  salary_desc: string
  description: string
  requirements: string
  is_published: boolean
  closes_at: string
}

const EMPTY: FormState = {
  title: '',
  role_type: 'coach',
  location: '',
  area: '',
  contract_type: 'part_time',
  hours_desc: '',
  salary_desc: '',
  description: '',
  requirements: '',
  is_published: false,
  closes_at: '',
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b]'
const textareaCls = inputCls + ' resize-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

interface AdvertFormProps {
  initial: JobAdvert | null
  areas: string[]
  onSave: (advert: JobAdvert) => void
  onCancel: () => void
}

function AdvertForm({ initial, areas, onSave, onCancel }: AdvertFormProps) {
  const [form, setForm] = useState<FormState>(initial ? {
    title: initial.title,
    role_type: initial.role_type,
    location: initial.location,
    area: initial.area ?? '',
    contract_type: initial.contract_type,
    hours_desc: initial.hours_desc ?? '',
    salary_desc: initial.salary_desc ?? '',
    description: initial.description,
    requirements: initial.requirements ?? '',
    is_published: initial.is_published,
    closes_at: initial.closes_at ?? '',
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FormState, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setError('Title, location and description are required')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      role_type: form.role_type,
      location: form.location.trim(),
      area: form.area.trim() || null,
      contract_type: form.contract_type,
      hours_desc: form.hours_desc.trim() || null,
      salary_desc: form.salary_desc.trim() || null,
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      is_published: form.is_published,
      closes_at: form.closes_at || null,
    }

    const result = initial
      ? await supabase.from('job_adverts').update(payload).eq('id', initial.id).select().single()
      : await supabase.from('job_adverts').insert(payload).select().single()

    if (result.error) { setError(result.error.message); setSaving(false); return }
    onSave(result.data as JobAdvert)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{initial ? 'Edit Vacancy' : 'New Vacancy'}</h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job Title *">
              <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Sports Coach — Salisbury" />
            </Field>
            <Field label="Role Type">
              <select className={inputCls} value={form.role_type} onChange={e => set('role_type', e.target.value)}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Location *">
              <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Salisbury, Wiltshire" />
            </Field>
            <Field label="Area (for filtering)">
              <input className={inputCls} value={form.area} onChange={e => set('area', e.target.value)} list="area-list" placeholder="e.g. Hampshire" />
              <datalist id="area-list">
                {areas.map(a => <option key={a} value={a} />)}
              </datalist>
            </Field>
            <Field label="Contract Type">
              <select className={inputCls} value={form.contract_type} onChange={e => set('contract_type', e.target.value)}>
                {CONTRACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Closing Date">
              <input className={inputCls} type="date" value={form.closes_at} onChange={e => set('closes_at', e.target.value)} />
            </Field>
            <Field label="Hours / Schedule">
              <input className={inputCls} value={form.hours_desc} onChange={e => set('hours_desc', e.target.value)} placeholder="e.g. Mon–Fri 3:15–4:15pm term time" />
            </Field>
            <Field label="Pay / Salary">
              <input className={inputCls} value={form.salary_desc} onChange={e => set('salary_desc', e.target.value)} placeholder="e.g. £14–16/hr depending on experience" />
            </Field>
          </div>

          <Field label="Job Description *">
            <textarea className={textareaCls} rows={6} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the role, what it involves, and what the ideal candidate will be doing day-to-day…" />
          </Field>

          <Field label="Requirements (one per line)">
            <textarea className={textareaCls} rows={4} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Enhanced DBS (or willingness to obtain)&#10;Safeguarding training&#10;Coaching qualification (desirable)&#10;Experience working with children" />
          </Field>

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-xl px-4 py-3">
            <div
              onClick={() => set('is_published', !form.is_published)}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.is_published ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{form.is_published ? 'Published — visible to candidates' : 'Draft — not visible to candidates'}</p>
              <p className="text-xs text-gray-500">Toggle to publish or unpublish this vacancy</p>
            </div>
          </label>

          <div className="flex gap-3 pb-4">
            <Button variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            <Button fullWidth onClick={handleSave} disabled={saving}>
              <Check size={16} />
              {saving ? 'Saving…' : 'Save Vacancy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function JobAdvertsAdminPage() {
  const [adverts, setAdverts] = useState<JobAdvert[]>([])
  const [loading, setLoading] = useState(true)
  const [areas, setAreas] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<JobAdvert | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [advertsRes, schoolsRes] = await Promise.all([
      supabase.from('job_adverts').select('*').order('created_at', { ascending: false }),
      supabase.from('schools').select('area').not('area', 'is', null),
    ])
    setAdverts((advertsRes.data as JobAdvert[]) ?? [])
    const uniqueAreas = [...new Set((schoolsRes.data ?? []).map((s: { area: string }) => s.area).filter(Boolean))].sort() as string[]
    setAreas(uniqueAreas)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function handleSaved(advert: JobAdvert) {
    setAdverts(prev => {
      const idx = prev.findIndex(a => a.id === advert.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = advert; return next }
      return [advert, ...prev]
    })
    setShowForm(false)
    setEditing(null)
  }

  async function togglePublish(advert: JobAdvert) {
    const { data } = await supabase
      .from('job_adverts')
      .update({ is_published: !advert.is_published })
      .eq('id', advert.id)
      .select()
      .single()
    if (data) handleSaved(data as JobAdvert)
  }

  async function handleDelete(id: string) {
    await supabase.from('job_adverts').delete().eq('id', id)
    setAdverts(prev => prev.filter(a => a.id !== id))
  }

  const published = adverts.filter(a => a.is_published).length
  const drafts = adverts.length - published

  return (
    <Layout title="Job Adverts">
      <div className="px-4 pt-6 flex flex-col gap-4 pb-6">

        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{published} live · {drafts} drafts</p>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={16} /> New Vacancy
          </Button>
        </div>

        {loading ? (
          <Card><p className="text-sm text-gray-500 text-center py-4">Loading…</p></Card>
        ) : adverts.length === 0 ? (
          <Card>
            <div className="text-center py-6">
              <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No vacancies yet. Create your first one!</p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {adverts.map(advert => (
              <AdvertCard
                key={advert.id}
                advert={advert}
                onEdit={() => { setEditing(advert); setShowForm(true) }}
                onTogglePublish={() => togglePublish(advert)}
                onDelete={() => handleDelete(advert.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AdvertForm
          initial={editing}
          areas={areas}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </Layout>
  )
}

// ─── Advert card ──────────────────────────────────────────────────────────────

function AdvertCard({
  advert,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  advert: JobAdvert
  onEdit: () => void
  onTogglePublish: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${advert.is_published ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold text-gray-900 text-sm">{advert.title}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${advert.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {advert.is_published ? 'Live' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-gray-500">{ROLE_LABELS[advert.role_type]} · {CONTRACT_LABELS[advert.contract_type]}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} />{advert.location}</span>
          {advert.hours_desc && <span className="flex items-center gap-1"><Clock size={11} />{advert.hours_desc}</span>}
          {advert.salary_desc && <span className="flex items-center gap-1"><Briefcase size={11} />{advert.salary_desc}</span>}
          {advert.closes_at && <span className="flex items-center gap-1">Closes {new Date(advert.closes_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] border border-[#1a3a6b]/30 rounded-xl px-3 py-1.5 hover:bg-[#1a3a6b] hover:text-white transition-colors"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={onTogglePublish}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-1.5 transition-colors border ${
              advert.is_published
                ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                : 'text-green-700 border-green-200 hover:bg-green-50'
            }`}
          >
            {advert.is_published ? <><EyeOff size={12} /> Unpublish</> : <><Globe size={12} /> Publish</>}
          </button>
          {confirmDelete ? (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 rounded-xl px-3 py-1.5"
            >
              Confirm delete
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
