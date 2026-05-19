import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, ChevronRight, Mail, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { School, ClubTerm } from '../../types'

// ─── Known camp venues ─────────────────────────────────────────────────────────
const KNOWN_VENUES = [
  { key: 'salisbury',   match: ['st martin', 'salisbury'],   venue: 'St Martins Primary School', city: 'Salisbury',   region: 'Wiltshire', emoji: '🏰' },
  { key: 'southampton', match: ['sholing', 'southampton'],   venue: 'Sholing Junior School',      city: 'Southampton', region: 'Hampshire', emoji: '🌊' },
  { key: 'basingstoke', match: ['overton', 'basingstoke'],   venue: 'Overton Primary School',     city: 'Basingstoke', region: 'Hampshire', emoji: '🌿' },
  { key: 'poole',       match: ['hamworthy', 'twin sails', 'poole'], venue: 'Hamworthy Twin Sails', city: 'Poole', region: 'Dorset', emoji: '⛵' },
]

const CAMP_DATES = 'Tue 28 – Thu 30 July 2026'
const CAMP_TIME  = '9:15am – 12:15pm daily'
const CAMP_DAYS  = 3


const WHY_CAMPS = [
  { emoji: '🌍', title: 'Open to everyone', desc: 'Our holiday camps are open to all children in the local area — not just pupils from ASO partner schools.' },
  { emoji: '🤸', title: 'Gymnastics focus', desc: 'Structured UKAG Award Pathway sessions each day so children progress through levels 1–6 over summer.' },
  { emoji: '🛡️', title: 'Safe & supervised', desc: 'DBS-checked coaches, first-aid trained staff, and full safeguarding protocols at every camp.' },
  { emoji: '😄', title: 'All abilities welcome', desc: 'From first-timers to budding gymnasts — our coaches tailor activities so every child thrives.' },
]

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LiveTerm extends ClubTerm {
  school: School
  spotsLeft: number
}

type VenueState =
  | { status: 'live';        term: LiveTerm }
  | { status: 'full';        term: LiveTerm }
  | { status: 'coming_soon'; venue: typeof KNOWN_VENUES[0] }

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

function matchesVenue(schoolName: string, city: string, keywords: string[]) {
  const hay = `${schoolName} ${city}`.toLowerCase()
  return keywords.some(k => hay.includes(k.toLowerCase()))
}

// ─── Camp card ─────────────────────────────────────────────────────────────────
function CampCard({ state, emoji }: { state: VenueState; emoji: string }) {
  const navigate = useNavigate()

  if (state.status === 'coming_soon') {
    const v = state.venue
    return (
      <div className="bg-white border-2 border-dashed border-[#f5c518] rounded-2xl p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{emoji}</span>
          <span className="text-[10px] font-extrabold bg-[#f5c518]/20 text-[#7c3c00] px-2.5 py-1 rounded-full uppercase tracking-wide">
            Opening Soon
          </span>
        </div>
        <div>
          <p className="text-xs font-extrabold text-[#f5c518] uppercase tracking-widest mb-0.5">{v.region}</p>
          <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{v.venue}</h3>
          <p className="text-xs text-gray-400 mb-4">{v.city}</p>
        </div>
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={13} className="shrink-0 text-[#f5c518]" />
            <span className="text-xs">{CAMP_DATES}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={13} className="shrink-0 text-[#f5c518]" />
            <span className="text-xs">{CAMP_TIME}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={13} className="shrink-0 text-[#f5c518]" />
            <span className="text-xs">24 places · Limited availability</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-center mb-3">
            <p className="text-lg font-extrabold text-gray-900">£75 <span className="text-xs font-normal text-gray-400">per child</span></p>
            <p className="text-xs text-gray-400 mt-0.5">3 mornings · £25 per day</p>
          </div>
          <a
            href="mailto:info@activeschoolorganisation.co.uk?subject=Summer Camp Enquiry — {v.city}"
            className="w-full flex items-center justify-center gap-2 bg-[#f5c518]/20 text-[#7c3c00] font-semibold text-sm py-2.5 rounded-xl hover:bg-[#f5c518]/30 transition-colors"
          >
            <Mail size={14} />
            Register Interest
          </a>
        </div>
      </div>
    )
  }

  const t = state.term
  const isFull = state.status === 'full'
  const spotsLeft = t.spotsLeft

  return (
    <div className={`bg-white border-2 rounded-2xl p-6 flex flex-col ${isFull ? 'border-gray-200 opacity-75' : 'border-[#1a3a6b]'}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{emoji}</span>
        {isFull ? (
          <span className="text-[10px] font-extrabold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Fully Booked
          </span>
        ) : (
          <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Booking Open
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-extrabold text-[#1a3a6b]/60 uppercase tracking-widest mb-0.5">
          {t.school.area ?? ''}
        </p>
        <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{t.school.name}</h3>
        <p className="text-xs text-gray-400 mb-4">{t.school.area ?? ''}</p>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={13} className="shrink-0 text-[#1a3a6b]" />
          <span className="text-xs">{CAMP_DATES}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock size={13} className="shrink-0 text-[#1a3a6b]" />
          <span className="text-xs">{CAMP_TIME}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Users size={13} className={`shrink-0 ${spotsLeft <= 5 ? 'text-orange-500' : 'text-[#1a3a6b]'}`} />
          <span className={`text-xs font-medium ${spotsLeft <= 5 ? 'text-orange-600' : ''}`}>
            {isFull ? 'No places remaining' : `${spotsLeft} of ${t.capacity} places remaining`}
          </span>
        </div>
        {!isFull && spotsLeft <= 5 && (
          <p className="text-xs font-bold text-orange-600 bg-orange-50 rounded-lg px-2 py-1">
            ⚡ Only {spotsLeft} {spotsLeft === 1 ? 'place' : 'places'} left — book now!
          </p>
        )}
      </div>
      <div className="mt-auto">
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-xl py-3 px-4 text-center mb-3">
          <p className="text-lg font-extrabold text-[#1a3a6b]">{fmtPrice(t.price_pence)} <span className="text-xs font-normal text-gray-400">per child</span></p>
          <p className="text-xs text-gray-400 mt-0.5">{CAMP_DAYS} mornings · {fmtPrice(Math.round(t.price_pence / CAMP_DAYS))} per day</p>
        </div>
        {isFull ? (
          <div className="w-full bg-gray-100 text-gray-400 font-semibold text-sm py-2.5 rounded-xl text-center">
            Fully Booked
          </div>
        ) : (
          <button
            onClick={() => navigate(`/portal/book/${t.id}`)}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#142f58] transition-colors"
          >
            Book Now
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────
export function PortalSummerCampsPage() {
  const navigate = useNavigate()
  const [venueStates, setVenueStates] = useState<(VenueState & { emoji: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCamps() }, [])

  async function loadCamps() {
    // Fetch active summer camp terms (July–August 2026) — no join to avoid silent failures
    const { data: terms } = await supabase
      .from('club_terms')
      .select('*')
      .gte('start_date', '2026-07-01')
      .lte('start_date', '2026-08-31')
      .eq('is_active', true)
      .order('start_date')

    const rawTerms = (terms ?? []) as ClubTerm[]

    // Fetch schools for those terms separately
    const schoolIds = [...new Set(rawTerms.map(t => t.school_id))]
    const schoolMap: Record<string, School> = {}
    if (schoolIds.length > 0) {
      const { data: schoolRows } = await supabase
        .from('schools')
        .select('id,name,area,session_day,session_time')
        .in('id', schoolIds)
      ;(schoolRows ?? []).forEach((s: { id: string; name: string; area: string; session_day: string; session_time: string }) => { schoolMap[s.id] = s as unknown as School })
    }

    const termList: LiveTerm[] = rawTerms.map(t => ({
      ...t,
      school: schoolMap[t.school_id] ?? ({ id: t.school_id, name: '', area: '' } as unknown as School),
      spotsLeft: t.capacity,
    }))

    // Count confirmed bookings per term
    if (termList.length > 0) {
      const { data: bookings } = await supabase
        .from('parent_bookings')
        .select('club_term_id')
        .in('club_term_id', termList.map(t => t.id))
        .eq('status', 'confirmed')
      const counts: Record<string, number> = {}
      ;(bookings ?? []).forEach((b: { club_term_id: string }) => {
        counts[b.club_term_id] = (counts[b.club_term_id] ?? 0) + 1
      })
      termList.forEach(t => { t.spotsLeft = t.capacity - (counts[t.id] ?? 0) })
    }

    // Build venue states: match live terms to known venues, fall back to coming_soon
    const states: (VenueState & { emoji: string })[] = KNOWN_VENUES.map(v => {
      const matched = termList.find(t =>
        matchesVenue(t.school?.name ?? '', t.school?.area ?? '', v.match)
      )
      if (matched) {
        const s: VenueState = matched.spotsLeft <= 0
          ? { status: 'full', term: matched }
          : { status: 'live', term: matched }
        return { ...s, emoji: v.emoji }
      }
      return { status: 'coming_soon', venue: v, emoji: v.emoji }
    })

    // Append any extra summer terms that don't match the known venues
    termList.forEach(t => {
      const alreadyShown = states.some(s =>
        s.status !== 'coming_soon' && s.term.id === t.id
      )
      if (!alreadyShown) {
        const s: VenueState = t.spotsLeft <= 0
          ? { status: 'full', term: t }
          : { status: 'live', term: t }
        states.push({ ...s, emoji: '🏅' })
      }
    })

    setVenueStates(states)
    setLoading(false)
  }

  const liveCount   = venueStates.filter(s => s.status === 'live').length
  const bookedCount = venueStates.filter(s => s.status === 'full').length

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5c518] via-[#f59e0b] to-[#d97706] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">☀️</div>
          <div className="inline-flex items-center gap-2 bg-white/30 text-[#7c3c00] text-sm font-extrabold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            Summer 2026 · Gymnastics Camps
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1a3a6b] mb-4 leading-tight">
            ASO Summer<br />Holiday Camps
          </h1>
          <p className="text-[#7c3c00] text-base leading-relaxed mb-2 max-w-xl mx-auto">
            Four gymnastics camps across Hampshire, Wiltshire and Dorset this summer. Open to <strong>all children</strong> — no school connection required.
          </p>
          <p className="text-[#7c3c00]/80 font-semibold text-sm mb-8">
            📅 28–30 July &nbsp;·&nbsp; 🕘 9:15am – 12:15pm &nbsp;·&nbsp; 💰 £75 per child
          </p>
          {liveCount > 0 ? (
            <button
              onClick={() => document.getElementById('camps-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              Book Your Place
              <ChevronRight size={16} />
            </button>
          ) : (
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
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#1a3a6b] text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: MapPin,     text: '4 venues across England' },
            { icon: Calendar,   text: '28–30 July 2026 · 3 days' },
            { icon: Clock,      text: '9:15am – 12:15pm each day' },
            { icon: Users,      text: 'Max 24 children per venue' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-[#f5c518] shrink-0" />
              <span className="text-sm font-medium text-white/90">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Camp cards */}
      <section id="camps-grid" className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {liveCount > 0 ? 'Choose Your Venue' : 'Four Camps. Four Regions.'}
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          {liveCount > 0
            ? `${liveCount} venue${liveCount > 1 ? 's' : ''} now open for booking${bookedCount > 0 ? ` · ${bookedCount} fully booked` : ''} — places are limited, book early to avoid disappointment.`
            : 'Booking opens very soon. Register your interest below to be notified the moment places go live.'}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {venueStates.map((s, i) => (
              <CampCard key={i} state={s} emoji={s.emoji} />
            ))}
          </div>
        )}
      </section>

      {/* UKAG callout */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-[#1a3a6b] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="text-5xl shrink-0">🏅</div>
          <div>
            <h3 className="font-extrabold text-lg mb-2">UKAG Award Pathway at Every Camp</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Every session follows the nationally recognised UKAG Award Pathway. Children progress through Levels 1–6, earning badges and certificates they carry forward into the autumn term.
            </p>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
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

      {/* What to bring */}
      <section className="bg-amber-50 border-t border-b border-amber-200 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">What to Bring</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: '👟', text: 'Trainers or bare feet (gymnastics)' },
              { emoji: '💧', text: 'Named water bottle' },
              { emoji: '🥪', text: 'Packed snack / light lunch' },
              { emoji: '🧴', text: 'Sun cream applied before arrival' },
              { emoji: '👕', text: 'Comfortable sports clothing' },
              { emoji: '📋', text: 'Consent form completed online' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2 bg-white border border-amber-100 rounded-xl p-3">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <p className="text-xs text-gray-600 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Questions</h2>
        <div className="flex flex-col gap-4">
          {[
            { q: 'Who can attend?', a: 'Any child aged 4–11. Our camps are open to all — you don\'t need to be enrolled at an ASO partner school.' },
            { q: 'What age is the camp suitable for?', a: 'We cater for children from Reception through to Year 6 (ages 4–11). Coaches group children by ability, not just age.' },
            { q: 'Is my child\'s place confirmed after booking?', a: 'Yes — once you complete the Stripe payment, your place is confirmed and you\'ll receive an email summary with all the details.' },
            { q: 'What if we need to cancel?', a: 'Please email us as soon as possible. We\'ll do our best to offer a transfer to another venue or a credit for the next available camp.' },
            { q: 'Do children need any prior gymnastics experience?', a: 'Not at all. We start from Level 1 and all activities are tailored to each child\'s current ability.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-[#1a3a6b] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{q}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#1a3a6b] text-white py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          {liveCount > 0 ? (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-3">Ready to Book?</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Places at each venue are limited to 24 children. Scroll up to choose your venue and secure your child's place now.
              </p>
              <button
                onClick={() => document.getElementById('camps-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                Book a Place
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-2xl font-bold mb-3">Be the First to Know</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Booking opens very soon. Get in touch and we'll notify you the moment places go live — they will fill fast.
              </p>
              <a
                href="mailto:info@activeschoolorganisation.co.uk?subject=Summer Camp 2026 — Please Keep Me Updated"
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                <Mail size={16} />
                Register Interest
              </a>
            </>
          )}
        </div>
      </section>

    </PortalLayout>
  )
}
