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
interface TimetableClass { venue: Venue; emoji: string; sport: string; years: string }
interface DaySlots { early: TimetableClass[]; late: TimetableClass[] }

const VENUE_STYLE: Record<Venue, { bg: string; border: string; text: string; dot: string; label: string }> = {
  hall:      { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'Sports Hall' },
  outdoor:   { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800',  dot: 'bg-green-500',  label: 'Outdoor Space' },
  classroom: { bg: 'bg-purple-50', border: 'border-purple-200',text: 'text-purple-800', dot: 'bg-purple-500', label: 'Classroom' },
}

const EXAMPLE_TIMETABLE: Record<string, DaySlots> = {
  Monday: {
    early: [
      { venue: 'hall',    emoji: '🤸', sport: 'Gymnastics',  years: 'Yr 3 & 4' },
      { venue: 'outdoor', emoji: '⚽', sport: 'Football',    years: 'Yr 5 & 6' },
    ],
    late: [
      { venue: 'hall',      emoji: '🤸', sport: 'Gymnastics', years: 'Yr 5 & 6' },
      { venue: 'classroom', emoji: '🧘', sport: 'Yoga',       years: 'Mixed' },
    ],
  },
  Tuesday: {
    early: [
      { venue: 'hall',    emoji: '🏀', sport: 'Basketball', years: 'Yr 4 & 5' },
      { venue: 'outdoor', emoji: '🏉', sport: 'Tag Rugby',  years: 'Yr 3 & 4' },
    ],
    late: [
      { venue: 'hall',    emoji: '🏐', sport: 'Netball',   years: 'Yr 5 & 6' },
      { venue: 'outdoor', emoji: '🏉', sport: 'Tag Rugby', years: 'Yr 5 & 6' },
    ],
  },
  Wednesday: {
    early: [
      { venue: 'hall',    emoji: '🤾', sport: 'Trampolining', years: 'Yr 3 & 4' },
      { venue: 'outdoor', emoji: '🎾', sport: 'Tennis',       years: 'Yr 3–5' },
    ],
    late: [
      { venue: 'hall',    emoji: '🤾', sport: 'Trampolining', years: 'Yr 5 & 6' },
      { venue: 'outdoor', emoji: '⚽', sport: 'Football',     years: 'Yr 3 & 4' },
    ],
  },
  Thursday: {
    early: [
      { venue: 'hall',    emoji: '🏃', sport: 'Multi-sport', years: 'Yr 3 & 4' },
      { venue: 'outdoor', emoji: '🏏', sport: 'Cricket',     years: 'Yr 4 & 5' },
    ],
    late: [
      { venue: 'hall',      emoji: '🏀', sport: 'Basketball', years: 'Yr 5 & 6' },
      { venue: 'classroom', emoji: '🧘', sport: 'Yoga',       years: 'Mixed' },
    ],
  },
  Friday: {
    early: [
      { venue: 'hall',    emoji: '🏐', sport: 'Netball',   years: 'Yr 3 & 4' },
      { venue: 'outdoor', emoji: '🏃', sport: 'Athletics', years: 'Yr 5 & 6' },
    ],
    late: [
      { venue: 'hall',    emoji: '🏃', sport: 'Multi-sport', years: 'Yr 5 & 6' },
      { venue: 'outdoor', emoji: '⚽', sport: 'Football',    years: 'Mixed' },
    ],
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri',
}

function ClassCard({ cls }: { cls: TimetableClass }) {
  const v = VENUE_STYLE[cls.venue]
  return (
    <div className={`rounded-lg border px-2 py-1.5 ${v.bg} ${v.border}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-sm">{cls.emoji}</span>
        <span className={`text-xs font-bold leading-tight ${v.text}`}>{cls.sport}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
        <span className="text-[10px] text-gray-500 leading-none">{v.label}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">{cls.years}</p>
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
              { value: '120', label: 'Sessions in term' },
              { value: '3', label: 'Venues on site' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-[#1a3a6b]">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-5">
            {(Object.entries(VENUE_STYLE) as [Venue, typeof VENUE_STYLE[Venue]][]).map(([, v]) => (
              <div key={v.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                <span className="text-xs font-medium text-gray-600">{v.label}</span>
              </div>
            ))}
          </div>

          {/* Timetable grid — horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[640px]">

              {/* Day headers */}
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] gap-2 mb-2">
                <div />
                {DAYS.map(day => (
                  <div key={day} className="text-center">
                    <div className="bg-[#1a3a6b] text-white text-xs font-bold py-2 rounded-lg">{DAY_SHORT[day]}</div>
                  </div>
                ))}
              </div>

              {/* 3:15pm row */}
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] gap-2 mb-2">
                <div className="flex items-start pt-1">
                  <span className="text-xs font-bold text-gray-500 leading-tight">3:15–<br/>4:15pm</span>
                </div>
                {DAYS.map(day => (
                  <div key={day} className="flex flex-col gap-1">
                    {EXAMPLE_TIMETABLE[day].early.map((cls, i) => (
                      <ClassCard key={i} cls={cls} />
                    ))}
                  </div>
                ))}
              </div>

              {/* 4:15pm row */}
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] gap-2">
                <div className="flex items-start pt-1">
                  <span className="text-xs font-bold text-gray-500 leading-tight">4:15–<br/>5:15pm</span>
                </div>
                {DAYS.map(day => (
                  <div key={day} className="flex flex-col gap-1">
                    {EXAMPLE_TIMETABLE[day].late.map((cls, i) => (
                      <ClassCard key={i} cls={cls} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6-week strip */}
          <div className="mt-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center mb-3">6-Week Block</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EXAMPLE_WEEKS.map((wk, i) => (
                <div key={wk.label} className={`rounded-xl border text-center py-3 px-2 ${
                  i === 0 ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-extrabold ${i === 0 ? 'text-[#f5c518]' : 'text-[#1a3a6b]'}`}>{wk.label}</p>
                  <p className={`text-[10px] mt-0.5 ${i === 0 ? 'text-white/70' : 'text-gray-400'}`}>{wk.dates}</p>
                  <p className={`text-[10px] font-semibold mt-1 ${i === 0 ? 'text-white/90' : 'text-gray-500'}`}>20 sessions</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Example only — actual sports and times vary by school. Contact us to discuss what's possible at your school.
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

      {/* CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 text-sm mb-6">Find a club near your school and book your child's first session.</p>
        <button
          onClick={() => navigate('/portal/clubs')}
          className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
        >
          Find a Club Near You
          <ChevronRight size={16} />
        </button>
      </section>
    </PortalLayout>
  )
}
