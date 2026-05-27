import { useNavigate } from 'react-router-dom'
import {
  Heart, Users, Star, Briefcase, ChevronRight, Globe, HandHeart
} from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const IMPACT_STATS = [
  { value: '5,000+', label: 'Children coached every term' },
  { value: '100+', label: 'Schools across the UK' },
  { value: '10,000+', label: 'UKAG awards given' },
  { value: '50+', label: 'Qualified coaches on our team' },
]

const COMMUNITY_VALUES = [
  { emoji: '🤝', title: 'Inclusive by design', desc: 'Every programme is designed so every child feels welcome, whatever their ability or background.' },
  { emoji: '🏫', title: 'School partnerships', desc: 'We work hand-in-hand with school staff, parents, and governors to make sport a priority.' },
  { emoji: '🏃', title: 'Lifelong activity', desc: 'We believe sport habits built in primary school last a lifetime. We\'re planting those seeds.' },
  { emoji: '🌍', title: 'Local roots', desc: 'Coaches live and work in the communities they serve — this isn\'t an outsourced service, it\'s a local team.' },
]

const JOIN_PATHS = [
  {
    emoji: '👟',
    title: 'Apply for a vacancy',
    desc: 'See our current openings for sports coaches across all areas.',
    cta: 'View vacancies',
    path: '/portal/careers',
    bg: 'bg-[#1a3a6b]',
    text: 'text-white',
    descColor: 'text-white/70',
    btnBg: 'bg-[#f5c518] text-[#1a3a6b]',
  },
  {
    emoji: '📋',
    title: 'Join the coach pool',
    desc: 'No current role near you? Register your interest and we\'ll contact you when placements open up.',
    cta: 'Register interest',
    path: '/portal/coach-pool',
    bg: 'bg-white border border-gray-200',
    text: 'text-gray-900',
    descColor: 'text-gray-500',
    btnBg: 'bg-[#1a3a6b] text-white',
  },
]

export function PortalCommunityPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Heart size={14} />
            Our Community
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            More Than a Sports Club
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto">
            ASO is a movement. We bring together children, families, schools, and coaches to build healthier, more active communities — one session at a time.
          </p>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-[#f5c518] py-6">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {IMPACT_STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1a3a6b]">{s.value}</p>
              <p className="text-[#1a3a6b]/70 text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community values */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What Community Means to Us</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            We don't just run clubs — we invest in the schools, families, and neighbourhoods we serve.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMMUNITY_VALUES.map(v => (
            <div key={v.title} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <span className="text-3xl shrink-0">{v.emoji}</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">{v.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For families */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Get Involved</h2>
            <p className="text-gray-500 text-sm">Whether you're a parent, a school, or a sports professional — there's a place for you in the ASO community.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                title: 'As a Parent',
                desc: 'Book your child into an after-school club at their school and watch them discover their sport.',
                cta: 'Find a club',
                path: '/portal/clubs',
                color: 'text-[#1a3a6b]',
                iconBg: 'bg-blue-100',
              },
              {
                icon: Globe,
                title: 'As a School',
                desc: 'Bring ASO to your school. We handle everything — coaching, registers, safeguarding, parent bookings.',
                cta: 'Partner with us',
                path: '/portal/for-schools',
                color: 'text-green-700',
                iconBg: 'bg-green-100',
              },
              {
                icon: HandHeart,
                title: 'As a Coach',
                desc: 'Join a team of passionate sports professionals making a real difference in young people\'s lives.',
                cta: 'Work with us',
                path: '/portal/careers',
                color: 'text-purple-700',
                iconBg: 'bg-purple-100',
              },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={item.color} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">{item.desc}</p>
                  <button
                    onClick={() => navigate(item.path)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1a3a6b] hover:underline"
                  >
                    {item.cta} <ChevronRight size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WORK WITH US ────────────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#1a3a6b] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Briefcase size={14} />
              Work With Us
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join the ASO Team</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We're always looking for passionate, energetic coaches and support staff. Whether there's a vacancy right now or not — there's a way in.
            </p>
          </div>

          {/* Two paths */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {JOIN_PATHS.map(p => (
              <div key={p.title} className={`${p.bg} rounded-2xl p-7 flex flex-col`}>
                <span className="text-3xl mb-3">{p.emoji}</span>
                <h3 className={`text-lg font-extrabold mb-2 ${p.text}`}>{p.title}</h3>
                <p className={`text-sm leading-relaxed mb-6 flex-1 ${p.descColor}`}>{p.desc}</p>
                <button
                  onClick={() => navigate(p.path)}
                  className={`self-start inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity ${p.btnBg}`}
                >
                  {p.cta} <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Why work for ASO */}
          <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white rounded-2xl p-8">
            <h3 className="text-lg font-bold text-center mb-6">Why coaches love working for ASO</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { emoji: '🏅', title: 'Funded DBS', desc: 'We cover your DBS check so you can start straight away.' },
                { emoji: '📚', title: 'CPD & Training', desc: 'Regular training days and qualifications support.' },
                { emoji: '📍', title: 'Local Placements', desc: 'Work near home — we\'ll match you to local schools.' },
                { emoji: '💰', title: 'Competitive Pay', desc: 'Rates that reflect your experience and qualifications.' },
                { emoji: '🤝', title: 'Supportive Team', desc: 'Dedicated area leads and a friendly national team.' },
                { emoji: '🏃', title: 'Make a Difference', desc: 'Impact children\'s health and wellbeing every day.' },
              ].map(item => (
                <div key={item.title} className="bg-white/10 rounded-xl p-4">
                  <div className="text-xl mb-1.5">{item.emoji}</div>
                  <p className="font-bold text-sm mb-0.5">{item.title}</p>
                  <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/portal/careers')}
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-6 py-3 rounded-xl text-sm hover:bg-yellow-400 transition-colors"
              >
                See open vacancies <ChevronRight size={14} />
              </button>
              <button
                onClick={() => navigate('/portal/coach-pool')}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                Join the coach pool <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What coaches say (placeholder) */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What Our Coaches Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { quote: 'Being an ASO coach is more than a job — you genuinely see the difference you make in kids\' lives every single day.', name: 'Lead Coach, Hampshire' },
              { quote: 'The support from the area lead team is brilliant. You never feel like you\'re on your own when a challenge comes up.', name: 'Sports Coach, Wiltshire' },
              { quote: 'I love that the sessions are structured but still fun. The UKAG pathway gives children something real to work towards.', name: 'Assistant Coach, Surrey' },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 text-left flex flex-col">
                <div className="text-[#f5c518] text-3xl font-serif mb-3">"</div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 italic">{t.quote}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 bg-[#1a3a6b] rounded-full flex items-center justify-center">
                    <Star size={13} className="text-[#f5c518]" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PortalLayout>
  )
}
