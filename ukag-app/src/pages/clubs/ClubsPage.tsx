import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Building2, MapPin, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Club, ClubStatus } from '../../types'

const STATUS_COLOURS: Record<ClubStatus, string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  lapsed: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
}

export function ClubsPage() {
  const { profile } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [filtered, setFiltered] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClubStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadClubs()
  }, [])

  useEffect(() => {
    let result = clubs
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.town?.toLowerCase().includes(q) ||
        c.county?.toLowerCase().includes(q) ||
        c.licence_number?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }
    setFiltered(result)
  }, [clubs, search, statusFilter])

  async function loadClubs() {
    setLoading(true)
    const query = supabase.from('clubs').select('*').order('name')
    if (profile?.role === 'club_manager' && profile.club_id) {
      query.eq('id', profile.club_id)
    }
    const { data } = await query
    setClubs(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Affiliated Clubs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{filtered.length} club{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-ukag-600 hover:bg-ukag-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add Club
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 focus:border-ukag-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ClubStatus | 'all')}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ukag-500"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="lapsed">Lapsed</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No clubs found</p>
            {search && <p className="text-sm mt-1">Try a different search term</p>}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(club => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-ukag-200 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-ukag-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-ukag-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{club.name}</div>
                  {(club.town || club.county) && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                      <MapPin size={12} />
                      {[club.town, club.county].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[club.status]}`}>
                      {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                    </span>
                    {club.disciplines.map(d => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-ukag-50 text-ukag-700">
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                {club.renewal_date && (
                  <div className="text-right text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <RefreshCw size={11} />
                      Renews
                    </div>
                    <div className="font-medium text-gray-600">
                      {new Date(club.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAddModal && isAdmin && (
        <AddClubModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); loadClubs() }} />
      )}
    </Layout>
  )
}

function AddClubModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', contact_name: '', contact_email: '', contact_phone: '',
    town: '', county: '', postcode: '', address: '',
    status: 'active' as ClubStatus,
    affiliation_date: '', renewal_date: '', licence_number: '',
    disciplines: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleDiscipline(d: string) {
    setForm(f => ({
      ...f,
      disciplines: f.disciplines.includes(d) ? f.disciplines.filter(x => x !== d) : [...f.disciplines, d],
    }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Club name is required'); return }
    if (form.disciplines.length === 0) { setError('Select at least one discipline'); return }
    setSaving(true)
    const { error } = await supabase.from('clubs').insert({
      ...form,
      affiliation_date: form.affiliation_date || null,
      renewal_date: form.renewal_date || null,
    })
    if (error) { setError(error.message); setSaving(false) }
    else onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Add Club</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          <Field label="Club name *">
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className="input" placeholder="e.g. Springfield Gymnastics Club" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Licence number">
              <input value={form.licence_number} onChange={e => set('licence_number', e.target.value)} className="input" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </Field>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disciplines *</label>
            <div className="flex gap-3">
              {['gymnastics', 'trampolining'].map(d => (
                <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.disciplines.includes(d)} onChange={() => toggleDiscipline(d)}
                    className="rounded border-gray-300 text-ukag-600 focus:ring-ukag-500" />
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <Field label="Contact name">
            <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className="input" />
            </Field>
            <Field label="Phone">
              <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={e => set('address', e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Town">
              <input value={form.town} onChange={e => set('town', e.target.value)} className="input" />
            </Field>
            <Field label="County">
              <input value={form.county} onChange={e => set('county', e.target.value)} className="input" />
            </Field>
            <Field label="Postcode">
              <input value={form.postcode} onChange={e => set('postcode', e.target.value)} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Affiliation date">
              <input type="date" value={form.affiliation_date} onChange={e => set('affiliation_date', e.target.value)} className="input" />
            </Field>
            <Field label="Renewal date">
              <input type="date" value={form.renewal_date} onChange={e => set('renewal_date', e.target.value)} className="input" />
            </Field>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Saving…' : 'Add Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
