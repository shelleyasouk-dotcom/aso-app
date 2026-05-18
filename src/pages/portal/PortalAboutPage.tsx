import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import type { Profile } from '../../types'

const VALUES = [
  { emoji: '🌟', title: 'Excellence', desc: 'We deliver high-quality coaching that challenges every child to be their best.' },
  { emoji: '🤝', title: 'Inclusion', desc: 'Every child is welcome, regardless of ability, background, or experience.' },
  { emoji: '🛡️', title: 'Safety', desc: 'Safeguarding and welfare underpin everything we do.' },
  { emoji: '🎯', title: 'Progress', desc: 'Structured award pathways give children clear goals to work towards.' },
  { emoji: '😄', title: 'Fun', desc: 'Sport should be enjoyable — if children are having fun, they keep coming back.' },
  { emoji: '🤗', title: 'Community', desc: 'We build positive relationships between schools, families, and coaches.' },
]

export function PortalAboutPage() {
  const navigate = useNavigate()
  const [coaches, setCoaches] = useState<Profile[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id,full_name,photo_url,area,role')
      .in('role', ['lead_coach', 'area_lead'])
      .order('full_name')
      .limit(12)
      .then(({ data }) => setCoaches((data as Profile[]) ?? []))
  }, [])

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img src="/AS Brand Sheet (2) - Edited.png" alt="Active School" className="w-36 h-36 object-contain mx-auto mb-2" />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">About Active School Organisation</h1>
          <p className="text-white/70 text-base leading-relaxed">
            We're passionate about getting young people active. ASO runs after-school sports clubs that are fun, safe, and award-winning.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-24 h-24 shrink-0">
            <img src="/Untitled-2 (1).png" alt="Active School" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              At Active School Organisation, our mission is to inspire a generation of children to develop a lifelong love of sport, movement, and physical activity.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">
              We believe every child deserves the opportunity to feel confident, capable, and proud of what they can achieve, regardless of their background or ability. Through high-quality coaching, structured progression pathways, and positive sporting experiences, we help children build not only physical skills, but resilience, confidence, discipline, and self-belief.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">
              We proudly partner with primary schools across the UK to deliver professional after-school programmes that combine fun, development, and achievement. Through our nationally recognised UKAG award pathways, children are given clear goals to work towards while representing their school with pride and becoming part of something bigger than themselves.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-3 font-semibold text-gray-700">
              Our aim is simple — create healthier, happier, more confident children through sport.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {VALUES.map(value => (
              <div key={value.title} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <span className="text-3xl">{value.emoji}</span>
                <h3 className="font-bold text-gray-800 mt-2 mb-1">{value.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the coaches */}
      {coaches.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Meet Our Coaches</h2>
          <p className="text-sm text-gray-500 mb-6">Every ASO coach is DBS-checked, first-aid trained, and passionate about working with young people.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {coaches.map(coach => (
              <div key={coach.id} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a3a6b] flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {coach.photo_url ? (
                    <img src={coach.photo_url} alt={coach.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-extrabold text-xl">{coach.full_name[0]}</span>
                  )}
                </div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{coach.full_name}</p>
                {coach.area && <p className="text-xs text-gray-400 mt-0.5">{coach.area}</p>}
                <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  coach.role === 'area_lead'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {coach.role === 'area_lead' ? 'Area Lead' : 'Lead Coach'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What makes us different */}
      <section className="bg-[#1a3a6b] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">What Makes ASO Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'In-school delivery', desc: 'Sessions run within school grounds so parents don\'t need to arrange extra travel. Your child stays safe on a site they know.' },
              { title: 'Multi-sport approach', desc: 'Rather than specialising early, we expose children to a range of sports so they discover what they love.' },
              { title: 'Award recognition', desc: 'The UKAG pathway gives children something concrete to achieve — certificates, badges, and recognition in school.' },
              { title: 'Small group coaching', desc: 'Kept to manageable group sizes so every child gets attention, feedback, and a great experience every session.' },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-xl p-5">
                <h3 className="font-bold text-[#f5c518] mb-1">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to join the ASO family?</h2>
        <p className="text-sm text-gray-500 mb-5">Find a club at your child's school and get started today.</p>
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
