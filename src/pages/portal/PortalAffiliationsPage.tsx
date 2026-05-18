import { ExternalLink } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const AFFILIATIONS = [
  {
    abbr: 'UKAG',
    name: 'UK Academies of Gymnastics',
    description: 'Our gymnastics programmes are fully aligned with the nationally recognised UKAG Award Pathway, providing children with a clear and structured progression journey from Level 1 through to Level 6.',
    category: 'Training & Licensing',
    color: 'bg-blue-600',
    link: null,
  },
  {
    abbr: 'SE',
    name: 'Sport England',
    description: 'We are committed to the Sport England principles of sport for all, ensuring our clubs are accessible, inclusive, and designed to grow participation.',
    category: 'National Body',
    color: 'bg-red-600',
    link: null,
  },
  {
    abbr: 'YST',
    name: 'Youth Sport Trust',
    description: 'ASO shares the Youth Sport Trust\'s vision that every young person should have a fantastic experience of sport and physical activity in school.',
    category: 'National Organisation',
    color: 'bg-purple-600',
    link: null,
  },
  {
    abbr: 'AfPE',
    name: 'Association for Physical Education',
    description: 'Our coaches follow AfPE guidance on safe practice, curriculum alignment, and high-quality PE and school sport delivery.',
    category: 'Professional Body',
    color: 'bg-teal-600',
    link: null,
  },
  {
    abbr: 'DBS',
    name: 'Disclosure & Barring Service',
    description: 'Every ASO coach holds an enhanced DBS (Disclosure & Barring Service) check before working with children. Certificates are renewed regularly.',
    category: 'Safeguarding',
    color: 'bg-green-700',
    link: null,
  },
  {
    abbr: 'FA',
    name: 'The Football Association',
    description: 'Our football sessions are delivered in line with FA grassroots coaching standards, including FA-qualified coaches and player welfare guidelines.',
    category: 'Sport Governing Body',
    color: 'bg-blue-800',
    link: null,
  },
  {
    abbr: 'BG',
    name: 'British Gymnastics',
    description: 'ASO\'s gymnastics coaches hold British Gymnastics qualifications and our programme follows BG\'s safeguarding and coaching best practices.',
    category: 'Sport Governing Body',
    color: 'bg-orange-600',
    link: null,
  },
  {
    abbr: 'ECB',
    name: 'England & Wales Cricket Board',
    description: 'Our cricket programmes use ECB All Stars Cricket and Dynamos Cricket formats, making cricket fun and accessible for primary-age children.',
    category: 'Sport Governing Body',
    color: 'bg-sky-700',
    link: null,
  },
]

const QUALITY_MARKS = [
  { label: 'Enhanced DBS', description: 'All coaches hold enhanced DBS clearance before working with children.' },
  { label: 'First Aid Trained', description: 'At least one first-aider present at every session.' },
  { label: 'Safeguarding Level 2', description: 'Lead coaches hold Level 2 Safeguarding qualification.' },
  { label: 'Public Liability Insurance', description: 'All ASO activities are covered by full public liability insurance.' },
  { label: 'Risk Assessed', description: 'Every venue undergoes a formal facility risk assessment before sessions begin.' },
]

export function PortalAffiliationsPage() {
  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Affiliations &amp; Accreditations</h1>
          <p className="text-white/70 text-base leading-relaxed">
            ASO works within nationally recognised frameworks so you can trust the quality and safety of every session your child attends.
          </p>
        </div>
      </section>

      {/* Affiliations grid */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Our Affiliations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AFFILIATIONS.map(aff => (
            <div key={aff.abbr} className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4">
              {/* Logo placeholder */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 ${aff.color}`}>
                {aff.abbr}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">{aff.name}</h3>
                  {aff.link && (
                    <a href={aff.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-400 hover:text-[#1a3a6b]">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{aff.category}</span>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{aff.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality marks */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Our Quality Commitments</h2>
          <p className="text-sm text-gray-500 mb-6">What we guarantee at every ASO session.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUALITY_MARKS.map(mark => (
              <div key={mark.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1a3a6b] text-base">✓</span>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{mark.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{mark.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust statement */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-center">
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-2xl p-6">
          <p className="text-4xl mb-3">🤝</p>
          <h2 className="font-bold text-[#1a3a6b] text-lg mb-2">Built on Trust</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you enrol your child with ASO, you're choosing a provider that works within the highest UK coaching, safeguarding, and quality standards. We are transparent about our affiliations and welcome any questions about our credentials.
          </p>
        </div>
      </section>
    </PortalLayout>
  )
}
