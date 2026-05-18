import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, User, AlertCircle, CheckCircle, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { ClubTerm, ParentChild } from '../../types'

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function bookingWindowStatus(term: ClubTerm): { label: string; open: boolean; colour: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const termEnd = new Date(term.end_date)
  if (today > termEnd) return { label: 'Term ended', open: false, colour: 'text-gray-400' }

  const openDate = term.open_booking_opens ? new Date(term.open_booking_opens) : null
  const priorityDate = term.priority_booking_opens ? new Date(term.priority_booking_opens) : null

  if (openDate && today >= openDate) {
    return { label: 'Open booking — book now', open: true, colour: 'text-green-700' }
  }
  if (priorityDate && today >= priorityDate) {
    return { label: 'Priority booking open — returning families', open: true, colour: 'text-blue-700' }
  }
  if (priorityDate) {
    return {
      label: `Booking opens ${priorityDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      open: false,
      colour: 'text-amber-600',
    }
  }
  return { label: 'Booking not yet open', open: false, colour: 'text-gray-500' }
}

export function PortalBookingPage() {
  const { termId } = useParams<{ termId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [term, setTerm] = useState<ClubTerm | null>(null)
  const [savedChildren, setSavedChildren] = useState<ParentChild[]>([])
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [step, setStep] = useState<'child' | 'review'>('child')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Child form
  const [selectedChildId, setSelectedChildId] = useState<string | 'new'>('new')
  const [childName, setChildName] = useState('')
  const [yearGroup, setYearGroup] = useState('')
  const [className, setClassName] = useState('')
  const [additionalNeeds, setAdditionalNeeds] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)

  useEffect(() => {
    if (!termId) return
    Promise.all([
      supabase
        .from('club_terms')
        .select('*, school:schools(id,name,area,session_day,session_time)')
        .eq('id', termId)
        .eq('is_active', true)
        .single(),
      supabase
        .from('parent_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('club_term_id', termId)
        .eq('status', 'confirmed'),
      user
        ? supabase.from('parent_children').select('*').eq('parent_id', user.id).order('full_name')
        : Promise.resolve({ data: [] }),
    ]).then(([termRes, countRes, childrenRes]) => {
      if (!termRes.data) { navigate('/portal/clubs'); return }
      setTerm(termRes.data as ClubTerm)
      setConfirmedCount(countRes.count ?? 0)
      setSavedChildren((childrenRes.data ?? []) as ParentChild[])
      if ((childrenRes.data ?? []).length > 0) setSelectedChildId((childrenRes.data as ParentChild[])[0].id)
      setLoading(false)
    })
  }, [termId, user])

  function handleChildSelect(id: string) {
    setSelectedChildId(id)
    if (id !== 'new') {
      const c = savedChildren.find(x => x.id === id)
      if (c) {
        setChildName(c.full_name)
        setYearGroup(c.year_group ?? '')
        setClassName(c.class_name ?? '')
        setAdditionalNeeds(c.additional_needs ?? '')
      }
    } else {
      setChildName('')
      setYearGroup('')
      setClassName('')
      setAdditionalNeeds('')
    }
  }

  async function handlePay() {
    if (!term || !user) return
    setError(null)
    setSubmitting(true)

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token || sessionErr) { setError('Session expired — please log in again.'); setSubmitting(false); return }

    const { data, error: fnErr } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        club_term_id: term.id,
        child: {
          full_name: childName.trim(),
          year_group: yearGroup.trim() || undefined,
          class_name: className.trim() || undefined,
          additional_needs: additionalNeeds.trim() || undefined,
        },
      },
    })

    setSubmitting(false)

    if (fnErr || data?.error) {
      setError(data?.error ?? fnErr?.message ?? 'Something went wrong. Please try again.')
      return
    }

    // Redirect to Stripe
    window.location.href = data.url
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    )
  }

  if (!term) return null

  const school = term.school as any
  const spotsLeft = term.capacity - confirmedCount
  const status = bookingWindowStatus(term)
  const canBook = status.open && spotsLeft > 0 && !!user
  const childReady = childName.trim().length > 0

  return (
    <PortalLayout>
      <div className="max-w-lg mx-auto px-4 py-8">

        <button
          onClick={() => navigate(`/portal/clubs/${school.id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to club
        </button>

        {/* Club summary */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-5 mb-5">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Booking for</p>
          <h1 className="text-xl font-extrabold mb-0.5">{school.name}</h1>
          <p className="text-white/70 text-sm">{term.term_name} · {term.num_sessions} sessions</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-extrabold text-[#f5c518]">{formatPrice(term.price_pence)}</span>
            <div className="text-right">
              <p className={`text-sm font-semibold ${status.open ? 'text-green-300' : 'text-amber-300'}`}>{status.label}</p>
              <p className="text-white/60 text-xs mt-0.5">
                {spotsLeft <= 0 ? 'No spaces available' : `${spotsLeft} of ${term.capacity} spaces left`}
              </p>
            </div>
          </div>
        </div>

        {/* Not logged in */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center mb-4">
            <Lock size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="font-bold text-blue-800 mb-1">Sign in to book</p>
            <p className="text-sm text-blue-600 mb-4">You need a Community Hub account to book a place.</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/portal/login')}
                className="flex-1 bg-[#1a3a6b] text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/portal/register')}
                className="flex-1 border border-[#1a3a6b] text-[#1a3a6b] font-bold py-2.5 rounded-xl text-sm"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Full / not open */}
        {user && !canBook && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              {spotsLeft <= 0 ? 'This club is currently full.' : status.label}
            </p>
          </div>
        )}

        {/* Booking steps */}
        {user && canBook && (
          <>
            {step === 'child' && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-[#1a3a6b] text-lg">Child's Details</h2>

                {/* Select existing child */}
                {savedChildren.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-600">Select a child on your account</p>
                    {savedChildren.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleChildSelect(c.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                          selectedChildId === c.id
                            ? 'border-[#1a3a6b] bg-[#1a3a6b]/5'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{c.full_name}</p>
                          <p className="text-xs text-gray-400">{[c.year_group, c.class_name].filter(Boolean).join(' · ')}</p>
                        </div>
                        {selectedChildId === c.id && <CheckCircle size={16} className="ml-auto text-[#1a3a6b]" />}
                      </button>
                    ))}
                    <button
                      onClick={() => handleChildSelect('new')}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        selectedChildId === 'new'
                          ? 'border-[#1a3a6b] bg-[#1a3a6b]/5 text-[#1a3a6b]'
                          : 'border-dashed border-gray-300 text-gray-500'
                      }`}
                    >
                      + Add a different child
                    </button>
                  </div>
                )}

                {/* Child form */}
                <div className="flex flex-col gap-3">
                  <Input
                    id="child_name"
                    label="Child's full name *"
                    placeholder="First and last name"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="year_group"
                      label="Year group"
                      placeholder="e.g. Year 3"
                      value={yearGroup}
                      onChange={e => setYearGroup(e.target.value)}
                    />
                    <Input
                      id="class_name"
                      label="Class"
                      placeholder="e.g. 3B"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Additional needs / medical info</label>
                    <textarea
                      value={additionalNeeds}
                      onChange={e => setAdditionalNeeds(e.target.value)}
                      placeholder="Allergies, medical conditions, SEND needs, or 'None'"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  disabled={!childReady}
                  onClick={() => setStep('review')}
                >
                  Continue to Review
                </Button>
              </div>
            )}

            {step === 'review' && (
              <div className="flex flex-col gap-4">
                <button onClick={() => setStep('child')} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <ChevronLeft size={14} /> Edit child details
                </button>

                <h2 className="font-bold text-[#1a3a6b] text-lg">Review Booking</h2>

                <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Club</p>
                    <p className="font-semibold text-gray-800">{school.name}</p>
                    <p className="text-sm text-gray-500">{school.session_day} · {school.session_time}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Term</p>
                    <p className="font-semibold text-gray-800">{term.term_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{term.num_sessions} sessions
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Child</p>
                    <p className="font-semibold text-gray-800">{childName}</p>
                    {(yearGroup || className) && (
                      <p className="text-sm text-gray-500">{[yearGroup, className].filter(Boolean).join(' · ')}</p>
                    )}
                    {additionalNeeds && (
                      <p className="text-xs text-amber-700 mt-0.5">{additionalNeeds}</p>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total</p>
                    <p className="text-xl font-extrabold text-[#1a3a6b]">{formatPrice(term.price_pence)}</p>
                  </div>
                </div>

                {/* T&C agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-[#1a3a6b] shrink-0"
                  />
                  <span className="text-sm text-gray-600">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => window.open('/portal/terms', '_blank')}
                      className="text-[#1a3a6b] font-semibold underline"
                    >
                      ASO Terms & Conditions
                    </button>
                    {' '}and understand the cancellation policy.
                  </span>
                </label>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Secure payment note */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} />
                  Secure payment powered by Stripe. You'll be taken to the Stripe payment page.
                </div>

                <Button
                  size="lg"
                  fullWidth
                  disabled={!agreedTerms || submitting}
                  onClick={handlePay}
                >
                  {submitting ? 'Redirecting to payment…' : `Pay ${formatPrice(term.price_pence)} securely`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  )
}
