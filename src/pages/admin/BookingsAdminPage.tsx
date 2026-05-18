import { useState, useEffect } from 'react'
import { Download, ChevronDown, ChevronUp, Phone, Mail, MapPin, User, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import type { School, ParentBooking, ClubTerm, ParentChild } from '../../types'

const STATUS_CONF = {
  confirmed:       { label: 'Confirmed',       colour: 'bg-green-100 text-green-700' },
  pending_payment: { label: 'Pending payment', colour: 'bg-amber-100 text-amber-700' },
  cancelled:       { label: 'Cancelled',       colour: 'bg-gray-100 text-gray-400' },
  refunded:        { label: 'Refunded',        colour: 'bg-gray-100 text-gray-400' },
}

interface BookingRow extends ParentBooking {
  parent_profile?: { full_name: string; email: string }
  child_profile?: ParentChild
}

function DetailRow({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 text-right font-medium">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </span>
    </div>
  )
}

function BookingDetail({ booking }: { booking: BookingRow }) {
  const c = booking.child_profile
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">

      {/* Child */}
      <div>
        <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1 flex items-center gap-1">
          <User size={11} /> Child
        </p>
        <DetailRow label="Full name" value={booking.child_name} />
        <DetailRow label="Date of birth" value={booking.child_dob ? new Date(booking.child_dob).toLocaleDateString('en-GB') : null} />
        <DetailRow label="Year group" value={booking.child_year_group} />
        <DetailRow label="Class" value={booking.child_class} />
        {booking.child_additional_needs && (
          <div className="mt-1 bg-amber-50 rounded-lg px-2 py-1.5 flex items-start gap-1.5">
            <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">{booking.child_additional_needs}</p>
          </div>
        )}
      </div>

      {c && (
        <>
          {/* Parent contact */}
          <div>
            <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1 flex items-center gap-1">
              <Phone size={11} /> Parent / Guardian
            </p>
            <DetailRow label="Name" value={c.parent_name} />
            <DetailRow label="Relationship" value={c.parent_relationship} />
            <DetailRow label="Phone" value={c.parent_phone} />
          </div>

          {/* Address */}
          {(c.address_line1 || c.address_city) && (
            <div>
              <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin size={11} /> Address
              </p>
              <DetailRow label="Address" value={c.address_line1} />
              <DetailRow label="City" value={c.address_city} />
              <DetailRow label="Postcode" value={c.address_postcode} />
            </div>
          )}

          {/* Emergency contacts */}
          {c.emergency_contact_name && (
            <div>
              <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Emergency Contact</p>
              <DetailRow label="Name" value={c.emergency_contact_name} />
              <DetailRow label="Relationship" value={c.emergency_contact_relationship} />
              <DetailRow label="Phone" value={c.emergency_contact_phone} />
            </div>
          )}

          {c.secondary_emergency_name && (
            <div>
              <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Third Contact</p>
              <DetailRow label="Name" value={c.secondary_emergency_name} />
              <DetailRow label="Phone" value={c.secondary_emergency_phone} />
              <DetailRow label="Email" value={c.secondary_emergency_email} />
            </div>
          )}

          {/* Collection */}
          <div>
            <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Collection</p>
            <DetailRow label="Collected by" value={c.collection_person} />
            <DetailRow label="Walk home alone" value={c.walk_home_alone} />
          </div>

          {/* Consents */}
          <div>
            <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Consents</p>
            <DetailRow label="Photo consent" value={c.photo_consent} />
            <DetailRow label="Medically fit" value={booking.medically_fit} />
            <DetailRow label="First aid permission" value={booking.first_aid_permission} />
            <DetailRow label="Fees non-refundable acknowledged" value={booking.fees_acknowledged} />
            <DetailRow label="Policy agreed" value={booking.policy_agreed} />
            {booking.signature_name && (
              <DetailRow label="Signed by" value={`${booking.signature_name} — ${booking.signed_at ? new Date(booking.signed_at).toLocaleDateString('en-GB') : ''}`} />
            )}
          </div>
        </>
      )}

      {/* Account email */}
      {booking.parent_profile && (
        <div>
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1 flex items-center gap-1">
            <Mail size={11} /> Account
          </p>
          <DetailRow label="Name" value={(booking.parent_profile as any).full_name} />
          <DetailRow label="Email" value={(booking.parent_profile as any).email} />
        </div>
      )}
    </div>
  )
}

export function BookingsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [terms, setTerms] = useState<ClubTerm[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSchool, setFilterSchool] = useState('')
  const [filterTerm, setFilterTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('confirmed')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [schoolsRes, termsRes, bookingsRes] = await Promise.all([
      supabase.from('schools').select('id,name,area').order('name'),
      supabase.from('club_terms').select('*').order('start_date', { ascending: false }),
      supabase
        .from('parent_bookings')
        .select('*, school:schools(id,name), club_term:club_terms(id,term_name,start_date,end_date), parent_profile:profiles!parent_id(full_name,email)')
        .order('created_at', { ascending: false }),
    ])
    setSchools((schoolsRes.data ?? []) as School[])
    setTerms((termsRes.data ?? []) as ClubTerm[])
    setBookings((bookingsRes.data ?? []) as BookingRow[])
    setLoading(false)
  }

  async function loadChildProfile(booking: BookingRow) {
    if (!booking.parent_child_id || booking.child_profile) return
    const { data } = await supabase
      .from('parent_children')
      .select('*')
      .eq('id', booking.parent_child_id)
      .single()
    if (data) {
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, child_profile: data as ParentChild } : b))
    }
  }

  function toggleExpand(booking: BookingRow) {
    if (expandedId === booking.id) {
      setExpandedId(null)
    } else {
      setExpandedId(booking.id)
      loadChildProfile(booking)
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking? The parent will need to be refunded manually via Stripe.')) return
    await supabase.from('parent_bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  const filteredTerms = filterSchool ? terms.filter(t => t.school_id === filterSchool) : terms

  const filtered = bookings.filter(b => {
    const school = b.school as any
    if (filterSchool && school?.id !== filterSchool) return false
    if (filterTerm && b.club_term_id !== filterTerm) return false
    if (filterStatus && b.status !== filterStatus) return false
    return true
  })

  const totalRevenue = filtered
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.amount_pence ?? 0), 0)

  function exportCSV() {
    const rows = [
      ['Child Name', 'DOB', 'Year Group', 'Class', 'Additional Needs',
       'Parent Name', 'Parent Phone', 'Address', 'City', 'Postcode',
       'Emergency Contact', 'Emergency Phone',
       'Secondary Contact', 'Secondary Phone', 'Secondary Email',
       'Collection Person', 'Walk Home Alone', 'Photo Consent',
       'Medically Fit', 'First Aid Permission',
       'School', 'Term', 'Status', 'Amount', 'Account Name', 'Account Email', 'Date'],
      ...filtered.map(b => {
        const school = (b.school as any)?.name ?? ''
        const term = (b.club_term as any)?.term_name ?? ''
        const parent = b.parent_profile as any
        const c = b.child_profile
        return [
          b.child_name,
          b.child_dob ? new Date(b.child_dob).toLocaleDateString('en-GB') : '',
          b.child_year_group ?? '',
          b.child_class ?? '',
          b.child_additional_needs ?? '',
          c?.parent_name ?? '',
          c?.parent_phone ?? '',
          c?.address_line1 ?? '',
          c?.address_city ?? '',
          c?.address_postcode ?? '',
          c?.emergency_contact_name ?? '',
          c?.emergency_contact_phone ?? '',
          c?.secondary_emergency_name ?? '',
          c?.secondary_emergency_phone ?? '',
          c?.secondary_emergency_email ?? '',
          c?.collection_person ?? '',
          c?.walk_home_alone === true ? 'Yes' : c?.walk_home_alone === false ? 'No' : '',
          c?.photo_consent === true ? 'Yes' : c?.photo_consent === false ? 'No' : '',
          b.medically_fit === true ? 'Yes' : b.medically_fit === false ? 'No' : '',
          b.first_aid_permission === true ? 'Yes' : b.first_aid_permission === false ? 'No' : '',
          school, term, b.status,
          b.amount_pence ? `£${(b.amount_pence / 100).toFixed(2)}` : '',
          parent?.full_name ?? '',
          parent?.email ?? '',
          new Date(b.created_at).toLocaleDateString('en-GB'),
        ]
      }),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'aso-bookings.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout title="Bookings">
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center py-3">
              <p className="text-2xl font-extrabold text-[#1a3a6b]">{filtered.filter(b => b.status === 'confirmed').length}</p>
              <p className="text-xs text-gray-400">Confirmed</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-2xl font-extrabold text-[#1a3a6b]">{filtered.filter(b => b.status === 'pending_payment').length}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-xl font-extrabold text-green-700">£{(totalRevenue / 100).toFixed(0)}</p>
              <p className="text-xs text-gray-400">Revenue</p>
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Select value={filterSchool} onChange={e => { setFilterSchool(e.target.value); setFilterTerm('') }}>
            <option value="">All Schools</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select value={filterTerm} onChange={e => setFilterTerm(e.target.value)}>
            <option value="">All Terms</option>
            {filteredTerms.map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}
          </Select>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending_payment">Pending payment</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>

        {filtered.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] self-end">
            <Download size={15} /> Export CSV
          </button>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-gray-500 text-sm">No bookings found.</p>
          </Card>
        ) : (
          filtered.map(b => {
            const school = (b.school as any)?.name
            const term = b.club_term as any
            const conf = STATUS_CONF[b.status]
            const isExpanded = expandedId === b.id
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-[#1a3a6b]">{b.child_name}</p>
                    <p className="text-xs text-gray-500">
                      {[b.child_year_group, b.child_class].filter(Boolean).join(' · ')}
                    </p>
                    {b.child_additional_needs && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                        <AlertCircle size={10} /> {b.child_additional_needs}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${conf.colour}`}>
                    {conf.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{school} · {term?.term_name}</p>
                <div className="flex items-center justify-between mt-2">
                  {b.amount_pence && (
                    <span className="text-xs font-semibold text-green-700">£{(b.amount_pence / 100).toFixed(2)}</span>
                  )}
                  <span className="text-xs text-gray-300">{new Date(b.created_at).toLocaleDateString('en-GB')}</span>
                  <div className="flex items-center gap-3">
                    {b.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(b.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(b)}
                      className="flex items-center gap-1 text-xs text-[#1a3a6b] font-medium"
                    >
                      {isExpanded ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> Full details</>}
                    </button>
                  </div>
                </div>
                {isExpanded && <BookingDetail booking={b} />}
              </Card>
            )
          })
        )}
      </div>
    </Layout>
  )
}
