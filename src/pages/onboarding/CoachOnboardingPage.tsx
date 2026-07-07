import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2, Circle, Clock, Upload, ExternalLink,
  BookOpen, Shield, HeartPulse, GraduationCap, User, FileSignature, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingRecord {
  id: string
  handbook_read_at: string | null
  safeguarding_cert_url: string | null
  safeguarding_cert_name: string | null
  safeguarding_cert_uploaded_at: string | null
  safeguarding_verified_at: string | null
  first_aid_required: boolean
  first_aid_cert_url: string | null
  first_aid_cert_name: string | null
  first_aid_cert_uploaded_at: string | null
  first_aid_verified_at: string | null
  coaching_resources_read_at: string | null
  profile_completed_at: string | null
  placement_offer_url: string | null
  placement_offer_name: string | null
  contract_signed_url: string | null
  contract_signed_name: string | null
  contract_signed_at: string | null
  contract_verified_at: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type StepStatus = 'complete' | 'verified' | 'pending' | 'locked' | 'not_started'

function stepStatus(done: boolean, verified?: boolean | null, locked?: boolean): StepStatus {
  if (locked) return 'locked'
  if (verified) return 'verified'
  if (done) return 'pending'
  return 'not_started'
}

function StatusBadge({ status }: { status: StepStatus }) {
  const map: Record<StepStatus, { label: string; className: string }> = {
    verified:    { label: 'Verified',      className: 'bg-green-100 text-green-700' },
    complete:    { label: 'Done',          className: 'bg-blue-100 text-blue-700' },
    pending:     { label: 'Pending review', className: 'bg-amber-100 text-amber-700' },
    not_started: { label: 'Not started',   className: 'bg-gray-100 text-gray-500' },
    locked:      { label: 'Locked',        className: 'bg-gray-100 text-gray-400' },
  }
  const { label, className } = map[status]
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>{label}</span>
}

function StepIcon({ status, icon: Icon }: { status: StepStatus; icon: React.ElementType }) {
  if (status === 'verified') return <CheckCircle2 size={22} className="text-green-500" />
  if (status === 'pending')  return <Clock size={22} className="text-amber-500" />
  if (status === 'locked')   return <Circle size={22} className="text-gray-300" />
  if (status === 'complete') return <CheckCircle2 size={22} className="text-blue-400" />
  return <Icon size={22} className="text-[#1a3a6b]" />
}

// ─── Upload button ────────────────────────────────────────────────────────────

function UploadButton({
  label, existingName, existingUrl, onUploaded, uploading, setUploading, storagePath,
}: {
  label: string
  existingName: string | null
  existingUrl: string | null
  onUploaded: (url: string, name: string) => void
  uploading: boolean
  setUploading: (v: boolean) => void
  storagePath: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${storagePath}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('coach-files').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('coach-files').getPublicUrl(path)
      onUploaded(data.publicUrl, file.name)
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {existingName && existingUrl && (
        <a href={existingUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#1a3a6b] font-semibold hover:underline">
          <ExternalLink size={13} /> {existingName}
        </a>
      )}
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#142f58] transition-colors disabled:opacity-60"
      >
        <Upload size={14} /> {uploading ? 'Uploading…' : label}
      </button>
      <p className="text-xs text-gray-400">PDF, JPG or PNG · max 10 MB</p>
    </div>
  )
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  number, icon, title, desc, status, children,
}: {
  number: number
  icon: React.ElementType
  title: string
  desc: string
  status: StepStatus
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isLocked = status === 'locked'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity ${isLocked ? 'opacity-50' : ''}`}>
      <button
        className="w-full flex items-center gap-4 px-4 py-4 text-left"
        onClick={() => !isLocked && setOpen(v => !v)}
        disabled={isLocked}
      >
        <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
          <StepIcon status={status} icon={icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs text-gray-400 font-semibold">Step {number}</span>
            <StatusBadge status={status} />
          </div>
          <p className="font-bold text-[#1a3a6b] text-sm leading-tight">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
        </div>
        {!isLocked && (open ? <ChevronUp size={16} className="text-gray-300 shrink-0" /> : <ChevronDown size={16} className="text-gray-300 shrink-0" />)}
      </button>
      {open && !isLocked && (
        <div className="border-t border-gray-100 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CoachOnboardingPage() {
  const { profile } = useAuth()
  const [rec, setRec] = useState<OnboardingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => { if (profile) init() }, [profile])

  async function init() {
    // Upsert an onboarding record for this coach
    const { data } = await supabase
      .from('coach_onboarding')
      .select('*')
      .eq('profile_id', profile!.id)
      .maybeSingle()
    if (data) {
      setRec(data as OnboardingRecord)
    } else {
      const COACHING_ROLES = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach']
      const { data: created } = await supabase
        .from('coach_onboarding')
        .insert({ profile_id: profile!.id, first_aid_required: COACHING_ROLES.includes(profile!.role) })
        .select()
        .single()
      if (created) setRec(created as OnboardingRecord)
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
    if (data) setRec(data as OnboardingRecord)
  }

  if (loading || !rec) {
    return <Layout title="My Onboarding" showBack><p className="text-center text-gray-400 py-10">Loading…</p></Layout>
  }

  // Step statuses
  const s1 = stepStatus(!!rec.handbook_read_at)
  const s2 = stepStatus(!!rec.safeguarding_cert_url, !!rec.safeguarding_verified_at)
  const s3 = stepStatus(!!rec.first_aid_cert_url, !!rec.first_aid_verified_at)
  const s4 = stepStatus(!!rec.coaching_resources_read_at)
  const s5 = stepStatus(!!rec.profile_completed_at)
  // Contract unlocks only when steps 1–4 are done (and step 5 if first aid required)
  const prerequisitesDone =
    !!rec.handbook_read_at &&
    !!rec.safeguarding_cert_url &&
    (!rec.first_aid_required || !!rec.first_aid_cert_url) &&
    !!rec.coaching_resources_read_at
  const contractLocked = !prerequisitesDone || !rec.placement_offer_url
  const s6 = stepStatus(!!rec.contract_signed_url, !!rec.contract_verified_at, contractLocked)

  // Progress
  const statuses = [s1, s2, ...(rec.first_aid_required ? [s3] : []), s4, s5, s6]
  const done = statuses.filter(s => s === 'verified' || s === 'complete' || s === 'pending').length
  const pct = Math.round((done / statuses.length) * 100)

  const isAllDone = s6 === 'verified'

  return (
    <Layout title="My Onboarding" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Progress header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] rounded-2xl p-5 text-white">
          {isAllDone ? (
            <div className="text-center">
              <CheckCircle2 size={36} className="text-green-400 mx-auto mb-2" />
              <p className="font-extrabold text-lg">Onboarding complete!</p>
              <p className="text-white/70 text-sm mt-1">Welcome to the ASO team. All steps verified.</p>
            </div>
          ) : (
            <>
              <p className="font-bold text-white mb-1">Welcome, {profile?.full_name?.split(' ')[0]}!</p>
              <p className="text-white/70 text-xs mb-3">Complete each step below to finish your onboarding.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-[#f5c518] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-[#f5c518] shrink-0">{pct}%</span>
              </div>
              <p className="text-white/50 text-xs mt-1">{done} of {statuses.length} steps done</p>
            </>
          )}
        </div>

        {/* Steps */}

        {/* 1 — Handbook */}
        <StepCard number={1} icon={BookOpen} title="Read the Staff Handbook" status={s1}
          desc="Read and acknowledge the ASO staff handbook — policies, procedures and expectations.">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              The handbook covers everything you need to know as an ASO coach — safeguarding, session procedures, communication standards, behaviour management and more.
            </p>
            <a href="/handbook" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a6b] hover:underline">
              <ExternalLink size={14} /> Open Staff Handbook
            </a>
            {!rec.handbook_read_at ? (
              <Button onClick={() => patch({ handbook_read_at: new Date().toISOString() })}>
                I have read and understood the handbook
              </Button>
            ) : (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Acknowledged {new Date(rec.handbook_read_at).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        </StepCard>

        {/* 2 — Safeguarding */}
        <StepCard number={2} icon={Shield} title="Safeguarding Certificate" status={s2}
          desc="Upload your valid safeguarding certificate. This must be renewed every 3 years.">
          {rec.safeguarding_verified_at ? (
            <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Verified by management
            </p>
          ) : (
            <UploadButton
              label={rec.safeguarding_cert_url ? 'Replace Certificate' : 'Upload Certificate'}
              existingName={rec.safeguarding_cert_name}
              existingUrl={rec.safeguarding_cert_url}
              storagePath={`certs/${profile!.id}/safeguarding`}
              uploading={!!uploading['safeguarding']}
              setUploading={v => setUploading(u => ({ ...u, safeguarding: v }))}
              onUploaded={(url, name) => patch({
                safeguarding_cert_url: url,
                safeguarding_cert_name: name,
                safeguarding_cert_uploaded_at: new Date().toISOString(),
              })}
            />
          )}
          {rec.safeguarding_cert_url && !rec.safeguarding_verified_at && (
            <p className="text-xs text-amber-600 mt-2">Uploaded — awaiting verification from your area lead.</p>
          )}
        </StepCard>

        {/* 3 — First Aid (if required) */}
        {rec.first_aid_required && (
          <StepCard number={3} icon={HeartPulse} title="First Aid Certificate" status={s3}
            desc="Upload your valid paediatric or emergency first aid certificate.">
            {rec.first_aid_verified_at ? (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Verified by management
              </p>
            ) : (
              <UploadButton
                label={rec.first_aid_cert_url ? 'Replace Certificate' : 'Upload Certificate'}
                existingName={rec.first_aid_cert_name}
                existingUrl={rec.first_aid_cert_url}
                storagePath={`certs/${profile!.id}/first-aid`}
                uploading={!!uploading['first_aid']}
                setUploading={v => setUploading(u => ({ ...u, first_aid: v }))}
                onUploaded={(url, name) => patch({
                  first_aid_cert_url: url,
                  first_aid_cert_name: name,
                  first_aid_cert_uploaded_at: new Date().toISOString(),
                })}
              />
            )}
            {rec.first_aid_cert_url && !rec.first_aid_verified_at && (
              <p className="text-xs text-amber-600 mt-2">Uploaded — awaiting verification from your area lead.</p>
            )}
          </StepCard>
        )}

        {/* 4 — Coaching Resources */}
        <StepCard number={rec.first_aid_required ? 4 : 3} icon={GraduationCap}
          title="Review Coaching Resources" status={s4}
          desc="Read through the coaching materials, lesson plan library and UKAG award framework.">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              Review the resources you'll use every session — lesson plans, UKAG award levels, and coaching guides.
            </p>
            <div className="flex flex-col gap-2">
              <a href="/lesson-plans" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:underline">
                <ExternalLink size={13} /> Lesson Plans
              </a>
              <a href="/ukag" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:underline">
                <ExternalLink size={13} /> UKAG Award Framework
              </a>
            </div>
            {!rec.coaching_resources_read_at ? (
              <Button onClick={() => patch({ coaching_resources_read_at: new Date().toISOString() })}>
                I've reviewed the coaching resources
              </Button>
            ) : (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Reviewed {new Date(rec.coaching_resources_read_at).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        </StepCard>

        {/* 5 — Profile */}
        <StepCard number={rec.first_aid_required ? 5 : 4} icon={User}
          title="Complete Your Profile" status={s5}
          desc="Fill in your personal details, emergency contact, and upload a profile photo.">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              Make sure your profile is complete with your contact details, address, and emergency contact information.
            </p>
            <a href="/profile" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a6b] hover:underline">
              <ExternalLink size={14} /> Go to My Profile
            </a>
            {!rec.profile_completed_at ? (
              <Button onClick={() => patch({ profile_completed_at: new Date().toISOString() })}>
                My profile is complete
              </Button>
            ) : (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Completed {new Date(rec.profile_completed_at).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        </StepCard>

        {/* 6 — Contract */}
        <StepCard number={rec.first_aid_required ? 6 : 5} icon={FileSignature}
          title="Sign Your Placement Offer & Contract" status={s6}
          desc={contractLocked ? 'Complete all previous steps first — your placement offer will appear here once uploaded by your area lead.' : 'Download, sign and upload your signed placement offer and contract.'}>
          {!contractLocked && (
            <div className="flex flex-col gap-4">
              {rec.placement_offer_url && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Your Placement Offer</p>
                  <a href={rec.placement_offer_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a6b] hover:underline">
                    <ExternalLink size={13} /> {rec.placement_offer_name ?? 'Download Placement Offer'}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Download, sign, then upload your signed copy below.</p>
                </div>
              )}
              {rec.contract_verified_at ? (
                <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Contract verified — onboarding complete!
                </p>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Upload signed contract</p>
                  <UploadButton
                    label={rec.contract_signed_url ? 'Replace Signed Contract' : 'Upload Signed Contract'}
                    existingName={rec.contract_signed_name}
                    existingUrl={rec.contract_signed_url}
                    storagePath={`onboarding/${profile!.id}/contract`}
                    uploading={!!uploading['contract']}
                    setUploading={v => setUploading(u => ({ ...u, contract: v }))}
                    onUploaded={(url, name) => patch({
                      contract_signed_url: url,
                      contract_signed_name: name,
                      contract_signed_at: new Date().toISOString(),
                    })}
                  />
                  {rec.contract_signed_url && (
                    <p className="text-xs text-amber-600 mt-2">Uploaded — awaiting final verification from management.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </StepCard>

      </div>
    </Layout>
  )
}
