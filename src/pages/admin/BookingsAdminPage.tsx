import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import type { School, ParentBooking, ClubTerm } from '../../types'

const STATUS_CONF = {
  confirmed:       { label: 'Confirmed',        colour: 'bg-green-100 text-green-700' },
  pending_payment: { label: 'Pending payment',  colour: 'bg-amber-100 text-amber-700' },
  cancelled:       { label: 'Cancelled',        colour: 'bg-gray-100 text-gray-400' },
  refunded:        { label: 'Refunded',         colour: 'bg-gray-100 text-gray-400' },
}

interface BookingRow extends ParentBooking {
  parent_profile?: { full_name: string; email: string }
}

export function BookingsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [terms, setTerms] = useState<ClubTerm[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSchool, setFilterSchool] = useState('')
  const [filterTerm, setFilterTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('confirmed')

  useEffect(() => {
    loadAll()
  }, [])

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

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking? The parent will need to be refunded manually via Stripe.')) return
    await supabase.from('parent_bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  const filteredTerms = filterSchool
    ? terms.filter(t => t.school_id === filterSchool)
    : terms

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
      ['Child Name', 'Year Group', 'Class', 'Additional Needs', 'School', 'Term', 'Status', 'Amount', 'Parent Name', 'Parent Email', 'Date'],
      ...filtered.map(b => {
        const school = (b.school as any)?.name ?? ''
        const term = (b.club_term as any)?.term_name ?? ''
        const parent = b.parent_profile as any
        return [
          b.child_name,
          b.child_year_group ?? '',
          b.child_class ?? '',
          b.child_additional_needs ?? '',
          school,
          term,
          b.status,
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

        {/* Summary */}
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

        {/* Filters */}
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

        {/* Export */}
        {filtered.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] self-end"
          >
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
            const parent = b.parent_profile as any
            const conf = STATUS_CONF[b.status]
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-[#1a3a6b]">{b.child_name}</p>
                    <p className="text-xs text-gray-500">
                      {[b.child_year_group, b.child_class].filter(Boolean).join(' · ')}
                      {b.child_additional_needs && ` · ⚠ ${b.child_additional_needs}`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${conf.colour}`}>
                    {conf.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{school} · {term?.term_name}</p>
                {parent && (
                  <p className="text-xs text-gray-400">Parent: {parent.full_name} · {parent.email}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  {b.amount_pence && (
                    <span className="text-xs font-semibold text-green-700">£{(b.amount_pence / 100).toFixed(2)}</span>
                  )}
                  <span className="text-xs text-gray-300">{new Date(b.created_at).toLocaleDateString('en-GB')}</span>
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </Layout>
  )
}
