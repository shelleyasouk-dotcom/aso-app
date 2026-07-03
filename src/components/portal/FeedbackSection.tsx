import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackStats {
  count: number
  overall: number
  fun: number
  safety: number
  inclusion: number
  development: number
  professionalism: number
}

// ─── Star picker ──────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={`transition-colors ${(hover || value) >= n ? 'text-[#f5c518] fill-[#f5c518]' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Star display (read-only) ─────────────────────────────────────────────────

function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-[#f5c518] fill-[#f5c518]' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  { key: 'fun',             label: '🎉 Fun',             question: 'How fun did your child find the sessions?' },
  { key: 'safety',          label: '🛡️ Safety',          question: 'How safe and well looked-after did your child feel?' },
  { key: 'inclusion',       label: '🤝 Inclusion',       question: 'Did your child feel welcome and included?' },
  { key: 'development',     label: '📈 Development',     question: 'Has your child learned and improved their skills?' },
  { key: 'professionalism', label: '⭐ Professionalism', question: 'How professional and supportive were the coaches?' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function FeedbackSection() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fun: 0,
    safety: 0,
    inclusion: 0,
    development: 0,
    professionalism: 0,
    overall: 0,
    comment: '',
    reviewer_name: '',
    school_name: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const { data } = await supabase
      .from('parent_feedback')
      .select('fun_rating, safety_rating, inclusion_rating, development_rating, professionalism_rating, overall_rating')
    if (!data || data.length === 0) return
    const count = data.length
    type RatingKey = 'fun_rating' | 'safety_rating' | 'inclusion_rating' | 'development_rating' | 'professionalism_rating' | 'overall_rating'
    const avg = (key: RatingKey) => data.reduce((sum, r) => sum + (r[key] ?? 0), 0) / count
    setStats({
      count,
      overall: avg('overall_rating'),
      fun: avg('fun_rating'),
      safety: avg('safety_rating'),
      inclusion: avg('inclusion_rating'),
      development: avg('development_rating'),
      professionalism: avg('professionalism_rating'),
    })
  }

  function setRating(key: string, val: number) {
    setForm(f => ({ ...f, [key]: val }))
    // auto-calculate overall as mean of the 5 category ratings
    const updated = { ...form, [key]: val }
    const vals = [updated.fun, updated.safety, updated.inclusion, updated.development, updated.professionalism].filter(v => v > 0)
    const mean = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
    setForm(f => ({ ...f, [key]: val, overall: mean }))
  }

  async function submit() {
    const filled = [form.fun, form.safety, form.inclusion, form.development, form.professionalism].filter(v => v > 0)
    if (filled.length < 5) { setError('Please rate all 5 areas before submitting.'); return }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('parent_feedback').insert({
      fun_rating: form.fun,
      safety_rating: form.safety,
      inclusion_rating: form.inclusion,
      development_rating: form.development,
      professionalism_rating: form.professionalism,
      overall_rating: form.overall,
      comment: form.comment.trim() || null,
      reviewer_name: form.reviewer_name.trim() || null,
      school_name: form.school_name.trim() || null,
    })
    setSaving(false)
    if (err) { setError('Something went wrong — please try again.'); return }
    setSubmitted(true)
    loadStats()
  }

  return (
    <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] py-14 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Star size={14} className="fill-[#f5c518]" /> Parent Reviews
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            How are we doing?
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto">
            Your feedback shapes everything we do. Tell us how your child's experience has been — it only takes two minutes.
          </p>
        </div>

        {/* Live average display */}
        {stats && stats.count > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6 border border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-white font-extrabold text-4xl leading-none">{stats.overall.toFixed(1)}</p>
                <StarDisplay value={stats.overall} size={16} />
                <p className="text-white/50 text-xs mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2">
                {[
                  { label: '🎉 Fun', val: stats.fun },
                  { label: '🛡️ Safety', val: stats.safety },
                  { label: '🤝 Inclusion', val: stats.inclusion },
                  { label: '📈 Development', val: stats.development },
                  { label: '⭐ Professionalism', val: stats.professionalism },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-white/70 text-xs w-28">{label}</span>
                    <StarDisplay value={val} size={11} />
                    <span className="text-white/60 text-xs">{val.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form toggle or success */}
        {submitted ? (
          <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 text-center">
            <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-bold text-lg mb-1">Thank you for your review!</p>
            <p className="text-white/70 text-sm">Your feedback helps us improve every session.</p>
          </div>
        ) : !showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-extrabold text-base px-8 py-3.5 rounded-2xl hover:bg-yellow-400 transition-colors shadow-lg"
            >
              <Star size={18} className="fill-[#1a3a6b]" />
              Leave a Review
            </button>
            <p className="text-white/40 text-xs mt-3">Anonymous · Takes 2 minutes</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="font-extrabold text-[#1a3a6b] text-lg">Rate your experience</h3>

            {QUESTIONS.map(q => (
              <div key={q.key}>
                <p className="text-sm font-bold text-gray-800 mb-1">{q.label}</p>
                <p className="text-xs text-gray-500 mb-2">{q.question}</p>
                <StarPicker
                  value={form[q.key as keyof typeof form] as number}
                  onChange={v => setRating(q.key, v)}
                />
              </div>
            ))}

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Your comment (optional)</label>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Tell us about your child's experience…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Your name (optional)</label>
                  <input
                    type="text"
                    value={form.reviewer_name}
                    onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                    placeholder="e.g. Sarah (parent)"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">School (optional)</label>
                  <input
                    type="text"
                    value={form.school_name}
                    onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))}
                    placeholder="e.g. Redlands Primary"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#142f58] transition-colors disabled:opacity-60">
                <Send size={14} /> {saving ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
