import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const SPORTS = [
  {
    emoji: '⚽',
    name: 'Football',
    tagline: 'The beautiful game for everyone',
    description: 'Develop dribbling, passing, shooting and teamwork through structured drills and small-sided games. Suitable for all abilities from complete beginners to school team players.',
    ageRange: '5–11',
    benefits: ['Coordination & agility', 'Team communication', 'Spatial awareness', 'Cardiovascular fitness'],
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    emoji: '🏀',
    name: 'Basketball',
    tagline: 'Fast-paced fun with ball skills',
    description: 'Learn dribbling, passing, shooting and defensive positioning in a fun, energetic environment. Great for developing hand-eye coordination and court awareness.',
    ageRange: '6–11',
    benefits: ['Hand-eye coordination', 'Decision making', 'Balance & footwork', 'Social skills'],
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    emoji: '🏏',
    name: 'Cricket',
    tagline: 'Classic British summer sport',
    description: 'Batting, bowling and fielding fundamentals delivered through Quick Cricket and Kwik Cricket formats designed specifically for primary-age children.',
    ageRange: '6–11',
    benefits: ['Reaction speed', 'Concentration', 'Patience & strategy', 'Fine motor skills'],
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    emoji: '🏐',
    name: 'Netball',
    tagline: 'Develop team play and precision',
    description: 'Passing, footwork, court positioning and game strategy. High 5 Netball (adapted for primaries) ensures every child gets equal involvement.',
    ageRange: '6–11',
    benefits: ['Throwing & catching', 'Tactical thinking', 'Leadership skills', 'Stamina'],
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    emoji: '🏉',
    name: 'Tag Rugby',
    tagline: 'Contact-free, full-on fun',
    description: 'All the excitement of rugby without the physical contact. Tag Rugby develops speed, handling and team awareness in a safe, accessible format.',
    ageRange: '5–11',
    benefits: ['Speed & agility', 'Handling skills', 'Spatial awareness', 'Team tactics'],
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  {
    emoji: '🎾',
    name: 'Tennis',
    tagline: 'Mini tennis built for young players',
    description: 'Mini Tennis (with foam balls and smaller courts) makes the sport accessible from day one. Focus on rallying, serving and movement patterns.',
    ageRange: '5–10',
    benefits: ['Racket skills', 'Coordination', 'Focus & patience', 'Footwork'],
    color: 'bg-lime-50 border-lime-200',
    badge: 'bg-lime-100 text-lime-700',
  },
  {
    emoji: '🤸',
    name: 'Gymnastics',
    tagline: 'UKAG-accredited programme',
    description: 'British Gymnastics and UKAG-aligned sessions building core strength, flexibility and movement confidence through floor and apparatus work.',
    ageRange: '4–11',
    benefits: ['Core strength', 'Flexibility', 'Body awareness', 'UKAG awards'],
    color: 'bg-pink-50 border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
  },
  {
    emoji: '🏃',
    name: 'Athletics & Multi-sport',
    tagline: 'Explore the full spectrum of sport',
    description: 'Running, jumping, throwing and sport-specific activities delivered through a multi-sport carousel. Ideal for children still discovering their favourite activity.',
    ageRange: '5–11',
    benefits: ['Fundamental movement', 'Sport sampling', 'Confidence', 'Physical literacy'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    emoji: '🧘',
    name: 'Yoga',
    tagline: 'Mindfulness and movement combined',
    description: 'Child-friendly yoga sessions building flexibility, balance and body awareness through fun poses, breathing exercises and relaxation techniques.',
    ageRange: '5–11',
    benefits: ['Flexibility & balance', 'Focus & calm', 'Body awareness', 'Mindfulness'],
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    emoji: '🤾',
    name: 'Trampolining',
    tagline: 'Bounce, flip and fly safely',
    description: 'British Gymnastics-aligned trampolining developing core strength, coordination and aerial awareness through progressive skills in a fully supervised environment.',
    ageRange: '8–16',
    benefits: ['Core strength', 'Coordination', 'Spatial awareness', 'Confidence'],
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
]

export function PortalSportsPage() {
  const navigate = useNavigate()

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Our Sports Programmes</h1>
          <p className="text-white/70 text-base leading-relaxed">
            Every sport we offer is delivered by qualified coaches using age-appropriate formats, so children learn properly and fall in love with being active.
          </p>
        </div>
      </section>

      {/* Sports grid */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SPORTS.map(sport => (
            <div key={sport.name} className={`rounded-2xl border p-5 ${sport.color}`}>
              <div className="flex items-start gap-4 mb-3">
                <span className="text-4xl">{sport.emoji}</span>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg leading-tight">{sport.name}</h2>
                  <p className="text-sm text-gray-500">{sport.tagline}</p>
                </div>
                <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${sport.badge}`}>
                  Age {sport.ageRange}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{sport.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {sport.benefits.map(b => (
                  <span key={b} className="text-xs bg-white/80 text-gray-600 border border-white px-2 py-0.5 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UKAG section */}
      <section className="bg-[#1a3a6b] text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-3">🏅</div>
          <h2 className="text-2xl font-extrabold mb-2">UKAG Award Progression</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            All ASO sessions are aligned with the UK Active Gymnastics (UKAG) award pathway, giving children a structured route from Level 1 through to Level 5. Awards are presented in sessions and certificates sent home.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].map((level, i) => (
              <div key={level} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm border-2 ${
                  i === 0 ? 'bg-gray-300 border-gray-300 text-gray-700' :
                  i === 1 ? 'bg-yellow-300 border-yellow-300 text-yellow-800' :
                  i === 2 ? 'bg-amber-400 border-amber-400 text-amber-900' :
                  i === 3 ? 'bg-gray-400 border-gray-400 text-white' :
                  'bg-yellow-500 border-yellow-500 text-yellow-900'
                }`}>
                  {i + 1}
                </div>
                <span className="text-xs text-white/60">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Find a club offering these sports</h2>
        <p className="text-sm text-gray-500 mb-5">Check what's available at schools near you.</p>
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
