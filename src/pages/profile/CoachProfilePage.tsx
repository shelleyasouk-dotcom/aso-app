import { useState, useEffect } from 'react'
import { Camera, Plus, Trash2, FileText, FolderOpen, Eye, Download } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { ROLE_LABELS } from '../../lib/roles'
import type { Profile, CoachCertificate, StaffDocument, OnboardingDocCategory } from '../../types'

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

// ─── Main page ────────────────────────────────────────────────────────────

export function CoachProfilePage() {
  const { profile: viewer, refreshProfile } = useAuth()
  const { id: staffId } = useParams<{ id?: string }>()

  const [subject, setSubject] = useState<Profile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | undefined>()
  const [fields, setFields] = useState({
    phone: '', dbs_number: '',
    dbs_expiry: '',          // stored as "date of issue" now
    safeguarding_expiry: '',
    first_aid_expiry: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
  }, [targetId])

  async function loadSubject(id: string) {
    if (id === viewer?.id && !staffId) {
      applyProfile(viewer)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) applyProfile(data)
  }

  function applyProfile(p: Profile) {
    setSubject(p)
    setPhotoUrl(p.photo_url)
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
    if (!file || !targetId) return
    setUploadingPhoto(true)
    setUploadError(null)
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `photos/${targetId}/profile.${ext}`
    const { error: storageErr } = await supabase.storage.from('coach-files').upload(path, file, { upsert: true, contentType: file.type })
    if (storageErr) {
      setUploadError(`Upload failed: ${storageErr.message}`)
      setUploadingPhoto(false)
      return
    }
    const { data: urlData } = supabase.storage.from('coach-files').getPublicUrl(path)
    const url = urlData.publicUrl + `?t=${Date.now()}`
    const { error: dbErr } = await supabase.from('profiles').update({ photo_url: url }).eq('id', targetId)
    if (dbErr) {
      setUploadError(`Profile update failed: ${dbErr.message}`)
      setUploadingPhoto(false)
      return
    }
    setPhotoUrl(url)
    if (isOwnProfile && refreshProfile) await refreshProfile()
    setUploadingPhoto(false)
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

  return (
    <Layout title={isOwnProfile ? 'My Profile' : subject.full_name} showBack>
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

        {/* Photo */}
        {canEdit && (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a6b] overflow-hidden flex items-center justify-center shrink-0">
                {photoUrl
                  ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-lg">{initials}</span>
                }
              </div>
              <div>
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white cursor-pointer ${uploadingPhoto ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}>
                  <Camera size={16} />
                  {uploadingPhoto ? 'Uploading…' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">JPG or PNG from camera roll</p>
              </div>
            </div>
            {uploadError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <p className="text-sm text-red-700 font-medium">{uploadError}</p>
              </div>
            )}
          </Card>
        )}

        {/* Contact & Compliance */}
        {canEdit ? (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-4">Contact &amp; Compliance</p>
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
                {saving ? 'Saving…' : 'Save Details'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-3">Contact</p>
            {subject.phone
              ? <p className="text-sm text-gray-700">{subject.phone}</p>
              : <p className="text-sm text-gray-400">No phone number on file</p>
            }
          </Card>
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
