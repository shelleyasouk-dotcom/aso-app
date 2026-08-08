import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Users, Send, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { useSEO } from '../../hooks/useSEO'

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b]'
const textareaCls = inputCls + ' resize-none'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

interface FormState {
  full_name: string
  email: string
  phone: string
  preferred_locations: string
  travel_distance_miles: string
  availability: string
  qualifications: string
  dbs_status: string
  notes: string
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  preferred_locations: '',
  travel_distance_miles: '',
  availability: '',
  qualifications: '',
  dbs_status: '',
  notes: '',
}

const DBS_OPTIONS = [
  { value: 'enhanced_dbs', label: 'Enhanced DBS (in date)' },
  { value: 'basic_dbs', label: 'Basic DBS only' },
  { value: 'in_progress', label: 'DBS application in progress' },
  { value: 'none', label: 'No DBS yet' },
]

export function PortalCoachPoolJoinPage() {
  useSEO({
    title: 'Join the Coach Pool — Register Your Interest',
    description: 'No gymnastics coaching vacancy near you right now? Join the ASO coach pool and we\'ll contact you when a local placement opens up. Register your interest today.',
    url: 'https://www.activeschool.org.uk/portal/coach-pool',
  })
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.full_name.trim()) errs.full_name = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required'
    if (!form.preferred_locations.trim()) errs.preferred_locations = 'Please tell us where you can work'
    if (!form.availability.trim()) errs.availability = 'Please describe your availability'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    await supabase.from('coach_pool').insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      preferred_locations: form.preferred_locations.trim(),
      travel_distance_miles: form.travel_distance_miles ? parseInt(form.travel_distance_miles) : null,
      availability: form.availability.trim(),
      notes: [
        form.qualifications ? `Qualifications: ${form.qualifications}` : '',
        form.dbs_status ? `DBS: ${DBS_OPTIONS.find(o => o.value === form.dbs_status)?.label}` : '',
        form.notes,
      ].filter(Boolean).join('\n') || null,
      status: 'available',
    })

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <PortalLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="font-extrabold text-gray-900 text-2xl mb-2">You're on the pool!</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Thanks <strong>{form.full_name}</strong>! We've added you to the ASO Coach Pool. We'll reach out at <strong>{form.email}</strong> when there's a suitable opening near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/portal/careers')}
              className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#142f58] transition-colors"
            >
              <ArrowLeft size={14} /> View vacancies
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl text-sm hover:border-gray-400 transition-colors"
            >
              Go to home
            </button>
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#1e4a8c] to-[#142f58] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-[#f5c518]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Join the ASO Coach Pool</h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Not seeing the right vacancy? Register your interest and we'll contact you when suitable placements come up near you. No commitment required.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate('/portal/careers')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a3a6b] text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to vacancies
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Personal */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-[#1a3a6b] text-sm">Your Details</h3>

            <Field label="Full Name" required>
              <input className={inputCls} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </Field>

            <Field label="Email Address" required>
              <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </Field>

            <Field label="Phone Number">
              <input className={inputCls} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="07700 900000" />
            </Field>
          </div>

          {/* Locations */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-[#1a3a6b] text-sm">Location & Availability</h3>

            <Field label="Preferred Locations / Areas" required>
              <input
                className={inputCls}
                value={form.preferred_locations}
                onChange={e => set('preferred_locations', e.target.value)}
                placeholder="e.g. Salisbury, Amesbury, Andover"
              />
              {errors.preferred_locations && <p className="text-red-500 text-xs mt-1">{errors.preferred_locations}</p>}
            </Field>

            <Field label="Max Travel Distance (miles)">
              <input
                className={inputCls}
                type="number"
                value={form.travel_distance_miles}
                onChange={e => set('travel_distance_miles', e.target.value)}
                placeholder="e.g. 15"
              />
            </Field>

            <Field label="Availability" required>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.availability}
                onChange={e => set('availability', e.target.value)}
                placeholder="e.g. Monday–Friday from 3pm. Not available Wednesdays."
              />
              {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
            </Field>
          </div>

          {/* Experience */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-[#1a3a6b] text-sm">Experience &amp; Qualifications</h3>

            <Field label="Qualifications / Certifications">
              <input
                className={inputCls}
                value={form.qualifications}
                onChange={e => set('qualifications', e.target.value)}
                placeholder="e.g. FA Level 1, UKCC Level 2, First Aid"
              />
            </Field>

            <Field label="DBS Status">
              <select className={inputCls} value={form.dbs_status} onChange={e => set('dbs_status', e.target.value)}>
                <option value="">Select…</option>
                {DBS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <Field label="Anything else you'd like us to know?">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Relevant experience, sports you coach, anything else…"
              />
            </Field>
          </div>

          {/* Consent */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700 leading-relaxed">
            By submitting this form you consent to ASO storing your details in our coach pool for recruitment purposes. We'll only contact you about relevant opportunities and will never share your details with third parties.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#142f58] transition-colors disabled:opacity-60"
          >
            <Send size={14} />
            {submitting ? 'Submitting…' : 'Join the Coach Pool'}
          </button>

        </form>
      </div>
    </PortalLayout>
  )
}
