import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, ChevronLeft, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { School, Profile, ClubTerm } from '../../types'
import { ProfilePhoto } from '../../components/ui/ProfilePhoto'

interface ClubData {
  school: School
  leadCoach: Profile | null
  activeTerm: ClubTerm | null
  confirmedCount: number
}

function termWindowLabel(term: ClubTerm): { label: string; colour: string; open: boolean } {
  const today = new Date(); today.setHours(0,0,0,0)
  const termEnd = new Date(term.end_date)
  if (today > termEnd) return { label: 'Term ended', colour: 'text-gray-400', open: false }
  const openDate = term.open_booking_opens ? new Date(term.open_booking_opens) : null
  const priorityDate = term.priority_booking_opens ? new Date(term.priority_booking_opens) : null
  if (openDate && today >= openDate) return { label: 'Open booking now', colour: 'text-green-700', open: true }
  if (priorityDate && today >= priorityDate) return { label: 'Priority booking open', colour: 'text-blue-700', open: true }
  if (priorityDate) return {
    label: `Booking opens ${priorityDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    colour: 'text-amber-600', open: false,
  }
  return { label: 'Booking not yet open', colour: 'text-gray-500', open: false }
}

export function PortalClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<ClubData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      const [schoolRes, assignRes, termRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', id).single(),
        supabase
          .from('staff_school_assignments')
          .select('staff:profiles(id,full_name,photo_url,area)')
          .eq('school_id', id)
          .eq('is_lead', true)
          .maybeSingle(),
        supabase
          .from('club_terms')
          .select('*')
          .eq('school_id', id)
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .lt('start_date', `${new Date().getFullYear()}-07-01`) // exclude summer camps
          .order('start_date')
          .limit(1)
          .maybeSingle(),
      ])

      if (!schoolRes.data) { navigate('/portal/clubs'); return }
      const activeTerm = (termRes.data ?? null) as ClubTerm | null

      let confirmedCount = 0
      if (activeTerm) {
        const { count } = await supabase
          .from('parent_bookings')
          .select('id', { count: 'exact', head: true })
          .eq('club_term_id', activeTerm.id)
          .eq('status', 'confirmed')
        confirmedCount = count ?? 0
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leadCoach = (assignRes.data as any)?.staff ?? null
      setData({ school: schoolRes.data as School, leadCoach, activeTerm, confirmedCount })
      setLoading(false)
    }
    load()
  }, [id, navigate])

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex justify-center items-center py-32">
          <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    )
  }

  if (!data) return null

  const { school, leadCoach, activeTerm, confirmedCount } = data
  const spotsLeft = activeTerm ? activeTerm.capacity - confirmedCount : 0
  const termWindow = activeTerm ? termWindowLabel(activeTerm) : null
  const FALLBACK_BOOKING_URL = 'https://www.activeschool.org.uk/classes'
  const bookingUrl = school.wix_booking_url || FALLBACK_BOOKING_URL

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/portal/clubs')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> All clubs
        </button>

        {/* Club header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight mb-1">{school.name}</h1>
              {school.school_type && (
                <span className="text-[#f5c518] text-xs font-semibold capitalize">
                  {school.school_type.replace('_', ' ')} school
                </span>
              )}
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/Untitled-2 (1).png" alt="Active School" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-5">
            {school.area && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin size={14} className="text-[#f5c518]" /> {school.area}
              </div>
            )}
            {school.session_day && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar size={14} className="text-[#f5c518]" /> {school.session_day}
              </div>
            )}
            {school.session_time && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock size={14} className="text-[#f5c518]" /> {school.session_time}
              </div>
            )}
          </div>
        </div>

        {/* Term card */}
        {activeTerm ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-gray-800">{activeTerm.term_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activeTerm.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {' – '}
                  {new Date(activeTerm.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{activeTerm.num_sessions} sessions
                </p>
              </div>
              <p className="text-xl font-extrabold text-[#1a3a6b] shrink-0">
                £{(activeTerm.price_pence / 100).toFixed(0)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {spotsLeft <= 0 ? 'Full' : `${spotsLeft} space${spotsLeft !== 1 ? 's' : ''} left`}
                </span>
              </div>
              {termWindow && (
                <p className={`text-xs font-semibold ${termWindow.colour}`}>{termWindow.label}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-gray-500">No upcoming term available yet. Check back soon.</p>
          </div>
        )}

        {/* Lead coach */}
        {leadCoach && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1a3a6b] flex items-center justify-center overflow-hidden shrink-0">
              {leadCoach.photo_url ? (
                <ProfilePhoto photoUrl={leadCoach.photo_url} alt={leadCoach.full_name} />
              ) : (
                <span className="text-white font-bold text-lg">{leadCoach.full_name[0]}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Lead Coach</p>
              <p className="font-bold text-gray-800">{leadCoach.full_name}</p>
              {leadCoach.area && <p className="text-xs text-gray-500">{leadCoach.area} area</p>}
            </div>
            <div className="ml-auto">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">DBS Checked</span>
            </div>
          </div>
        )}

        {/* What to expect */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">What to Expect</h2>
          <div className="space-y-2.5">
            {[
              'Expert coaching from qualified, DBS-checked staff',
              'Multi-sport programme covering a range of activities',
              'UKAG Award Pathway (Level 1–6) to recognise achievement',
              'Inclusive sessions suitable for all ability levels',
              'Safe, structured environment with safeguarding trained coaches',
            ].map(point => (
              <div key={point} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-[#1a3a6b] mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking CTA */}
        <div className="bg-[#f5c518]/10 border border-[#f5c518] rounded-xl p-5">
          <h2 className="font-bold text-[#1a3a6b] mb-1">Book a place</h2>
          <p className="text-sm text-gray-600 mb-4">
            Book online via our website — quick and easy, no account required.
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#1a3a6b] text-white font-bold py-3 rounded-xl hover:bg-[#142f58] transition-colors text-sm"
          >
            Book Now <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </PortalLayout>
  )
}
