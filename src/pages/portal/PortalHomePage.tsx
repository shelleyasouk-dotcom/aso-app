import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Trophy, Users, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { ShareFacebookButton } from '../../components/ui/ShareFacebookButton'
import { AdBanner } from '../../components/ui/AdBanner'
import { useSEO } from '../../hooks/useSEO'

const SUPABASE_URL = 'https://yhsxtjttoxzhmbeenhow.supabase.co'

const PROGRAMMES = [
  {
    emoji: '🤸',
    title: 'Gymnastics',
    subtitle: 'Primary & Secondary · KS1, KS2 & KS3',
    description: 'Curriculum-aligned gymnastics enrichment for primary schools (KS1 & KS2) and secondary schools (KS3, ages 11–14). From foundation floor skills through to progressive apparatus work — all through the UKAG Award Pathway.',
    highlights: [
      'Primary after-school & lunchtime clubs',
      'Secondary KS3 curriculum & enrichment',
      'UKAG Level 1–6 structured progression',
      'All equipment supplied and managed',
    ],
    color: 'bg-pink-50 border-pink-200',
    badgeColor: 'bg-pink-100 text-pink-700',
    ageLabel: 'Primary & KS3 · Age 4–14',
  },
  {
    emoji: '🤾',
    title: 'Trampolining',
    subtitle: 'Secondary Schools · Curriculum & GCSE',
    description: 'Professional trampolining for secondary schools — from after-school enrichment to curriculum PE and GCSE trampolining. Delivered by UKAG-trained coaches in a fully supervised environment.',
    highlights: [
      'Curriculum PE & GCSE trampolining support',
      'UKAG Level 1–6 structured progression',
      'After-school & lunchtime enrichment',
      'Secondary gymnastics also available',
    ],
    color: 'bg-indigo-50 border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    ageLabel: 'Secondary · Age 11–18',
  },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Get in Touch', desc: 'Tell us about your school — primary or secondary, available spaces, and what you\'d like to deliver for pupils.' },
  { step: '2', title: 'We Design a Programme', desc: 'We plan gymnastics or trampolining sessions aligned to your timetable, year groups, and curriculum needs.' },
  { step: '3', title: 'We Deliver Everything', desc: 'UKAG-affiliated coaches arrive, set up, deliver, and pack away. You receive a digital session report after every session.' },
]

export function PortalHomePage() {
  useSEO({
    title: 'Gymnastics & Trampolining for Schools',
    description: 'ASO delivers UKAG-affiliated gymnastics and trampolining enrichment programmes in primary and secondary schools across England. DBS-checked coaches, ages 4–14.',
    url: 'https://www.activeschool.org.uk/portal',
  })
  const navigate = useNavigate()
  const [regions, setRegions] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('schools')
      .select('area')
      .not('area', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((r: { area: string }) => r.area).filter(Boolean))]
        setRegions(unique.sort())
      })

    // Load website photos: uploaded images + director-approved profile photos
    Promise.all([
      supabase.storage
        .from('coach-files')
        .list('Public', { limit: 40, sortBy: { column: 'name', order: 'asc' } }),
      supabase
        .from('profiles')
        .select('photo_url')
        .eq('website_photo_approved' as string, true)
        .not('photo_url', 'is', null),
    ]).then(([storageRes, profilesRes]) => {
      const folderUrls = (storageRes.data ?? [])
        .filter(f => f.name && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
        .map(f => `${SUPABASE_URL}/storage/v1/object/public/coach-files/Public/${f.name}`)

      const profileUrls = ((profilesRes.data ?? []) as { photo_url: string }[])
        .filter(p => p.photo_url)
        .map(p => {
          const path = p.photo_url.startsWith('http')
            ? p.photo_url
            : `${SUPABASE_URL}/storage/v1/object/public/coach-files/${p.photo_url}`
          return path
        })

      setPhotoUrls([...folderUrls, ...profileUrls])
    })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/portal/clubs?q=${encodeURIComponent(search)}`)
  }

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">

          {/* Text side */}
          <div className="flex-1 text-center lg:text-left">
            <img
              src="/AS Brand Sheet (2) - Edited.png"
              alt="Active School"
              className="w-36 h-36 object-contain mx-auto lg:mx-0 -mb-2"
            />
            <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              🏅 UKAG Affiliated Programme Provider
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Gymnastics &amp; Trampolining<br />for Schools
            </h1>
            <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-xl">
              ASO delivers curriculum-based gymnastics and trampolining enrichment programmes in primary and secondary schools — affiliated with the UK Academy of Gymnastics.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto lg:mx-0">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by school or area…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#f5c518] text-[#1a3a6b] font-bold px-5 py-3 rounded-xl hover:bg-yellow-400 transition-colors whitespace-nowrap text-sm"
              >
                Find Clubs
              </button>
            </form>
          </div>

          {/* Action photo stack — only shown on desktop when photos exist */}
          {photoUrls.length >= 2 && (
            <div className="hidden lg:flex shrink-0 relative w-72 h-80">
              {/* Back photo — rotated right */}
              <div className="absolute top-6 right-0 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl rotate-3 border-4 border-white/20">
                <img src={photoUrls[1]} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Front photo — rotated left */}
              <div className="absolute top-0 left-0 w-52 h-64 rounded-3xl overflow-hidden shadow-2xl -rotate-2 border-4 border-[#f5c518]/60">
                <img src={photoUrls[0]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {photoUrls.length === 1 && (
            <div className="hidden lg:block shrink-0 w-64 h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#f5c518]/60 -rotate-1">
              <img src={photoUrls[0]} alt="" className="w-full h-full object-cover" />
            </div>
          )}

        </div>
      </section>

      {/* Term time announcement bar */}
      <section className="bg-[#f5c518] py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
            {[
              { icon: Users, label: 'Children Coached', value: '5,000+' },
              { icon: MapPin, label: 'Schools', value: '100+' },
              { icon: Trophy, label: 'Awards Given', value: '10,000+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={18} className="text-[#1a3a6b]" />
                <div>
                  <p className="font-extrabold text-[#1a3a6b] text-lg leading-none">{value}</p>
                  <p className="text-[#1a3a6b]/70 text-xs font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="https://activeschool.classforkids.io"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors text-sm whitespace-nowrap"
          >
            <ExternalLink size={14} /> Book a Place
          </a>
        </div>
      </section>

      {/* Term time registration banner */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="text-5xl shrink-0">🏫</div>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-[#f5c518]/20 text-[#f5c518] text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
              🔔 Registration Now Open
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
              Term Time Sessions Are Back!
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-lg">
              Weekly after-school gymnastics and trampolining clubs are starting back from <strong className="text-white">the week of 7th September</strong>. Book your child's place now — spaces are limited at each school.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-3 items-center">
            <a
              href="https://activeschool.classforkids.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-extrabold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
            >
              <ExternalLink size={15} /> Book Your Place
            </a>
            <p className="text-white/40 text-xs text-center">Weekly from 7th September</p>
          </div>
        </div>
      </section>

      {/* What we deliver */}
      <section className="bg-gray-50 py-12 mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What We Deliver</h2>
              <p className="text-gray-500 text-sm">
                Specialist gymnastics and trampolining — curriculum-based enrichment programmes for primary and secondary schools.
              </p>
            </div>
            {photoUrls.length >= 3 && (
              <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden shadow-lg rotate-1 border-4 border-white">
                <img src={photoUrls[2]} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PROGRAMMES.map(prog => (
              <div
                key={prog.title}
                onClick={() => navigate('/portal/sports')}
                className={`rounded-2xl border p-6 cursor-pointer hover:shadow-md transition-shadow ${prog.color}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-5xl">{prog.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{prog.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{prog.subtitle}</p>
                    <span className={`mt-1.5 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${prog.badgeColor}`}>
                      {prog.ageLabel}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{prog.description}</p>
                <div className="flex flex-col gap-2">
                  {prog.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-green-600 shrink-0" />
                      <span className="text-xs text-gray-600">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/portal/sports')}
              className="text-sm font-medium text-[#1a3a6b] hover:underline"
            >
              Learn more about our programmes →
            </button>
          </div>
        </div>
      </section>

      {/* UKAG affiliation banner */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-[#1a3a6b] rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-6 text-white">
          <div className="text-5xl shrink-0">🏅</div>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-[#f5c518]/20 text-[#f5c518] text-xs font-extrabold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
              Affiliated Organisation
            </div>
            <h3 className="font-extrabold text-white text-lg leading-tight mb-1">UK Academy of Gymnastics (UKAG)</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              ASO runs the UKAG training model in all our schools — providing a nationally recognised award pathway from Level 1 to Level 6 for both gymnastics and trampolining. Our coaches are trained and supported by UKAG, and schools can access UKAG teacher and coach training through our partnership.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => navigate('/portal/sports')}
              className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
            >
              Award Pathway <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Browse by region */}
      {regions.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Region</h2>
          <p className="text-gray-500 text-sm mb-6">Click a region to see all clubs in that area.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {regions.map(area => (
              <button
                key={area}
                onClick={() => navigate(`/portal/clubs?area=${encodeURIComponent(area)}`)}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#1a3a6b] hover:bg-blue-50 transition-colors group text-left"
              >
                <MapPin size={16} className="text-[#1a3a6b] shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a3a6b] truncate">{area}</span>
                <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[#1a3a6b]" />
              </button>
            ))}
            <button
              onClick={() => navigate('/portal/clubs')}
              className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-[#1a3a6b] transition-colors group text-left"
            >
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#1a3a6b]">View all clubs</span>
              <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[#1a3a6b]" />
            </button>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1a3a6b] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ASO */}
      <section className="bg-[#1a3a6b] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose ASO?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'DBS-checked, qualified coaches at every session',
              'UKAG Award Pathway progression — Level 1 to Level 6',
              'Inclusive — every child welcomed regardless of ability',
              'Safeguarding trained staff in line with UK standards',
              'Regular parent updates and progress tracking',
              'Sessions delivered inside the school day schedule',
            ].map(point => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[#f5c518] shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Parents */}
          <div className="bg-[#1a3a6b] text-white rounded-2xl p-7 flex flex-col items-start">
            <span className="text-2xl mb-3">👨‍👩‍👧</span>
            <h3 className="text-lg font-extrabold mb-2">For Parents</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-5">Find a gymnastics or trampolining club at your child's school and watch them progress through the UKAG Award Pathway.</p>
            <button
              onClick={() => navigate('/portal/clubs')}
              className="mt-auto inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm"
            >
              Find a Club Near You
              <ChevronRight size={15} />
            </button>
          </div>
          {/* Schools & Partners */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-7 flex flex-col items-start">
            <span className="text-2xl mb-3">🏫</span>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">For Schools, Trusts &amp; LAs</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">Bring ASO's gymnastics or trampolining programme to your school or authority. We manage everything — coaching, registers, reporting, and bookings.</p>
            <button
              onClick={() => navigate('/portal/for-schools')}
              className="mt-auto inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors text-sm"
            >
              Partner with ASO
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Work With Us */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
            {photoUrls.length >= 4 && (
              <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#f5c518] shadow-xl -rotate-2">
                <img src={photoUrls[3]} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                🏃 Join the Team
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Work With Us</h2>
              <p className="text-white/70 text-sm max-w-lg leading-relaxed">
                Passionate about gymnastics or trampolining and working with young people? We're always looking for qualified coaches to join our growing team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {/* Apply */}
            <div className="bg-white rounded-2xl p-6 flex flex-col">
              <span className="text-3xl mb-3">👟</span>
              <h3 className="font-extrabold text-[#1a3a6b] text-lg mb-2">Apply for a Vacancy</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
                Browse our current openings for gymnastics and trampolining coaches, lead coaches, and support staff.
              </p>
              <button
                onClick={() => navigate('/portal/careers')}
                className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors text-sm self-start"
              >
                See open roles <ChevronRight size={14} />
              </button>
            </div>
            {/* Coach pool */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col">
              <span className="text-3xl mb-3">📋</span>
              <h3 className="font-extrabold text-white text-lg mb-2">Join the Coach Pool</h3>
              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">
                No current vacancy near you? Register your interest and we'll get in touch when a suitable placement opens up in your area.
              </p>
              <button
                onClick={() => navigate('/portal/coach-pool')}
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm self-start"
              >
                Register interest <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Perks strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { emoji: '🏅', label: 'Funded DBS check' },
              { emoji: '📚', label: 'UKAG CPD & training' },
              { emoji: '📍', label: 'Local placements' },
              { emoji: '💰', label: 'Competitive hourly pay' },
            ].map(p => (
              <div key={p.label} className="bg-white/10 rounded-xl px-3 py-3 text-center">
                <div className="text-xl mb-1">{p.emoji}</div>
                <p className="text-white/80 text-xs font-semibold leading-tight">{p.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs mb-3">Know a great coach? Share our vacancies!</p>
            <ShareFacebookButton
              url="https://www.activeschool.org.uk/portal/careers"
              hashtag="ASOCareers"
              label="Share on Facebook"
            />
          </div>
        </div>
      </section>

      {/* Sponsored banner */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <AdBanner placement="homepage" />
      </div>
    </PortalLayout>
  )
}
