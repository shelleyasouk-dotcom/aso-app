import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, ChevronLeft, BookOpen, CheckCircle, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { School, Profile } from '../../types'

interface ClubData {
  school: School
  leadCoach: Profile | null
  childCount: number
  sessionCount: number
}

export function PortalClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<ClubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      const [schoolRes, assignRes, childRes, sessionRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', id).single(),
        supabase
          .from('staff_school_assignments')
          .select('staff:profiles(id,full_name,photo_url,area)')
          .eq('school_id', id)
          .eq('is_lead', true)
          .maybeSingle(),
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('school_id', id).eq('is_active', true),
        supabase.from('session_registers').select('id', { count: 'exact', head: true }).eq('school_id', id),
      ])

      if (!schoolRes.data) { navigate('/portal/clubs'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leadCoach = (assignRes.data as any)?.staff ?? null
      setData({
        school: schoolRes.data as School,
        leadCoach: leadCoach as Profile | null,
        childCount: childRes.count ?? 0,
        sessionCount: sessionRes.count ?? 0,
      })
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

  const { school, leadCoach, childCount, sessionCount } = data

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/portal/clubs')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          All clubs
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
                <MapPin size={14} className="text-[#f5c518]" />
                {school.area}
              </div>
            )}
            {school.session_day && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar size={14} className="text-[#f5c518]" />
                {school.session_day}
              </div>
            )}
            {school.session_time && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock size={14} className="text-[#f5c518]" />
                {school.session_time}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1a3a6b]">{childCount}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Users size={11} />
              Active members
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1a3a6b]">{sessionCount}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <BookOpen size={11} />
              Sessions run
            </p>
          </div>
        </div>

        {/* Lead coach */}
        {leadCoach && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1a3a6b] flex items-center justify-center overflow-hidden shrink-0">
              {leadCoach.photo_url ? (
                <img src={leadCoach.photo_url} alt={leadCoach.full_name} className="w-full h-full object-cover" />
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
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                DBS Checked
              </span>
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
              'UKAG award progression to recognise achievement',
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
        <div className="bg-[#f5c518]/10 border border-[#f5c518] rounded-xl p-5 text-center">
          <h2 className="font-bold text-[#1a3a6b] mb-1">Interested in joining?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Book your child's place at {school.name}'s ASO club.
          </p>
          <button
            onClick={() => setShowBooking(true)}
            className="bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors w-full sm:w-auto"
          >
            Book a Place
          </button>
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowBooking(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-900">Book a Place</h3>
              <button onClick={() => setShowBooking(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-blue-800 font-semibold mb-1">Online booking coming soon!</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                We're setting up our online booking system. In the meantime, please contact your school office or speak to the ASO coach directly to reserve your child's place.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-[#1a3a6b] font-bold text-xs shrink-0">1</div>
                <p>Contact the school office and ask about ASO after-school clubs.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-[#1a3a6b] font-bold text-xs shrink-0">2</div>
                <p>Complete the registration form provided by the school or ASO coach.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-[#1a3a6b] font-bold text-xs shrink-0">3</div>
                <p>Your child will be added to the next available session.</p>
              </div>
            </div>
            <button
              onClick={() => setShowBooking(false)}
              className="mt-5 w-full bg-[#1a3a6b] text-white font-bold py-3 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
