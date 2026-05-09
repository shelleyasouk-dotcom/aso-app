import { useState, useEffect, useRef } from 'react'
import { Camera, Plus, Trash2, FileText, ShieldCheck, AlertTriangle, XCircle, Download } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ROLE_LABELS } from '../../lib/roles'
import type { Profile, CoachCertificate } from '../../types'

// ─── Expiry helpers ────────────────────────────────────────────────────────

type ExpiryStatus = { label: string; color: string; icon: 'ok' | 'warn' | 'bad' | 'none' }

function expiryStatus(dateStr: string | null | undefined): ExpiryStatus {
  if (!dateStr) return { label: 'Not set', color: 'text-gray-400', icon: 'none' }
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
  const fmt = new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  if (days < 0) return { label: `Expired ${fmt}`, color: 'text-red-400', icon: 'bad' }
  if (days < 30) return { label: `Expires ${fmt}`, color: 'text-orange-500', icon: 'warn' }
  if (days < 90) return { label: `Expires ${fmt}`, color: 'text-yellow-500', icon: 'warn' }
  return { label: fmt, color: 'text-green-400', icon: 'ok' }
}

// ─── ID Card ──────────────────────────────────────────────────────────────

interface IdCardProps {
  fullName: string
  role: string
  area?: string
  profileId: string
  photoUrl?: string
  dbsNumber?: string
  dbsExpiry?: string
  safeguardingExpiry?: string
  firstAidExpiry?: string
}

function ExpiryRow({ label, dateStr }: { label: string; dateStr?: string | null }) {
  const s = expiryStatus(dateStr)
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
      <span className="text-white/60 text-xs">{label}</span>
      <div className="flex items-center gap-1.5">
        {s.icon === 'ok' && <ShieldCheck size={13} className="text-green-400" />}
        {s.icon === 'warn' && <AlertTriangle size={13} className="text-yellow-400" />}
        {s.icon === 'bad' && <XCircle size={13} className="text-red-400" />}
        <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
      </div>
    </div>
  )
}

function CoachIdCard({ fullName, role, area, profileId, photoUrl, dbsNumber, dbsExpiry, safeguardingExpiry, firstAidExpiry }: IdCardProps) {
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2247] rounded-3xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#f5c518] rounded-xl flex items-center justify-center shrink-0">
            <span className="text-[#1a3a6b] font-black text-xs">ASO</span>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Active School Organisation</p>
            <p className="text-white font-bold text-sm leading-tight">Digital Coach ID</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-[10px]">ID</p>
          <p className="text-white/60 text-xs font-mono">{profileId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-20 h-20 rounded-2xl bg-white/20 overflow-hidden flex items-center justify-center shrink-0 border-2 border-white/20">
          {photoUrl
            ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-2xl">{initials}</span>
          }
        </div>
        <div>
          <p className="text-xl font-bold leading-tight">{fullName}</p>
          <p className="text-white/70 text-sm mt-0.5">{role}</p>
          {area && <p className="text-white/50 text-xs mt-0.5">{area}</p>}
        </div>
      </div>
      {dbsNumber && (
        <div className="bg-white/10 rounded-xl px-3 py-2 mb-3">
          <p className="text-white/50 text-[10px] uppercase tracking-wider">DBS Certificate Number</p>
          <p className="text-white font-mono font-bold text-sm mt-0.5">{dbsNumber}</p>
        </div>
      )}
      <div className="bg-white/10 rounded-xl px-3 py-1">
        <ExpiryRow label="DBS Expiry" dateStr={dbsExpiry} />
        <ExpiryRow label="Safeguarding" dateStr={safeguardingExpiry} />
        <ExpiryRow label="First Aid" dateStr={firstAidExpiry} />
      </div>
    </div>
  )
}

// ─── Certificate row ───────────────────────────────────────────────────────

interface CertRowProps {
  cert: CoachCertificate
  canEdit: boolean
  onDelete: (id: string) => void
  onDownload: (cert: CoachCertificate) => void
}

function CertRow({ cert, canEdit, onDelete, onDownload }: CertRowProps) {
  const s = expiryStatus(cert.expiry_date)
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
        <FileText size={16} className="text-[#1a3a6b]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1a3a6b] text-sm truncate">{cert.title}</p>
        <p className={`text-xs mt-0.5 ${s.color}`}>{s.label}</p>
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

// ─── Main page ────────────────────────────────────────────────────────────

export function CoachProfilePage() {
  const { profile: viewer, refreshProfile } = useAuth()
  const { id: staffId } = useParams<{ id?: string }>()

  // The profile being viewed/edited (may differ from the logged-in viewer)
  const [subject, setSubject] = useState<Profile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | undefined>()
  const [fields, setFields] = useState({
    phone: '', dbs_number: '', dbs_expiry: '', safeguarding_expiry: '', first_aid_expiry: '',
  })
  const [certs, setCerts] = useState<CoachCertificate[]>([])
  const [addingCert, setAddingCert] = useState(false)
  const [certForm, setCertForm] = useState({ title: '', issued_date: '', expiry_date: '' })
  const [certFile, setCertFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const certFileInputRef = useRef<HTMLInputElement>(null)

  const viewerRole = viewer?.role
  const isAdminViewer = viewerRole === 'director' || viewerRole === 'area_lead'
  const isOwnProfile = !staffId || staffId === viewer?.id
  const canEdit = isOwnProfile || isAdminViewer

  // Target ID: if staffId param provided use it, else use own profile id
  const targetId = staffId ?? viewer?.id

  useEffect(() => {
    if (!targetId) return
    loadSubject(targetId)
    loadCerts(targetId)
  }, [targetId])

  async function loadSubject(id: string) {
    // If viewing own profile, use the auth context profile so it stays in sync
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
      .from('coach_certificates')
      .select('*')
      .eq('coach_id', id)
      .order('created_at', { ascending: false })
    if (data) setCerts(data)
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !targetId) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `photos/${targetId}/profile.${ext}`
    await supabase.storage.from('coach-files').upload(path, file, { upsert: true })
    const { data: urlData } = supabase.storage.from('coach-files').getPublicUrl(path)
    const url = urlData.publicUrl + `?t=${Date.now()}`
    await supabase.from('profiles').update({ photo_url: url }).eq('id', targetId)
    setPhotoUrl(url)
    if (isOwnProfile && refreshProfile) await refreshProfile()
    setUploadingPhoto(false)
  }

  async function saveProfile() {
    if (!targetId) return
    setSaving(true)
    await supabase.from('profiles').update({
      phone: fields.phone || null,
      dbs_number: fields.dbs_number || null,
      dbs_expiry: fields.dbs_expiry || null,
      safeguarding_expiry: fields.safeguarding_expiry || null,
      first_aid_expiry: fields.first_aid_expiry || null,
    }).eq('id', targetId)
    if (isOwnProfile && refreshProfile) await refreshProfile()
    // Refresh subject state to reflect saved values
    if (subject) setSubject({ ...subject, ...fields })
    setSaving(false)
  }

  async function addCert() {
    if (!targetId || !certForm.title.trim()) return
    setUploadingCert(true)
    let filePath: string | null = null
    if (certFile) {
      const ext = certFile.name.split('.').pop()
      filePath = `certs/${targetId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('coach-files').upload(filePath, certFile)
      if (error) filePath = null
    }
    const { data } = await supabase.from('coach_certificates').insert({
      coach_id: targetId,
      title: certForm.title.trim(),
      file_path: filePath,
      issued_date: certForm.issued_date || null,
      expiry_date: certForm.expiry_date || null,
    }).select().single()
    if (data) setCerts(prev => [data, ...prev])
    setCertForm({ title: '', issued_date: '', expiry_date: '' })
    setCertFile(null)
    setAddingCert(false)
    if (certFileInputRef.current) certFileInputRef.current.value = ''
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

  if (!subject) return (
    <Layout title="Profile" showBack>
      <p className="text-center text-gray-400 py-12">Loading…</p>
    </Layout>
  )

  const initials = subject.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const pageTitle = isOwnProfile ? 'My Profile' : subject.full_name

  return (
    <Layout title={pageTitle} showBack>
      <div className="px-4 pt-6 flex flex-col gap-5 pb-8">

        <CoachIdCard
          fullName={subject.full_name}
          role={ROLE_LABELS[subject.role]}
          area={subject.area}
          profileId={subject.id}
          photoUrl={photoUrl}
          dbsNumber={fields.dbs_number}
          dbsExpiry={fields.dbs_expiry}
          safeguardingExpiry={fields.safeguarding_expiry}
          firstAidExpiry={fields.first_aid_expiry}
        />

        {/* Photo */}
        {canEdit && (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a6b] overflow-hidden flex items-center justify-center shrink-0">
                {photoUrl
                  ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-lg">{initials}</span>
                }
              </div>
              <div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <Button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} variant="secondary">
                  <Camera size={16} /> {uploadingPhoto ? 'Uploading…' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">JPG or PNG from camera roll</p>
              </div>
            </div>
          </Card>
        )}

        {/* Compliance fields */}
        {canEdit ? (
          <Card>
            <p className="text-sm font-bold text-[#1a3a6b] mb-4">Contact &amp; Compliance</p>
            <div className="flex flex-col gap-3">
              <Input label="Phone Number" placeholder="e.g. 07700 900123"
                value={fields.phone} onChange={e => setFields({ ...fields, phone: e.target.value })} />
              <Input label="DBS Certificate Number" placeholder="e.g. 001234567890"
                value={fields.dbs_number} onChange={e => setFields({ ...fields, dbs_number: e.target.value })} />
              <Input label="DBS Expiry Date" type="date"
                value={fields.dbs_expiry} onChange={e => setFields({ ...fields, dbs_expiry: e.target.value })} />
              <Input label="Safeguarding Certificate Expiry" type="date"
                value={fields.safeguarding_expiry} onChange={e => setFields({ ...fields, safeguarding_expiry: e.target.value })} />
              <Input label="First Aid Certificate Expiry" type="date"
                value={fields.first_aid_expiry} onChange={e => setFields({ ...fields, first_aid_expiry: e.target.value })} />
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Details'}
              </Button>
            </div>
          </Card>
        ) : (
          // Read-only view for non-admin viewing someone else
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
              <Input label="Certificate Title" placeholder="e.g. UKAG Gymnastics L2"
                value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} />
              <Input label="Date Issued (optional)" type="date"
                value={certForm.issued_date} onChange={e => setCertForm({ ...certForm, issued_date: e.target.value })} />
              <Input label="Expiry Date (optional)" type="date"
                value={certForm.expiry_date} onChange={e => setCertForm({ ...certForm, expiry_date: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Upload Certificate (optional)</label>
                <input ref={certFileInputRef} type="file" className="hidden"
                  onChange={e => setCertFile(e.target.files?.[0] ?? null)} />
                <button
                  onClick={() => certFileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-[#1a3a6b] transition-colors"
                >
                  <FileText size={16} />
                  <span className="text-sm">{certFile ? certFile.name : 'Tap to attach file…'}</span>
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setAddingCert(false); setCertForm({ title: '', issued_date: '', expiry_date: '' }); setCertFile(null) }} className="flex-1">Cancel</Button>
                <Button onClick={addCert} disabled={uploadingCert || !certForm.title.trim()} className="flex-1">
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
      </div>
    </Layout>
  )
}
