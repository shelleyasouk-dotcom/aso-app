import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Trophy, Users, Star, ChevronRight, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'

const SPORTS = [
  { emoji: '⚽', name: 'Football' },
  { emoji: '🏀', name: 'Basketball' },
  { emoji: '🏏', name: 'Cricket' },
  { emoji: '🏐', name: 'Netball' },
  { emoji: '🏉', name: 'Tag Rugby' },
  { emoji: '🎾', name: 'Tennis' },
  { emoji: '🤸', name: 'Gymnastics' },
  { emoji: '🏃', name: 'Athletics' },
  { emoji: '🧘', name: 'Yoga' },
  { emoji: '🤾', name: 'Trampolining' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Find Your Club', desc: 'Search by region or school to see ASO clubs near you.' },
  { step: '2', title: 'Book a Place', desc: 'Secure your child\'s spot with our simple booking process.' },
  { step: '3', title: 'Get Active!', desc: 'Your child joins expert-led sessions and progresses through the UKAG Award Pathway.' },
]

// ─── Example timetable ────────────────────────────────────────────────────────

type Venue = 'hall' | 'outdoor' | 'classroom'
interface TimetableClass {
  emoji: string
  sport: string
  ks: string          // 'KS1' | 'KS2' | 'Mixed'
  years: string       // e.g. 'Yr 1 & 2'
  multiDay?: string   // e.g. 'Mon & Wed'
}

const VENUE_STYLE: Record<Venue, { bg: string; border: string; text: string; dot: string; label: string; rowBg: string }> = {
  hall:      { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'Sports Hall',   rowBg: 'bg-blue-600' },
  outdoor:   { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Outdoor Space', rowBg: 'bg-green-600' },
  classroom: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Classroom',     rowBg: 'bg-purple-600' },
}

const KS_STYLE: Record<string, string> = {
  KS1:   'bg-amber-100 text-amber-800',
  KS2:   'bg-sky-100 text-sky-800',
  Mixed: 'bg-gray-100 text-gray-600',
}

// Outer key = venue row. Inner key = day. Value = one class or null.
const EXAMPLE_TIMETABLE: Record<Venue, Record<string, TimetableClass | null>> = {
  hall: {
    Monday:    { emoji: '⚽', sport: 'Football',     ks: 'KS2', years: 'Yr 5 & 6', multiDay: 'Mon & Wed' },
    Tuesday:   { emoji: '🤸', sport: 'Gymnastics',  ks: 'KS1', years: 'Yr 1 & 2' },
    Wednesday: { emoji: '🏀', sport: 'Basketball',  ks: 'KS2', years: 'Yr 5 & 6' },
    Thursday:  { emoji: '💃', sport: 'Dance',        ks: 'KS2', years: 'Yr 3–6',  multiDay: 'Mon & Thu' },
    Friday:    { emoji: '🥋', sport: 'Martial Arts', ks: 'KS2', years: 'Yr 4–6' },
  },
  outdoor: {
    Monday:    { emoji: '🏐', sport: 'Netball',    ks: 'KS1', years: 'Yr 3 & 4' },
    Tuesday:   { emoji: '🏏', sport: 'Cricket',    ks: 'KS2', years: 'Yr 5 & 6' },
    Wednesday: { emoji: '⚽', sport: 'Football',   ks: 'KS1', years: 'Yr 3 & 4', multiDay: 'Mon & Wed' },
    Thursday:  { emoji: '🏉', sport: 'Tag Rugby',  ks: 'KS1', years: 'Yr 1 & 2' },
    Friday:    { emoji: '🏃', sport: 'Athletics',  ks: 'Mixed', years: 'All years' },
  },
  classroom: {
    Monday:    { emoji: '💃', sport: 'Dance',  ks: 'KS1', years: 'Yr 1 & 2', multiDay: 'Mon & Thu' },
    Tuesday:   null,
    Wednesday: { emoji: '🧘', sport: 'Yoga',   ks: 'Mixed', years: 'All years' },
    Thursday:  null,
    Friday:    null,
  },
}

const EXAMPLE_WEEKS = [
  { label: 'Wk 1', dates: '7–11 Sep' },
  { label: 'Wk 2', dates: '14–18 Sep' },
  { label: 'Wk 3', dates: '21–25 Sep' },
  { label: 'Wk 4', dates: '28 Sep–2 Oct' },
  { label: 'Wk 5', dates: '5–9 Oct' },
  { label: 'Wk 6', dates: '12–16 Oct' },
]

const VENUES: Venue[] = ['hall', 'outdoor', 'classroom']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri',
}

function ClassCard({ cls, venue }: { cls: TimetableClass; venue: Venue }) {
  const v = VENUE_STYLE[venue]
  return (
    <div className={`rounded-xl border p-2.5 h-full ${v.bg} ${v.border}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-base leading-none">{cls.emoji}</span>
        <span className={`text-xs font-extrabold leading-tight ${v.text}`}>{cls.sport}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${KS_STYLE[cls.ks]}`}>{cls.ks}</span>
        {cls.multiDay && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f5c518]/30 text-[#7a5c00]">
            {cls.multiDay}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{cls.years}</p>
    </div>
  )
}

export function PortalHomePage() {
  const navigate = useNavigate()
  const [regions, setRegions] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('schools')
      .select('area')
      .not('area', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((r: { area: string }) => r.area).filter(Boolean))]
        setRegions(unique.sort())
      })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/portal/clubs?q=${encodeURIComponent(search)}`)
  }

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img
            src="/AS Brand Sheet (2) - Edited.png"
            alt="Active School"
            className="w-44 h-44 object-contain mx-auto -mb-2"
          />
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star size={14} />
            UK's Premier School Sports Clubs
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Sport &amp; Fun for<br />Every Young Person
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            ASO runs award-winning after-school sports clubs across the UK. Find a club at your child's school and watch them thrive.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
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
      </section>

      {/* Stats bar */}
      <section className="bg-[#f5c518] py-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-8">
          {[
            { icon: Users, label: 'Children Coached', value: '5,000+' },
            { icon: MapPin, label: 'Schools', value: '100+' },
            { icon: Trophy, label: 'Awards Given', value: '10,000+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={20} className="text-[#1a3a6b]" />
              <div>
                <p className="font-extrabold text-[#1a3a6b] text-xl leading-none">{value}</p>
                <p className="text-[#1a3a6b]/70 text-xs font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summer Camps teaser */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-2">
        <div
          onClick={() => navigate('/portal/summer-camps')}
          className="cursor-pointer bg-gradient-to-r from-[#f5c518] to-[#f59e0b] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 hover:shadow-lg transition-shadow"
        >
          <span className="text-5xl shrink-0">☀️</span>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] text-[10px] font-extrabold px-2.5 py-1 rounded-full mb-1.5 uppercase tracking-wide">
              New · Summer 2026
            </div>
            <h3 className="font-extrabold text-[#1a3a6b] text-lg leading-tight mb-1">ASO Summer Holiday Camps</h3>
            <p className="text-[#7c3c00] text-sm">
              Three camps across different regions — <strong>open to all children</strong>, not just school pupils. Locations and booking coming soon.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-[#1a3a6b] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors">
              Find Out More <ChevronRight size={15} />
            </span>
          </div>
        </div>
      </section>

      {/* Browse by region */}
      {regions.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
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

      {/* Sports we offer */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sports We Offer</h2>
          <p className="text-gray-500 text-sm mb-6">Multi-sport programmes tailored for primary school children.</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {SPORTS.map(sport => (
              <button
                key={sport.name}
                onClick={() => navigate('/portal/sports')}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 hover:border-[#1a3a6b] hover:shadow-sm transition-all"
              >
                <span className="text-3xl">{sport.emoji}</span>
                <span className="text-xs font-medium text-gray-600 text-center leading-tight">{sport.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/portal/sports')}
              className="text-sm font-medium text-[#1a3a6b] hover:underline"
            >
              Learn more about our sports programmes →
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
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
      </section>

      {/* Example timetable */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-block bg-[#f5c518] text-[#1a3a6b] text-xs font-extrabold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
              Example Term
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">A Full Term at Maple Primary</h2>
            <p className="text-gray-500 text-sm">Autumn Term 1 · September – October 2026 · 6-week block · 20 sessions per week</p>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              { value: '6', label: 'Weeks' },
              { value: '10', label: 'Sports' },
              { value: '13', label: 'Sessions / week' },
              { value: '3', label: 'Venues on site' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-[#1a3a6b]">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-5 mb-6">
            {VENUES.map(v => (
              <div key={v} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${VENUE_STYLE[v].dot}`} />
                <span className="text-xs font-medium text-gray-600">{VENUE_STYLE[v].label}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KS_STYLE['KS1']}`}>KS1</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${KS_STYLE['KS2']}`}>KS2</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5c518]/30 text-[#7a5c00]">Multi-day</span>
            </div>
          </div>

          {/* Timetable grid — horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="min-w-[600px]">

              {/* Day headers */}
              <div className="grid grid-cols-[110px_1fr_1fr_1fr_1fr_1fr] gap-1.5 mb-1.5">
                <div className="flex items-end pb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">3:15–4:15pm</span>
                </div>
                {DAYS.map(day => (
                  <div key={day} className="bg-[#1a3a6b] text-white text-xs font-bold py-2 rounded-lg text-center">
                    {DAY_SHORT[day]}
                  </div>
                ))}
              </div>

              {/* One row per venue */}
              {VENUES.map(venue => {
                const v = VENUE_STYLE[venue]
                return (
                  <div key={venue} className="grid grid-cols-[110px_1fr_1fr_1fr_1fr_1fr] gap-1.5 mb-1.5">
                    {/* Venue label */}
                    <div className={`${v.rowBg} text-white rounded-lg flex items-center justify-center px-2 py-2`}>
                      <span className="text-[10px] font-extrabold text-center leading-tight">{v.label}</span>
                    </div>
                    {/* Day cells */}
                    {DAYS.map(day => {
                      const cls = EXAMPLE_TIMETABLE[venue][day]
                      return (
                        <div key={day} className="min-h-[80px]">
                          {cls
                            ? <ClassCard cls={cls} venue={venue} />
                            : <div className="h-full rounded-xl border border-dashed border-gray-200 bg-white/50" />
                          }
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Multi-day clubs callout */}
          <div className="mt-5 bg-[#f5c518]/10 border border-[#f5c518]/40 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center justify-center">
            <span className="text-xs font-bold text-gray-700">Multi-day clubs this term:</span>
            <span className="text-xs text-gray-600">⚽ Football runs <strong>Mon</strong> (KS2) &amp; <strong>Wed</strong> (KS1)</span>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <span className="text-xs text-gray-600">💃 Dance runs <strong>Mon</strong> (KS1) &amp; <strong>Thu</strong> (KS2)</span>
          </div>

          {/* 6-week strip */}
          <div className="mt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center mb-3">6-Week Block</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EXAMPLE_WEEKS.map((wk, i) => (
                <div key={wk.label} className={`rounded-xl border text-center py-3 px-2 ${
                  i === 0 ? 'bg-[#1a3a6b] border-[#1a3a6b]' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-extrabold ${i === 0 ? 'text-[#f5c518]' : 'text-[#1a3a6b]'}`}>{wk.label}</p>
                  <p className={`text-[10px] mt-0.5 ${i === 0 ? 'text-white/70' : 'text-gray-400'}`}>{wk.dates}</p>
                  <p className={`text-[10px] font-semibold mt-1 ${i === 0 ? 'text-white/90' : 'text-gray-500'}`}>13 sessions</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Example only — actual sports and times vary by school. Contact us to discuss what's possible.
          </p>

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
            <p className="text-white/70 text-sm leading-relaxed mb-5">Find a club at your child's school, book online, and watch them thrive in expert-led after-school sessions.</p>
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
            <p className="text-gray-500 text-sm leading-relaxed mb-5">Bring ASO to your school or authority. We manage everything — coaching, registers, reporting, and parent bookings.</p>
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              🏃 Join the Team
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Work With Us</h2>
            <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
              Passionate about sport and young people? We're always looking for energetic coaches to join our growing team across the UK.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {/* Apply */}
            <div className="bg-white rounded-2xl p-6 flex flex-col">
              <span className="text-3xl mb-3">👟</span>
              <h3 className="font-extrabold text-[#1a3a6b] text-lg mb-2">Apply for a Vacancy</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
                Browse our current openings for sports coaches, lead coaches and support staff across all areas.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji: '🏅', label: 'Funded DBS check' },
              { emoji: '📚', label: 'CPD & training support' },
              { emoji: '📍', label: 'Local placements' },
              { emoji: '💰', label: 'Competitive hourly pay' },
            ].map(p => (
              <div key={p.label} className="bg-white/10 rounded-xl px-3 py-3 text-center">
                <div className="text-xl mb-1">{p.emoji}</div>
                <p className="text-white/80 text-xs font-semibold leading-tight">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PortalLayout>
  )
}
