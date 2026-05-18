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
