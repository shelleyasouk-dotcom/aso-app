import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp,
  Upload, ExternalLink, ShieldCheck, HeartPulse, AlertCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoachWithOnboarding {
  id: string
  full_name: string
  role: string
  area: string | null
  onboarding: {
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
    notes: string | null
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COACHING_ROLES = ['lead_coach', 'assistant_coach', 'junior_coach', 'area_lead']

function roleLabel(role: string) {
  const map: Record<string, string> = {
    lead_coach: 'Lead Coach', assistant_coach: 'Assistant Coach',
    junior_coach: 'Junior Coach', area_lead: 'Area Lead',
    director: 'Director', outreach_worker: 'Outreach',
  }
  return map[role] ?? role
}

function progressPct(o: CoachWithOnboarding['onboarding']): number {
  if (!o) return 0
  const steps = [
    !!o.handbook_read_at,
    !!o.safeguarding_cert_url,
    ...(o.first_aid_required ? [!!o.first_aid_cert_url] : []),
    !!o.coaching_resources_read_at,
    !!o.profile_completed_at,
    !!o.contract_signed_url,
  ]
  return Math.round(steps.filter(Boolean).length / steps.length * 100)
}

function StepRow({ label, done, url, name, verified, onVerify, onUnverify }: {
  label: string
  done: boolean
  url?: string | null
  name?: string | null
  verified?: boolean
  onVerify?: () => void
  onUnverify?: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-5 shrink-0">
        {verified ? <CheckCircle2 size={16} className="text-green-500" />
          : done ? <Clock size={16} className="text-amber-400" />
          : <XCircle size={16} className="text-gray-200" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
        {url && name && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#1a3a6b] hover:underline mt-0.5">
            <ExternalLink size={10} /> {name}
          </a>
        )}
      </div>
      {done && !verified && onVerify && (
        <button onClick={onVerify}
          className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors shrink-0">
          Verify
        </button>
      )}
      {verified && onUnverify && (
        <button onClick={onUnverify}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0">
          Unverify
        </button>
      )}
    </div>
  )
}

// ─── Coach row ────────────────────────────────────────────────────────────────

function CoachRow({ coach, onRefresh, managerId }: {
  coach: CoachWithOnboarding
  onRefresh: () => void
  managerId: string
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(coach.onboarding?.notes ?? '')
  const [uploadingOffer, setUploadingOffer] = useState(false)
  const offerRef = useRef<HTMLInputElement>(null)
  const o = coach.onboarding

  const pct = progressPct(o)
  const isComplete = o?.contract_verified_at != null
  const hasIssues = o && (
    (o.safeguarding_cert_url && !o.safeguarding_verified_at) ||
    (o.first_aid_required && o.first_aid_cert_url && !o.first_aid_verified_at) ||
    (o.contract_signed_url && !o.contract_verified_at)
  )

  async function patchOnboarding(fields: Record<string, unknown>) {
    if (!o) return
    setSaving(true)
    await supabase.from('coach_onboarding').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', o.id)
    setSaving(false)
    onRefresh()
  }

  async function createRecord() {
    setSaving(true)
    await supabase.from('coach_onboarding').insert({
      profile_id: coach.id,
      first_aid_required: COACHING_ROLES.includes(coach.role),
    })
    setSaving(false)
    onRefresh()
  }

  async function uploadOffer(file: File) {
    if (!o) return
    setUploadingOffer(true)
    const ext = file.name.split('.').pop()
    const path = `onboarding/${coach.id}/placement-offer.${ext}`
    const { error } = await supabase.storage.from('coach-files').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('coach-files').getPublicUrl(path)
      await patchOnboarding({
        placement_offer_url: data.publicUrl,
        placement_offer_name: file.name,
        placement_offer_uploaded_at: new Date().toISOString(),
      })
    }
    setUploadingOffer(false)
  }

  async function saveNotes() {
    await patchOnboarding({ notes })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {coach.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#1a3a6b] text-sm leading-tight">{coach.full_name}</p>
            {hasIssues && <AlertCircle size={13} className="text-amber-500" />}
            {isComplete && <CheckCircle2 size={13} className="text-green-500" />}
          </div>
          <p className="text-xs text-gray-400">{roleLabel(coach.role)}{coach.area ? ` · ${coach.area}` : ''}</p>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-[#1a3a6b] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-500 w-8">{pct}%</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-300 shrink-0" /> : <ChevronDown size={15} className="text-gray-300 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4">

          {!o ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No onboarding record yet.</p>
              <Button onClick={createRecord} disabled={saving}>Create Onboarding Record</Button>
            </div>
          ) : (
            <>
              {/* Step checklist */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Steps</p>
                <StepRow label="Staff handbook read" done={!!o.handbook_read_at} />
                <StepRow
                  label="Safeguarding certificate"
                  done={!!o.safeguarding_cert_url}
                  url={o.safeguarding_cert_url}
                  name={o.safeguarding_cert_name}
                  verified={!!o.safeguarding_verified_at}
                  onVerify={() => patchOnboarding({ safeguarding_verified_at: new Date().toISOString(), safeguarding_verified_by: managerId })}
                  onUnverify={() => patchOnboarding({ safeguarding_verified_at: null, safeguarding_verified_by: null })}
                />
                {o.first_aid_required && (
                  <StepRow
                    label="First aid certificate"
                    done={!!o.first_aid_cert_url}
                    url={o.first_aid_cert_url}
                    name={o.first_aid_cert_name}
                    verified={!!o.first_aid_verified_at}
                    onVerify={() => patchOnboarding({ first_aid_verified_at: new Date().toISOString(), first_aid_verified_by: managerId })}
                    onUnverify={() => patchOnboarding({ first_aid_verified_at: null, first_aid_verified_by: null })}
                  />
                )}
                <StepRow label="Coaching resources reviewed" done={!!o.coaching_resources_read_at} />
                <StepRow label="Profile completed" done={!!o.profile_completed_at} />
                <StepRow
                  label="Signed contract uploaded"
                  done={!!o.contract_signed_url}
                  url={o.contract_signed_url}
                  name={o.contract_signed_name}
                  verified={!!o.contract_verified_at}
                  onVerify={() => patchOnboarding({ contract_verified_at: new Date().toISOString() })}
                  onUnverify={() => patchOnboarding({ contract_verified_at: null })}
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide">Settings</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => patchOnboarding({ first_aid_required: !o.first_aid_required })}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${o.first_aid_required ? 'bg-[#1a3a6b]' : 'bg-gray-200'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${o.first_aid_required ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <HeartPulse size={14} className="text-rose-500" /> First aid required
                  </span>
                </label>
              </div>

              {/* Upload placement offer */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Placement Offer</p>
                {o.placement_offer_url && (
                  <a href={o.placement_offer_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#1a3a6b] font-semibold hover:underline mb-2 block">
                    <ExternalLink size={13} /> {o.placement_offer_name}
                  </a>
                )}
                <input ref={offerRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadOffer(f) }} />
                <button
                  onClick={() => offerRef.current?.click()}
                  disabled={uploadingOffer}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3a6b] bg-[#1a3a6b]/8 px-3 py-2 rounded-xl hover:bg-[#1a3a6b]/15 transition-colors disabled:opacity-60"
                >
                  <Upload size={13} /> {uploadingOffer ? 'Uploading…' : o.placement_offer_url ? 'Replace Offer' : 'Upload Placement Offer'}
                </button>
                <p className="text-xs text-gray-400 mt-1">Uploading this unlocks the contract signing step for the coach.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center">
                <ShieldCheck size={14} className="text-gray-300" />
                <a href={`/profile/${coach.id}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#1a3a6b] font-semibold hover:underline">
                  View full profile →
                </a>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Internal notes about this coach's onboarding…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
                />
                <button onClick={saveNotes} disabled={saving}
                  className="mt-1.5 text-xs text-[#1a3a6b] font-bold hover:underline disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save notes'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingAdminPage() {
  const { profile } = useAuth()
  const [coaches, setCoaches] = useState<CoachWithOnboarding[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'complete'>('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: staff } = await supabase
      .from('profiles')
      .select('id, full_name, role, area')
      .in('role', [...COACHING_ROLES, 'director'])
      .order('full_name')

    const { data: onboarding } = await supabase
      .from('coach_onboarding')
      .select('*')

    const onboardingMap = Object.fromEntries((onboarding ?? []).map(o => [o.profile_id, o]))

    setCoaches((staff ?? []).map(s => ({
      ...s,
      onboarding: onboardingMap[s.id] ?? null,
    })))
    setLoading(false)
  }

  const filtered = coaches.filter(c => {
    if (filter === 'complete') return c.onboarding?.contract_verified_at != null
    if (filter === 'pending') return !c.onboarding?.contract_verified_at
    return true
  })

  const totalComplete = coaches.filter(c => c.onboarding?.contract_verified_at).length
  const totalPending = coaches.filter(c => c.onboarding && !c.onboarding.contract_verified_at).length
  const totalAwaitingReview = coaches.filter(c => c.onboarding && (
    (c.onboarding.safeguarding_cert_url && !c.onboarding.safeguarding_verified_at) ||
    (c.onboarding.first_aid_required && c.onboarding.first_aid_cert_url && !c.onboarding.first_aid_verified_at) ||
    (c.onboarding.contract_signed_url && !c.onboarding.contract_verified_at)
  )).length

  return (
    <Layout title="Coach Onboarding" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Complete', value: totalComplete, color: 'bg-green-50 text-green-700' },
            { label: 'In Progress', value: totalPending, color: 'bg-blue-50 text-[#1a3a6b]' },
            { label: 'Need Review', value: totalAwaitingReview, color: 'bg-amber-50 text-amber-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
              <p className="text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'pending', 'complete'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'}`}>
              {f === 'all' ? 'All' : f === 'pending' ? 'In Progress' : 'Complete'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No coaches found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(c => (
              <CoachRow key={c.id} coach={c} onRefresh={load} managerId={profile!.id} />
            ))}
          </div>
        )}

        {/* Onboarding link for coaches */}
        <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/10 rounded-2xl px-4 py-3">
          <p className="text-xs text-[#1a3a6b] leading-relaxed">
            <span className="font-bold">Share with coaches:</span> Coaches access their own onboarding checklist at{' '}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded">/onboarding</span> after logging in.
          </p>
        </div>

      </div>
    </Layout>
  )
}
