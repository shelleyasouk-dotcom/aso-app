import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { ParentBooking } from '../../types'

export function PortalBookingConfirmedPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [booking, setBooking] = useState<ParentBooking | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!sessionId) return
    // Poll briefly for the webhook to confirm the booking
    const poll = async () => {
      const { data } = await supabase
        .from('parent_bookings')
        .select('*, school:schools(name), club_term:club_terms(term_name,num_sessions,start_date,end_date)')
        .eq('stripe_session_id', sessionId)
        .maybeSingle()
      if (data?.status === 'confirmed') {
        setBooking(data as ParentBooking)
      } else if (attempts < 6) {
        setAttempts(a => a + 1)
        setTimeout(poll, 2000)
      }
    }
    poll()
  }, [sessionId])

  const school = (booking?.school as any)?.name
  const term = booking?.club_term as any

  return (
    <PortalLayout>
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1a3a6b] mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          {booking
            ? `${booking.child_name} has been enrolled at ${school}.`
            : 'Your payment was successful. Your booking will be confirmed shortly.'}
        </p>

        {booking && term && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-left mb-6 space-y-2">
            <p className="font-bold text-gray-800">{school}</p>
            <p className="text-sm text-gray-600">{term.term_name} · {term.num_sessions} sessions</p>
            <p className="text-sm text-gray-500">
              {new Date(term.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {' – '}
              {new Date(term.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {booking.amount_pence && (
              <p className="text-sm font-semibold text-green-700">
                £{(booking.amount_pence / 100).toFixed(2)} paid
              </p>
            )}
          </div>
        )}

        {!booking && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1a3a6b] rounded-full animate-spin" />
            Confirming your booking…
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-6 text-left">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
            <li>A receipt has been emailed to you by Stripe.</li>
            <li>Your child will appear on the coach's register from the first session.</li>
            <li>The school will be notified of your child's enrolment.</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/portal/my-bookings')}
          className="flex items-center gap-2 mx-auto bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
        >
          <BookOpen size={16} />
          View my bookings
        </button>
      </div>
    </PortalLayout>
  )
}
