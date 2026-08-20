import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, ScrollText, ChevronDown } from 'lucide-react'
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

function AccordionSection({ section, index }: { section: JDSection; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
      >
        <span className="text-sm font-semibold text-[#1a3a6b] pr-2 leading-snug">{section.heading}</span>
        <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
          {section.items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No content in this section.</p>
          ) : section.items.map((item, i) =>
            item.type === 'bullet'
              ? <div key={i} className="flex items-start gap-2">
                  <span className="text-[#1a3a6b] mt-1 shrink-0 text-xs">•</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              : <p key={i} className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function JobDescriptionModal() {
  const { profile, refreshProfile } = useAuth()
  const [jd, setJd] = useState<JobDescription | null>(null)
  const [show, setShow] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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
        if (!data?.content?.length) return // no JD written yet — skip
        const alreadyAgreed =
          p.jd_agreed_role === profile.role &&
          p.jd_agreed_version === data.version &&
          !!p.jd_agreed_at
        if (!alreadyAgreed) {
          setJd(data as JobDescription)
          setShow(true)
        }
      })
  }, [profile?.id, profile?.role])

  async function handleAgree() {
    if (!profile || !jd || !agreed) return
    setSaving(true)
    const now = new Date().toISOString()
    await supabase.from('profiles').update({
      jd_agreed_at:      now,
      jd_agreed_version: jd.version,
      jd_agreed_role:    jd.role,
    } as Record<string, unknown>).eq('id', profile.id)
    if (refreshProfile) await refreshProfile()
    setSaving(false)
    setDone(true)
    setTimeout(() => setShow(false), 1800)
  }

  if (!show || !jd) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="bg-[#1a3a6b] px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-[#f5c518] rounded-xl flex items-center justify-center shrink-0">
            <ScrollText size={17} className="text-[#1a3a6b]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight">Your Job Description</p>
            <p className="text-white/60 text-xs mt-0.5 truncate">{jd.title} · {jd.version}</p>
          </div>
        </div>

        {/* Intro banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 shrink-0">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Please read your job description for this academic year.</strong> Once you've read each section, tick the box below and confirm your agreement.
          </p>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CheckCircle2 size={48} className="text-green-500" />
              <p className="text-base font-bold text-gray-800">Thank you!</p>
              <p className="text-sm text-gray-500 text-center">Your agreement has been recorded.</p>
            </div>
          ) : jd.content?.map((section, i) => (
            <AccordionSection key={i} section={section} index={i} />
          ))}
        </div>

        {/* Footer */}
        {!done && (
          <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3 shrink-0 bg-white">
            <label className="flex items-start gap-3 cursor-pointer bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-2xl p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-[#1a3a6b] shrink-0 cursor-pointer"
              />
              <span className="text-sm font-semibold text-[#1a3a6b] leading-snug">
                I have read and understood my job description ({jd.title}, {jd.version}) and agree to fulfil the responsibilities of my role.
              </span>
            </label>
            <button
              onClick={handleAgree}
              disabled={!agreed || saving}
              className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-extrabold disabled:opacity-40 transition-opacity"
            >
              {saving ? 'Saving…' : 'Confirm & Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
