import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const PROGRAMMES = [
  {
    emoji: '🤸',
    name: 'Gymnastics',
    audience: 'Primary Schools',
    tagline: 'UKAG Award Pathway · KS1 & KS2',
    description: 'ASO gymnastics sessions are fully aligned with the UK Academy of Gymnastics Award Pathway, providing primary school children with a structured, progressive journey from their very first vault to advanced floor and apparatus work. Every session is age-appropriate, inclusive, and led by UKAG-affiliated coaches.',
    ageRange: '4–11',
    levels: [
      { title: 'KS1 (Yr 1 & 2)', desc: 'Fundamental movement, body shape, balance, and introductory floor skills. Big focus on confidence and enjoyment.' },
      { title: 'KS2 (Yr 3 & 4)', desc: 'Developing floor sequences, introductory apparatus work, and controlled jumps and landings.' },
      { title: 'KS2 (Yr 5 & 6)', desc: 'Progressive apparatus skills, sequencing routines, and working towards UKAG Levels 3–4.' },
    ],
    benefits: ['Core strength & flexibility', 'Coordination & spatial awareness', 'Confidence & discipline', 'UKAG Level 1–6 progression'],
    color: 'bg-pink-50 border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
    headingColor: 'text-pink-700',
  },
  {
    emoji: '🤾',
    name: 'Trampolining',
    audience: 'Secondary Schools',
    tagline: 'UKAG Award Pathway · Curriculum & GCSE',
    description: 'ASO delivers professional trampolining for secondary schools, covering after-school enrichment, curriculum PE lessons, and GCSE trampolining. All sessions follow the UKAG Award Pathway and are delivered in a fully supervised, safeguarding-compliant environment by trained coaches.',
    ageRange: '11–18',
    levels: [
      { title: 'Enrichment Clubs', desc: 'After-school and lunchtime clubs open to all pupils. UKAG Level 1–6 progression in a fun, social environment.' },
      { title: 'Curriculum PE', desc: 'Trampolining integrated into your school\'s PE curriculum — structured lessons with clear learning outcomes.' },
      { title: 'GCSE Trampolining', desc: 'Specialist coaching for GCSE trampolining, covering required elements, routines, and assessment preparation.' },
    ],
    benefits: ['Core strength & aerial awareness', 'Coordination & balance', 'Curriculum & GCSE support', 'UKAG Level 1–6 progression'],
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    headingColor: 'text-indigo-700',
  },
]

export function PortalSportsPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            🏅 UKAG Affiliated
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Our Programmes</h1>
          <p className="text-white/70 text-base leading-relaxed">
            Specialist gymnastics for primary schools and trampolining for secondary schools — both delivered through the nationally recognised UKAG Award Pathway.
          </p>
        </div>
      </section>

      {/* Programmes */}
      <section className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-8">
        {PROGRAMMES.map(prog => (
          <div key={prog.name} className={`rounded-2xl border p-6 sm:p-8 ${prog.color}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
              <span className="text-6xl shrink-0">{prog.emoji}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className={`font-extrabold text-2xl ${prog.headingColor}`}>{prog.name}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${prog.badge}`}>
                    Age {prog.ageRange}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{prog.audience}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{prog.tagline}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6">{prog.description}</p>

            {/* Delivery levels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {prog.levels.map(level => (
                <div key={level.title} className="bg-white/80 border border-white rounded-xl p-4">
                  <p className="font-bold text-gray-900 text-xs mb-1">{level.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{level.desc}</p>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2">
              {prog.benefits.map(b => (
                <div key={b} className="flex items-center gap-1.5 bg-white/80 border border-white rounded-full px-3 py-1">
                  <CheckCircle size={12} className="text-green-600 shrink-0" />
                  <span className="text-xs text-gray-700">{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* UKAG Award Pathway */}
      <section className="bg-[#1a3a6b] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-3">🏅</div>
          <h2 className="text-2xl font-extrabold mb-2">UKAG Award Pathway</h2>
          <p className="text-white/70 text-sm mb-2 leading-relaxed">
            Both gymnastics and trampolining programmes use the nationally recognised UKAG Award Pathway, giving children a clear, structured progression from Level 1 through to Level 6. Each level develops confidence, coordination, strength, flexibility, and technical skill.
          </p>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            Awards are presented in sessions, certificates sent home, and results tracked through the ASO coaches app. Schools receive participation and award data to support PE Premium impact reporting.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              { level: 'Level 1', desc: 'Foundation', style: 'bg-gray-300 border-gray-300 text-gray-700' },
              { level: 'Level 2', desc: 'Bronze', style: 'bg-yellow-300 border-yellow-300 text-yellow-800' },
              { level: 'Level 3', desc: 'Silver', style: 'bg-amber-400 border-amber-400 text-amber-900' },
              { level: 'Level 4', desc: 'Gold', style: 'bg-gray-400 border-gray-400 text-white' },
              { level: 'Level 5', desc: 'Platinum', style: 'bg-yellow-500 border-yellow-500 text-yellow-900' },
              { level: 'Level 6', desc: 'Elite', style: 'bg-[#f5c518] border-[#f5c518] text-[#1a3a6b]' },
            ].map((l, i) => (
              <div key={l.level} className="flex flex-col items-center gap-1.5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg border-2 ${l.style}`}>
                  {i + 1}
                </div>
                <span className="text-xs text-white/60 font-semibold">{l.level}</span>
                <span className="text-[10px] text-white/40">{l.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40">
            UKAG also offers teacher and coach training — contact us to find out more about getting your staff UKAG-trained.
          </p>
        </div>
      </section>

      {/* Secondary gymnastics note */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
          <span className="text-4xl shrink-0">🤸</span>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-extrabold text-gray-900 text-base mb-1">Gymnastics in Secondary Schools</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              ASO can also deliver gymnastics enrichment and curriculum gymnastics in secondary schools. Contact us to discuss how we can support your secondary PE programme alongside trampolining.
            </p>
          </div>
          <a
            href="mailto:info@activeschoolorganisation.co.uk"
            className="shrink-0 inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors text-sm"
          >
            Enquire <ChevronRight size={14} />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-12 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Find a club near you</h2>
        <p className="text-sm text-gray-500 mb-5">Check what's available at schools in your area.</p>
        <button
          onClick={() => navigate('/portal/clubs')}
          className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-7 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
        >
          Find a Club
          <ChevronRight size={16} />
        </button>
      </section>
    </PortalLayout>
  )
}
