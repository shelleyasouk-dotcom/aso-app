import { useState } from 'react'
import { Mail, AlertTriangle, CheckCircle, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'

// ─── Toggle this to false once email is restored ──────────────────────────────
const EMAIL_DOWN = false

const ENQUIRY_TYPES = [
  { value: 'parent',      label: '👨‍👩‍👧 Parent / Guardian — booking or child query' },
  { value: 'summer_camp', label: '☀️ Summer Camp — enquiry about GymCamps 2026' },
  { value: 'partnership', label: '🏫 School or Partnership — bring ASO to your school' },
  { value: 'careers',     label: '🏃 Work With Us — coaching roles or interest' },
  { value: 'general',     label: '💬 General — anything else' },
]

export function PortalContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', enquiry_type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.enquiry_type || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error: insertErr } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      enquiry_type: form.enquiry_type,
      message: form.message.trim(),
    })

    if (insertErr) {
      setError(`Sorry, something went wrong: ${insertErr.message}`)
      setSubmitting(false)
      return
    }

    // Notify all directors via the notifications table
    const { data: directors } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'director')

    if (directors && directors.length > 0) {
      await supabase.from('notifications').insert(
        directors.map((d: { id: string }) => ({
          user_id: d.id,
          title: `New message from ${form.name.trim()}`,
          body: form.message.trim().slice(0, 100) + (form.message.trim().length > 100 ? '…' : ''),
          type: 'contact_message',
          related_id: null,
          read: false,
        }))
      )
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5c518]/20 text-[#f5c518] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Mail size={14} /> Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xl mx-auto">
            Send us a message and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-10">

        {/* Email outage notice */}
        {EMAIL_DOWN && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 flex gap-4 mb-8">
            <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-800 mb-1">Our email is temporarily unavailable</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                We're experiencing a technical issue with <strong>info@activeschool.org.uk</strong> and are working to fix it.
                Please use the form below and we'll respond as quickly as possible — your message is received and stored safely.
              </p>
            </div>
          </div>
        )}

        {/* Success state */}
        {submitted ? (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Message received!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Thanks, <strong>{form.name}</strong> — we've got your message and will be in touch at <strong>{form.email}</strong> as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900">Send us a message</h2>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Sarah Jones"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="e.g. sarah@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
                  required
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="e.g. 07700 900123"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30"
              />
            </div>

            {/* Enquiry type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">What is your enquiry about? <span className="text-red-500">*</span></label>
              <select
                value={form.enquiry_type}
                onChange={e => set('enquiry_type', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 bg-white"
                required
              >
                <option value="">Select a category…</option>
                {ENQUIRY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your message <span className="text-red-500">*</span></label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Tell us how we can help…"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3 rounded-xl hover:bg-[#142f58] transition-colors disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Sending…' : 'Send Message'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              We aim to respond within 2 working days. Your message is stored securely.
            </p>
          </form>
        )}
      </section>

      {/* Info strip */}
      <section className="bg-gray-50 border-t border-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { emoji: '📍', title: 'Based in', desc: 'Hampshire, UK — serving schools nationwide' },
            { emoji: '🕐', title: 'Office hours', desc: 'Mon–Fri, 9am–5pm (term time)' },
            { emoji: '⏱️', title: 'Response time', desc: 'We aim to reply within 2 working days' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </PortalLayout>
  )
}
