import { useNavigate } from 'react-router-dom'
import { RefreshCw, ExternalLink, Calendar, CheckCircle, ChevronLeft, HelpCircle } from 'lucide-react'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { Card } from '../../components/ui/Card'
import { useSchoolId } from '../../hooks/useSchoolId'

const STEPS = [
  { step: '1', title: 'Check your place', desc: 'Your child\'s place will be held for the first 2 weeks of the new term. After that, spaces go to the waiting list.' },
  { step: '2', title: 'Book via Class4Kids', desc: 'All re-enrolments are processed through our Class4Kids booking system. Click the button below to go to our booking page.' },
  { step: '3', title: 'Pay the term fee', desc: 'Pay securely online. You\'ll receive a booking confirmation by email.' },
  { step: '4', title: 'You\'re all set', desc: 'Your child\'s place is confirmed for the new term. We\'ll be in touch with any updates.' },
]

const FAQS = [
  {
    q: 'When do I need to re-enrol by?',
    a: 'We recommend re-enrolling at least 2 weeks before the new term starts to secure your child\'s place.',
  },
  {
    q: 'What if my child wants to try a different sport?',
    a: 'Get in touch with your area lead or contact us at info@activeschool.org.uk and we\'ll do our best to accommodate a change.',
  },
  {
    q: 'Is there a sibling discount?',
    a: 'Yes — a 10% discount applies for a second sibling. This is applied automatically at checkout on Class4Kids.',
  },
  {
    q: 'Can I defer a term?',
    a: 'Please contact your area lead to discuss deferring. We\'ll hold a place where we can.',
  },
]

export function SchoolReenrolmentPage() {
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  return (
    <SchoolLayout title="Re-enrolment">
      <div className="px-4 pt-4 pb-8 flex flex-col gap-5">

        {/* Back */}
        <button
          onClick={() => navigate('/school-portal')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1a3a6b] -mb-1"
        >
          <ChevronLeft size={16} /> Back to portal
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={18} className="text-[#f5c518]" />
            <p className="font-extrabold text-lg">Re-enrolment</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Secure your child's place for next term. Re-enrolment is quick and easy through our Class4Kids booking system.
          </p>
        </div>

        {/* Book button */}
        <a
          href="https://www.class4kids.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-extrabold py-3.5 rounded-2xl hover:bg-yellow-400 transition-colors text-sm"
        >
          Re-enrol on Class4Kids <ExternalLink size={15} />
        </a>

        {/* How it works */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">How it works</p>
          <div className="flex flex-col gap-3">
            {STEPS.map(s => (
              <Card key={s.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a3a6b] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Term dates */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Upcoming term dates</p>
          <Card className="flex items-start gap-3">
            <Calendar size={20} className="text-[#1a3a6b] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Term dates are confirmed each half-term</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your area lead will confirm exact start and end dates by email before each new term. You can also check the Club Schedule in your portal.
              </p>
              <button
                onClick={() => navigate('/school-portal/club')}
                className="mt-2 text-xs font-bold text-[#1a3a6b] flex items-center gap-1 hover:underline"
              >
                View Club Schedule <CheckCircle size={12} />
              </button>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">FAQs</p>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => (
              <Card key={faq.q} className="flex items-start gap-3">
                <HelpCircle size={18} className="text-[#1a3a6b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Card className="text-center py-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">Questions about re-enrolment?</p>
          <p className="text-xs text-gray-400 mb-3">Get in touch with your area lead or our team</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate('/school-portal/contacts')}
              className="text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-4 py-2 rounded-xl hover:bg-[#1a3a6b]/20 transition-colors"
            >
              View Contacts
            </button>
            <a
              href="mailto:info@activeschool.org.uk"
              className="text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-4 py-2 rounded-xl hover:bg-[#1a3a6b]/20 transition-colors"
            >
              Email us
            </a>
          </div>
        </Card>

      </div>
    </SchoolLayout>
  )
}
