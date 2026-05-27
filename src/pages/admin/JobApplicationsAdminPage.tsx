import { useState, useEffect, useCallback } from 'react'
import { Search, Mail, Phone, MapPin, ChevronDown, ChevronUp, X, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'

interface Application {
  id: string
  job_advert_id: string | null
  full_name: string
  email: string
  phone: string | null
  address: string | null
  cover_letter: string | null
  experience: string | null
  qualifications: string | null
  availability: string | null
  dbs_status: string | null
  how_heard: string | null
  join_pool: boolean
  preferred_locations: string | null
  travel_distance_miles: number | null
  status: AppStatus
  notes: string | null
  created_at: string
  job_advert?: { title: string; location: string } | null
}

const STATUS_LABELS: Record<AppStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
}

const STATUS_CHIP: Record<AppStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-gray-100 text-gray-600',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  hired: 'bg-[#1a3a6b] text-white',
}

const ALL_STATUSES: AppStatus[] = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired']

const DBS_LABELS: Record<string, string> = {
  enhanced_dbs: 'Enhanced DBS ✓',
  basic_dbs: 'Basic DBS',
  in_progress: 'DBS in progress',
  none: 'No DBS yet',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Application card ─────────────────────────────────────────────────────────

function AppCard({ app, onUpdate }: { app: Application; onUpdate: (updated: Application) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(app.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)

  async function updateStatus(status: AppStatus) {
    const { data } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', app.id)
      .select()
      .single()
    if (data) onUpdate(data as Application)
  }

  async function saveNotes() {
    setSavingNotes(true)
    const { data } = await supabase
      .from('job_applications')
      .update({ notes: notes.trim() || null })
      .eq('id', app.id)
      .select()
      .single()
    setSavingNotes(false)
    setEditingNotes(false)
    if (data) onUpdate(data as Application)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        className="w-full text-left px-4 pt-4 pb-3 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-gray-900 text-sm">{app.full_name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[app.status]}`}>
              {STATUS_LABELS[app.status]}
            </span>
            {app.join_pool && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                <Users size={10} /> Pool
              </span>
            )}
          </div>
          {app.job_advert && (
            <p className="text-xs text-[#1a3a6b] font-medium mb-0.5">{app.job_advert.title} — {app.job_advert.location}</p>
          )}
          <p className="text-xs text-gray-500">{fmtDate(app.created_at)}</p>
          {app.address && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <MapPin size={10} />{app.address}
            </div>
          )}
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-1" />}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 flex flex-col gap-3">

          {/* Contact */}
          <div className="flex gap-2 flex-wrap">
            {app.email && (
              <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                <Mail size={12} />{app.email}
              </a>
            )}
            {app.phone && (
              <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
                <Phone size={12} />{app.phone}
              </a>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Availability', value: app.availability },
              { label: 'DBS', value: app.dbs_status ? (DBS_LABELS[app.dbs_status] ?? app.dbs_status) : null },
              { label: 'How heard', value: app.how_heard },
              { label: 'Qualifications', value: app.qualifications },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">{f.label}</p>
                <p className="text-xs text-gray-800 leading-relaxed">{f.value}</p>
              </div>
            ))}
          </div>

          {app.experience && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Experience</p>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 rounded-xl px-3 py-2">{app.experience}</p>
            </div>
          )}

          {app.cover_letter && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Cover Letter</p>
              <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 rounded-xl px-3 py-2">{app.cover_letter}</p>
            </div>
          )}

          {app.join_pool && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
              <p className="text-xs font-bold text-purple-700 mb-0.5">Coach Pool Registration</p>
              <p className="text-xs text-purple-600">
                {app.preferred_locations && `Preferred: ${app.preferred_locations}`}
                {app.travel_distance_miles && ` · Up to ${app.travel_distance_miles} miles`}
              </p>
            </div>
          )}

          {/* Internal notes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Internal Notes</p>
            {editingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes visible only to staff…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-[#1a3a6b]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes ? 'Saving…' : 'Save notes'}
                  </Button>
                  <button onClick={() => { setEditingNotes(false); setNotes(app.notes ?? '') }} className="text-xs text-gray-500 hover:text-gray-800 font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full text-left text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                {app.notes || 'Click to add notes…'}
              </button>
            )}
          </div>

          {/* Status buttons */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                    app.status === s
                      ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function JobApplicationsAdminPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'all'>('all')
  const [filterJob, setFilterJob] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('job_applications')
      .select('*, job_advert:job_adverts(title, location)')
      .order('created_at', { ascending: false })
    setApps((data as Application[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function handleUpdate(updated: Application) {
    setApps(prev => prev.map(a => a.id === updated.id ? updated : a))
  }

  // Unique jobs for filter
  const jobs = [...new Map(
    apps
      .filter(a => a.job_advert)
      .map(a => [a.job_advert_id, a.job_advert!.title])
  ).entries()]

  const filtered = apps.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || a.full_name.toLowerCase().includes(q)
      || (a.email ?? '').toLowerCase().includes(q)
      || (a.address ?? '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const matchJob = !filterJob || a.job_advert_id === filterJob
    return matchSearch && matchStatus && matchJob
  })

  const counts: Record<string, number> = {
    all: apps.length,
    ...Object.fromEntries(ALL_STATUSES.map(s => [s, apps.filter(a => a.status === s).length])),
  }

  return (
    <Layout title="Applications">
      <div className="px-4 pt-6 flex flex-col gap-4 pb-6">

        {/* Summary */}
        <p className="text-gray-500 text-sm">{counts.new} new · {counts.shortlisted} shortlisted · {apps.length} total</p>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', ...ALL_STATUSES] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterStatus === s
                    ? 'bg-[#1a3a6b] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]} ({counts[s]})
              </button>
            ))}
          </div>

          {jobs.length > 0 && (
            <select
              value={filterJob}
              onChange={e => setFilterJob(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#1a3a6b] ml-auto"
            >
              <option value="">All vacancies</option>
              {jobs.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          )}
        </div>

        {/* List */}
        {loading ? (
          <Card><p className="text-sm text-gray-500 text-center py-4">Loading…</p></Card>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500 text-center py-4">
              {apps.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(app => (
              <AppCard key={app.id} app={app} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
