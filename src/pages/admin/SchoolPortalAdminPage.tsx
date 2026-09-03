import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2, ShieldCheck, FileText, Upload, CheckCircle,
  ClipboardList, Users, Link2, AlertTriangle, Eye, FolderOpen, Trash2, Plus, Edit2, Send
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { School, ImpactReport, Profile, SchoolDocument } from '../../types'

const DOC_CATEGORIES = [
  { value: 'letter_of_assurance', label: 'Letter of Assurance' },
  { value: 'partnership',         label: 'Partnership Agreement' },
  { value: 'guidance',            label: 'Guidance' },
  { value: 'other',               label: 'Other' },
]

function Row({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = value === null || value === undefined ? '—'
    : value === true ? 'Yes'
    : value === false ? 'No'
    : value || '—'
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{display as string}</span>
    </div>
  )
}

export function SchoolPortalAdminPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [school, setSchool] = useState<School | null>(null)
  const [reports, setReports] = useState<ImpactReport[]>([])
  const [childCount, setChildCount] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [reportForm, setReportForm] = useState({ term_name: '', sport: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // School documents
  const [schoolDocs, setSchoolDocs] = useState<SchoolDocument[]>([])
  const [docForm, setDocForm] = useState({ title: '', category: 'letter_of_assurance' })
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)

  // Safeguarding interface edit
  const [editingSafeguarding, setEditingSafeguarding] = useState(false)
  const [sgForm, setSgForm] = useState({
    safeguarding_out_of_hours: '',
    child_protection_policy_received: false,
    medical_emergency_process: '',
    lado_pathway: '',
    secure_info_method: '',
  })
  const [sgSaving, setSgSaving] = useState(false)

  // Portal accounts
  interface PortalAccount { id: string; user_id: string; label: string | null; profile?: Profile }
  const [portalAccounts, setPortalAccounts] = useState<PortalAccount[]>([])
  const [linkEmail, setLinkEmail] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [schoolRes, reportsRes, childRes, sessionRes, assignmentsRes, docsRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', id).single(),
        supabase.from('impact_reports').select('*').eq('school_id', id).order('created_at', { ascending: false }),
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('school_id', id).eq('is_active', true),
        supabase.from('session_registers').select('id', { count: 'exact', head: true }).eq('school_id', id),
        supabase.from('school_portal_assignments').select('id, user_id, label, profile:profiles(id,full_name,email)').eq('school_id', id),
        supabase.from('school_documents').select('*').eq('school_id', id).order('created_at', { ascending: false }),
      ])
      if (schoolRes.data) {
        setSchool(schoolRes.data)
        const s = schoolRes.data
        setSgForm({
          safeguarding_out_of_hours: s.safeguarding_out_of_hours ?? '',
          child_protection_policy_received: s.child_protection_policy_received ?? false,
          medical_emergency_process: s.medical_emergency_process ?? '',
          lado_pathway: s.lado_pathway ?? '',
          secure_info_method: s.secure_info_method ?? '',
        })
      }
      setReports(reportsRes.data ?? [])
      setChildCount(childRes.count ?? 0)
      setSessionCount(sessionRes.count ?? 0)
      setPortalAccounts((assignmentsRes.data ?? []) as unknown as PortalAccount[])
      setSchoolDocs(docsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function saveSafeguarding() {
    if (!id) return
    setSgSaving(true)
    const { data } = await supabase.from('schools')
      .update(sgForm)
      .eq('id', id)
      .select()
      .single()
    if (data) setSchool(data)
    setSgSaving(false)
    setEditingSafeguarding(false)
  }

  async function markAsoPackShared() {
    if (!id) return
    const { data } = await supabase.from('schools')
      .update({ aso_pack_shared_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setSchool(data)
  }

  async function uploadReport(file: File) {
    if (!id || !reportForm.term_name) {
      setUploadError('Please enter a term name before uploading.')
      return
    }
    setUploading(true)
    setUploadError(null)
    const fileName = `${id}/${Date.now()}-${file.name}`
    const { error: storageErr } = await supabase.storage
      .from('impact-reports')
      .upload(fileName, file, { contentType: 'application/pdf' })
    if (storageErr) {
      setUploadError('Upload failed: ' + storageErr.message)
      setUploading(false)
      return
    }
    const { data: inserted, error: dbErr } = await supabase
      .from('impact_reports')
      .insert({
        school_id: id,
        term_name: reportForm.term_name,
        sport: reportForm.sport || null,
        file_path: fileName,
        file_name: file.name,
        generated_at: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (dbErr) {
      setUploadError('File uploaded but record failed: ' + dbErr.message)
    } else {
      setReports(prev => [inserted, ...prev])
      setReportForm({ term_name: '', sport: '' })
    }
    setUploading(false)
  }

  async function uploadDoc(file: File) {
    if (!id || !docForm.title) { setDocError('Please enter a document title first.'); return }
    setUploadingDoc(true)
    setDocError(null)
    const fileName = `${id}/${Date.now()}-${file.name}`
    const { error: storageErr } = await supabase.storage
      .from('school-docs')
      .upload(fileName, file, { contentType: 'application/pdf', upsert: false })
    if (storageErr) { setDocError('Upload failed: ' + storageErr.message); setUploadingDoc(false); return }
    const { data: inserted, error: dbErr } = await supabase
      .from('school_documents')
      .insert({
        school_id: id,
        title: docForm.title,
        category: docForm.category,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()
    if (dbErr) { setDocError('File uploaded but record failed: ' + dbErr.message) }
    else { setSchoolDocs(prev => [inserted, ...prev]); setDocForm({ title: '', category: 'letter_of_assurance' }) }
    setUploadingDoc(false)
  }

  async function deleteDoc(doc: SchoolDocument) {
    if (!confirm(`Remove "${doc.title}"?`)) return
    await supabase.storage.from('school-docs').remove([doc.file_path])
    await supabase.from('school_documents').delete().eq('id', doc.id)
    setSchoolDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  async function linkAccount() {
    if (!id || !linkEmail.trim()) return
    setLinkSaving(true)
    setLinkMsg(null)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', linkEmail.trim().toLowerCase())
    if (error || !profiles?.length) {
      setLinkMsg({ type: 'error', text: 'No user found with that email address.' })
      setLinkSaving(false)
      return
    }
    const target = profiles[0]
    // Ensure role is set to school
    await supabase.from('profiles').update({ role: 'school' }).eq('id', target.id)
    // Insert into assignments table (ignore duplicate)
    const { data: inserted, error: insErr } = await supabase
      .from('school_portal_assignments')
      .insert({ user_id: target.id, school_id: id, label: linkLabel.trim() || null })
      .select('id, user_id, label')
      .single()
    if (insErr) {
      setLinkMsg({ type: 'error', text: insErr.code === '23505' ? 'This user is already linked to this school.' : insErr.message })
    } else {
      setPortalAccounts(prev => [...prev, { ...inserted, profile: target }])
      setLinkMsg({ type: 'success', text: `${target.full_name} linked as school portal user.` })
      setLinkEmail('')
      setLinkLabel('')
    }
    setLinkSaving(false)
  }

  async function removeAccount(assignmentId: string) {
    if (!confirm('Remove this portal account from this school?')) return
    await supabase.from('school_portal_assignments').delete().eq('id', assignmentId)
    setPortalAccounts(prev => prev.filter(a => a.id !== assignmentId))
  }

  if (loading) {
    return (
      <Layout title="School Portal" showBack>
        <div className="px-4 pt-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    )
  }

  if (!school) {
    return (
      <Layout title="School Portal" showBack>
        <div className="px-4 pt-8 text-center">
          <p className="text-gray-500">School not found.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={school.name} showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-5">

        {/* View as school button */}
        <button
          onClick={() => navigate(`/school-portal?schoolId=${id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1a3a6b] text-white text-sm font-semibold"
        >
          <Eye size={16} /> View as School
        </button>

        {/* Status flags */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={`text-center py-3 ${school.facility_form_completed ? 'bg-green-50' : 'bg-amber-50'}`}>
            {school.facility_form_completed
              ? <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
              : <AlertTriangle size={20} className="text-amber-500 mx-auto mb-1" />
            }
            <p className="text-xs font-semibold text-gray-700">Facility Form</p>
            <p className={`text-xs ${school.facility_form_completed ? 'text-green-600' : 'text-amber-600'}`}>
              {school.facility_form_completed ? 'Completed' : 'Pending'}
            </p>
          </Card>
          <Card className={`text-center py-3 ${school.dsl_name ? 'bg-green-50' : 'bg-amber-50'}`}>
            {school.dsl_name
              ? <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
              : <AlertTriangle size={20} className="text-amber-500 mx-auto mb-1" />
            }
            <p className="text-xs font-semibold text-gray-700">DSL Details</p>
            <p className={`text-xs ${school.dsl_name ? 'text-green-600' : 'text-amber-600'}`}>
              {school.dsl_name ? 'On file' : 'Missing'}
            </p>
          </Card>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center py-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users size={16} className="text-[#1a3a6b]" />
              <p className="text-xl font-black text-[#1a3a6b]">{childCount}</p>
            </div>
            <p className="text-xs text-gray-500">Enrolled pupils</p>
          </Card>
          <Card className="text-center py-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ClipboardList size={16} className="text-[#1a3a6b]" />
              <p className="text-xl font-black text-[#1a3a6b]">{sessionCount}</p>
            </div>
            <p className="text-xs text-gray-500">Sessions recorded</p>
          </Card>
        </div>

        {/* School contact details */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">School Details</p>
          </div>
          <Row label="Name"          value={school.name} />
          <Row label="Address"       value={school.address} />
          <Row label="Session"       value={`${school.session_day} — ${school.session_time}`} />
          <Row label="Type"          value={school.school_type} />
          <Row label="Region"        value={school.region} />
          <Row label="MAT"           value={school.mat_name} />
          <Row label="Headteacher"   value={school.headteacher_name} />
          <Row label="Contact"       value={school.contact_name} />
          <Row label="Contact email" value={school.contact_email} />
          <Row label="Contact phone" value={school.contact_phone} />
        </Card>

        {/* Safeguarding */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">Safeguarding Contacts</p>
          </div>
          <Row label="DSL name"   value={school.dsl_name} />
          <Row label="DSL email"  value={school.dsl_email} />
          <Row label="DSL phone"  value={school.dsl_phone} />
          <Row label="DDSL name"  value={school.ddsl_name} />
          <Row label="DDSL email" value={school.ddsl_email} />
          <Row label="DDSL phone" value={school.ddsl_phone} />
        </Card>

        {/* KCSIE 2026 Safeguarding Interface */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-600" />
              <p className="font-bold text-[#1a3a6b]">Safeguarding Interface <span className="text-xs font-normal text-gray-400 ml-1">KCSIE 2026</span></p>
            </div>
            <button
              onClick={() => setEditingSafeguarding(e => !e)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] bg-[#1a3a6b]/8 px-3 py-1.5 rounded-lg hover:bg-[#1a3a6b]/15 transition-colors"
            >
              <Edit2 size={12} /> {editingSafeguarding ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* ASO DSL info — always visible */}
          <div className="mb-3 p-3 bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-xl">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#1a3a6b] mb-1.5">ASO Designated Safeguarding Leads</p>
            <p className="text-sm font-semibold text-gray-800">Shelley Wood <span className="text-gray-400 font-normal">(DSL)</span></p>
            <p className="text-sm font-semibold text-gray-800">Naima Clarke <span className="text-gray-400 font-normal">(Deputy DSL)</span></p>
          </div>

          {editingSafeguarding ? (
            <div className="flex flex-col gap-3">
              <Input
                label="Out-of-hours safeguarding contact"
                placeholder="e.g. 07700 900000 — call MASH directly after 5pm"
                value={sgForm.safeguarding_out_of_hours}
                onChange={e => setSgForm(f => ({ ...f, safeguarding_out_of_hours: e.target.value }))}
              />
              <Input
                label="Medical emergency process"
                placeholder="e.g. Call 999 then school office on 01234 567890"
                value={sgForm.medical_emergency_process}
                onChange={e => setSgForm(f => ({ ...f, medical_emergency_process: e.target.value }))}
              />
              <Input
                label="LADO / allegation pathway"
                placeholder="e.g. Contact LADO via LA: 01234 567000"
                value={sgForm.lado_pathway}
                onChange={e => setSgForm(f => ({ ...f, lado_pathway: e.target.value }))}
              />
              <Input
                label="Secure information transmission"
                placeholder="e.g. Encrypted email to dsl@school.org.uk only"
                value={sgForm.secure_info_method}
                onChange={e => setSgForm(f => ({ ...f, secure_info_method: e.target.value }))}
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sgForm.child_protection_policy_received}
                  onChange={e => setSgForm(f => ({ ...f, child_protection_policy_received: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#1a3a6b]"
                />
                <span className="text-sm font-medium text-gray-700">School child protection policy received</span>
              </label>
              <Button onClick={saveSafeguarding} disabled={sgSaving}>
                {sgSaving ? 'Saving…' : 'Save Safeguarding Interface'}
              </Button>
            </div>
          ) : (
            <div>
              <Row label="Out-of-hours contact"    value={school.safeguarding_out_of_hours} />
              <Row label="Medical emergency"        value={school.medical_emergency_process} />
              <Row label="LADO pathway"             value={school.lado_pathway} />
              <Row label="Secure info method"       value={school.secure_info_method} />
              <Row label="CP policy received"       value={school.child_protection_policy_received} />
            </div>
          )}

          {/* ASO pack shared */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-700">ASO compliance pack shared with school</p>
              {school.aso_pack_shared_at ? (
                <p className="text-xs text-green-600 mt-0.5">
                  ✓ Shared {new Date(school.aso_pack_shared_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-0.5">Not yet shared</p>
              )}
            </div>
            {!school.aso_pack_shared_at && (
              <button
                onClick={markAsoPackShared}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1a3a6b] px-3 py-1.5 rounded-lg hover:bg-[#1a3a6b]/90 transition-colors shrink-0"
              >
                <Send size={11} /> Mark as shared
              </button>
            )}
          </div>
        </Card>

        {/* Impact reports */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">Impact Reports ({reports.length})</p>
          </div>

          {/* Upload form */}
          <div className="flex flex-col gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload New Report</p>
            <Input
              label="Term name"
              placeholder="e.g. Autumn Term 2025"
              value={reportForm.term_name}
              onChange={e => setReportForm(f => ({ ...f, term_name: e.target.value }))}
            />
            <Input
              label="Sport (optional)"
              placeholder="e.g. Gymnastics"
              value={reportForm.sport}
              onChange={e => setReportForm(f => ({ ...f, sport: e.target.value }))}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) uploadReport(e.target.files[0]) }}
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !reportForm.term_name}
            >
              <Upload size={16} /> {uploading ? 'Uploading…' : 'Choose PDF to Upload'}
            </Button>
            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
          </div>

          {reports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No reports uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <FileText size={16} className="text-[#1a3a6b] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.term_name}</p>
                    <p className="text-xs text-gray-400">{r.file_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* School-specific documents */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">School Documents ({schoolDocs.length})</p>
          </div>

          <div className="flex flex-col gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Document</p>
            <Input
              label="Document title"
              placeholder="e.g. Letter of Assurance 2025"
              value={docForm.title}
              onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                value={docForm.category}
                onChange={e => setDocForm(f => ({ ...f, category: e.target.value }))}
              >
                {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) uploadDoc(e.target.files[0]) }}
            />
            <Button
              variant="primary"
              onClick={() => docInputRef.current?.click()}
              disabled={uploadingDoc || !docForm.title}
            >
              <Upload size={16} /> {uploadingDoc ? 'Uploading…' : 'Choose File to Upload'}
            </Button>
            {docError && <p className="text-red-500 text-xs">{docError}</p>}
          </div>

          {schoolDocs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No documents uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {schoolDocs.map(d => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <FileText size={16} className="text-[#1a3a6b] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{d.title}</p>
                    <p className="text-xs text-gray-400">{d.file_name}</p>
                  </div>
                  <button onClick={() => deleteDoc(d)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Portal accounts */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">Portal Accounts ({portalAccounts.length})</p>
          </div>

          {portalAccounts.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {portalAccounts.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle size={16} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">{(a.profile as Profile)?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-green-700">{(a.profile as Profile)?.email}</p>
                    {a.label && <p className="text-xs text-[#1a3a6b] font-semibold mt-0.5">{a.label}</p>}
                  </div>
                  <button onClick={() => removeAccount(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Plus size={12} className="inline mr-1" />Add Portal Account
            </p>
            <p className="text-xs text-gray-400">
              Create the user in Supabase Auth first, then enter their email below.
              The same email can be linked to multiple schools.
            </p>
            <Input
              label="User email"
              type="email"
              placeholder="school.contact@example.com"
              value={linkEmail}
              onChange={e => setLinkEmail(e.target.value)}
            />
            <Input
              label="Label (optional)"
              placeholder="e.g. KS1, KS2, Primary"
              value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
            />
            <Button onClick={linkAccount} disabled={linkSaving || !linkEmail.trim()}>
              {linkSaving ? 'Linking…' : 'Link Account'}
            </Button>
          </div>

          {linkMsg && (
            <p className={`text-sm mt-3 ${linkMsg.type === 'success' ? 'text-green-700' : 'text-red-500'}`}>
              {linkMsg.text}
            </p>
          )}
        </Card>

      </div>
    </Layout>
  )
}
