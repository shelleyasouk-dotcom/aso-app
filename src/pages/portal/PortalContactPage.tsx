import { useNavigate } from 'react-router-dom'
import { Mail, School, Users, Briefcase, MessageCircle, ChevronRight } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const CONTACT_CARDS = [
  {
    icon: School,
    emoji: '🏫',
    title: 'Partner with ASO',
    audience: 'Schools, Trusts & Local Authorities',
    desc: 'Interested in bringing ASO clubs to your school, multi-academy trust, or local authority? We\'d love to hear from you.',
    points: [
      'Bringing ASO to a new school or trust',
      'Block booking or bulk pricing enquiries',
      'Local authority sports programme partnerships',
      'Facility or timetable queries',
    ],
    subject: 'Partnership Enquiry',
    cta: 'Email our partnerships team',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    btnBg: 'bg-[#1a3a6b] hover:bg-[#142f58]',
  },
  {
    icon: Users,
    emoji: '👨‍👩‍👧',
    title: 'Parents & Guardians',
    audience: 'Existing or prospective families',
    desc: 'Questions about your child\'s club, bookings, or progress? We\'re here to help.',
    points: [
      'Making changes to an existing booking',
      'Questions about your child\'s sessions',
      'Award progress or attendance queries',
      'Medical or additional needs information',
    ],
    subject: 'Parent Enquiry',
    cta: 'Email the parent team',
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    btnBg: 'bg-green-700 hover:bg-green-800',
  },
  {
    icon: Briefcase,
    emoji: '🏃',
    title: 'Work With Us',
    audience: 'Coaches & sports professionals',
    desc: 'Looking to join our coaching team? Whether you\'ve seen a vacancy or just want to register your interest, get in touch.',
    points: [
      'Applying for a coaching role',
      'Joining the coach pool',
      'Volunteering or work experience',
      'Coaching qualifications questions',
    ],
    subject: 'Coaching / Work Enquiry',
    cta: 'Email our recruitment team',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    btnBg: 'bg-purple-700 hover:bg-purple-800',
    extraLink: { label: 'View current vacancies', path: '/portal/careers' },
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    title: 'General Enquiries',
    audience: 'Anything else',
    desc: 'Not sure where your question fits? Send us a general message and we\'ll make sure it gets to the right person.',
    points: [
      'Press & media enquiries',
      'Feedback or complaints',
      'Website or app issues',
      'Anything else on your mind',
    ],
    subject: 'General Enquiry',
    cta: 'Send a general enquiry',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    btnBg: 'bg-amber-600 hover:bg-amber-700',
  },
]

const EMAIL = 'info@activeschool.org.uk'

export function PortalContactPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Mail size={14} />
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xl mx-auto">
            We'd love to hear from you. Choose the category that best matches your enquiry and we'll make sure it reaches the right person.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 text-sm">
            <Mail size={15} className="text-[#f5c518]" />
            <span className="text-white/80">All enquiries are handled by</span>
            <a href={`mailto:${EMAIL}`} className="font-bold text-[#f5c518] hover:underline">{EMAIL}</a>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CONTACT_CARDS.map(card => {
            const Icon = card.icon
            const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent(card.subject)}`
            return (
              <div
                key={card.title}
                className={`${card.bg} border ${card.border} rounded-2xl p-6 flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={card.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{card.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{card.audience}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.desc}</p>

                {/* Bullet points */}
                <ul className="flex flex-col gap-1.5 mb-5 flex-1">
                  {card.points.map(point => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex flex-col gap-2">
                  <a
                    href={mailtoHref}
                    className={`flex items-center justify-center gap-2 text-white font-bold text-sm py-3 rounded-xl transition-colors ${card.btnBg}`}
                  >
                    <Mail size={15} />
                    {card.cta}
                  </a>
                  {'extraLink' in card && card.extraLink && (
                    <button
                      onClick={() => navigate(card.extraLink!.path)}
                      className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {card.extraLink.label} <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Response time banner */}
      <section className="bg-gray-50 border-t border-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-gray-800 text-lg mb-2">What to expect</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We aim to respond to all enquiries within <strong>2 working days</strong>. During busy term-time periods it may take a little longer, but we'll always get back to you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '📧', title: 'Email us', desc: EMAIL, href: `mailto:${EMAIL}` },
              { emoji: '📍', title: 'Based in', desc: 'Hampshire, UK — serving schools nationwide', href: null },
              { emoji: '🕐', title: 'Office hours', desc: 'Mon–Fri, 9am–5pm (term time)', href: null },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-center">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                {item.href ? (
                  <a href={item.href} className="text-xs text-[#1a3a6b] hover:underline font-medium">{item.desc}</a>
                ) : (
                  <p className="text-xs text-gray-500">{item.desc}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </PortalLayout>
  )
}
