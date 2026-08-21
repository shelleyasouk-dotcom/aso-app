import { useState, useEffect } from 'react'
import { CheckCircle2, ScrollText, ChevronRight, Check, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface JDItem { type: 'text' | 'bullet'; text: string }
interface JDSection { heading: string; items: JDItem[] }
interface JobDescription {
  id: string
  role: string
  title: string
  version: string
  content: JDSection[] | null
}

const STAFF_ROLES = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach', 'outreach_worker', 'media_tech']

export function JobDescriptionModal() {
  const { profile, refreshProfile } = useAuth()
  const [jd, setJd] = useState<JobDescription | null>(null)
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(() => {
    try { return parseInt(localStorage.getItem('jd_modal_step') ?? '0', 10) || 0 } catch { return 0 }
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // Lock body scroll while modal is visible
  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [show])

  useEffect(() => {
    if (!profile || !STAFF_ROLES.includes(profile.role)) return

    const p = profile as typeof profile & {
      jd_agreed_at?: string | null
      jd_agreed_version?: string | null
      jd_agreed_role?: string | null
    }

    supabase
      .from('job_descriptions')
      .select('id, role, title, version, content')
      .eq('role', profile.role)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.content?.length) return
        const alreadyAgreed =
          p.jd_agreed_role === profile.role &&
          p.jd_agreed_version === data.version &&
          !!p.jd_agreed_at
        if (!alreadyAgreed) {
          setJd(data as JobDescription)
          setStep(0)
          setShow(true)
        }
      })
  }, [profile?.id, profile?.role])

  async function handleAgree() {
    if (!profile || !jd) return
    setSaving(true)
    await supabase.from('profiles').update({
      jd_agreed_at:      new Date().toISOString(),
      jd_agreed_version: jd.version,
      jd_agreed_role:    jd.role,
    } as Record<string, unknown>).eq('id', profile.id)
    if (refreshProfile) await refreshProfile()
    try { localStorage.removeItem('jd_modal_step') } catch {}
    setSaving(false)
    setDone(true)
    setTimeout(() => setShow(false), 1800)
  }

  if (!show || !jd) return null

  const sections = jd.content ?? []
  const total = sections.length
  const onConfirmScreen = step >= total
  const currentSection = !onConfirmScreen ? sections[step] : null

  return (
    /* Overlay — stopPropagation prevents clicks reaching the page behind */
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60"
      onTouchMove={e => e.stopPropagation()}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl flex flex-col shadow-2xl"
        style={{ height: '95dvh', maxHeight: '95dvh' }}
      >

        {/* Header */}
        <div className="bg-[#1a3a6b] px-5 py-4 flex items-center gap-3 shrink-0 sm:rounded-t-2xl">
          {step > 0 && !done && !onConfirmScreen && (
            <button onClick={() => setStep(s => s - 1)} className="text-white/70 hover:text-white">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-9 h-9 bg-[#f5c518] rounded-xl flex items-center justify-center shrink-0">
            <ScrollText size={17} className="text-[#1a3a6b]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight">Your Job Description</p>
            <p className="text-white/60 text-xs mt-0.5 truncate">{jd.title} · {jd.version}</p>
          </div>
          {!done && (
            <div className="shrink-0 bg-white/10 rounded-full px-3 py-1">
              <p className="text-white text-xs font-bold">{Math.min(step, total)}/{total}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!done && (
          <div className="h-1.5 bg-gray-100 shrink-0">
            <div
              className="h-full bg-[#f5c518] transition-all duration-300"
              style={{ width: `${(Math.min(step, total) / total) * 100}%` }}
            />
          </div>
        )}

        {/* Scrollable content — each step fills this area */}
        <div className="flex-1 overflow-y-auto">

          {done ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
              <CheckCircle2 size={52} className="text-green-500" />
              <p className="text-base font-bold text-gray-800">Thank you!</p>
              <p className="text-sm text-gray-500 text-center">Your agreement has been recorded.</p>
            </div>

          ) : onConfirmScreen ? (
            <div className="px-5 py-6 flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={30} className="text-green-500" />
                </div>
                <p className="text-base font-bold text-gray-800 text-center">All sections read</p>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  Tap confirm below to record your agreement to the {jd.title} ({jd.version}).
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2.5">
                {sections.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-sm text-gray-700">{s.heading}</p>
                  </div>
                ))}
              </div>
            </div>

          ) : currentSection && (
            <div className="px-5 py-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold text-[#1a3a6b]/40 uppercase tracking-wider mb-1">
                  Section {step + 1} of {total}
                </p>
                <h2 className="text-xl font-extrabold text-[#1a3a6b] leading-snug">{currentSection.heading}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {currentSection.items.map((item, i) =>
                  item.type === 'bullet'
                    ? <div key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1a3a6b] mt-2 shrink-0" />
                        <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                      </div>
                    : <p key={i} className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white sm:rounded-b-2xl">
            {onConfirmScreen ? (
              <button
                onClick={handleAgree}
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-green-600 text-white text-sm font-extrabold disabled:opacity-50"
              >
                {saving ? 'Saving…' : '✓  I confirm — I have read and understood my job description'}
              </button>
            ) : (
              <button
                onClick={() => {
                  const next = step + 1
                  try { localStorage.setItem('jd_modal_step', String(next)) } catch {}
                  setStep(next)
                }}
                className="w-full py-4 rounded-2xl bg-[#1a3a6b] text-white text-sm font-extrabold flex items-center justify-center gap-2 active:opacity-80"
              >
                I've read this section
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
