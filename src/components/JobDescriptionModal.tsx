import { useState, useEffect } from 'react'
import { CheckCircle2, ScrollText, ChevronDown, Check } from 'lucide-react'
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

function AccordionSection({
  section,
  index,
  ticked,
  onTick,
}: {
  section: JDSection
  index: number
  ticked: boolean
  onTick: () => void
}) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${ticked ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      {/* Section header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white"
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${ticked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
          {ticked && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
        <span className="flex-1 text-sm font-semibold text-[#1a3a6b] leading-snug">{section.heading}</span>
        <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Section body */}
      {open && (
        <div className="px-4 pt-1 pb-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
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

          {/* Per-section tick */}
          {!ticked && (
            <button
              onClick={onTick}
              className="mt-2 self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a3a6b] text-white text-xs font-bold"
            >
              <Check size={13} strokeWidth={3} /> I've read this section
            </button>
          )}
          {ticked && (
            <p className="mt-1 text-xs text-green-600 font-semibold flex items-center gap-1">
              <Check size={12} strokeWidth={3} /> Read
            </p>
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
  const [tickedSections, setTickedSections] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

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
          setShow(true)
        }
      })
  }, [profile?.id, profile?.role])

  const totalSections = jd?.content?.length ?? 0
  const allTicked = tickedSections.size === totalSections && totalSections > 0

  function tickSection(idx: number) {
    setTickedSections(prev => new Set([...prev, idx]))
  }

  async function handleAgree() {
    if (!profile || !jd || !allTicked) return
    setSaving(true)
    await supabase.from('profiles').update({
      jd_agreed_at:      new Date().toISOString(),
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
          {/* Progress pill */}
          {!done && (
            <div className="shrink-0 bg-white/10 rounded-full px-3 py-1">
              <p className="text-white text-xs font-bold">{tickedSections.size}/{totalSections}</p>
            </div>
          )}
        </div>

        {/* Intro banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 shrink-0">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Please read each section carefully.</strong> Tick each section once you've read it — the confirm button unlocks when all sections are done.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CheckCircle2 size={48} className="text-green-500" />
              <p className="text-base font-bold text-gray-800">Thank you!</p>
              <p className="text-sm text-gray-500 text-center">Your agreement has been recorded.</p>
            </div>
          ) : jd.content?.map((section, i) => (
            <AccordionSection
              key={i}
              section={section}
              index={i}
              ticked={tickedSections.has(i)}
              onTick={() => tickSection(i)}
            />
          ))}
        </div>

        {/* Footer */}
        {!done && (
          <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white">
            {!allTicked && (
              <p className="text-xs text-gray-400 text-center mb-3">
                Read and tick all {totalSections} sections to continue ({totalSections - tickedSections.size} remaining)
              </p>
            )}
            <button
              onClick={handleAgree}
              disabled={!allTicked || saving}
              className="w-full py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-extrabold disabled:opacity-30 transition-opacity"
            >
              {saving ? 'Saving…' : allTicked ? `Confirm & Continue` : `Read all sections to continue`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
