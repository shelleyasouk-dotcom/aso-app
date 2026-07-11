import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText, FolderOpen, Eye, Download, X, Lock, User, IdCard, ScrollText, CheckCircle2, ChevronDown, ArrowLeft } from 'lucide-react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { ROLE_LABELS } from '../../lib/roles'
import type { Profile, CoachCertificate, StaffDocument, OnboardingDocCategory, StaffPersonal, StaffEmployment, ContractType, PayFrequency } from '../../types'

// ─── Date helpers ──────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type ExpiryStatus = { label: string; color: string }

function certExpiryStatus(dateStr: string | null | undefined): ExpiryStatus {
  if (!dateStr) return { label: 'No expiry', color: 'text-gray-400' }
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
  const fmt = formatDate(dateStr)
  if (days < 0) return { label: `Expired ${fmt}`, color: 'text-red-400' }
  if (days < 60) return { label: `Expires ${fmt}`, color: 'text-orange-500' }
  return { label: fmt, color: 'text-green-500' }
}

// ─── ID Card ──────────────────────────────────────────────────────────────

interface IdCardProps {
  fullName: string
  role: string
  area?: string
  profileId: string
  photoUrl?: string
  dbsNumber?: string
  dbsIssued?: string
  safeguardingIssued?: string
  firstAidIssued?: string
}

function DateRow({ label, dateStr }: { label: string; dateStr?: string | null }) {
  const isEmpty = !dateStr
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
      <span className="text-white/60 text-xs">{label}</span>
      <span className={`text-xs font-medium ${isEmpty ? 'text-white/30' : 'text-white/90'}`}>
        {isEmpty ? 'Not set' : formatDate(dateStr)}
      </span>
    </div>
  )
}

function CoachIdCard({ fullName, role, area, profileId, photoUrl, dbsNumber, dbsIssued, safeguardingIssued, firstAidIssued }: IdCardProps) {
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] rounded-3xl overflow-hidden shadow-xl text-white">
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#f5c518] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#1a3a6b] font-black text-[9px] leading-none">ASO</span>
          </div>
          <span className="text-white/70 text-xs font-medium">Digital Coach ID</span>
        </div>
        <span className="text-white/40 font-mono text-[10px]">{profileId.slice(0, 8).toUpperCase()}</span>
      </div>
      <div className="flex items-start gap-4 px-4 pt-4 pb-3">
        <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden border-2 border-white/20 shrink-0 flex items-center justify-center">
          {photoUrl
            ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-3xl">{initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-white font-bold text-xl leading-tight">{fullName}</p>
          <p className="text-white/70 text-sm mt-0.5">{role}</p>
          {area && <p className="text-white/50 text-xs mt-0.5">{area}</p>}
          {dbsNumber && (
            <div className="mt-2.5">
              <p className="text-white/40 text-[9px] uppercase tracking-wider">DBS Certificate No.</p>
              <p className="text-white font-mono font-bold text-sm mt-0.5">{dbsNumber}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mx-4 mb-4 bg-white/10 rounded-xl px-3 py-1">
        <DateRow label="DBS Issued" dateStr={dbsIssued} />
        <DateRow label="Safeguarding Issued" dateStr={safeguardingIssued} />
        <DateRow label="First Aid Issued" dateStr={firstAidIssued} />
      </div>
    </div>
  )
}

// ─── Certificate row ───────────────────────────────────────────────────────

function CertRow({ cert, canEdit, onDelete, onDownload }: {
  cert: CoachCertificate
  canEdit: boolean
  onDelete: (id: string) => void
  onDownload: (cert: CoachCertificate) => void
}) {
  const expiry = certExpiryStatus(cert.expiry_date)
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
        <FileText size={16} className="text-[#1a3a6b]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1a3a6b] text-sm truncate">{cert.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {cert.issued_date && (
            <span className="text-xs text-gray-400">Issued {formatDate(cert.issued_date)}</span>
          )}
          {cert.expiry_date && (
            <span className={`text-xs font-medium ${expiry.color}`}>{expiry.label}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {cert.file_path && (
          <button onClick={() => onDownload(cert)} className="p-1.5 rounded-lg text-[#1a3a6b] hover:bg-blue-50">
            <Download size={15} />
          </button>
        )}
        {canEdit && (
          <button onClick={() => onDelete(cert.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Onboarding documents ─────────────────────────────────────────────────

const DOC_CATEGORIES: { value: OnboardingDocCategory; label: string; color: string }[] = [
  { value: 'contract',      label: 'Contract',       color: 'bg-blue-100 text-blue-700' },
  { value: 'right_to_work', label: 'Right to Work',  color: 'bg-purple-100 text-purple-700' },
  { value: 'dbs',           label: 'DBS',            color: 'bg-red-100 text-red-700' },
  { value: 'reference',     label: 'Reference',      color: 'bg-amber-100 text-amber-700' },
  { value: 'certificate',   label: 'Certificate',    color: 'bg-green-100 text-green-700' },
  { value: 'other',         label: 'Other',          color: 'bg-gray-100 text-gray-600' },
]

function categoryChip(cat: OnboardingDocCategory) {
  const c = DOC_CATEGORIES.find(d => d.value === cat)
  return c ? (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
  ) : null
}

function DocRow({ doc, canDelete, onView, onDelete }: {
  doc: StaffDocument
  canDelete: boolean
  onView: (doc: StaffDocument) => void
  onDelete: (doc: StaffDocument) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
        <FileText size={16} className="text-[#1a3a6b]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1a3a6b] text-sm truncate">{doc.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {categoryChip(doc.category)}
          <span className="text-xs text-gray-400">
            {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        {doc.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.notes}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onView(doc)} className="p-1.5 rounded-lg text-[#1a3a6b] hover:bg-blue-50" title="View / Download">
          <Eye size={15} />
        </button>
        {canDelete && (
          <button onClick={() => onDelete(doc)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50" title="Delete">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Compliance row for full-screen ID ────────────────────────────────────

function ComplianceRow({ label, status, note, last }: {
  label: string
  status: 'yes' | 'no' | 'na'
  note?: string
  last?: boolean
}) {
  const chip = {
    yes: { text: 'YES', cls: 'bg-green-500 text-white' },
    no:  { text: 'NO',  cls: 'bg-red-500 text-white' },
    na:  { text: 'N/A', cls: 'bg-white/20 text-white/60' },
  }[status]

  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-white/10'}`}>
      <div>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        {note && <p className="text-white/35 text-xs mt-0.5">{note}</p>}
      </div>
      <span className={`text-xs font-extrabold px-3 py-1 rounded-full tracking-wide ${chip.cls}`}>
        {chip.text}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export function CoachProfilePage() {
  const { profile: viewer, refreshProfile } = useAuth()
  const { id: staffId } = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const fromOnboarding = !!(location.state as { fromOnboarding?: boolean } | null)?.fromOnboarding

  const [subject, setSubject] = useState<Profile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | undefined>()
  const [websitePhotoApproved, setWebsitePhotoApproved] = useState(false)
  const [togglingWebsiteApproval, setTogglingWebsiteApproval] = useState(false)
  const [fields, setFields] = useState({
    phone: '', dbs_number: '',
    dbs_expiry: '',          // stored as "date of issue" now
    safeguarding_expiry: '',
    first_aid_expiry: '',
  })
  const [showFullId, setShowFullId] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<string | null>(null)
  const [leadershipCert, setLeadershipCert] = useState<{ course_title: string; completed_at: string } | null>(null)
  const [apparatusCerts, setApparatusCerts] = useState<{ course_id: string; course_title: string; completed_at: string }[]>([])

  // Whether the current viewer can edit this profile
  const [canEdit, setCanEdit] = useState(false)

  // Certs
  const [certs, setCerts] = useState<CoachCertificate[]>([])
  const [addingCert, setAddingCert] = useState(false)
  const [certForm, setCertForm] = useState({ title: '', issued_date: '', expiry_date: '' })
  const [certFile, setCertFile] = useState<File | null>(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [certError, setCertError] = useState<string | null>(null)

  // Onboarding docs
  const [docs, setDocs] = useState<StaffDocument[]>([])
  const [addingDoc, setAddingDoc] = useState(false)
  const [docForm, setDocForm] = useState({ title: '', category: 'contract' as OnboardingDocCategory, notes: '' })
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<string | null>(null)

  const targetId = staffId ?? viewer?.id
  const isOwnProfile = !staffId || staffId === viewer?.id

  // Resolve edit permission: own profile, director (all), area lead (shared schools)
  useEffect(() => {
    if (!viewer || !targetId) return
    if (isOwnProfile) { setCanEdit(true); return }
    if (viewer.role === 'director') { setCanEdit(true); return }
    if (viewer.role === 'area_lead') {
      supabase.from('staff_school_assignments').select('school_id').eq('staff_id', viewer.id)
        .then(({ data: mySchools }) => {
          if (!mySchools?.length) return
          const myIds = mySchools.map((r: { school_id: string }) => r.school_id)
          supabase.from('staff_school_assignments')
            .select('staff_id').eq('staff_id', targetId).in('school_id', myIds).limit(1)
            .then(({ data }) => setCanEdit((data?.length ?? 0) > 0))
        })
    }
  }, [viewer, targetId, isOwnProfile])

  useEffect(() => {
    if (!targetId) return
    loadSubject(targetId)
    loadCerts(targetId)
    loadDocs(targetId)
    supabase.from('course_certificates')
      .select('course_title, completed_at')
      .eq('user_id', targetId)
      .eq('course_id', 'leadership_v1')
      .maybeSingle()
      .then(({ data }) => setLeadershipCert(data))
    supabase.from('course_certificates')
      .select('course_id, course_title, completed_at')
      .eq('user_id', targetId)
      .in('course_id', ['floor', 'bars', 'beam', 'vault', 'area_lead_v1'])
      .then(({ data }) => setApparatusCerts(data ?? []))
  }, [targetId])

  async function loadSubject(id: string) {
    if (id === viewer?.id && !staffId) {
      applyProfile(viewer)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) applyProfile(data)
  }

  // Download photo via Supabase client and display as a blob URL.
  // This bypasses Content-Security-Policy restrictions on external domains
  // because the resulting blob: URL is treated as same-origin by the browser.
  async function loadPhotoAsBlob(urlOrPath: string) {
    let path = urlOrPath
    if (urlOrPath.startsWith('http')) {
      // Extract the storage path from a full Supabase URL
      // e.g. .../object/public/coach-files/photos/uuid/profile.jpg
      const m = urlOrPath.match(/\/coach-files\/([^?]+)/)
      if (!m) return
      path = m[1]
    }
    const { data } = await supabase.storage.from('coach-files').download(path)
    if (data) setPhotoUrl(URL.createObjectURL(data))
  }

  async function toggleWebsitePhotoApproval() {
    if (!targetId) return
    setTogglingWebsiteApproval(true)
    const newVal = !websitePhotoApproved
    const { error } = await supabase
      .from('profiles')
      .update({ website_photo_approved: newVal } as Record<string, unknown>)
      .eq('id', targetId)
    if (!error) setWebsitePhotoApproved(newVal)
    setTogglingWebsiteApproval(false)
  }

  function applyProfile(p: Profile) {
    setSubject(p)
    setWebsitePhotoApproved(!!(p as Profile & { website_photo_approved?: boolean }).website_photo_approved)
    if (p.photo_url) loadPhotoAsBlob(p.photo_url)
    else setPhotoUrl(undefined)
    setFields({
      phone: p.phone ?? '',
      dbs_number: p.dbs_number ?? '',
      dbs_expiry: p.dbs_expiry ?? '',
      safeguarding_expiry: p.safeguarding_expiry ?? '',
      first_aid_expiry: p.first_aid_expiry ?? '',
    })
  }

  async function loadCerts(id: string) {
    const { data } = await supabase
      .from('coach_certificates').select('*').eq('coach_id', id).order('created_at', { ascending: false })
    if (data) setCerts(data)
  }

  async function loadDocs(id: string) {
    const { data } = await supabase
      .from('staff_documents').select('*').eq('staff_id', id).order('created_at', { ascending: false })
    if (data) setDocs(data as StaffDocument[])
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !targetId) {
      setUploadError('No file selected or profile not loaded.')
      return
    }
    setUploadingPhoto(true)
    setUploadError(null)
    setUploadStep('Uploading photo…')

    // Determine extension — fall back to jpg for HEIC/unknown types from iPhone
    const mime = file.type || 'image/jpeg'
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
    const path = `photos/${targetId}/profile.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('coach-files')
      .upload(path, file, { upsert: true, contentType: mime })

    if (storageErr) {
      const msg = storageErr.message
      if (msg.includes('Bucket not found') || msg.includes('not found')) {
        setUploadError('Storage bucket missing. Run supabase/fix_photo_upload.sql in the Supabase SQL Editor.')
      } else if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('Unauthorized') || msg.includes('403')) {
        setUploadError('Permission denied — run supabase/fix_photo_upload.sql in the Supabase SQL Editor to set up storage policies.')
      } else {
        setUploadError(`Upload failed: ${msg}`)
      }
      setUploadStep(null)
      setUploadingPhoto(false)
      return
    }

    // Store just the path in DB (blob URL used only for display)
    setUploadStep('Saving…')
    const { error: dbErr } = await supabase.from('profiles').update({ photo_url: path }).eq('id', targetId)
    if (dbErr) {
      setUploadError(`Could not save photo: ${dbErr.message}`)
      setUploadStep(null)
      setUploadingPhoto(false)
      return
    }

    // Show as blob URL — bypasses any CSP restrictions on external domains
    setPhotoUrl(URL.createObjectURL(file))
    if (isOwnProfile && refreshProfile) await refreshProfile()
    setUploadStep(null)
    setUploadingPhoto(false)
  }

  async function clearPhoto() {
    if (!targetId) return
    await supabase.from('profiles').update({ photo_url: null }).eq('id', targetId)
    setPhotoUrl(undefined)
    if (isOwnProfile && refreshProfile) await refreshProfile()
  }

  async function saveProfile() {
    if (!targetId) return
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase.from('profiles').update({
      phone: fields.phone || null,
      dbs_number: fields.dbs_number || null,
      dbs_expiry: fields.dbs_expiry || null,
      safeguarding_expiry: fields.safeguarding_expiry || null,
      first_aid_expiry: fields.first_aid_expiry || null,
    }).eq('id', targetId)
    if (error) { setSaveError(error.message); setSaving(false); return }
    if (isOwnProfile && refreshProfile) await refreshProfile()
    if (subject) setSubject({ ...subject, ...fields })
    setSaving(false)
  }

  async function addCert() {
    if (!targetId || !certForm.title.trim()) return
    setUploadingCert(true)
    setCertError(null)
    let filePath: string | null = null
    if (certFile) {
      const ext = certFile.name.split('.').pop()
      filePath = `certs/${targetId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('coach-files').upload(filePath, certFile)
      if (error) {
        setCertError(`File upload failed: ${error.message}`)
        setUploadingCert(false)
        return
      }
    }
    const { data, error } = await supabase.from('coach_certificates').insert({
      coach_id: targetId,
      title: certForm.title.trim(),
      file_path: filePath,
      issued_date: certForm.issued_date || null,
      expiry_date: certForm.expiry_date || null,
    }).select().single()
    if (error) { setCertError(error.message); setUploadingCert(false); return }
    if (data) setCerts(prev => [data, ...prev])
    setCertForm({ title: '', issued_date: '', expiry_date: '' })
    setCertFile(null)
    setAddingCert(false)
    setUploadingCert(false)
  }

  async function deleteCert(id: string) {
    const cert = certs.find(c => c.id === id)
    if (!cert) return
    if (cert.file_path) await supabase.storage.from('coach-files').remove([cert.file_path])
    await supabase.from('coach_certificates').delete().eq('id', id)
    setCerts(prev => prev.filter(c => c.id !== id))
  }

  async function downloadCert(cert: CoachCertificate) {
    if (!cert.file_path) return
    const { data } = await supabase.storage.from('coach-files').createSignedUrl(cert.file_path, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function uploadDoc() {
    if (!targetId || !docForm.title.trim() || !docFile || !viewer) return
    setUploadingDoc(true)
    setDocError(null)
    const ext = docFile.name.split('.').pop()
    const filePath = `onboarding/${targetId}/${Date.now()}.${ext}`
    const { error: storageErr } = await supabase.storage.from('coach-files').upload(filePath, docFile)
    if (storageErr) {
      setDocError(`Upload failed: ${storageErr.message}`)
      setUploadingDoc(false)
      return
    }
    const { data, error: dbErr } = await supabase.from('staff_documents').insert({
      staff_id: targetId,
      title: docForm.title.trim(),
      category: docForm.category,
      file_path: filePath,
      file_name: docFile.name,
      uploaded_by: viewer.id,
      notes: docForm.notes.trim() || null,
    }).select().single()
    if (dbErr) {
      setDocError(`Save failed: ${dbErr.message}`)
      // Clean up orphaned file
      await supabase.storage.from('coach-files').remove([filePath])
      setUploadingDoc(false)
      return
    }
    if (data) setDocs(prev => [data as StaffDocument, ...prev])
    setDocForm({ title: '', category: 'contract', notes: '' })
    setDocFile(null)
    setAddingDoc(false)
    setUploadingDoc(false)
  }

  async function viewDoc(doc: StaffDocument) {
    const { data } = await supabase.storage.from('coach-files').createSignedUrl(doc.file_path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function deleteDoc(doc: StaffDocument) {
    await supabase.storage.from('coach-files').remove([doc.file_path])
    const { error } = await supabase.from('staff_documents').delete().eq('id', doc.id)
    if (!error) setDocs(prev => prev.filter(d => d.id !== doc.id))
    setConfirmDeleteDocId(null)
  }

  if (!subject) return (
    <Layout title="Profile" showBack>
      <p className="text-center text-gray-400 py-12">Loading…</p>
    </Layout>
  )

  const initials = subject.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const COACHING_ROLES = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach']
  const needsFirstAid = COACHING_ROLES.includes(subject.role)

  function issuedWithin3Years(dateStr: string | null | undefined) {
    if (!dateStr) return false
    const issued = new Date(dateStr)
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 3)
    return issued >= cutoff
  }

  const dbsValid         = !!fields.dbs_number
  const dbsCurrent       = issuedWithin3Years(fields.dbs_expiry)
  const safeguardCurrent = issuedWithin3Years(fields.safeguarding_expiry)
  const firstAidCurrent  = issuedWithin3Years(fields.first_aid_expiry)

  return (
    <Layout title={isOwnProfile ? 'My Profile' : subject.full_name} showBack>

      {fromOnboarding && (
        <div className="px-4 pt-3 pb-0 max-w-lg mx-auto w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1a3a6b]"
          >
            <ArrowLeft size={14} />
            Back to onboarding task
          </button>
        </div>
      )}

      {/* ── Full-screen ID overlay ── */}
      {showFullId && (
        <div className="fixed inset-0 z-50 bg-[#0d2247] flex flex-col" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-safe-top pt-6 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#f5c518] rounded-xl flex items-center justify-center">
                <span className="text-[#1a3a6b] font-black text-[11px] leading-none">ASO</span>
              </div>
              <span className="text-white/60 text-xs font-semibold tracking-wide uppercase">Digital Staff ID</span>
            </div>
            <button
              onClick={() => setShowFullId(false)}
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Photo */}
          <div className="flex flex-col items-center px-6 pt-4 pb-5 shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-white/10 border-4 border-white/20 overflow-hidden flex items-center justify-center mb-4">
              {photoUrl
                ? <img src={photoUrl} alt={subject.full_name} className="w-full h-full object-cover" />
                : <span className="text-white font-black text-4xl">{initials}</span>
              }
            </div>
            <h1 className="text-white font-extrabold text-2xl leading-tight text-center">{subject.full_name}</h1>
            <p className="text-[#f5c518] font-semibold text-sm mt-1">{ROLE_LABELS[subject.role]}</p>
            {subject.area && <p className="text-white/50 text-xs mt-0.5">{subject.area}</p>}
            <p className="text-white/30 font-mono text-xs mt-2 tracking-widest">
              ID · {subject.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Compliance cards */}
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

              {/* DBS Number */}
              <div className="px-4 py-3.5 border-b border-white/10">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">DBS Certificate Number</p>
                <p className={`font-mono font-bold text-base ${fields.dbs_number ? 'text-white' : 'text-white/25 italic'}`}>
                  {fields.dbs_number || 'Not recorded'}
                </p>
              </div>

              {/* Enhanced DBS */}
              <ComplianceRow label="Enhanced DBS Checked" status={dbsValid ? 'yes' : 'no'} />

              {/* DBS up to date */}
              <ComplianceRow label="DBS Up to Date" status={dbsCurrent ? 'yes' : (fields.dbs_expiry ? 'no' : 'no')} note={fields.dbs_expiry ? `Issued ${formatDate(fields.dbs_expiry)}` : undefined} />

              {/* Safeguarding */}
              <ComplianceRow label="Safeguarding Certificate" status={safeguardCurrent ? 'yes' : (fields.safeguarding_expiry ? 'no' : 'no')} note={fields.safeguarding_expiry ? `Issued ${formatDate(fields.safeguarding_expiry)}` : undefined} />

              {/* First Aid */}
              <ComplianceRow
                label="First Aid Certificate"
                status={needsFirstAid ? (firstAidCurrent ? 'yes' : 'no') : 'na'}
                note={needsFirstAid && fields.first_aid_expiry ? `Issued ${formatDate(fields.first_aid_expiry)}` : undefined}
                last
              />
            </div>

            {/* Footer */}
            <div className="mt-5 flex flex-col items-center gap-1">
              <p className="text-white/30 text-[10px] text-center">
                Active School Organisation Ltd · Verified {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-white/20 text-[10px] text-center">
                This digital ID is for verification purposes only
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-6 flex flex-col gap-5 pb-8">

        <CoachIdCard
          fullName={subject.full_name}
          role={ROLE_LABELS[subject.role]}
          area={subject.area}
          profileId={subject.id}
          photoUrl={photoUrl}
          dbsNumber={fields.dbs_number}
          dbsIssued={fields.dbs_expiry}
          safeguardingIssued={fields.safeguarding_expiry}
          firstAidIssued={fields.first_aid_expiry}
        />

        {/* Show full ID button */}
        <button
          onClick={() => setShowFullId(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white font-bold py-3.5 rounded-2xl text-sm active:opacity-80"
        >
          <IdCard size={18} />
          Show Full ID Card
        </button>

        {/* Leadership course certificate */}
        {leadershipCert && (
          <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] rounded-2xl p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#f5c518] mb-1">Certificate of Completion</p>
                <p className="font-extrabold text-sm leading-tight">ASO Lead Coach Leadership Programme</p>
                <p className="text-white/70 text-xs mt-1">
                  {subject?.full_name}
                </p>
                <p className="text-white/50 text-xs mt-2">
                  Awarded {new Date(leadershipCert.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-3xl shrink-0">🏅</div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
              <p className="text-[10px] text-white/50 font-semibold">Active Schools Organisation</p>
              <p className="text-[10px] text-white/50">Verified ✓</p>
            </div>
          </div>
        )}

        {/* Apparatus CPD certificates */}
        {apparatusCerts.length > 0 && (() => {
          const APPARATUS_META: Record<string, { emoji: string; label: string; gradient: string }> = {
            floor:         { emoji: '🤸', label: 'Floor Coaching CPD',        gradient: 'from-rose-600 to-pink-700' },
            bars:          { emoji: '🏋️', label: 'Bars Coaching CPD',         gradient: 'from-blue-700 to-indigo-700' },
            beam:          { emoji: '⚖️', label: 'Beam Coaching CPD',         gradient: 'from-amber-500 to-orange-600' },
            vault:         { emoji: '🏃', label: 'Vault Coaching CPD',        gradient: 'from-green-600 to-teal-700' },
            area_lead_v1:  { emoji: '🗺️', label: 'UKAG Area Lead Award',      gradient: 'from-violet-700 to-purple-900' },
          }
          return (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Apparatus CPD</p>
              <div className="grid grid-cols-2 gap-2">
                {apparatusCerts.map(cert => {
                  const meta = APPARATUS_META[cert.course_id] ?? { emoji: '📋', label: cert.course_title, gradient: 'from-gray-600 to-gray-700' }
                  return (
                    <div key={cert.course_id} className={`bg-gradient-to-br ${meta.gradient} rounded-2xl p-3 text-white`}>
                      <div className="text-2xl mb-1">{meta.emoji}</div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-0.5">Certificate</p>
                      <p className="font-bold text-xs leading-tight">{meta.label}</p>
                      <p className="text-white/50 text-[10px] mt-1">
                        {new Date(cert.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Photo */}
        {canEdit && (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a6b] overflow-hidden flex items-center justify-center shrink-0 relative">
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => {/* keep broken state visible */}}
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      title="Remove broken photo"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </>
                ) : (
                  <span className="text-white font-bold text-lg">{initials}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
                <p className="text-xs text-gray-400">Any image from camera roll</p>
              </div>
            </div>
            {uploadStep && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                <p className="text-sm text-blue-700">{uploadStep}</p>
              </div>
            )}
            {uploadError && (
              <div className="mt-3 bg-red-100 border-2 border-red-400 rounded-xl px-3 py-3">
                <p className="text-sm text-red-800 font-bold mb-1">Upload failed</p>
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}
            {/* Director-only: approve this photo for use on the public website */}
            {viewer?.role === 'director' && !isOwnProfile && subject?.photo_url && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={toggleWebsitePhotoApproval}
                  disabled={togglingWebsiteApproval}
                  className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                    websitePhotoApproved
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {websitePhotoApproved ? (
                    <><CheckCircle2 size={15} /> Approved for website</>
                  ) : (
                    <><User size={15} /> Approve for website</>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">
                  {websitePhotoApproved
                    ? 'This photo appears in the ASO in Action gallery on the home page.'
                    : 'Only approve photos where the coach is wearing an Active School top.'}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* DBS / Compliance — editable by self + directors */}
        {canEdit && (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-4">DBS &amp; Compliance</p>
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{saveError}</p>
            )}
            <div className="flex flex-col gap-3">
              <Input label="Phone Number" placeholder="e.g. 07700 900123"
                value={fields.phone} onChange={e => setFields({ ...fields, phone: e.target.value })} />
              <Input label="DBS Certificate Number" placeholder="e.g. 001234567890"
                value={fields.dbs_number} onChange={e => setFields({ ...fields, dbs_number: e.target.value })} />
              <Input label="DBS Date of Issue" type="date"
                value={fields.dbs_expiry} onChange={e => setFields({ ...fields, dbs_expiry: e.target.value })} />
              <Input label="Safeguarding Certificate Date of Issue" type="date"
                value={fields.safeguarding_expiry} onChange={e => setFields({ ...fields, safeguarding_expiry: e.target.value })} />
              <Input label="First Aid Certificate Date of Issue" type="date"
                value={fields.first_aid_expiry} onChange={e => setFields({ ...fields, first_aid_expiry: e.target.value })} />
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </Card>
        )}

        {/* Personal Details — staff fills in own; area leads + directors can view */}
        {(isOwnProfile || viewer?.role === 'director' || viewer?.role === 'area_lead') && targetId && (
          <PersonalDetailsSection
            staffId={targetId}
            canEdit={isOwnProfile || viewer?.role === 'director'}
          />
        )}

        {/* Employment Details — directors fill in; staff + area leads can view (no admin notes) */}
        {(isOwnProfile || viewer?.role === 'director' || viewer?.role === 'area_lead') && targetId && (
          <EmploymentSection
            staffId={targetId}
            isDirector={viewer?.role === 'director'}
            viewerId={viewer?.id ?? ''}
          />
        )}

        {/* Contract — staff see own; directors see all */}
        {(isOwnProfile || viewer?.role === 'director') && targetId && subject && (
          <ContractSection
            staffId={targetId}
            staffRole={subject.role}
            isDirector={viewer?.role === 'director'}
          />
        )}

        {/* Certificates */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#1a3a6b]">Certificates &amp; Qualifications</p>
            {canEdit && (
              <button
                onClick={() => setAddingCert(!addingCert)}
                className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Add
              </button>
            )}
          </div>

          {addingCert && (
            <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-100">
              {certError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{certError}</p>
              )}
              <Input label="Certificate Title *" placeholder="e.g. UKAG Gymnastics L2"
                value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} />
              <Input label="Date of Issue (optional)" type="date"
                value={certForm.issued_date} onChange={e => setCertForm({ ...certForm, issued_date: e.target.value })} />
              <Input label="Expiry Date (optional)" type="date"
                value={certForm.expiry_date} onChange={e => setCertForm({ ...certForm, expiry_date: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Upload Certificate (optional)</label>
                <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-[#1a3a6b] transition-colors cursor-pointer">
                  <input type="file" className="hidden"
                    onChange={e => setCertFile(e.target.files?.[0] ?? null)} />
                  <FileText size={16} />
                  <span className="text-sm">{certFile ? certFile.name : 'Tap to attach file…'}</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1"
                  onClick={() => { setAddingCert(false); setCertForm({ title: '', issued_date: '', expiry_date: '' }); setCertFile(null); setCertError(null) }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addCert} disabled={uploadingCert || !certForm.title.trim()}>
                  {uploadingCert ? 'Saving…' : 'Add'}
                </Button>
              </div>
            </div>
          )}

          {certs.length === 0 && !addingCert
            ? <p className="text-sm text-gray-400 text-center py-2">No certificates added yet.</p>
            : certs.map(cert => (
                <CertRow key={cert.id} cert={cert} canEdit={canEdit} onDelete={deleteCert} onDownload={downloadCert} />
              ))
          }
        </Card>

        {/* Onboarding Documents */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-[#1a3a6b]" />
              <p className="text-sm font-bold text-[#1a3a6b]">Onboarding Documents</p>
            </div>
            {canEdit && (
              <button
                onClick={() => setAddingDoc(v => !v)}
                className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Upload
              </button>
            )}
          </div>

          {addingDoc && (
            <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-100">
              {docError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{docError}</p>
              )}
              <Input label="Document Title *" placeholder="e.g. Employment Contract May 2026"
                value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} />
              <Select label="Category" value={docForm.category}
                onChange={e => setDocForm({ ...docForm, category: e.target.value as OnboardingDocCategory })}>
                {DOC_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
              <Input label="Notes (optional)" placeholder="e.g. Signed and returned"
                value={docForm.notes} onChange={e => setDocForm({ ...docForm, notes: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">File *</label>
                <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-[#1a3a6b] transition-colors cursor-pointer">
                  <input type="file" className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
                  <FileText size={16} />
                  <span className="text-sm truncate">{docFile ? docFile.name : 'Tap to select file (PDF, Word, image)…'}</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1"
                  onClick={() => { setAddingDoc(false); setDocForm({ title: '', category: 'contract', notes: '' }); setDocFile(null); setDocError(null) }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={uploadDoc}
                  disabled={uploadingDoc || !docForm.title.trim() || !docFile}>
                  {uploadingDoc ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>
          )}

          {docs.length === 0 && !addingDoc ? (
            <p className="text-sm text-gray-400 text-center py-2">No onboarding documents yet.</p>
          ) : (
            docs.map(doc => (
              <div key={doc.id}>
                {confirmDeleteDocId === doc.id ? (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <p className="text-sm text-red-600 font-medium truncate flex-1 mr-2">Delete "{doc.title}"?</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setConfirmDeleteDocId(null)}
                        className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg">Cancel</button>
                      <button onClick={() => deleteDoc(doc)}
                        className="text-xs text-white bg-red-500 px-3 py-1.5 rounded-lg font-semibold">Delete</button>
                    </div>
                  </div>
                ) : (
                  <DocRow doc={doc} canDelete={canEdit} onView={viewDoc} onDelete={d => setConfirmDeleteDocId(d.id)} />
                )}
              </div>
            ))
          )}
        </Card>

      </div>
    </Layout>
  )
}

// ─── Personal Details Section ─────────────────────────────────────────────────

const EMPTY_PERSONAL = {
  date_of_birth: '',
  address_line1: '', address_line2: '', address_city: '', address_postcode: '',
  ni_number: '',
  bank_account_name: '', bank_name: '', bank_sort_code: '', bank_account_number: '',
  ec1_name: '', ec1_relationship: '', ec1_phone: '',
  ec2_name: '', ec2_relationship: '', ec2_phone: '',
  additional_needs: '',
}

function PersonalDetailsSection({ staffId, canEdit }: { staffId: string; canEdit: boolean }) {
  const [fields, setFields] = useState(EMPTY_PERSONAL)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('staff_personal').select('*').eq('staff_id', staffId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFields({
            date_of_birth: data.date_of_birth ?? '',
            address_line1: data.address_line1 ?? '',
            address_line2: data.address_line2 ?? '',
            address_city: data.address_city ?? '',
            address_postcode: data.address_postcode ?? '',
            ni_number: data.ni_number ?? '',
            bank_account_name: data.bank_account_name ?? '',
            bank_name: data.bank_name ?? '',
            bank_sort_code: data.bank_sort_code ?? '',
            bank_account_number: data.bank_account_number ?? '',
            ec1_name: data.ec1_name ?? '',
            ec1_relationship: data.ec1_relationship ?? '',
            ec1_phone: data.ec1_phone ?? '',
            ec2_name: data.ec2_name ?? '',
            ec2_relationship: data.ec2_relationship ?? '',
            ec2_phone: data.ec2_phone ?? '',
            additional_needs: data.additional_needs ?? '',
          })
        }
        setLoaded(true)
      })
  }, [staffId])

  function set(key: keyof typeof EMPTY_PERSONAL, value: string) {
    setFields(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function save() {
    setSaving(true); setError(null)
    const payload: Partial<StaffPersonal> = {
      staff_id: staffId,
      date_of_birth: fields.date_of_birth || null,
      address_line1: fields.address_line1 || null,
      address_line2: fields.address_line2 || null,
      address_city: fields.address_city || null,
      address_postcode: fields.address_postcode || null,
      ni_number: fields.ni_number || null,
      bank_account_name: fields.bank_account_name || null,
      bank_name: fields.bank_name || null,
      bank_sort_code: fields.bank_sort_code || null,
      bank_account_number: fields.bank_account_number || null,
      ec1_name: fields.ec1_name || null,
      ec1_relationship: fields.ec1_relationship || null,
      ec1_phone: fields.ec1_phone || null,
      ec2_name: fields.ec2_name || null,
      ec2_relationship: fields.ec2_relationship || null,
      ec2_phone: fields.ec2_phone || null,
      additional_needs: fields.additional_needs || null,
      updated_at: new Date().toISOString(),
    }
    const { error: err } = await supabase.from('staff_personal').upsert(payload, { onConflict: 'staff_id' })
    if (err) setError(err.message)
    else setSaved(true)
    setSaving(false)
  }

  if (!loaded) return null

  return (
    <div>
      <div className="flex items-center gap-2 bg-[#1a3a6b] text-white px-4 py-3 rounded-t-2xl">
        <User size={15} />
        <p className="text-sm font-bold tracking-wide">Personal Details</p>
        <span className="ml-auto text-xs text-white/60">Private — you &amp; directors only</span>
      </div>
      <div className="bg-blue-50 border border-blue-200 border-t-0 rounded-b-2xl px-4 pt-4 pb-5 flex flex-col gap-5">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        {/* Personal */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Personal</p>
          <Input label="Date of Birth" type="date" value={fields.date_of_birth}
            onChange={e => set('date_of_birth', e.target.value)} disabled={!canEdit} />
          <Input label="Address Line 1" placeholder="e.g. 12 High Street"
            value={fields.address_line1} onChange={e => set('address_line1', e.target.value)} disabled={!canEdit} />
          <Input label="Address Line 2 (optional)" placeholder="e.g. Flat 3"
            value={fields.address_line2} onChange={e => set('address_line2', e.target.value)} disabled={!canEdit} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="City / Town" placeholder="e.g. Southampton"
              value={fields.address_city} onChange={e => set('address_city', e.target.value)} disabled={!canEdit} />
            <Input label="Postcode" placeholder="e.g. SO14 1AA"
              value={fields.address_postcode} onChange={e => set('address_postcode', e.target.value)} disabled={!canEdit} />
          </div>
        </div>

        {/* Financial */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Financial</p>
          <Input label="NI Number" placeholder="e.g. AB 12 34 56 C"
            value={fields.ni_number} onChange={e => set('ni_number', e.target.value)} disabled={!canEdit} />
          <Input label="Bank Account Holder Name"
            value={fields.bank_account_name} onChange={e => set('bank_account_name', e.target.value)} disabled={!canEdit} />
          <Input label="Bank Name" placeholder="e.g. Barclays"
            value={fields.bank_name} onChange={e => set('bank_name', e.target.value)} disabled={!canEdit} />
          <Input label="Sort Code" placeholder="e.g. 12-34-56"
            value={fields.bank_sort_code} onChange={e => set('bank_sort_code', e.target.value)} disabled={!canEdit} />
          <Input label="Account Number" placeholder="e.g. 12345678"
            value={fields.bank_account_number} onChange={e => set('bank_account_number', e.target.value)} disabled={!canEdit} />
        </div>

        {/* Emergency contacts */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Emergency Contact 1</p>
          <Input label="Full Name" value={fields.ec1_name}
            onChange={e => set('ec1_name', e.target.value)} disabled={!canEdit} />
          <Input label="Relationship" placeholder="e.g. Spouse, Parent"
            value={fields.ec1_relationship} onChange={e => set('ec1_relationship', e.target.value)} disabled={!canEdit} />
          <Input label="Phone Number" type="tel" value={fields.ec1_phone}
            onChange={e => set('ec1_phone', e.target.value)} disabled={!canEdit} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Emergency Contact 2</p>
          <Input label="Full Name" value={fields.ec2_name}
            onChange={e => set('ec2_name', e.target.value)} disabled={!canEdit} />
          <Input label="Relationship" placeholder="e.g. Sibling, Friend"
            value={fields.ec2_relationship} onChange={e => set('ec2_relationship', e.target.value)} disabled={!canEdit} />
          <Input label="Phone Number" type="tel" value={fields.ec2_phone}
            onChange={e => set('ec2_phone', e.target.value)} disabled={!canEdit} />
        </div>

        {/* Additional needs */}
        <div>
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide mb-2">Additional Needs</p>
          <textarea
            rows={3}
            placeholder="Any medical conditions, accessibility needs, or other info we should know…"
            value={fields.additional_needs}
            onChange={e => { set('additional_needs', e.target.value) }}
            disabled={!canEdit}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none disabled:opacity-60"
          />
        </div>

        {canEdit && (
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Personal Details'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Employment Section ───────────────────────────────────────────────────────

const EMPTY_EMPLOYMENT = {
  contract_type: '' as ContractType | '',
  contract_start_date: '', contract_end_date: '',
  pay_rate: '', pay_frequency: '' as PayFrequency | '',
  utr_number: '', tax_code: '', admin_notes: '',
}

function EmploymentSection({ staffId, isDirector, viewerId }: { staffId: string; isDirector: boolean; viewerId: string }) {
  const [fields, setFields] = useState(EMPTY_EMPLOYMENT)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('staff_employment').select('*').eq('staff_id', staffId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFields({
            contract_type: (data.contract_type as ContractType) ?? '',
            contract_start_date: data.contract_start_date ?? '',
            contract_end_date: data.contract_end_date ?? '',
            pay_rate: data.pay_rate != null ? String(data.pay_rate) : '',
            pay_frequency: (data.pay_frequency as PayFrequency) ?? '',
            utr_number: data.utr_number ?? '',
            tax_code: data.tax_code ?? '',
            admin_notes: data.admin_notes ?? '',
          })
        }
        setLoaded(true)
      })
  }, [staffId])

  function set(key: keyof typeof EMPTY_EMPLOYMENT, value: string) {
    setFields(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function save() {
    setSaving(true); setError(null)
    const payload: Partial<StaffEmployment> = {
      staff_id: staffId,
      contract_type: (fields.contract_type as ContractType) || null,
      contract_start_date: fields.contract_start_date || null,
      contract_end_date: fields.contract_end_date || null,
      pay_rate: fields.pay_rate ? parseFloat(fields.pay_rate) : null,
      pay_frequency: (fields.pay_frequency as PayFrequency) || null,
      utr_number: fields.utr_number || null,
      tax_code: fields.tax_code || null,
      admin_notes: fields.admin_notes || null,
      updated_by: viewerId,
      updated_at: new Date().toISOString(),
    }
    const { error: err } = await supabase.from('staff_employment').upsert(payload, { onConflict: 'staff_id' })
    if (err) setError(err.message)
    else setSaved(true)
    setSaving(false)
  }

  if (!loaded) return null

  const CONTRACT_LABELS: Record<string, string> = {
    employee: 'Employee', self_employed: 'Self-Employed',
    zero_hours: 'Zero Hours', casual: 'Casual',
  }
  const PAY_LABELS: Record<string, string> = {
    hourly: 'Hourly', per_session: 'Per Session',
    weekly: 'Weekly', monthly: 'Monthly',
  }

  return (
    <div>
      <div className="flex items-center gap-2 bg-red-700 text-white px-4 py-3 rounded-t-2xl">
        <Lock size={15} />
        <p className="text-sm font-bold tracking-wide">Employment Details</p>
        {!isDirector && <span className="ml-auto text-xs text-white/60">Set by Director</span>}
      </div>
      <div className="bg-red-50 border border-red-200 border-t-0 rounded-b-2xl px-4 pt-4 pb-5 flex flex-col gap-4">
        {error && <p className="text-sm text-red-600 bg-red-100 rounded-xl px-3 py-2">{error}</p>}

        {isDirector ? (
          <>
            <div className="flex flex-col gap-2">
              <Select label="Contract Type" value={fields.contract_type} onChange={e => set('contract_type', e.target.value)}>
                <option value="">— Select —</option>
                <option value="employee">Employee</option>
                <option value="self_employed">Self-Employed</option>
                <option value="zero_hours">Zero Hours</option>
                <option value="casual">Casual</option>
              </Select>
              <Input label="Contract Start Date" type="date" value={fields.contract_start_date}
                onChange={e => set('contract_start_date', e.target.value)} />
              <Input label="Contract End Date (if applicable)" type="date" value={fields.contract_end_date}
                onChange={e => set('contract_end_date', e.target.value)} />
              <Input label="Pay Rate (£)" type="number" placeholder="e.g. 12.50" value={fields.pay_rate}
                onChange={e => set('pay_rate', e.target.value)} />
              <Select label="Pay Frequency" value={fields.pay_frequency} onChange={e => set('pay_frequency', e.target.value)}>
                <option value="">— Select —</option>
                <option value="hourly">Hourly</option>
                <option value="per_session">Per Session</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
              <Input label="UTR Number (Self-Employed)" placeholder="10-digit UTR" value={fields.utr_number}
                onChange={e => set('utr_number', e.target.value)} />
              <Input label="Tax Code" placeholder="e.g. 1257L" value={fields.tax_code}
                onChange={e => set('tax_code', e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Admin Notes (director only)</p>
              <textarea rows={3} placeholder="Internal notes…"
                value={fields.admin_notes} onChange={e => set('admin_notes', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Employment Details'}
            </Button>
          </>
        ) : (
          // Staff view — read-only
          <div className="flex flex-col gap-2">
            {fields.contract_type
              ? <Row label="Contract Type" value={CONTRACT_LABELS[fields.contract_type] ?? fields.contract_type} />
              : <p className="text-sm text-gray-400">Employment details not yet completed.</p>
            }
            {fields.contract_start_date && <Row label="Start Date" value={formatDate(fields.contract_start_date)} />}
            {fields.contract_end_date && <Row label="End Date" value={formatDate(fields.contract_end_date)} />}
            {fields.pay_rate && <Row label="Pay Rate" value={`£${parseFloat(fields.pay_rate).toFixed(2)} ${PAY_LABELS[fields.pay_frequency] ?? fields.pay_frequency}`} />}
            {fields.tax_code && <Row label="Tax Code" value={fields.tax_code} />}
            {fields.utr_number && <Row label="UTR Number" value={fields.utr_number} />}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-[#1a3a6b]">{value}</span>
    </div>
  )
}

// ─── Contract Section ─────────────────────────────────────────────────────────

const CONTRACT_ROLES = ['junior_coach', 'assistant_coach', 'lead_coach', 'area_lead']

interface ContractItem { type: 'text' | 'bullet'; text: string }
interface ContractSectionData { heading: string; items: ContractItem[] }
interface StaffContract {
  id: string
  role: string
  title: string
  version: string
  content: ContractSectionData[] | null
}

function ContractAccordionSection({ section, index }: { section: ContractSectionData; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-emerald-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
      >
        <span className="text-sm font-semibold text-[#1a5c3a] pr-2">{section.heading}</span>
        <ChevronDown size={16} className={`text-emerald-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && section.items.length > 0 && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-emerald-100 flex flex-col gap-1.5">
          {section.items.map((item, i) => (
            item.type === 'bullet'
              ? <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1 shrink-0">•</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              : <p key={i} className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
          ))}
        </div>
      )}
      {open && section.items.length === 0 && (
        <div className="px-4 pb-3 pt-1 bg-white border-t border-emerald-100">
          <p className="text-sm text-gray-400 italic">No details in this section.</p>
        </div>
      )}
    </div>
  )
}

function ContractSection({ staffId, staffRole, isDirector }: {
  staffId: string
  staffRole: string
  isDirector: boolean
}) {
  const navigate = useNavigate()
  const [contract, setContract] = useState<StaffContract | null>(null)
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [signedVersion, setSignedVersion] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)
  const [showContract, setShowContract] = useState(false)

  useEffect(() => {
    if (!CONTRACT_ROLES.includes(staffRole)) { setLoaded(true); return }
    Promise.all([
      supabase.from('staff_contracts').select('id,role,title,version,content').eq('role', staffRole).eq('is_active', true).maybeSingle(),
      supabase.from('profiles').select('contract_signed_at,contract_version').eq('id', staffId).maybeSingle(),
    ]).then(([{ data: c }, { data: p }]) => {
      if (c) setContract(c as StaffContract)
      if (p) {
        setSignedAt((p as any).contract_signed_at ?? null)
        setSignedVersion((p as any).contract_version ?? null)
      }
      setLoaded(true)
    })
  }, [staffId, staffRole])

  async function sign() {
    if (!contract || !agreed) return
    setSigning(true); setSignError(null)
    const now = new Date().toISOString()
    const { error } = await supabase.from('profiles').update({
      contract_signed_at: now,
      contract_version: contract.version,
    }).eq('id', staffId)
    if (error) { setSignError(error.message); setSigning(false); return }

    // If this staff member is in active onboarding, signing their contract completes it
    const { data: profStatus } = await supabase
      .from('profiles')
      .select('onboarding_required')
      .eq('id', staffId)
      .single()

    if (profStatus?.onboarding_required) {
      await supabase.from('profiles').update({
        onboarding_required: false,
        onboarding_status: 'active',
      }).eq('id', staffId)
      navigate('/dashboard')
      return
    }

    setSignedAt(now)
    setSignedVersion(contract.version)
    setSigning(false)
  }

  if (!loaded) return null
  if (!CONTRACT_ROLES.includes(staffRole)) return null

  const versionMismatch = !!(signedAt && signedVersion && contract && signedVersion !== contract.version)
  const needsSign = !signedAt || versionMismatch

  return (
    <div>
      <div className="flex items-center gap-2 bg-[#1a5c3a] text-white px-4 py-3 rounded-t-2xl">
        <ScrollText size={15} />
        <p className="text-sm font-bold tracking-wide">Employment Contract</p>
        <span className="ml-auto text-xs text-white/60 flex items-center gap-1">
          <Lock size={11} /> Private &amp; Confidential
        </span>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 border-t-0 rounded-b-2xl px-4 pt-4 pb-5 flex flex-col gap-4">

        {/* Signing status banner */}
        {signedAt && !versionMismatch ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Contract acknowledged</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {signedVersion && ` · ${signedVersion}`}
              </p>
            </div>
            <button
              onClick={() => setShowContract(v => !v)}
              className="text-xs font-semibold text-[#1a5c3a] bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0"
            >
              {showContract ? 'Hide' : 'View'}
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <ScrollText size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              {isDirector
                ? 'This staff member has not yet acknowledged their contract.'
                : versionMismatch
                  ? 'A new version of your contract is available. Please read and re-acknowledge below.'
                  : 'Please read each section of your contract below, then sign and agree.'}
            </p>
          </div>
        )}

        {/* Contract title row */}
        {contract && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">{contract.title}</p>
              <p className="text-xs text-gray-400">Version {contract.version}</p>
            </div>
            {(!signedAt || versionMismatch || !showContract) && contract.content && (
              <button
                onClick={() => setShowContract(v => !v)}
                className="text-xs font-semibold text-[#1a5c3a] bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0"
              >
                {showContract ? 'Collapse' : 'Read contract'}
              </button>
            )}
          </div>
        )}

        {/* Accordion sections */}
        {showContract && contract?.content && (
          <div className="flex flex-col gap-2">
            {contract.content.map((section, i) => (
              <ContractAccordionSection key={i} section={section} index={i} />
            ))}
          </div>
        )}

        {/* No content yet */}
        {showContract && contract && !contract.content && (
          <p className="text-sm text-gray-400 text-center py-2">Contract content not yet loaded. Run the staff_contracts_content.sql migration.</p>
        )}

        {/* Sign & agree — staff only, when not yet signed or version mismatch */}
        {!isDirector && contract && needsSign && (
          <div className="flex flex-col gap-3 border-t border-emerald-200 pt-4">
            <label className="flex items-start gap-3 cursor-pointer bg-[#1a5c3a]/5 border border-[#1a5c3a]/20 rounded-2xl p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-[#1a5c3a] shrink-0 cursor-pointer"
              />
              <span className="text-sm font-semibold text-[#1a5c3a] leading-snug">
                I have read and understood my contract ({contract.title}, {contract.version}) and agree to all terms.
              </span>
            </label>
            {signError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{signError}</p>}
            <button
              onClick={sign}
              disabled={!agreed || signing}
              className="flex items-center justify-center gap-2 bg-[#1a5c3a] text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              {signing ? 'Saving…' : 'Sign & Agree'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

