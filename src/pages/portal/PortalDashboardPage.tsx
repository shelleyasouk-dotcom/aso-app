import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LogOut, ChevronRight, BookOpen, FileText, Calendar, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { ParentBooking } from '../../types'

const STATUS_CONF = {
  confirmed:      { label: 'Confirmed', colour: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending_payment:{ label: 'Awaiting payment', colour: 'bg-amber-100 text-amber-700', icon: Clock },
  cancelled:      { label: 'Cancelled', colour: 'bg-gray-100 text-gray-500', icon: null },
  refunded:       { label: 'Refunded', colour: 'bg-gray-100 text-gray-500', icon: null },
}

export function PortalDashboardPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<ParentBooking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (!profile) return
    supabase
      .from('parent_bookings')
      .select('*, school:schools(name), club_term:club_terms(term_name,num_sessions,start_date,end_date)')
      .eq('parent_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data ?? []) as ParentBooking[])
        setLoadingBookings(false)
      })
  }, [profile])

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending_payment')

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl p-1 shrink-0">
                <img src="/Untitled-2 (1).png" alt="Active School" className="h-9 w-9 object-contain" />
              </div>
              <img src="/Untitled-1.png" alt="Active School" className="h-6 object-contain" />
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Hi, {firstName}!</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {activeBookings.length > 0
              ? `You have ${activeBookings.length} active booking${activeBookings.length !== 1 ? 's' : ''}.`
              : 'Welcome to your Community Hub account.'
            }
          </p>
        </div>

        {/* T&C banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">Terms &amp; Conditions</p>
            <p className="text-xs text-amber-700 mt-0.5">Please read before booking — covers fees, cancellations &amp; safeguarding.</p>
          </div>
          <button
            onClick={() => navigate('/portal/terms')}
            className="shrink-0 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            Read
          </button>
        </div>

        {/* My Bookings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#1a3a6b]" />
              <h2 className="font-bold text-gray-800">My Bookings</h2>
            </div>
            <button
              onClick={() => navigate('/portal/clubs')}
              className="text-xs font-semibold text-[#1a3a6b] flex items-center gap-1"
            >
              Find a club <ChevronRight size={12} />
            </button>
          </div>

          {loadingBookings ? (
            <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
          ) : activeBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-gray-300" />
              </div>
              <p className="font-medium text-sm text-gray-500">No active bookings</p>
              <p className="text-xs mt-1 text-gray-400">Find a club and book your child's place.</p>
              <button
                onClick={() => navigate('/portal/clubs')}
                className="mt-4 bg-[#1a3a6b] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
              >
                Browse clubs
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeBookings.map(b => {
                const school = (b.school as any)?.name
                const term = b.club_term as any
                const conf = STATUS_CONF[b.status]
                const Icon = conf.icon
                return (
                  <div key={b.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-gray-800 text-sm">{school}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${conf.colour}`}>
                        {Icon && <Icon size={10} />}
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      {b.child_name}
                      {(b.child_year_group || b.child_class) && ` · ${[b.child_year_group, b.child_class].filter(Boolean).join(' ')}`}
                    </p>
                    {term && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <Calendar size={11} />
                        {term.term_name} · {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' – '}
                        {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                    {b.amount_pence && b.status === 'confirmed' && (
                      <p className="text-xs text-green-700 font-semibold mt-1">
                        £{(b.amount_pence / 100).toFixed(2)} paid
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <h2 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate('/portal/clubs')}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3a6b] transition-colors group text-left"
          >
            <div className="w-10 h-10 bg-[#1a3a6b]/10 rounded-xl flex items-center justify-center shrink-0">
              <Search size={18} className="text-[#1a3a6b]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Find a Club</p>
              <p className="text-xs text-gray-500 mt-0.5">Browse clubs at schools near you</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
          </button>

          <button
            onClick={() => navigate('/portal/sports')}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3a6b] transition-colors group text-left"
          >
            <div className="w-10 h-10 bg-[#f5c518]/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">⚽</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Our Sports</p>
              <p className="text-xs text-gray-500 mt-0.5">See what sports ASO offers</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
          </button>
        </div>
      </div>
    </PortalLayout>
  )
}
