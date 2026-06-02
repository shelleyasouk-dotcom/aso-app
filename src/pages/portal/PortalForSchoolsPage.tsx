import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, Mail } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const AUDIENCES = [
  {
    emoji: '🏫',
    title: 'Primary Schools',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    points: [
      'No cost to the school — funded entirely through parent subscriptions',
      'No staff supervision required — our coaches manage everything',
      'All equipment supplied, transported, and set up by ASO',
      'Follows your term dates and timetable exactly',
      'Digital registers sent to your school admin after every session',
    ],
  },
  {
    emoji: '🏛️',
    title: 'Multi-Academy Trusts',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    points: [
      'Consistent programme quality and safeguarding standards across all your schools',
      'Centralised reporting — one point of contact for your whole trust',
      'Scalable across 2, 10, or 50+ schools with the same coach quality',
      'Supports your trust-wide PE Premium strategy and impact evidence',
      'Bespoke partnership agreements available for larger trusts',
    ],
  },
  {
    emoji: '🗺️',
    title: 'Local Authorities',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    points: [
      'Supports your borough\'s physical activity and sport participation targets',
      'Aligned with Active Schools and School Games frameworks',
      'Provides measurable data on children engaged in structured physical activity',
      'Reduces barriers to participation — inclusive and affordable for all families',
      'Partnership reporting available to support your annual strategies',
    ],
  },
  {
    emoji: '🎓',
    title: 'Secondary Schools',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    points: [
      'Gymnastics enrichment & curriculum delivery for KS3 (ages 11–14)',
      'Trampolining enrichment clubs — after-school and lunchtime, all year groups',
      'Curriculum PE delivery — structured lessons aligned to your scheme of work',
      'GCSE trampolining specialist coaching and assessment support',
      'UKAG Award Pathway Level 1–6 progression for all pupils',
    ],
  },
]

const WHAT_WE_PROVIDE = [
  { emoji: '🧑‍🏫', title: 'Fully managed delivery', desc: 'ASO coaches plan, deliver, and manage every session. Your school staff don\'t need to be involved.' },
  { emoji: '🛡️', title: 'Safeguarding compliant', desc: 'All coaches hold enhanced DBS and Level 2 Safeguarding. Incident logs and registers available on request.' },
  { emoji: '🏅', title: 'UKAG Award Pathway', desc: 'Children progress through nationally recognised Levels 1–6, giving schools tangible evidence of achievement.' },
  { emoji: '📊', title: 'Impact reporting', desc: 'Session attendance, award progress, and participation data provided to help meet PE Premium and Ofsted requirements.' },
  { emoji: '💳', title: 'Cashless for schools', desc: 'Parents book and pay through our online portal. No invoicing, no cash handling, no finance admin for your school.' },
  { emoji: '📋', title: 'Digital registers', desc: 'Every session produces a digital register with attendance, year groups, and any notes — sent straight to school admin.' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Get in touch', desc: 'Contact us to tell us about your school, the spaces you have available, and what you\'d like to offer pupils.' },
  { step: '2', title: 'Site assessment', desc: 'We\'ll assess your sports hall, outdoor space, and available days to design a programme that fits perfectly.' },
  { step: '3', title: 'Programme agreed', desc: 'We agree the sports, year groups, days and start date. We handle all parent communications and bookings.' },
  { step: '4', title: 'We handle everything', desc: 'Coaches arrive, set up, deliver, and pack away. You receive a session report after every session.' },
]

const FAQS = [
  { q: 'Does it cost the school anything?', a: 'No. ASO programmes are funded entirely through parent subscriptions. There is no cost to the school.' },
  { q: 'Do we need to provide a member of staff?', a: 'No. Our coaches are fully responsible for the session. Your staff are welcome to observe but are not required.' },
  { q: 'Which programmes do you offer?', a: 'We specialise in gymnastics and trampolining. Gymnastics is delivered in primary schools (KS1 & KS2) and secondary schools (KS3, ages 11–14). Trampolining is delivered in secondary schools, including enrichment clubs, curriculum PE, and GCSE. Both can run in the same secondary school.' },
  { q: 'What happens if a child has an accident?', a: 'All ASO coaches are first-aid trained. Incidents are logged digitally and parents notified same day. Reports are available to school admin.' },
  { q: 'Can ASO support our PE Premium evidence?', a: 'Yes. We provide participation data, award progression reports, and session summaries that can be used directly in your PE Premium impact statement.' },
  { q: 'How quickly can we get started?', a: 'Subject to DBS clearance and site assessment, most schools are up and running within 2–4 weeks of first contact.' },
]

export function PortalForSchoolsPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            Schools · Trusts · Local Authorities · Councils
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            Partnering with ASO to Get Children Active
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-6">
            ASO works with primary and secondary schools, multi-academy trusts, and local authorities to deliver specialist gymnastics and trampolining programmes. UKAG-affiliated coaches, fully managed delivery — you get the results.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:info@activeschoolorganisation.co.uk"
              className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
              <Mail size={16} />
              Enquire About a Partnership
            </a>
            <button
              onClick={() => navigate('/portal/clubs')}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              See Our Clubs
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Who We Work With</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Whether you're a single school or a regional authority, ASO has experience working with organisations like yours.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {AUDIENCES.map(a => (
            <div key={a.title} className={`rounded-2xl border p-5 ${a.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{a.emoji}</span>
                <h3 className="font-extrabold text-gray-900 text-base">{a.title}</h3>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${a.badge}`}>ASO Partner</span>
              </div>
              <ul className="flex flex-col gap-2">
                {a.points.map(p => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-green-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* What ASO provides */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What ASO Provides</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Everything needed to run a professional after-school sports programme — at no cost to your school.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {WHAT_WE_PROVIDE.map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works for Schools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="text-center relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-gray-200" />
              )}
              <div className="w-10 h-10 rounded-full bg-[#1a3a6b] text-white font-extrabold text-base flex items-center justify-center mx-auto mb-3 relative z-10">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#1a3a6b]/5 border-t border-[#1a3a6b]/10 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Common Questions</h2>
          <p className="text-gray-500 text-sm text-center mb-8">From schools and local authorities considering a partnership with ASO.</p>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="font-bold text-gray-900 text-sm mb-1.5">{faq.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a3a6b] text-white py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ready to bring ASO to your school or area?</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            Get in touch and we'll put together a proposal tailored to your school, trust, or authority — no obligation, no cost.
          </p>
          <a
            href="mailto:info@activeschoolorganisation.co.uk"
            className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Mail size={16} />
            Contact Us to Partner
          </a>
        </div>
      </section>

    </PortalLayout>
  )
}
