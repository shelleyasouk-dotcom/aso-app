import { useState } from 'react'
import { Camera, CheckCircle, BookOpen, X, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const STAFF_ROLES = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach', 'outreach_worker', 'media_tech']

// Show to anyone who acknowledged before the June 2026 update, or never acknowledged
const POLICY_UPDATED_AT = new Date('2026-06-01T00:00:00Z')

export function PhotoPolicyModal() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!profile) return null
  if (!STAFF_ROLES.includes(profile.role)) return null

  const ackedAt: string | null = (profile as any).photography_policy_ack_at ?? null
  if (ackedAt && new Date(ackedAt) >= POLICY_UPDATED_AT) return null

  async function handleAccept() {
    if (!agreed || !profile) return
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('profiles')
      .update({ photography_policy_ack_at: new Date().toISOString() })
      .eq('id', profile.id)
    if (error) {
      setSaveError(error.message.includes('photography_policy_ack_at')
        ? 'Please run supabase/photography_policy.sql in the Supabase SQL Editor first.'
        : error.message)
      setSaving(false)
      return
    }
    await refreshProfile()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a3a6b] px-6 py-5 text-white shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#f5c518] rounded-full flex items-center justify-center shrink-0">
              <Camera size={14} className="text-[#1a3a6b]" />
            </div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Staff Handbook Update · June 2026</p>
          </div>
          <h1 className="text-lg font-extrabold leading-snug">Photography & Image Policy — Updated</h1>
          <p className="text-white/70 text-sm mt-1">Section 13.3 has been added to your handbook. Please read the key points and accept below.</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm font-bold text-red-800">Lead Coaches only may take photographs at sessions.</p>
            <p className="text-xs text-red-700 mt-1">Assistant Coaches and Junior Coaches do not take photos — on any device, at any time.</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">3 checks before any photo</p>
            {[
              'Area Lead has confirmed photography is approved for this session',
              'You know which children have NOT given consent — you will not photograph them',
              'You are using the ASO app or an ASO-issued device (or have written approval for personal device)',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1a3a6b] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-gray-700">{t}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Never — zero exceptions</p>
            {[
              'Store photos of children in your personal camera roll long-term',
              'Share photos in personal WhatsApp chats or on your own social media',
              'Send photos directly to parents — even if they ask',
              'Upload photos to any AI tool or editing app',
            ].map(t => (
              <div key={t} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <X size={12} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{t}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/handbook')}
            className="flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
          >
            <BookOpen size={15} />
            Read the full policy — Section 13.3 of your handbook
          </button>

          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            By ticking below and clicking <strong>Accept & Continue</strong>, you confirm you have read and understood the updated photography and image policy (Section 13.3, June 2026).
          </p>

          <label className="flex items-start gap-3 cursor-pointer bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-2xl p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#1a3a6b] shrink-0 cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#1a3a6b] leading-snug">
              I have read the updated photography policy (Section 13.3) and will follow it at every session.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex flex-col gap-3">
          {saveError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{saveError}</p>
            </div>
          )}
          <button
            onClick={handleAccept}
            disabled={!agreed || saving}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} />
            {saving ? 'Saving…' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
