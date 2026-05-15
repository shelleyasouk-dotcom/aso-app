import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2, ShieldCheck, FileText, Upload, CheckCircle,
  ClipboardList, Users, Link2, AlertTriangle, Eye
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { School, ImpactReport, Profile } from '../../types'

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

  // Link account
  const [linkEmail, setLinkEmail] = useState('')
  const [linkSaving, setLinkSaving] = useState(false)
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [linkedUser, setLinkedUser] = useState<Profile | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [schoolRes, reportsRes, childRes, sessionRes, linkedRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', id).single(),
        supabase.from('impact_reports').select('*').eq('school_id', id).order('created_at', { ascending: false }),
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('school_id', id).eq('is_active', true),
        supabase.from('session_registers').select('id', { count: 'exact', head: true }).eq('school_id', id),
        supabase.from('profiles').select('*').eq('school_id', id).eq('role', 'school').maybeSingle(),
      ])
      if (schoolRes.data) setSchool(schoolRes.data)
      setReports(reportsRes.data ?? [])
      setChildCount(childRes.count ?? 0)
      setSessionCount(sessionRes.count ?? 0)
      if (linkedRes.data) setLinkedUser(linkedRes.data)
      setLoading(false)
    }
    load()
  }, [id])

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
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ role: 'school', school_id: id })
      .eq('id', target.id)
    if (updateErr) {
      setLinkMsg({ type: 'error', text: 'Could not update profile: ' + updateErr.message })
    } else {
      setLinkedUser({ ...target, role: 'school', school_id: id })
      setLinkMsg({ type: 'success', text: `${target.full_name} linked as school portal user.` })
      setLinkEmail('')
    }
    setLinkSaving(false)
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

        {/* Link portal account */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={18} className="text-[#1a3a6b]" />
            <p className="font-bold text-[#1a3a6b]">Portal Account</p>
          </div>

          {linkedUser ? (
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">{linkedUser.full_name}</p>
                  <p className="text-xs text-green-700">{linkedUser.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Link an existing Supabase auth user to this school's portal. First create the user account
                in Supabase Dashboard, then enter their email below.
              </p>
              <div className="flex flex-col gap-3">
                <Input
                  label="User email"
                  type="email"
                  placeholder="school.contact@example.com"
                  value={linkEmail}
                  onChange={e => setLinkEmail(e.target.value)}
                />
                <Button onClick={linkAccount} disabled={linkSaving || !linkEmail.trim()}>
                  {linkSaving ? 'Linking…' : 'Link Account'}
                </Button>
              </div>
            </>
          )}

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
