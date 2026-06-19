import { useState, useEffect } from 'react'
import { MapPin, Calendar, Clock, ChevronRight, Mail, CheckCircle, ExternalLink, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { HolidayCamp } from '../../types'

const EMAIL = 'info@activeschool.org.uk'
const EARLY_BIRD_DEADLINE = new Date('2026-06-21T23:59:59')
const EARLY_BIRD_PENCE = 6750
const STANDARD_PENCE  = 7500

const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3']

const INCLUDED = [
  'Gymnastics activities — floor skills and apparatus work',
  'Team games and challenges',
  'Confidence-building activities',
  'Fun competitions and awards',
  'Qualified and DBS-checked coaching staff',
  'Safe, inclusive environment for all abilities',
]

const WHY_LIST = [
  { emoji: '🤸', text: 'Build gymnastics skills and physical literacy' },
  { emoji: '🤝', text: 'Encourage teamwork and new friendships' },
  { emoji: '💪', text: 'Build confidence in a fun, supportive space' },
  { emoji: '🏅', text: 'UKAG Award Pathway — earn badges and certificates' },
  { emoji: '☀️', text: 'Keep children active and engaged over summer' },
  { emoji: '🛡️', text: 'Safeguarding-trained, DBS-checked coaches at every session' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmtShortDate(str: string): string {
  const d = parseLocalDate(str)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ─── Venue group ──────────────────────────────────────────────────────────────

type VenueGroup = { venue_name: string; city: string; region: string; weeks: HolidayCamp[] }

function groupByVenue(camps: HolidayCamp[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>()
  camps.forEach(c => {
    const key = c.venue_name
    if (!map.has(key)) map.set(key, { venue_name: c.venue_name, city: c.city ?? '', region: c.region ?? '', weeks: [] })
    map.get(key)!.weeks.push(c)
  })
  return Array.from(map.values())
}

function WeekRow({ camp, weekLabel, isEarlyBird }: { camp: HolidayCamp; weekLabel: string; isEarlyBird: boolean }) {
  const CAMPS_URL = 'https://activeschool.classforkids.io/camps'

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border ${
      camp.is_full ? 'bg-gray-50 border-gray-200' : 'bg-white border-[#1a3a6b]/15 hover:border-[#1a3a6b]/40 transition-colors'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xs font-extrabold text-[#1a3a6b] bg-[#1a3a6b]/10 px-2.5 py-1 rounded-lg shrink-0">{weekLabel}</span>
        <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
          <Calendar size={12} className="shrink-0 text-[#1a3a6b]" />
          <span className="text-sm">{fmtShortDate(camp.start_date)} – {fmtShortDate(camp.end_date)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-gray-400">
          <Clock size={12} className="shrink-0" />
          <span className="text-xs">9:15am – 12:15pm</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-extrabold text-[#1a3a6b] text-sm leading-none">
            £{((isEarlyBird ? EARLY_BIRD_PENCE : STANDARD_PENCE) / 100).toFixed(2)}
          </p>
          {isEarlyBird && (
            <p className="text-[10px] text-green-600 font-semibold mt-0.5">Early bird</p>
          )}
        </div>

        {camp.is_full ? (
          <span className="text-xs font-semibold bg-gray-100 text-gray-400 px-3 py-2 rounded-xl whitespace-nowrap">Fully booked</span>
        ) : (
          <a
            href={CAMPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#1a3a6b] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors whitespace-nowrap"
          >
            <ExternalLink size={12} /> Book Now
          </a>
        )}
      </div>
    </div>
  )
}

function VenueCard({ group, isEarlyBird }: { group: VenueGroup; isEarlyBird: boolean }) {
  const hasBooking = group.weeks.some(w => !!w.booking_url)
  const availableCount = group.weeks.filter(w => !w.is_full).length

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Venue header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1e4a8c] px-6 py-4 flex items-start justify-between">
        <div>
          <p className="text-[#f5c518] text-[10px] font-extrabold uppercase tracking-widest mb-0.5">{group.region}</p>
          <h3 className="text-white font-extrabold text-lg leading-tight">{group.city}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-white/50 shrink-0" />
            <p className="text-white/60 text-xs">{group.venue_name}</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          {availableCount > 0 ? (
            <span className="text-[10px] font-extrabold bg-green-400/20 text-green-300 px-2.5 py-1 rounded-full uppercase">
              {availableCount} week{availableCount !== 1 ? 's' : ''} open
            </span>
          ) : (
            <span className="text-[10px] font-extrabold bg-gray-400/20 text-gray-300 px-2.5 py-1 rounded-full uppercase">
              Fully booked
            </span>
          )}
          {!hasBooking && availableCount > 0 && (
            <p className="text-white/40 text-[10px] mt-1">Booking coming soon</p>
          )}
        </div>
      </div>

      {/* Week rows */}
      <div className="p-4 flex flex-col gap-2">
        {group.weeks.map((camp, i) => (
          <WeekRow key={camp.id} camp={camp} weekLabel={WEEK_LABELS[i] ?? `Week ${i + 1}`} isEarlyBird={isEarlyBird} />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function PortalSummerCampsPage() {
  const [camps, setCamps] = useState<HolidayCamp[]>([])
  const [loading, setLoading] = useState(true)
  const isEarlyBird = new Date() < EARLY_BIRD_DEADLINE

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('holiday_camps')
      .select('*')
      .eq('is_published', true)
      .eq('camp_type', 'summer')
      .gte('end_date', today)
      .order('display_order')
      .then(({ data }) => {
        setCamps((data ?? []) as HolidayCamp[])
        setLoading(false)
      })
  }, [])

  const venues = groupByVenue(camps)
  const totalOpen = camps.filter(c => !c.is_full).length

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
            ASO Summer<br />GymCamps 2026
          </h1>
          <p className="text-[#7c3c00] text-base leading-relaxed mb-2 max-w-xl mx-auto">
            Six venues across Hampshire, Wiltshire, Dorset and Bristol. Open to <strong>all children aged 4–11</strong> — no school connection required.
          </p>
          <p className="text-[#7c3c00]/80 font-semibold text-sm mb-8">
            📅 28 Jul – 20 Aug 2026 &nbsp;·&nbsp; 🕘 9:15am – 12:15pm &nbsp;·&nbsp; 3 days per week
          </p>
          {totalOpen > 0 && (
            <button
              onClick={() => document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              Book Your Place <ChevronRight size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Early bird banner */}
      {isEarlyBird && (
        <section className="bg-green-600 text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
            <Tag size={15} className="shrink-0" />
            <p className="text-sm font-bold">
              Early Bird Offer — save £7.50 per camp when you book before 21 June 2026
            </p>
            <span className="text-green-200 text-sm font-extrabold">£67.50 per child &nbsp;(was £75.00)</span>
          </div>
        </section>
      )}

      {/* Pricing bar */}
      <section className="bg-[#1a3a6b] text-white py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          <div>
            <p className="text-[#f5c518] font-extrabold text-2xl leading-none">
              {isEarlyBird ? '£67.50' : '£75.00'}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {isEarlyBird ? 'Early bird price per child' : 'Standard price per child'}
            </p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div>
            <p className="text-white font-extrabold text-lg leading-none">3 days</p>
            <p className="text-white/60 text-xs mt-1">Per camp (Tue–Thu)</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div>
            <p className="text-white font-extrabold text-lg leading-none">6 venues</p>
            <p className="text-white/60 text-xs mt-1">Hampshire · Wiltshire · Dorset · Bristol</p>
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div>
            <p className="text-white font-extrabold text-lg leading-none">Ages 4–11</p>
            <p className="text-white/60 text-xs mt-1">Reception to Year 6 · all abilities</p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What's Included</h2>
        <p className="text-gray-500 text-sm text-center mb-8">Every camp includes all of the following — no hidden extras.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INCLUDED.map(item => (
            <div key={item} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Venue booking grid */}
      <section id="venues" className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Choose Your Venue & Week</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Each camp runs Tue–Thu, 9:15am–12:15pm. Book securely through ClassForKids.
          </p>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-gray-200" />)}
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-4">Camps will appear here once published — check back soon!</p>
              <a
                href={`mailto:${EMAIL}?subject=Summer Camp 2026 Enquiry`}
                className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
              >
                <Mail size={14} /> Register Interest
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {venues.map(group => (
                <VenueCard key={group.venue_name} group={group} isEarlyBird={isEarlyBird} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Who can attend */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Who Can Attend?</h2>
            <div className="flex flex-col gap-3">
              {[
                'Reception to Year 6 (ages 4–11)',
                'Boys and girls equally welcome',
                'Current Active School members and non-members',
                'All abilities welcome — complete beginners to experienced gymnasts',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-[#1a3a6b] shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Why Choose ASO?</h2>
            <div className="flex flex-col gap-3">
              {WHY_LIST.map(item => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 leading-none mt-0.5">{item.emoji}</span>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What to bring */}
      <section className="bg-amber-50 border-t border-b border-amber-200 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">What to Bring</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: '👟', text: 'Trainers or bare feet' },
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
            { q: 'Who can attend?', a: "Any child aged 4–11. Our camps are open to all — you don't need to be enrolled at an ASO partner school." },
            { q: 'How does the early bird offer work?', a: 'Book any camp before 21st June 2026 and pay just £67.50 per child. After that date the standard price of £75.00 applies.' },
            { q: 'What are the camp dates?', a: 'Week 1: 28–30 July · Week 2: 4–6 August · Week 3: 18–20 August. All camps run Tuesday to Thursday, 9:15am–12:15pm.' },
            { q: 'How do I book?', a: 'Click "Book Now" on your chosen venue and week. This takes you to our ClassForKids page where you can create an account and pay securely online.' },
            { q: 'What if we need to cancel?', a: 'Email us as soon as possible. We\'ll do our best to transfer you to another date or venue, or issue a credit.' },
            { q: 'Do children need any prior gymnastics experience?', a: 'Not at all. We start from Level 1 and coaches group children by ability. Complete beginners are very welcome.' },
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
          {totalOpen > 0 ? (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-3">Ready to Book?</h2>
              {isEarlyBird && (
                <p className="text-[#f5c518] font-bold text-sm mb-2">Early bird: £67.50 — offer ends 21 June 2026</p>
              )}
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Places are limited at each venue. Scroll up to pick your location and week.
              </p>
              <button
                onClick={() => document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                Book a Place <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-2xl font-bold mb-3">Be the First to Know</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Booking opens very soon. Get in touch and we'll notify you the moment places go live.
              </p>
              <a
                href={`mailto:${EMAIL}?subject=Summer Camp 2026 — Please Keep Me Updated`}
                className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
              >
                <Mail size={16} /> Register Interest
              </a>
            </>
          )}
        </div>
      </section>

    </PortalLayout>
  )
}
