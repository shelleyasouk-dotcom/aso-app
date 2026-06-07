import { useState } from 'react'
import { CheckCircle, FileCheck, ShieldCheck, GraduationCap, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const STAFF_ROLES = ['area_lead', 'lead_coach', 'assistant_coach', 'junior_coach', 'outreach_worker', 'media_tech']

export function StaffOnboardingModal() {
  const { profile, refreshProfile } = useAuth()
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)

  // Only show for staff who haven't agreed yet
  if (!profile) return null
  if (!STAFF_ROLES.includes(profile.role)) return null
  if ((profile as any).terms_agreed_at) return null

  async function handleAccept() {
    if (!agreed || !profile) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ terms_agreed_at: new Date().toISOString() })
      .eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a3a6b] px-6 py-6 text-white shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#f5c518] rounded-full flex items-center justify-center shrink-0">
              <span className="text-[#1a3a6b] font-extrabold text-sm">ASO</span>
            </div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Active Schools Organisation</p>
          </div>
          <h1 className="text-xl font-extrabold mt-2">Welcome to the team, {profile.full_name.split(' ')[0]}!</h1>
          <p className="text-white/70 text-sm mt-1">Before you get started, please read and agree to the following.</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          <p className="text-sm text-gray-700 leading-relaxed">
            We're thrilled to have you join the Active Schools Organisation team. To ensure we maintain the highest standards
            for the children and schools we work with, all staff are required to agree to the following commitments.
          </p>

          {/* Commitments */}
          <div className="flex flex-col gap-3">
            <CommitmentItem icon={ShieldCheck} color="blue">
              <strong>Safeguarding & Compliance</strong> — You agree to submit all required documents before working with children,
              including a valid Enhanced DBS certificate, up-to-date Safeguarding certificate, and First Aid qualification.
              These must be kept current throughout your employment.
            </CommitmentItem>

            <CommitmentItem icon={GraduationCap} color="purple">
              <strong>Coaching Qualifications</strong> — You agree to undertake all coaching qualifications and CPD training
              required by ASO. These may include UKAG gymnastics coaching awards, safeguarding refreshers, and any
              additional role-specific training.
            </CommitmentItem>

            <CommitmentItem icon={Clock} color="amber">
              <strong>Minimum Commitment — 2 Full Semesters</strong> — ASO invests significantly in each member of staff,
              including course fees, DBS processing, induction, and school placements — often hundreds of pounds per person.
              In return, we require a minimum commitment of <strong>two full semesters</strong> of employment.
            </CommitmentItem>

            <CommitmentItem icon={FileCheck} color="red">
              <strong>Course Fee Repayment</strong> — If you leave ASO before completing two full semesters, you may be
              required to repay some or all of the costs invested in your training and onboarding. This will be discussed
              with you at the time and is at the discretion of ASO management.
            </CommitmentItem>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
            By ticking the box below and clicking <strong>Accept & Continue</strong>, you confirm that you have read,
            understood, and agree to the above commitments. This agreement is recorded with a timestamp against your profile.
          </p>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-2xl p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#1a3a6b] shrink-0 cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#1a3a6b] leading-snug">
              I have read and agree to the commitments above, including the minimum two-semester commitment and potential course fee repayment.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
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

function CommitmentItem({
  icon: Icon, color, children,
}: {
  icon: React.ElementType
  color: 'blue' | 'purple' | 'amber' | 'red'
  children: React.ReactNode
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  }
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${colors[color]}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-xs text-gray-700 leading-relaxed">{children}</p>
    </div>
  )
}
