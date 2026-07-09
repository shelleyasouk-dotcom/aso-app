import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Upload, ExternalLink, ChevronRight, AlertCircle, X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingRecord {
  id: string
  handbook_read_at: string | null
  safeguarding_quiz_passed_at: string | null
  safeguarding_cert_url: string | null
  safeguarding_cert_name: string | null
  safeguarding_cert_uploaded_at: string | null
  safeguarding_verified_at: string | null
  first_aid_required: boolean
  first_aid_cert_url: string | null
  first_aid_cert_name: string | null
  first_aid_cert_uploaded_at: string | null
  coaching_quiz_passed_at: string | null
  coaching_resources_read_at: string | null
  profile_completed_at: string | null
  placement_offer_url: string | null
  placement_offer_name: string | null
  contract_signed_url: string | null
  contract_signed_name: string | null
  contract_signed_at: string | null
  contract_verified_at: string | null
}

interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

// ─── Quiz content ─────────────────────────────────────────────────────────────

const SAFEGUARDING_QUIZ: QuizQuestion[] = [
  {
    q: 'If a child discloses abuse to you, what should you do?',
    options: [
      'Promise the child you will keep it a secret',
      'Listen calmly, reassure them, and report to your area lead — never promise confidentiality',
      'Call the police immediately yourself',
      'Ask them to repeat it in front of a teacher',
    ],
    correct: 1,
    explanation: 'Always listen without promising confidentiality. Reassure the child they were right to tell you, then report immediately to your area lead using the correct procedures.',
  },
  {
    q: 'When can you be alone with a child in a one-to-one situation during an ASO session?',
    options: [
      'When the child\'s parent has given permission',
      'Briefly if the door is open',
      'Never — another adult must always be present or visible',
      'Only during individual skills assessments',
    ],
    correct: 2,
    explanation: 'ASO operates on a clear principle: never be alone with a child. Always ensure another adult is present or clearly visible.',
  },
  {
    q: 'You notice unexplained bruising on a child. What do you do?',
    options: [
      'Ask the child directly how they got it',
      'Ignore it — children bruise easily in sport',
      'Note your observation and report it to your area lead before the session ends',
      'Tell another coach but do nothing further',
    ],
    correct: 2,
    explanation: 'Record your observation factually and report to your area lead promptly. Do not question the child directly or delay until after the session.',
  },
  {
    q: 'Who is responsible for safeguarding during an ASO session?',
    options: [
      'Only the lead coach',
      'The school\'s designated safeguarding lead',
      'Everyone present — all staff share responsibility',
      'Only the area lead',
    ],
    correct: 2,
    explanation: 'Safeguarding is everyone\'s responsibility. All ASO staff present have a duty of care regardless of role.',
  },
  {
    q: 'A parent asks you for personal contact details of another child at the session. You should:',
    options: [
      'Share the information — the parent seems trustworthy',
      'Decline politely — you cannot share personal data about other children',
      'Refer them to the school office and share anyway',
      'Ask your area lead if it is okay first',
    ],
    correct: 1,
    explanation: 'You must never share personal data about any child with an unauthorised person. GDPR and safeguarding require you to protect children\'s information at all times.',
  },
]

const COACHING_QUIZ: QuizQuestion[] = [
  {
    q: 'A child refuses to take part in an activity. How do you respond?',
    options: [
      'Insist they participate — it\'s for their own good',
      'Ignore them and focus on the rest of the group',
      'Calmly check if there\'s a reason, offer a modified activity, and never force participation',
      'Call their parents immediately',
    ],
    correct: 2,
    explanation: 'Children may have physical, emotional or personal reasons for not participating. Always respond with empathy, offer alternatives, and never force a child.',
  },
  {
    q: 'You cannot make your session tomorrow. What do you do?',
    options: [
      'Call the school directly to let them know',
      'Post in the staff group chat and assume someone will cover',
      'Contact your area lead as soon as possible — at least 24 hours in advance',
      'Not show up and explain afterwards',
    ],
    correct: 2,
    explanation: 'You must notify your area lead immediately. They will arrange cover and inform the school. Never leave a session without cover.',
  },
  {
    q: 'A child is persistently disruptive and affecting the rest of the group. The correct approach is:',
    options: [
      'Raise your voice to establish authority in front of the group',
      'Exclude them from every remaining session',
      'Follow the ASO behaviour management approach — positive language, clear choices, escalate to area lead if needed',
      'Contact their parents during the session',
    ],
    correct: 2,
    explanation: 'ASO\'s approach centres on positive language, consistent boundaries and de-escalation. Exclusion is a last resort and must go through proper channels.',
  },
  {
    q: 'When is physical contact with a child acceptable during coaching?',
    options: [
      'Whenever it\'s needed to correct technique',
      'Only with prior consent and strictly within ASO\'s physical contact guidelines — safety spotting only',
      'Never under any circumstances',
      'Only for children under 8',
    ],
    correct: 1,
    explanation: 'Physical contact must only occur where necessary for safety (e.g. spotting in gymnastics) and always within ASO guidelines. Consent and transparency are essential.',
  },
]

// ─── Quiz component ───────────────────────────────────────────────────────────

function Quiz({ questions, onPass }: { questions: QuizQuestion[]; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((_, i) => answers[i] !== undefined)
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0
  const passed = submitted && score === questions.length

  function reset() {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, qi) => {
        const selected = answers[qi]
        const isWrong = submitted && selected !== q.correct
        const isRight = submitted && selected === q.correct
        return (
          <div key={qi} className={`rounded-2xl border p-4 ${isRight ? 'border-green-200 bg-green-50' : isWrong ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <p className="text-sm font-bold text-gray-900 mb-3">Q{qi + 1}. {q.q}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi
                const isCorrectOpt = submitted && oi === q.correct
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      isCorrectOpt ? 'border-green-400 bg-green-100 text-green-800 font-semibold'
                      : isSelected && isWrong ? 'border-red-400 bg-red-100 text-red-800'
                      : isSelected ? 'border-[#1a3a6b] bg-[#1a3a6b]/10 font-semibold text-[#1a3a6b]'
                      : 'border-gray-200 text-gray-700 hover:border-[#1a3a6b]/30 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {isWrong && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-xl p-2.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span><strong>Correct answer:</strong> {q.options[q.correct]}. {q.explanation}</span>
              </div>
            )}
          </div>
        )
      })}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm disabled:opacity-40 hover:bg-[#142f58] transition-colors"
        >
          Submit Answers
        </button>
      ) : passed ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-700 mb-1">All correct — well done!</p>
          <button onClick={onPass}
            className="mt-2 w-full py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors">
            Continue <ChevronRight size={14} className="inline" />
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-amber-700 mb-1">You got {score} of {questions.length} correct</p>
          <p className="text-xs text-amber-600 mb-3">Review the explanations above, then try again.</p>
          <button onClick={reset}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── File upload ──────────────────────────────────────────────────────────────

function UploadArea({ label, existingName, existingUrl, onUploaded, storagePath }: {
  label: string
  existingName: string | null
  existingUrl: string | null
  onUploaded: (url: string, name: string) => void
  storagePath: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB'); return }
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${storagePath}/${Date.now()}.${ext}`
    const { error: err } = await supabase.storage.from('coach-files').upload(path, file, { upsert: true })
    if (err) { setError('Upload failed — please try again'); setUploading(false); return }
    const { data } = supabase.storage.from('coach-files').getPublicUrl(path)
    onUploaded(data.publicUrl, file.name)
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {existingName && existingUrl && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <a href={existingUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-green-700 font-semibold hover:underline flex-1 truncate">
            {existingName}
          </a>
          <ExternalLink size={12} className="text-green-500 shrink-0" />
        </div>
      )}
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      <button onClick={() => ref.current?.click()} disabled={uploading}
        className="flex items-center justify-center gap-2 border-2 border-dashed border-[#1a3a6b]/30 rounded-2xl px-4 py-5 text-[#1a3a6b] font-semibold text-sm hover:border-[#1a3a6b] hover:bg-[#1a3a6b]/5 transition-colors disabled:opacity-50">
        <Upload size={18} />
        {uploading ? 'Uploading…' : existingName ? `Replace ${label}` : `Upload ${label}`}
      </button>
      <p className="text-xs text-gray-400 text-center">PDF, JPG or PNG · max 10 MB</p>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}

// ─── Step definitions ─────────────────────────────────────────────────────────

function getSteps(firstAidRequired: boolean) {
  return [
    'welcome',
    'handbook',
    'safeguarding_quiz',
    'safeguarding_cert',
    ...(firstAidRequired ? ['first_aid_cert'] : []),
    'coaching_resources',
    'coaching_quiz',
    'contract',
    'profile',
  ]
}

function currentStep(rec: OnboardingRecord): string {
  const steps = getSteps(rec.first_aid_required)
  if (!rec.handbook_read_at) return 'handbook'
  if (!rec.safeguarding_quiz_passed_at) return 'safeguarding_quiz'
  if (!rec.safeguarding_cert_url) return 'safeguarding_cert'
  if (rec.first_aid_required && !rec.first_aid_cert_url) return 'first_aid_cert'
  if (!rec.coaching_resources_read_at) return 'coaching_resources'
  if (!rec.coaching_quiz_passed_at) return 'coaching_quiz'
  if (!rec.contract_signed_url) return 'contract'
  if (!rec.profile_completed_at) return 'profile'
  return steps[steps.length - 1]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CoachOnboardingPage() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [rec, setRec] = useState<OnboardingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('welcome')

  useEffect(() => { if (profile) init() }, [profile])

  async function init() {
    const COACHING_ROLES = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach']
    let { data } = await supabase
      .from('coach_onboarding')
      .select('*')
      .eq('profile_id', profile!.id)
      .maybeSingle()
    if (!data) {
      const { data: created } = await supabase
        .from('coach_onboarding')
        .insert({ profile_id: profile!.id, first_aid_required: COACHING_ROLES.includes(profile!.role) })
        .select()
        .single()
      data = created
    }
    if (data) {
      setRec(data as OnboardingRecord)
      setStep(currentStep(data as OnboardingRecord))
    }
    setLoading(false)
  }

  async function patch(fields: Partial<OnboardingRecord>) {
    if (!rec) return
    const { data } = await supabase
      .from('coach_onboarding')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', rec.id)
      .select()
      .single()
    if (data) {
      const updated = data as OnboardingRecord
      setRec(updated)
      setStep(currentStep(updated))
    }
  }

  async function completeOnboarding() {
    await patch({ profile_completed_at: new Date().toISOString() })
    await supabase.from('profiles').update({ onboarding_required: false }).eq('id', profile!.id)
    await refreshProfile()
    navigate('/dashboard')
  }

  if (loading || !rec) {
    return (
      <div className="min-h-screen bg-[#1a3a6b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const steps = getSteps(rec.first_aid_required)
  const stepIndex = steps.indexOf(step)
  const pct = Math.round((Math.max(0, stepIndex) / (steps.length - 1)) * 100)

  const now = new Date().toISOString()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-[#1a3a6b] font-extrabold text-xs">ASO</span>
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm leading-none">Coach Onboarding</p>
          <p className="text-white/50 text-xs mt-0.5">{rec.first_aid_required ? steps.length - 1 : steps.length - 1} steps to full access</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-20 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-[#f5c518] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-[#f5c518]">{pct}%</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8">

          {/* ── WELCOME ── */}
          {step === 'welcome' && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#f5c518] rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#1a3a6b] font-extrabold text-2xl">ASO</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Welcome to the team, {profile?.full_name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Before you get started coaching, we need to complete a short onboarding. This covers safeguarding, coaching standards, and getting your documents in place. It takes around 20 minutes.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
                {[
                  { emoji: '📖', label: 'Read the Staff Handbook' },
                  { emoji: '🛡️', label: 'Safeguarding knowledge check' },
                  { emoji: '📄', label: 'Upload your certificates' },
                  { emoji: '🎯', label: 'Coaching resources & quiz' },
                  { emoji: '✍️', label: 'Sign your placement contract' },
                  { emoji: '👤', label: 'Complete your profile' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{s.emoji}</span>
                    <p className="text-sm font-semibold text-gray-700">{s.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep('handbook')}
                className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white font-extrabold text-base hover:bg-[#142f58] transition-colors">
                Let's get started <ChevronRight size={16} className="inline" />
              </button>
            </div>
          )}

          {/* ── HANDBOOK ── */}
          {step === 'handbook' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step 1 of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Staff Handbook</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  The handbook covers everything you need to know as an ASO coach — safeguarding, session procedures, communication, behaviour management, and your responsibilities.
                </p>
              </div>
              <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-2xl p-4">
                <p className="text-sm text-[#1a3a6b] font-semibold mb-3">You must read the full handbook before continuing.</p>
                <a href="/handbook" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors">
                  <ExternalLink size={14} /> Open Staff Handbook
                </a>
              </div>
              <button onClick={() => patch({ handbook_read_at: now })}
                className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm hover:bg-[#142f58] transition-colors">
                I have read and understood the Staff Handbook
              </button>
            </div>
          )}

          {/* ── SAFEGUARDING QUIZ ── */}
          {step === 'safeguarding_quiz' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step 2 of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Safeguarding Check</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Safeguarding is at the heart of everything we do. Answer all 5 questions correctly to continue. You can retry as many times as needed.
                </p>
              </div>
              <Quiz
                questions={SAFEGUARDING_QUIZ}
                onPass={() => patch({ safeguarding_quiz_passed_at: now })}
              />
            </div>
          )}

          {/* ── SAFEGUARDING CERT ── */}
          {step === 'safeguarding_cert' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step 3 of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Safeguarding Certificate</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Upload your valid safeguarding certificate (must be within the last 3 years). Your area lead will verify it before your first session.
                </p>
              </div>
              <UploadArea
                label="Safeguarding Certificate"
                existingName={rec.safeguarding_cert_name}
                existingUrl={rec.safeguarding_cert_url}
                storagePath={`certs/${profile!.id}/safeguarding`}
                onUploaded={(url, name) => patch({
                  safeguarding_cert_url: url,
                  safeguarding_cert_name: name,
                  safeguarding_cert_uploaded_at: now,
                })}
              />
              {rec.safeguarding_cert_url && (
                <button onClick={() => setStep(currentStep({ ...rec, safeguarding_cert_url: rec.safeguarding_cert_url }))}
                  className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm hover:bg-[#142f58] transition-colors">
                  Continue <ChevronRight size={14} className="inline" />
                </button>
              )}
            </div>
          )}

          {/* ── FIRST AID CERT ── */}
          {step === 'first_aid_cert' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step 4 of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">First Aid Certificate</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  As a coach working with children, you must hold a valid paediatric or emergency first aid certificate. Upload it here.
                </p>
              </div>
              <UploadArea
                label="First Aid Certificate"
                existingName={rec.first_aid_cert_name}
                existingUrl={rec.first_aid_cert_url}
                storagePath={`certs/${profile!.id}/first-aid`}
                onUploaded={(url, name) => patch({
                  first_aid_cert_url: url,
                  first_aid_cert_name: name,
                  first_aid_cert_uploaded_at: now,
                })}
              />
              {rec.first_aid_cert_url && (
                <button onClick={() => setStep('coaching_resources')}
                  className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm hover:bg-[#142f58] transition-colors">
                  Continue <ChevronRight size={14} className="inline" />
                </button>
              )}
            </div>
          )}

          {/* ── COACHING RESOURCES ── */}
          {step === 'coaching_resources' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step {rec.first_aid_required ? 5 : 4} of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Coaching Resources</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Review the lesson plans and UKAG award framework you'll use in every session.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Lesson Plan Library', path: '/lesson-plans', desc: 'Weekly session structures for every age group and ability' },
                  { label: 'UKAG Award Framework', path: '/ukag', desc: 'The gymnastics progression pathway used in every ASO session' },
                  { label: 'Staff Handbook', path: '/handbook', desc: 'Session procedures, behaviour management and code of conduct' },
                ].map(r => (
                  <a key={r.label} href={r.path} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-[#1a3a6b]/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1a3a6b]">{r.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 shrink-0" />
                  </a>
                ))}
              </div>
              <button onClick={() => patch({ coaching_resources_read_at: now })}
                className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm hover:bg-[#142f58] transition-colors">
                I've reviewed all coaching resources
              </button>
            </div>
          )}

          {/* ── COACHING QUIZ ── */}
          {step === 'coaching_quiz' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step {rec.first_aid_required ? 6 : 5} of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Coaching Standards</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  A quick check on ASO coaching standards and professional conduct. All 4 questions must be correct to continue.
                </p>
              </div>
              <Quiz
                questions={COACHING_QUIZ}
                onPass={() => patch({ coaching_quiz_passed_at: now })}
              />
            </div>
          )}

          {/* ── CONTRACT ── */}
          {step === 'contract' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Step {rec.first_aid_required ? 7 : 6} of {steps.length - 1}</p>
                <h2 className="text-xl font-extrabold text-gray-900">Your Contract</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Download your placement offer, sign it, and upload your signed copy below.
                </p>
              </div>
              {!rec.placement_offer_url ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-sm font-bold text-amber-700 mb-1">Waiting for your placement offer</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Your area lead is preparing your placement offer. You'll be able to sign and upload it here once it's ready. Check back soon.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-2">Your Placement Offer</p>
                    <a href={rec.placement_offer_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a6b] hover:underline">
                      <ExternalLink size={13} /> {rec.placement_offer_name ?? 'Download Placement Offer'}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">Download, print or sign digitally, then upload your signed copy below.</p>
                  </div>
                  <UploadArea
                    label="Signed Contract"
                    existingName={rec.contract_signed_name}
                    existingUrl={rec.contract_signed_url}
                    storagePath={`onboarding/${profile!.id}/contract`}
                    onUploaded={(url, name) => patch({
                      contract_signed_url: url,
                      contract_signed_name: name,
                      contract_signed_at: now,
                    })}
                  />
                  {rec.contract_signed_url && (
                    <button onClick={() => setStep('profile')}
                      className="w-full py-3 rounded-2xl bg-[#1a3a6b] text-white font-bold text-sm hover:bg-[#142f58] transition-colors">
                      Continue <ChevronRight size={14} className="inline" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {step === 'profile' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-1">Final step</p>
                <h2 className="text-xl font-extrabold text-gray-900">Complete Your Profile</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Fill in your personal details, emergency contact, and add a profile photo. Once done, you'll have full access to the ASO app.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {[
                  'Your contact number',
                  'Your home address',
                  'Emergency contact name & number',
                  'A profile photo',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <X size={14} className="text-gray-300 shrink-0" />
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
              <a href="/profile" target="_blank" rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-white border-2 border-[#1a3a6b] text-[#1a3a6b] font-bold text-sm text-center hover:bg-[#1a3a6b]/5 transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={14} /> Open My Profile
              </a>
              <button onClick={completeOnboarding}
                className="w-full py-3.5 rounded-2xl bg-[#f5c518] text-[#1a3a6b] font-extrabold text-base hover:bg-yellow-400 transition-colors">
                My profile is complete — take me to the app!
              </button>
              <p className="text-xs text-gray-400 text-center">
                By continuing you confirm your profile details are accurate and up to date.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
