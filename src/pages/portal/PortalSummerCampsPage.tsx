import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, ChevronRight, Mail, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { HolidayCamp } from '../../types'

const EMAIL = 'info@activeschool.org.uk'

const WHY_CAMPS = [
  { emoji: '🌍', title: 'Open to everyone', desc: "Our holiday camps are open to all children in the local area — not just pupils from ASO partner schools." },
  { emoji: '🤸', title: 'Gymnastics focus', desc: 'Structured UKAG Award Pathway sessions each day so children progress through levels 1–6 over the holidays.' },
  { emoji: '🛡️', title: 'Safe & supervised', desc: 'DBS-checked coaches, first-aid trained staff, and full safeguarding protocols at every camp.' },
  { emoji: '😄', title: 'All abilities welcome', desc: "From first-timers to budding gymnasts — our coaches tailor activities so every child thrives." },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start)
  const e = parseLocalDate(end)
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${DAYS[s.getDay()]} ${s.getDate()} – ${DAYS[e.getDay()]} ${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`
  }
  return `${DAYS[s.getDay()]} ${s.getDate()} ${MONTHS[s.getMonth()]} – ${DAYS[e.getDay()]} ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`
}

function numDays(start: string, end: string): number {
  return Math.round((parseLocalDate(end).getTime() - parseLocalDate(start).getTime()) / 86_400_000) + 1
}

function fmtPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

// ─── Camp card ─────────────────────────────────────────────────────────────────

function CampCard({ camp }: { camp: HolidayCamp }) {
  const days = numDays(camp.start_date, camp.end_date)
  const pricePerDay = days > 0 ? Math.round(camp.price_pence / days) : camp.price_pence
  const timeLabel = camp.session_start_time && camp.session_end_time
    ? `${camp.session_start_time} – ${camp.session_end_time} daily`
    : camp.session_start_time ?? ''

  const bookingHref = camp.booking_url ?? `mailto:${EMAIL}?subject=${encodeURIComponent(`Holiday Camp Enquiry — ${camp.venue_name}`)}`
  const isExternal = !!camp.booking_url

  return (
    <div className={`bg-white border-2 rounded-2xl p-6 flex flex-col ${camp.is_full ? 'border-gray-200 opacity-75' : 'border-[#1a3a6b]'}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{camp.emoji ?? '☀️'}</span>
        {camp.is_full ? (
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
        {camp.region && (
          <p className="text-xs font-extrabold text-[#1a3a6b]/60 uppercase tracking-widest mb-0.5">{camp.region}</p>
        )}
        <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{camp.venue_name}</h3>
        {camp.city && <p className="text-xs text-gray-400 mb-4">{camp.city}</p>}
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={13} className="shrink-0 text-[#1a3a6b]" />
          <span className="text-xs">{formatDateRange(camp.start_date, camp.end_date)}</span>
        </div>
        {timeLabel && (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={13} className="shrink-0 text-[#1a3a6b]" />
            <span className="text-xs">{timeLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500">
          <Users size={13} className="shrink-0 text-[#1a3a6b]" />
          <span className="text-xs">{camp.capacity} places · Ages {camp.age_range ?? '4-11'}</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-xl py-3 px-4 text-center mb-3">
          <p className="text-lg font-extrabold text-[#1a3a6b]">
            {fmtPrice(camp.price_pence)} <span className="text-xs font-normal text-gray-400">per child</span>
          </p>
          {days > 1 && (
            <p className="text-xs text-gray-400 mt-0.5">{days} days · {fmtPrice(pricePerDay)} per day</p>
          )}
        </div>

        {camp.is_full ? (
          <div className="w-full bg-gray-100 text-gray-400 font-semibold text-sm py-2.5 rounded-xl text-center">
            Fully Booked
          </div>
        ) : (
          <a
            href={bookingHref}
            target={isExternal ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#142f58] transition-colors"
          >
            {isExternal ? (
              <><ExternalLink size={15} /> Book Now</>
            ) : (
              <><Mail size={15} /> Register Interest</>
            )}
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export function PortalSummerCampsPage() {
  const navigate = useNavigate()
  const [camps, setCamps] = useState<HolidayCamp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCamps() }, [])

  async function loadCamps() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('holiday_camps')
      .select('*')
      .eq('is_published', true)
      .eq('camp_type', 'summer')
      .gte('end_date', today)
      .order('start_date')
      .order('display_order')
    setCamps((data ?? []) as HolidayCamp[])
    setLoading(false)
  }

  const liveCount   = camps.filter(c => !c.is_full).length
  const bookedCount = camps.filter(c => c.is_full).length

  // Compute date range across all camps for hero
  const allDates = camps.map(c => ({ s: c.start_date, e: c.end_date }))
  const minDate = allDates.length ? allDates.reduce((a, b) => a.s < b.s ? a : b).s : null
  const maxDate = allDates.length ? allDates.reduce((a, b) => a.e > b.e ? a : b).e : null

  const heroDateLine = minDate && maxDate
    ? (minDate === maxDate
        ? formatDateRange(minDate, maxDate)
        : `${formatDateRange(minDate, maxDate)}`)
    : 'Coming soon'

  // Price range
  const prices = camps.map(c => c.price_pence)
  const minPrice = prices.length ? Math.min(...prices) : null
  const maxPrice = prices.length ? Math.max(...prices) : null
  const priceLabel = minPrice === null ? null
    : minPrice === maxPrice ? fmtPrice(minPrice)
    : `${fmtPrice(minPrice)} – ${fmtPrice(maxPrice!)}`

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
            Gymnastics camps across Hampshire, Wiltshire and Dorset. Open to <strong>all children</strong> — no school connection required.
          </p>
          {(heroDateLine || priceLabel) && (
            <p className="text-[#7c3c00]/80 font-semibold text-sm mb-8">
              {heroDateLine && <><span>📅 {heroDateLine}</span></>}
              {priceLabel && <span className="ml-2">💰 {priceLabel} per child</span>}
            </p>
          )}
          {liveCount > 0 ? (
            <button
              onClick={() => document.getElementById('camps-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              Book Your Place <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${EMAIL}?subject=Summer Camp 2026 Enquiry`}
                className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#142f58] transition-colors"
              >
                <Mail size={16} /> Register Your Interest
              </a>
              <button
                onClick={() => navigate('/portal/clubs')}
                className="inline-flex items-center gap-2 bg-white/40 text-[#1a3a6b] font-semibold px-6 py-3 rounded-xl hover:bg-white/60 transition-colors"
              >
                View Term Clubs <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats bar */}
      {camps.length > 0 && (
        <section className="bg-[#1a3a6b] text-white py-4 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: MapPin,   text: `${camps.length} venue${camps.length !== 1 ? 's' : ''} across England` },
              { icon: Calendar, text: heroDateLine },
              { icon: Users,    text: `Up to ${camps[0]?.capacity ?? 24} children per venue` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-[#f5c518] shrink-0" />
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Camp cards */}
      <section id="camps-grid" className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {liveCount > 0 ? 'Choose Your Venue' : 'Booking Opening Soon'}
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          {liveCount > 0
            ? `${liveCount} venue${liveCount > 1 ? 's' : ''} open for booking${bookedCount > 0 ? ` · ${bookedCount} fully booked` : ''} — places are limited, book early.`
            : 'Register your interest below to be notified the moment places go live.'}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : camps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm mb-4">No summer camps are listed yet — check back soon!</p>
            <a
              href={`mailto:${EMAIL}?subject=Summer Camp Enquiry`}
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors"
            >
              <Mail size={14} /> Register Interest
            </a>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${camps.length >= 3 ? 'lg:grid-cols-3' : ''} gap-5`}>
            {camps.map(camp => (
              <CampCard key={camp.id} camp={camp} />
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
            { q: 'Who can attend?', a: "Any child aged 4–11. Our camps are open to all — you don't need to be enrolled at an ASO partner school." },
            { q: 'What age is the camp suitable for?', a: 'We cater for children from Reception through to Year 6 (ages 4–11). Coaches group children by ability, not just age.' },
            { q: 'How do I book?', a: 'Click "Book Now" on your chosen venue. This takes you directly to our Wix booking page where you can secure your place and complete payment online.' },
            { q: 'What if we need to cancel?', a: "Please email us as soon as possible. We'll do our best to offer a transfer to another venue or a credit for the next available camp." },
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
                Places are limited at each venue. Scroll up to choose your location and book now to avoid disappointment.
              </p>
              <button
                onClick={() => document.getElementById('camps-grid')?.scrollIntoView({ behavior: 'smooth' })}
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
