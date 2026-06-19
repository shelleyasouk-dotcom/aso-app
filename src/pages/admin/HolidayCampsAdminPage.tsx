import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, X, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import type { HolidayCamp } from '../../types'

const CAMP_TYPES = [
  { value: 'summer',    label: 'Summer' },
  { value: 'easter',    label: 'Easter' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'half_term', label: 'Half Term' },
  { value: 'other',     label: 'Other' },
]

const EMOJIS = ['☀️','🏰','🌊','🌿','⛵','🎄','🐣','🍂','🏅','🎉','🌈','🤸','⚽','🏐']

interface CampForm {
  title: string
  camp_type: string
  venue_name: string
  city: string
  region: string
  emoji: string
  start_date: string
  end_date: string
  session_start_time: string
  session_end_time: string
  price_pence: string
  capacity: string
  booking_url: string
  age_range: string
  notes: string
  display_order: string
}

const EMPTY_FORM: CampForm = {
  title: 'Summer Gymnastics Camp',
  camp_type: 'summer',
  venue_name: '',
  city: '',
  region: '',
  emoji: '☀️',
  start_date: '',
  end_date: '',
  session_start_time: '9:15am',
  session_end_time: '12:15pm',
  price_pence: '7500',
  capacity: '24',
  booking_url: '',
  age_range: '4-11',
  notes: '',
  display_order: '0',
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start)
  const e = parseLocalDate(end)
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${DAYS[s.getDay()]} ${s.getDate()} – ${DAYS[e.getDay()]} ${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`
  }
  return `${DAYS[s.getDay()]} ${s.getDate()} ${MONTHS[s.getMonth()]} – ${DAYS[e.getDay()]} ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`
}

export function HolidayCampsAdminPage() {
  const [camps, setCamps] = useState<HolidayCamp[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CampForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCamps() }, [])

  async function loadCamps() {
    const { data } = await supabase
      .from('holiday_camps')
      .select('*')
      .order('start_date')
      .order('display_order')
    setCamps((data ?? []) as HolidayCamp[])
    setLoading(false)
  }

  function field(key: keyof CampForm, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(camp: HolidayCamp) {
    setForm({
      title:              camp.title,
      camp_type:          camp.camp_type,
      venue_name:         camp.venue_name,
      city:               camp.city ?? '',
      region:             camp.region ?? '',
      emoji:              camp.emoji ?? '☀️',
      start_date:         camp.start_date,
      end_date:           camp.end_date,
      session_start_time: camp.session_start_time ?? '9:15am',
      session_end_time:   camp.session_end_time ?? '12:15pm',
      price_pence:        String(camp.price_pence),
      capacity:           String(camp.capacity),
      booking_url:        camp.booking_url ?? '',
      age_range:          camp.age_range ?? '4-11',
      notes:              camp.notes ?? '',
      display_order:      String(camp.display_order),
    })
    setEditingId(camp.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      title:              form.title,
      camp_type:          form.camp_type,
      venue_name:         form.venue_name,
      city:               form.city || null,
      region:             form.region || null,
      emoji:              form.emoji || '☀️',
      start_date:         form.start_date,
      end_date:           form.end_date,
      session_start_time: form.session_start_time || null,
      session_end_time:   form.session_end_time || null,
      price_pence:        parseInt(form.price_pence) || 0,
      capacity:           parseInt(form.capacity) || 24,
      booking_url:        form.booking_url || null,
      age_range:          form.age_range || null,
      notes:              form.notes || null,
      display_order:      parseInt(form.display_order) || 0,
    }
    if (editingId) {
      await supabase.from('holiday_camps').update(payload).eq('id', editingId)
    } else {
      await supabase.from('holiday_camps').insert(payload)
    }
    closeForm()
    await loadCamps()
    setSaving(false)
  }

  async function togglePublished(camp: HolidayCamp) {
    await supabase.from('holiday_camps').update({ is_published: !camp.is_published }).eq('id', camp.id)
    setCamps(prev => prev.map(c => c.id === camp.id ? { ...c, is_published: !c.is_published } : c))
  }

  async function toggleFull(camp: HolidayCamp) {
    await supabase.from('holiday_camps').update({ is_full: !camp.is_full }).eq('id', camp.id)
    setCamps(prev => prev.map(c => c.id === camp.id ? { ...c, is_full: !c.is_full } : c))
  }

  async function deleteCamp(id: string) {
    if (!confirm('Delete this camp? This cannot be undone.')) return
    await supabase.from('holiday_camps').delete().eq('id', id)
    setCamps(prev => prev.filter(c => c.id !== id))
  }

  const visible = typeFilter === 'all' ? camps : camps.filter(c => c.camp_type === typeFilter)

  const formValid = form.title && form.venue_name && form.start_date && form.end_date

  if (loading) return (
    <Layout title="Holiday Camps">
      <div className="px-4 pt-6"><p className="text-gray-400 text-sm">Loading…</p></div>
    </Layout>
  )

  return (
    <Layout title="Holiday Camps">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Manage holiday camp listings shown on the public portal.</p>
          <Button onClick={openCreate} size="sm">
            <Plus size={14} className="mr-1" /> Add Camp
          </Button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
          {[{ value: 'all', label: 'All' }, ...CAMP_TYPES].map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === t.value
                  ? 'bg-[#1a3a6b] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Camp list */}
        {visible.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No camps found. Add one above.</p>
        ) : (
          visible.map(camp => (
            <Card key={camp.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-3xl shrink-0">{camp.emoji ?? '☀️'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-gray-900">{camp.venue_name}</p>
                      {camp.city && <span className="text-xs text-gray-400">{camp.city}{camp.region ? `, ${camp.region}` : ''}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{camp.title}</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {formatDateRange(camp.start_date, camp.end_date)}
                      {camp.session_start_time && ` · ${camp.session_start_time}${camp.session_end_time ? ` – ${camp.session_end_time}` : ''}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-[#1a3a6b]">£{(camp.price_pence / 100).toFixed(0)}</span>
                      <span className="text-xs text-gray-400">{camp.capacity} places · ages {camp.age_range ?? '4-11'}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        CAMP_TYPES.find(t => t.value === camp.camp_type)
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {CAMP_TYPES.find(t => t.value === camp.camp_type)?.label ?? camp.camp_type}
                      </span>
                    </div>
                    {camp.booking_url && (
                      <a
                        href={camp.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                      >
                        <Globe size={11} /> Booking URL set
                      </a>
                    )}
                    {!camp.booking_url && (
                      <p className="text-xs text-amber-600 mt-1">⚠ No booking URL — add one before publishing</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFull(camp)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded-lg transition-colors ${
                        camp.is_full
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                      }`}
                      title="Toggle fully booked"
                    >
                      {camp.is_full ? 'Full' : 'Has Spaces'}
                    </button>
                    <button
                      onClick={() => togglePublished(camp)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded-lg transition-colors ${
                        camp.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {camp.is_published ? 'Live' : 'Draft'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {camp.booking_url && (
                      <a href={camp.booking_url} target="_blank" rel="noopener noreferrer" title="Open booking page">
                        <ExternalLink size={14} className="text-gray-400 hover:text-blue-600" />
                      </a>
                    )}
                    <button onClick={() => openEdit(camp)} title="Edit">
                      <Pencil size={14} className="text-gray-400 hover:text-[#1a3a6b]" />
                    </button>
                    <button onClick={() => deleteCamp(camp.id)} title="Delete">
                      <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}

        {/* How-to note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
          <strong>How to add a holiday club:</strong> Click "Add Camp" → fill in the venue, dates, price and your ClassForKids booking URL → Save. Then toggle it from <em>Draft</em> to <em>Live</em> when ready to go public. Mark as <em>Full</em> once spaces sell out.
        </div>
      </div>

      {/* ── Create / Edit modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-5 py-4 rounded-t-2xl">
              <p className="font-bold text-[#1a3a6b]">{editingId ? 'Edit Camp' : 'New Holiday Camp'}</p>
              <button onClick={closeForm}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {/* Camp type + emoji */}
              <div className="grid grid-cols-2 gap-3">
                <Select label="Camp type" value={form.camp_type} onChange={e => field('camp_type', e.target.value)}>
                  {CAMP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => field('emoji', e)}
                        className={`text-xl p-1 rounded-lg border-2 transition-colors ${
                          form.emoji === e ? 'border-[#1a3a6b] bg-[#1a3a6b]/5' : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Input id="hc-title" label="Camp title" placeholder="e.g. Summer Gymnastics Camp" value={form.title} onChange={e => field('title', e.target.value)} />
              <Input id="hc-venue" label="Venue name *" placeholder="e.g. St Martins Primary School" value={form.venue_name} onChange={e => field('venue_name', e.target.value)} />

              <div className="grid grid-cols-2 gap-3">
                <Input id="hc-city" label="City / town" placeholder="e.g. Salisbury" value={form.city} onChange={e => field('city', e.target.value)} />
                <Input id="hc-region" label="Region" placeholder="e.g. Wiltshire" value={form.region} onChange={e => field('region', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input id="hc-sd" label="Start date *" type="date" value={form.start_date} onChange={e => field('start_date', e.target.value)} />
                <Input id="hc-ed" label="End date *" type="date" value={form.end_date} onChange={e => field('end_date', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input id="hc-st" label="Start time" placeholder="9:15am" value={form.session_start_time} onChange={e => field('session_start_time', e.target.value)} />
                <Input id="hc-et" label="End time" placeholder="12:15pm" value={form.session_end_time} onChange={e => field('session_end_time', e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input id="hc-price" label="Price (pence)" type="number" placeholder="7500" value={form.price_pence} onChange={e => field('price_pence', e.target.value)} />
                <Input id="hc-cap" label="Capacity" type="number" placeholder="24" value={form.capacity} onChange={e => field('capacity', e.target.value)} />
                <Input id="hc-age" label="Age range" placeholder="4-11" value={form.age_range} onChange={e => field('age_range', e.target.value)} />
              </div>

              <div>
                <Input
                  id="hc-url"
                  label="ClassForKids booking URL"
                  placeholder="https://activeschool.classforkids.io/class/..."
                  value={form.booking_url}
                  onChange={e => field('booking_url', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Paste the ClassForKids class URL. Leave blank to show a contact-us button.</p>
              </div>

              <Input id="hc-order" label="Display order" type="number" placeholder="0" value={form.display_order} onChange={e => field('display_order', e.target.value)} />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Internal notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes visible only to staff"
                  value={form.notes}
                  onChange={e => field('notes', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                />
              </div>

              <p className="text-xs text-gray-400">Price in pence: £75 = 7500.</p>

              <div className="flex gap-2 pt-1">
                <Button disabled={!formValid || saving} onClick={handleSave}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Camp'}
                </Button>
                <Button variant="secondary" onClick={closeForm}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
