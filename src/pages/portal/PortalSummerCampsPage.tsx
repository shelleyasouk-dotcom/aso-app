import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, ChevronRight, Mail } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const CAMPS = [
  { id: 1, region: 'Region TBC', location: 'Venue to be confirmed', dates: 'Dates coming soon', availability: 'Limited places' },
  { id: 2, region: 'Region TBC', location: 'Venue to be confirmed', dates: 'Dates coming soon', availability: 'Limited places' },
  { id: 3, region: 'Region TBC', location: 'Venue to be confirmed', dates: 'Dates coming soon', availability: 'Limited places' },
]

const INCLUDED = [
  { emoji: '⚽', label: 'Multi-sport sessions' },
  { emoji: '🤸', label: 'Gymnastics' },
  { emoji: '💃', label: 'Dance' },
  { emoji: '🥋', label: 'Martial Arts' },
  { emoji: '🏀', label: 'Basketball' },
  { emoji: '🏃', label: 'Athletics' },
  { emoji: '🎨', label: 'Creative activities' },
  { emoji: '🏅', label: 'UKAG awards' },
]

const WHY_CAMPS = [
  { emoji: '🌍', title: 'Open to everyone', desc: 'Our holiday camps are open to all children in the local area — not just pupils from partner schools.' },
  { emoji: '🛡️', title: 'Safe & supervised', desc: 'DBS-checked coaches, first-aid trained staff, and full safeguarding protocols at every camp.' },
  { emoji: '🏆', title: 'Award progression', desc: 'Children continue their UKAG Award Pathway through the holidays, keeping momentum going over summer.' },
  { emoji: '😄', title: 'All abilities welcome', desc: 'From first-timers to budding athletes — our coaches tailor activities so every child thrives and has fun.' },
]

export function PortalSummerCampsPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5c518] via-[#f59e0b] to-[#d97706] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">☀️</div>
          <div className="inline-flex items-center gap-2 bg-white/30 text-[#7c3c00] text-sm font-extrabold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            Summer 2026 · Coming Soon
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1a3a6b] mb-4 leading-tight">
            ASO Summer<br />Holiday Camps
          </h1>
          <p className="text-[#7c3c00] text-base leading-relaxed mb-3 max-w-xl mx-auto">
            Three action-packed summer camps running across different regions this summer. Open to <strong>all children</strong> — not just pupils from ASO schools.
          </p>
          <p className="text-[#7c3c00]/70 text-sm mb-8">
            Locations and dates to be confirmed. Booking opens soon.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:info@activeschoolorganisation.co.uk?subject=Summer Camp 2026 Enquiry"
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              <Mail size={16} />
              Register Your Interest
            </a>
            <button
              onClick={() => navigate('/portal/clubs')}
              className="inline-flex items-center gap-2 bg-white/40 text-[#1a3a6b] font-semibold px-6 py-3 rounded-xl hover:bg-white/60 transition-colors"
            >
              View Term Clubs
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Open to all banner */}
      <section className="bg-[#1a3a6b] text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: Users, text: 'Open to all children — no school required' },
            { icon: MapPin, text: '3 regional camps across England' },
            { icon: Calendar, text: 'Summer 2026 — dates TBC' },
            { icon: Clock, text: 'Full & half-day options coming' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-[#f5c518] shrink-0" />
              <span className="text-sm font-medium text-white/90">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Camp cards */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Three Camps. Three Regions.</h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          We're finalising locations and dates now. Check back soon — or email us to be the first to know when booking opens.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CAMPS.map(camp => (
            <div key={camp.id} className="bg-white border-2 border-dashed border-[#f5c518] rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-extrabold bg-[#f5c518]/20 text-[#7c3c00] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#f5c518]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">☀️</span>
              </div>
              <p className="text-xs font-extrabold text-[#f5c518] uppercase tracking-widest mb-1">Camp {camp.id}</p>
              <h3 className="font-extrabold text-gray-900 text-lg mb-3">{camp.region}</h3>
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={13} className="shrink-0" />
                  <span className="text-xs">{camp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={13} className="shrink-0" />
                  <span className="text-xs">{camp.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={13} className="shrink-0" />
                  <span className="text-xs">{camp.availability}</span>
                </div>
              </div>
              <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3">
                <p className="text-xs text-gray-400 font-medium">Booking opens soon</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="bg-[#f5c518]/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What's Included</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            A packed programme of sport, activity, and fun — every day of camp.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INCLUDED.map(item => (
              <div key={item.label} className="bg-white border border-[#f5c518]/40 rounded-2xl p-4 text-center">
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-xs font-bold text-gray-700 mt-2 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ASO Camps */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose an ASO Camp?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {WHY_CAMPS.map(item => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4">
              <span className="text-3xl shrink-0">{item.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a3a6b] text-white py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3">Be the First to Know</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            Locations, dates, and pricing are being confirmed now. Get in touch and we'll let you know the moment booking opens — places will be limited.
          </p>
          <a
            href="mailto:info@activeschoolorganisation.co.uk?subject=Summer Camp 2026 — Please Keep Me Updated"
            className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Mail size={16} />
            Email Us to Register Interest
          </a>
          <p className="text-white/40 text-xs mt-4">
            Or call us — we're happy to answer questions about the camps.
          </p>
        </div>
      </section>

    </PortalLayout>
  )
}
