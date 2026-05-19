import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Mail, Phone, RefreshCw, Edit2, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Club, Profile, ClubStatus } from '../../types'

const STATUS_COLOURS: Record<ClubStatus, string> = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  lapsed: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
}

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile: me } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Club>>({})
  const [saving, setSaving] = useState(false)

  const isAdmin = me?.role === 'admin'

  useEffect(() => {
    if (id) loadData(id)
  }, [id])

  async function loadData(clubId: string) {
    const [clubRes, coachesRes] = await Promise.all([
      supabase.from('clubs').select('*').eq('id', clubId).single(),
      supabase.from('profiles').select('*').eq('club_id', clubId).order('full_name'),
    ])
    setClub(clubRes.data)
    setForm(clubRes.data ?? {})
    setCoaches(coachesRes.data ?? [])
    setLoading(false)
  }

  async function saveEdits() {
    if (!id) return
    setSaving(true)
    await supabase.from('clubs').update(form).eq('id', id)
    setClub(c => c ? { ...c, ...form } as Club : c)
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" />
        </div>
      </Layout>
    )
  }

  if (!club) {
    return (
      <Layout>
        <div className="text-center py-16 text-gray-500">Club not found.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/clubs" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 min-w-0 truncate">{club.name}</h1>
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-ukag-600 hover:text-ukag-800 border border-ukag-200 hover:border-ukag-400 px-3 py-1.5 rounded-lg transition-colors">
              <Edit2 size={14} /> Edit
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X size={18} /></button>
              <button onClick={saveEdits} disabled={saving} className="flex items-center gap-1.5 bg-ukag-600 hover:bg-ukag-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                <Check size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Club Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {editing ? (
                  <>
                    <EditField label="Club name" value={form.name ?? ''} onChange={v => setForm(f => ({ ...f, name: v }))} />
                    <EditField label="Licence number" value={form.licence_number ?? ''} onChange={v => setForm(f => ({ ...f, licence_number: v }))} />
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClubStatus }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                        <option value="lapsed">Lapsed</option>
                      </select>
                    </div>
                    <EditField label="Affiliation date" value={form.affiliation_date ?? ''} type="date" onChange={v => setForm(f => ({ ...f, affiliation_date: v }))} />
                    <EditField label="Renewal date" value={form.renewal_date ?? ''} type="date" onChange={v => setForm(f => ({ ...f, renewal_date: v }))} />
                  </>
                ) : (
                  <>
                    <InfoItem label="Licence number" value={club.licence_number} />
                    <InfoItem label="Status" value={
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[club.status]}`}>
                        {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                      </span>
                    } />
                    <InfoItem label="Disciplines" value={club.disciplines.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} />
                    <InfoItem label="Affiliation date" value={club.affiliation_date ? new Date(club.affiliation_date).toLocaleDateString('en-GB') : undefined} />
                    <InfoItem label="Renewal date" value={club.renewal_date ? new Date(club.renewal_date).toLocaleDateString('en-GB') : undefined} />
                  </>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
              {editing ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <EditField label="Contact name" value={form.contact_name ?? ''} onChange={v => setForm(f => ({ ...f, contact_name: v }))} />
                  <EditField label="Email" value={form.contact_email ?? ''} type="email" onChange={v => setForm(f => ({ ...f, contact_email: v }))} />
                  <EditField label="Phone" value={form.contact_phone ?? ''} onChange={v => setForm(f => ({ ...f, contact_phone: v }))} />
                  <EditField label="Address" value={form.address ?? ''} onChange={v => setForm(f => ({ ...f, address: v }))} />
                  <EditField label="Town" value={form.town ?? ''} onChange={v => setForm(f => ({ ...f, town: v }))} />
                  <EditField label="County" value={form.county ?? ''} onChange={v => setForm(f => ({ ...f, county: v }))} />
                  <EditField label="Postcode" value={form.postcode ?? ''} onChange={v => setForm(f => ({ ...f, postcode: v }))} />
                </div>
              ) : (
                <div className="space-y-3">
                  {club.contact_name && <div className="font-medium text-gray-900">{club.contact_name}</div>}
                  {club.contact_email && (
                    <a href={`mailto:${club.contact_email}`} className="flex items-center gap-2 text-sm text-ukag-600 hover:underline">
                      <Mail size={14} /> {club.contact_email}
                    </a>
                  )}
                  {club.contact_phone && (
                    <a href={`tel:${club.contact_phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                      <Phone size={14} /> {club.contact_phone}
                    </a>
                  )}
                  {(club.address || club.town || club.county || club.postcode) && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        {club.address && <div>{club.address}</div>}
                        <div>{[club.town, club.county, club.postcode].filter(Boolean).join(', ')}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Renewal alert */}
            {club.renewal_date && (
              <div className={`rounded-xl border p-4 ${
                isExpiringSoon(club.renewal_date) ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw size={14} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Renewal Date</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(club.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {isExpiringSoon(club.renewal_date) && (
                  <div className="text-amber-700 text-xs mt-1">Renewal due within 90 days</div>
                )}
              </div>
            )}

            {/* Coaches at this club */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Coaches ({coaches.length})</h3>
              {coaches.length === 0 ? (
                <p className="text-gray-400 text-sm">No coaches assigned</p>
              ) : (
                <div className="space-y-2">
                  {coaches.map(c => (
                    <Link key={c.id} to={`/coaches/${c.id}`} className="flex items-center gap-2 text-sm hover:text-ukag-600 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-ukag-100 flex items-center justify-center text-xs font-medium text-ukag-700">
                        {c.full_name.charAt(0)}
                      </div>
                      {c.full_name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function InfoItem({ label, value }: { label: string; value?: string | React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
    </div>
  )
}

function isExpiringSoon(date: string) {
  return new Date(date).getTime() - Date.now() < 90 * 86400000
}
