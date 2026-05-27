import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Send, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PortalLayout } from '../../components/layout/PortalLayout'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobAdvert {
  id: string
  title: string
  location: string
}

type Step = 'personal' | 'experience' | 'availability' | 'confirm'

const STEPS: Step[] = ['personal', 'experience', 'availability', 'confirm']

const STEP_LABELS: Record<Step, string> = {
  personal: 'About You',
  experience: 'Experience',
  availability: 'Availability',
  confirm: 'Submit',
}

const DBS_OPTIONS = [
  { value: 'enhanced_dbs', label: 'Enhanced DBS (in date)' },
  { value: 'basic_dbs', label: 'Basic DBS only' },
  { value: 'in_progress', label: 'DBS application in progress' },
  { value: 'none', label: 'No DBS yet' },
]

const HOW_HEARD_OPTIONS = [
  'ASO website', 'Indeed', 'TotalJobs', 'LinkedIn', 'Social media', 'Friend / word of mouth', 'School', 'Other',
]

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  full_name: string
  email: string
  phone: string
  address: string
  cover_letter: string
  experience: string
  qualifications: string
  availability: string
  dbs_status: string
  how_heard: string
  join_pool: boolean
  preferred_locations: string
  travel_distance_miles: string
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  cover_letter: '',
  experience: '',
  qualifications: '',
  availability: '',
  dbs_status: '',
  how_heard: '',
  join_pool: false,
  preferred_locations: '',
  travel_distance_miles: '',
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
            i < idx ? 'bg-green-500 text-white' :
            i === idx ? 'bg-[#1a3a6b] text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < idx ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === idx ? 'text-[#1a3a6b]' : 'text-gray-400'}`}>
            {STEP_LABELS[s]}
          </span>
          {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────

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

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b]'
const textareaCls = inputCls + ' resize-none'

// ─── Main page ────────────────────────────────────────────────────────────────

export function PortalCareerApplyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobAdvert | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [step, setStep] = useState<Step>('personal')
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('job_adverts')
      .select('id, title, location')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        setJob(data as JobAdvert)
        setLoadingJob(false)
      })
  }, [id])

  function set(field: keyof FormState, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(s: Step): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (s === 'personal') {
      if (!form.full_name.trim()) errs.full_name = 'Required'
      if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required'
    }
    if (s === 'experience') {
      if (!form.experience.trim()) errs.experience = 'Please describe your experience'
    }
    if (s === 'availability') {
      if (!form.availability.trim()) errs.availability = 'Please describe your availability'
      if (!form.dbs_status) errs.dbs_status = 'Please select your DBS status'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (!validate(step)) return
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function back() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)

    const { data: appData, error } = await supabase.from('job_applications').insert({
      job_advert_id: id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      cover_letter: form.cover_letter.trim() || null,
      experience: form.experience.trim() || null,
      qualifications: form.qualifications.trim() || null,
      availability: form.availability.trim() || null,
      dbs_status: form.dbs_status || null,
      how_heard: form.how_heard || null,
      join_pool: form.join_pool,
      preferred_locations: form.join_pool ? (form.preferred_locations.trim() || null) : null,
      travel_distance_miles: form.join_pool && form.travel_distance_miles
        ? parseInt(form.travel_distance_miles)
        : null,
      status: 'new',
    }).select('id').single()

    if (error) {
      setSubmitting(false)
      setErrors({ full_name: 'Submission failed — please try again.' })
      return
    }

    // If they want to join the pool, add them as a pending coach_pool entry
    if (form.join_pool && appData?.id) {
      await supabase.from('coach_pool').insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        preferred_locations: form.preferred_locations.trim() || null,
        travel_distance_miles: form.travel_distance_miles ? parseInt(form.travel_distance_miles) : null,
        availability: form.availability.trim() || null,
        status: 'available',
        application_id: appData.id,
      })
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingJob) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    )
  }

  if (!job) {
    return (
      <PortalLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Vacancy not found.</p>
          <button onClick={() => navigate('/portal/careers')} className="mt-4 text-[#1a3a6b] font-semibold text-sm hover:underline">
            ← Back to vacancies
          </button>
        </div>
      </PortalLayout>
    )
  }

  if (submitted) {
    return (
      <PortalLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="font-extrabold text-gray-900 text-2xl mb-2">Application submitted!</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            Thank you <strong>{form.full_name}</strong>. We've received your application for <strong>{job.title}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            We'll be in touch at <strong>{form.email}</strong> if your application is progressed.
            {form.join_pool && ' We\'ve also added you to our Coach Pool so we can contact you about future opportunities.'}
          </p>
          <button
            onClick={() => navigate('/portal/careers')}
            className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#142f58] transition-colors"
          >
            <ArrowLeft size={14} /> View more vacancies
          </button>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(`/portal/careers/${id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a3a6b] text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to vacancy
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1a3a6b] mb-1">Apply for: {job.title}</h1>
          <p className="text-gray-500 text-sm">{job.location}</p>
        </div>

        <StepBar current={step} />

        {/* ── Step 1: Personal ── */}
        {step === 'personal' && (
          <div className="flex flex-col gap-4">
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

            <Field label="Town / Area">
              <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Salisbury, Wiltshire" />
            </Field>

            <Field label="Cover Letter / Why do you want to work for ASO?">
              <textarea
                className={textareaCls}
                rows={4}
                value={form.cover_letter}
                onChange={e => set('cover_letter', e.target.value)}
                placeholder="Tell us a little about yourself and why you'd like to join the team…"
              />
            </Field>

            <Field label="How did you hear about us?">
              <select className={inputCls} value={form.how_heard} onChange={e => set('how_heard', e.target.value)}>
                <option value="">Select…</option>
                {HOW_HEARD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* ── Step 2: Experience ── */}
        {step === 'experience' && (
          <div className="flex flex-col gap-4">
            <Field label="Relevant Experience" required>
              <textarea
                className={textareaCls}
                rows={5}
                value={form.experience}
                onChange={e => set('experience', e.target.value)}
                placeholder="Tell us about any previous coaching, teaching, or childcare experience. Include the age groups and sports you've worked with…"
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </Field>

            <Field label="Qualifications & Certifications">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.qualifications}
                onChange={e => set('qualifications', e.target.value)}
                placeholder="e.g. FA Level 1 Football, UKCC Level 2, First Aid, Safeguarding certificate…"
              />
            </Field>
          </div>
        )}

        {/* ── Step 3: Availability ── */}
        {step === 'availability' && (
          <div className="flex flex-col gap-4">
            <Field label="Availability" required>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.availability}
                onChange={e => set('availability', e.target.value)}
                placeholder="e.g. Available Monday–Friday from 3pm. Not available Wednesdays. Flexible during school holidays."
              />
              {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
            </Field>

            <Field label="DBS Status" required>
              <div className="flex flex-col gap-2">
                {DBS_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="dbs_status"
                      value={opt.value}
                      checked={form.dbs_status === opt.value}
                      onChange={() => set('dbs_status', opt.value)}
                      className="accent-[#1a3a6b] w-4 h-4 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.dbs_status && <p className="text-red-500 text-xs mt-1">{errors.dbs_status}</p>}
            </Field>

            {/* Coach pool opt-in */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.join_pool}
                  onChange={e => set('join_pool', e.target.checked)}
                  className="accent-[#1a3a6b] w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <p className="font-semibold text-[#1a3a6b] text-sm">Also add me to the ASO Coach Pool</p>
                  <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
                    We'll keep your details on file and contact you about future placements near you, even if this specific role isn't the right fit.
                  </p>
                </div>
              </label>

              {form.join_pool && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-blue-200">
                  <Field label="Preferred Locations / Areas">
                    <input
                      className={inputCls}
                      value={form.preferred_locations}
                      onChange={e => set('preferred_locations', e.target.value)}
                      placeholder="e.g. Salisbury, Amesbury, Andover"
                    />
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === 'confirm' && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 mb-4">Review your application</h3>
              <dl className="flex flex-col gap-3">
                {[
                  { label: 'Name', value: form.full_name },
                  { label: 'Email', value: form.email },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Location', value: form.address || '—' },
                  { label: 'DBS Status', value: DBS_OPTIONS.find(o => o.value === form.dbs_status)?.label ?? '—' },
                  { label: 'Coach Pool', value: form.join_pool ? 'Yes — add me to the pool' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-sm">
                    <dt className="font-semibold text-gray-500 w-28 shrink-0">{label}</dt>
                    <dd className="text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700 leading-relaxed">
              By submitting this application you consent to ASO storing your details for recruitment purposes. Your data will not be shared with third parties.
            </div>

            {errors.full_name && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {errors.full_name}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step !== 'personal' && (
            <button
              onClick={back}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {step !== 'confirm' ? (
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#142f58] transition-colors"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              <Send size={14} />
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
        </div>

      </div>
    </PortalLayout>
  )
}
