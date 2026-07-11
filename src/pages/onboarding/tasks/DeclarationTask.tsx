import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { TaskComponentProps } from '../../../types/onboarding'

export function DeclarationTask({ task, assignment, profileName, onComplete, onRefresh }: TaskComponentProps) {
  const [reachedEnd, setReachedEnd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const text = task.declaration_text ?? ''
    if (text.length < 300) { setReachedEnd(true); return }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setReachedEnd(true) },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [task.declaration_text])

  function nameMatches(typed: string, profile: string): boolean {
    const words = (s: string) => s.toLowerCase().trim().split(/\s+/)
    const typedWords = words(typed)
    const profileWords = words(profile)
    const first = profileWords[0]
    const last = profileWords[profileWords.length - 1]
    if (profileWords.length === 1) return typedWords.includes(first)
    return typedWords.includes(first) && typedWords.includes(last)
  }

  async function submit() {
    if (!nameMatches(typedName, profileName)) {
      setNameError(`Please enter your name as it appears on your profile: ${profileName}`)
      return
    }
    setNameError(null)
    setSaving(true)
    const now = new Date().toISOString()
    await supabase.from('onboarding_task_assignments').update({
      status: 'completed',
      completed_at: now,
      declaration_name: typedName.trim(),
      declaration_signed_at: now,
      declaration_version: task.version,
      declaration_text_snapshot: task.declaration_text,
      updated_at: now,
    }).eq('id', assignment.id)
    setSaving(false)
    onRefresh()
    onComplete()
  }

  const declarationText = task.declaration_text ?? ''

  if (assignment.status === 'completed') {
    return (
      <>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 pb-4 max-w-lg mx-auto w-full flex flex-col gap-5">

            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Declaration signed</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Signed as {assignment.declaration_name} on{' '}
                  {new Date(assignment.declaration_signed_at!).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Declaration</p>
              {declarationText.length > 0 ? (
                declarationText.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">
                    {line || <br />}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No declaration text available.</p>
              )}
            </div>

          </div>
        </div>

        <div className="sticky bottom-0 bg-[#f5f7fc] border-t border-gray-100 px-4 py-3 pb-safe-bottom">
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-2xl font-bold text-sm bg-[#1a3a6b] text-white"
          >
            Continue
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-4 max-w-lg mx-auto w-full flex flex-col gap-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Declaration</p>
            {declarationText.length > 0 ? (
              declarationText.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {line || <br />}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">
                No declaration text provided. Contact your area lead.
              </p>
            )}
            <div ref={sentinelRef} className="h-1" />
          </div>

          {!reachedEnd && (
            <p className="text-xs text-gray-400 text-center">
              ↓ Scroll to the end of the declaration to continue
            </p>
          )}

          <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
            agreed ? 'bg-[#1a3a6b]/5 border-[#1a3a6b]/20' : 'bg-white border-gray-100'
          } ${!reachedEnd ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              disabled={!reachedEnd}
              className="mt-0.5 accent-[#1a3a6b] w-4 h-4 shrink-0"
            />
            <span className="text-sm text-gray-700 leading-snug">
              I have read and understood the above declaration and confirm it is accurate.
            </span>
          </label>

          <div className={`transition-opacity ${!agreed ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-xs font-bold text-gray-500 block mb-1.5">
              Type your full legal name to sign
            </label>
            <input
              type="text"
              value={typedName}
              onChange={e => { setTypedName(e.target.value); setNameError(null) }}
              placeholder={profileName}
              disabled={!agreed}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
            />
            <p className="text-xs text-gray-400 mt-1">Your name on file: {profileName}</p>
            {nameError && (
              <div className="flex items-start gap-1.5 mt-2">
                <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{nameError}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="sticky bottom-0 bg-[#f5f7fc] border-t border-gray-100 px-4 py-3 pb-safe-bottom">
        <button
          onClick={submit}
          disabled={!(reachedEnd && agreed && typedName.trim().length > 1) || saving}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-colors
            disabled:bg-gray-100 disabled:text-gray-400
            enabled:bg-[#1a3a6b] enabled:text-white"
        >
          {saving ? 'Signing…' : 'Sign Declaration'}
        </button>
      </div>
    </>
  )
}
