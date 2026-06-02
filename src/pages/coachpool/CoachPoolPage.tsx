import { useState, useEffect, useCallback } from 'react'
import {
  Search, UserPlus, MapPin, Navigation, Mail, Phone,
  ChevronDown, ChevronUp, X, Check, CalendarDays, List,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

// ─── Types ────────────────────────────────────────────────────────────────────

type PoolStatus = 'available' | 'placed' | 'inactive'

interface CoachPoolEntry {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  preferred_locations: string | null
  travel_distance_miles: number | null
  availability: string | null
  notes: string | null
  status: PoolStatus
  created_at: string
}

const STATUS_LABELS: Record<PoolStatus, string> = {
  available: 'Available',
  placed: 'Placed',
  inactive: 'Inactive',
}
const STATUS_CHIP: Record<PoolStatus, string> = {
  available: 'bg-green-100 text-green-700',
  placed: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-500',
}
const STATUS_BORDER: Record<PoolStatus, string> = {
  available: 'border-l-green-500',
  placed: 'border-l-blue-400',
  inactive: 'border-l-gray-300',
}
const ALL_STATUSES: PoolStatus[] = ['available', 'placed', 'inactive']

// ─── Availability helpers ─────────────────────────────────────────────────────

const AVAIL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const AVAIL_TIMES = ['Mornings', 'Afternoons', 'Evenings', 'Flexible']

function parseAvailability(str: string | null): { days: string[]; time: string } {
  if (!str) return { days: [], time: '' }
  const parts = str.split('—').map(s => s.trim())
  const days = AVAIL_DAYS.filter(d => parts[0]?.includes(d))
  const time = AVAIL_TIMES.find(t => parts[1]?.includes(t)) ?? ''
  return { days, time }
}

function serializeAvailability(days: string[], time: string): string {
  const parts: string[] = []
  if (days.length) parts.push(days.join(', '))
  if (time) parts.push(time)
  return parts.join(' — ')
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormData {
  full_name: string
  email: string
  phone: string
  preferred_locations: string
  travel_distance_miles: string
  availability_days: string[]
  availability_time: string
  notes: string
  status: PoolStatus
}

const EMPTY_FORM: FormData = {
  full_name: '', email: '', phone: '',
  preferred_locations: '', travel_distance_miles: '',
  availability_days: [], availability_time: '',
  notes: '', status: 'available',
}

interface EntryFormProps {
  initial?: CoachPoolEntry | null
  prefill?: { full_name: string; email: string; phone: string }
  selfService?: boolean
  onSave: (entry: CoachPoolEntry) => void
  onCancel: () => void
}

function EntryForm({ initial, prefill, selfService, onSave, onCancel }: EntryFormProps) {
  const [form, setForm] = useState<FormData>(() => {
    if (initial) {
      const { days, time } = parseAvailability(initial.availability)
      return {
        full_name: initial.full_name,
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        preferred_locations: initial.preferred_locations ?? '',
        travel_distance_miles: initial.travel_distance_miles?.toString() ?? '',
        availability_days: days,
        availability_time: time,
        notes: initial.notes ?? '',
        status: initial.status,
      }
    }
    return { ...EMPTY_FORM, ...(prefill ?? {}) }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Name is required'); return }
    setSaving(true); setError(null)
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      preferred_locations: form.preferred_locations.trim() || null,
      travel_distance_miles: form.travel_distance_miles ? parseInt(form.travel_distance_miles) : null,
      availability: serializeAvailability(form.availability_days, form.availability_time) || null,
      notes: selfService ? null : (form.notes.trim() || null),
      status: selfService ? ('available' as PoolStatus) : form.status,
    }
    const result = initial
      ? await supabase.from('coach_pool').update(payload).eq('id', initial.id).select().single()
      : await supabase.from('coach_pool').insert(payload).select().single()
    if (result.error) { setError(result.error.message); setSaving(false); return }
    onSave(result.data as CoachPoolEntry)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {initial ? 'Edit Availability' : selfService ? 'Add My Availability' : 'Add to Coach Pool'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

          {!selfService && (
            <>
              <Input label="Full Name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
              <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
              <Input label="Phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="07700 900000" />
            </>
          )}

          <Input
            label="Preferred Locations / Areas"
            value={form.preferred_locations}
            onChange={e => set('preferred_locations', e.target.value)}
            placeholder="e.g. Salisbury, Amesbury, Andover"
          />
          <Input
            label="Max Travel Distance (miles)"
            type="number"
            value={form.travel_distance_miles}
            onChange={e => set('travel_distance_miles', e.target.value)}
            placeholder="e.g. 15"
          />

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Available Days</p>
            <div className="flex gap-2 flex-wrap">
              {AVAIL_DAYS.map(day => {
                const selected = form.availability_days.includes(day)
                return (
                  <button key={day} type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      availability_days: selected
                        ? f.availability_days.filter(d => d !== day)
                        : [...f.availability_days, day],
                    }))}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                      selected ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >{day}</button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Time of Day</p>
            <div className="flex gap-2 flex-wrap">
              {AVAIL_TIMES.map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, availability_time: f.availability_time === t ? '' : t }))}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                    form.availability_time === t ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          {!selfService && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
                <div className="flex gap-2">
                  {ALL_STATUSES.map(s => (
                    <button key={s} onClick={() => set('status', s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        form.status === s ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >{STATUS_LABELS[s]}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Notes</p>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Any additional info, interview notes, skills…" rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] resize-none"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pb-4">
            <Button variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            <Button fullWidth onClick={handleSave} disabled={saving}>
              <Check size={18} />{saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Coach card ───────────────────────────────────────────────────────────────

interface CoachCardProps {
  entry: CoachPoolEntry
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

function CoachCard({ entry, canEdit, onEdit, onDelete }: CoachCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border-l-4 ${STATUS_BORDER[entry.status]} shadow-sm overflow-hidden`}>
      <button className="w-full text-left px-4 pt-4 pb-3 flex items-start gap-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm">{entry.full_name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[entry.status]}`}>
              {STATUS_LABELS[entry.status]}
            </span>
          </div>
          {entry.preferred_locations && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
              <MapPin size={12} /><span className="truncate">{entry.preferred_locations}</span>
            </div>
          )}
          {entry.travel_distance_miles != null && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Navigation size={12} /><span>Up to {entry.travel_distance_miles} miles</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-50 pt-3">
          {entry.availability && (
            <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Availability: </span>{entry.availability}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {entry.email && (
              <a href={`mailto:${entry.email}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                <Mail size={13} />{entry.email}
              </a>
            )}
            {entry.phone && (
              <a href={`tel:${entry.phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
                <Phone size={13} />{entry.phone}
              </a>
            )}
          </div>
          {entry.notes && <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">{entry.notes}</p>}
          {canEdit && (
            <div className="flex gap-2 mt-1">
              <button onClick={onEdit}
                className="flex-1 text-xs font-semibold text-[#1a3a6b] border border-[#1a3a6b] rounded-xl py-2 hover:bg-[#1a3a6b] hover:text-white transition-colors">
                Edit
              </button>
              {confirmDelete ? (
                <button onClick={onDelete} className="flex-1 text-xs font-semibold text-white bg-red-500 rounded-xl py-2">
                  Confirm delete
                </button>
              ) : (
                <button onClick={() => setConfirmDelete(true)}
                  className="flex-1 text-xs font-semibold text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50 transition-colors">
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Summary / By Day view ────────────────────────────────────────────────────

function SummaryView({ entries }: { entries: CoachPoolEntry[] }) {
  const available = entries.filter(e => e.status === 'available')

  const byDay: Record<string, CoachPoolEntry[]> = Object.fromEntries(AVAIL_DAYS.map(d => [d, []]))
  available.forEach(entry => {
    parseAvailability(entry.availability).days.forEach(day => byDay[day]?.push(entry))
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Coverage grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {AVAIL_DAYS.map(day => {
          const n = byDay[day].length
          return (
            <div key={day} className={`rounded-2xl p-3 text-center border ${n > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{day}</p>
              <p className={`text-2xl font-extrabold mt-1 ${n > 0 ? 'text-green-700' : 'text-gray-300'}`}>{n}</p>
              <p className="text-[10px] text-gray-400">{n === 1 ? 'coach' : 'coaches'}</p>
            </div>
          )
        })}
      </div>

      {/* Per-day coach lists */}
      {AVAIL_DAYS.filter(d => byDay[d].length > 0).map(day => (
        <div key={day}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-800 text-sm">{day}</h3>
            <span className="text-xs text-gray-400">{byDay[day].length} available</span>
          </div>
          <div className="flex flex-col gap-2">
            {byDay[day].map(entry => {
              const { time } = parseAvailability(entry.availability)
              return (
                <div key={entry.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{entry.full_name}</p>
                    {entry.preferred_locations && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="shrink-0" />{entry.preferred_locations}
                      </p>
                    )}
                  </div>
                  {time && (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shrink-0">{time}</span>
                  )}
                  <div className="flex gap-2 shrink-0">
                    {entry.email && (
                      <a href={`mailto:${entry.email}`} className="text-blue-500 hover:text-blue-700">
                        <Mail size={15} />
                      </a>
                    )}
                    {entry.phone && (
                      <a href={`tel:${entry.phone}`} className="text-green-600 hover:text-green-800">
                        <Phone size={15} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {available.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No available coaches yet.</p>
      )}
    </div>
  )
}

// ─── My Availability view (coaching staff self-service) ───────────────────────

interface MyAvailProps {
  fullName: string
  email: string
  phone: string
}

function MyAvailabilityView({ fullName, email, phone }: MyAvailProps) {
  const [entry, setEntry] = useState<CoachPoolEntry | null | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!email) { setEntry(null); return }
    supabase.from('coach_pool').select('*').eq('email', email).maybeSingle()
      .then(({ data }) => setEntry((data as CoachPoolEntry) ?? null))
  }, [email])

  if (entry === undefined) return <p className="text-sm text-gray-400 text-center py-8">Loading…</p>

  const { days, time } = parseAvailability(entry?.availability ?? null)

  return (
    <>
      {entry ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900">{entry.full_name}</p>
              <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[entry.status]}`}>
                {STATUS_LABELS[entry.status]}
              </span>
            </div>
            <button onClick={() => setShowForm(true)}
              className="text-xs font-semibold text-[#1a3a6b] border border-[#1a3a6b] rounded-xl px-3 py-1.5 hover:bg-[#1a3a6b] hover:text-white transition-colors">
              Edit
            </button>
          </div>

          {entry.preferred_locations && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
              <MapPin size={14} className="text-gray-400 shrink-0" />{entry.preferred_locations}
            </div>
          )}

          {days.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {days.map(d => (
                <span key={d} className="bg-[#1a3a6b] text-white text-xs font-semibold px-2.5 py-1 rounded-lg">{d}</span>
              ))}
              {time && <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">{time}</span>}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No availability set — tap Edit to add your days.</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-700 mb-1">You're not in the coach pool yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your available locations and days so the team knows when you can cover sessions.</p>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={16} /> Add My Availability
          </Button>
        </div>
      )}

      {showForm && (
        <EntryForm
          initial={entry}
          prefill={{ full_name: fullName, email, phone }}
          selfService
          onSave={saved => { setEntry(saved); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CoachPoolPage() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState<CoachPoolEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<PoolStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CoachPoolEntry | null>(null)
  const [tab, setTab] = useState<'list' | 'summary'>('list')

  const isManagement = ['director', 'area_lead', 'outreach_worker'].includes(profile?.role ?? '')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('coach_pool').select('*').order('full_name')
    setEntries((data as CoachPoolEntry[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function handleSaved(entry: CoachPoolEntry) {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = entry; return n }
      return [...prev, entry].sort((a, b) => a.full_name.localeCompare(b.full_name))
    })
    setShowForm(false); setEditing(null)
  }

  async function handleDelete(id: string) {
    await supabase.from('coach_pool').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  // ── Coach self-service view ─────────────────────────────────────────────────
  if (!isManagement) {
    return (
      <Layout title="My Availability">
        <div className="px-4 pt-6 pb-6 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a6b]">My Availability</h2>
            <p className="text-sm text-gray-500 mt-0.5">Let the team know when and where you can cover sessions.</p>
          </div>
          <MyAvailabilityView
            fullName={profile?.full_name ?? ''}
            email={profile?.email ?? ''}
            phone={profile?.phone ?? ''}
          />
        </div>
      </Layout>
    )
  }

  // ── Management view ─────────────────────────────────────────────────────────
  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || e.full_name.toLowerCase().includes(q)
      || (e.preferred_locations ?? '').toLowerCase().includes(q)
      || (e.email ?? '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: entries.length,
    available: entries.filter(e => e.status === 'available').length,
    placed: entries.filter(e => e.status === 'placed').length,
    inactive: entries.filter(e => e.status === 'inactive').length,
  }

  return (
    <Layout title="Coach Pool">
      <div className="px-4 pt-6 flex flex-col gap-4 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{counts.available} available · {entries.length} total</p>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <UserPlus size={16} /> Add Coach
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { key: 'list', label: 'List', icon: List },
            { key: 'summary', label: 'By Day', icon: CalendarDays },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Summary tab */}
        {tab === 'summary' && (
          loading
            ? <Card><p className="text-sm text-gray-500 text-center py-4">Loading…</p></Card>
            : <SummaryView entries={entries} />
        )}

        {/* List tab */}
        {tab === 'list' && (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search by name or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] placeholder:text-gray-400"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {(['all', ...ALL_STATUSES] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filterStatus === s ? 'bg-[#1a3a6b] text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s]} ({counts[s]})
                </button>
              ))}
            </div>

            {loading ? (
              <Card><p className="text-sm text-gray-500 text-center py-4">Loading…</p></Card>
            ) : filtered.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-500 text-center py-4">
                  {entries.length === 0 ? 'No coaches in the pool yet. Add your first one!' : 'No coaches match your search.'}
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(entry => (
                  <CoachCard
                    key={entry.id}
                    entry={entry}
                    canEdit
                    onEdit={() => { setEditing(entry); setShowForm(true) }}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <EntryForm
          initial={editing}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </Layout>
  )
}
