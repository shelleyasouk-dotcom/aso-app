import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, School as SchoolIcon, ExternalLink, CheckCircle, AlertTriangle, FolderOpen, Upload, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School, SchoolDocument } from '../../types'

const SHARED_DOC_CATEGORIES = [
  { value: 'policy',   label: 'ASO Policies & Procedures' },
  { value: 'guidance', label: 'Guidance & Resources' },
  { value: 'other',    label: 'Other' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']
const SELECT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

type SchoolForm = { name: string; address: string; area: string; session_day: string; session_time: string }
const emptyForm: SchoolForm = { name: '', address: '', area: 'Hampshire', session_day: 'Monday', session_time: '' }

function sortByDay(schools: School[]): School[] {
  return [...schools].sort((a, b) => DAYS.indexOf(a.session_day) - DAYS.indexOf(b.session_day))
}

function parseStartMinutes(sessionTime: string): number {
  if (!sessionTime) return 9999
  const first = sessionTime.split(/[-–]/)[0].trim()
  const match = first.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i)
  if (!match) return 9999
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const ampm = match[3]?.toLowerCase()
  if (ampm === 'pm' && h !== 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return h * 60 + m
}

function sortByTime(schools: School[]): School[] {
  return [...schools].sort((a, b) => parseStartMinutes(a.session_time) - parseStartMinutes(b.session_time))
}

// Defined at module level so React never remounts it between renders
function SchoolFormFields({ form, set }: { form: SchoolForm; set: (f: SchoolForm) => void }) {
  return (
    <>
      <Input
        label="School Name"
        placeholder="e.g. St Mary's Primary"
        value={form.name}
        onChange={e => set({ ...form, name: e.target.value })}
      />
      <Input
        label="Location"
        placeholder="e.g. Andover, Hampshire"
        value={form.address}
        onChange={e => set({ ...form, address: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Area</label>
        <select className={SELECT_CLASS} value={form.area} onChange={e => set({ ...form, area: e.target.value })}>
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Session Day</label>
        <select className={SELECT_CLASS} value={form.session_day} onChange={e => set({ ...form, session_day: e.target.value })}>
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <Input
        label="Session Time"
        placeholder="e.g. 15:30 – 16:30"
        value={form.session_time}
        onChange={e => set({ ...form, session_time: e.target.value })}
      />
    </>
  )
}

export function SchoolsAdminPage() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<SchoolForm>(emptyForm)
  const [editForm, setEditForm] = useState<SchoolForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Shared documents (visible to all schools)
  const [sharedDocs, setSharedDocs] = useState<SchoolDocument[]>([])
  const [sharedDocForm, setSharedDocForm] = useState({ title: '', category: 'policy', version: '' })
  const [uploadingShared, setUploadingShared] = useState(false)
  const [sharedDocError, setSharedDocError] = useState<string | null>(null)
  const [showSharedDocs, setShowSharedDocs] = useState(false)
  const sharedDocInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadSchools(); loadSharedDocs() }, [])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('name')
    if (data) setSchools(sortByDay(data))
    setLoading(false)
  }

  async function loadSharedDocs() {
    const { data } = await supabase
      .from('school_documents')
      .select('*')
      .is('school_id', null)
      .order('created_at', { ascending: false })
    setSharedDocs(data ?? [])
  }

  async function uploadSharedDoc(file: File) {
    if (!sharedDocForm.title) { setSharedDocError('Please enter a document title first.'); return }
    setUploadingShared(true)
    setSharedDocError(null)
    const fileName = `shared/${Date.now()}-${file.name}`
    const { error: storageErr } = await supabase.storage
      .from('school-shared-docs')
      .upload(fileName, file, { upsert: false })
    if (storageErr) { setSharedDocError('Upload failed: ' + storageErr.message); setUploadingShared(false); return }
    const { data: inserted, error: dbErr } = await supabase
      .from('school_documents')
      .insert({
        school_id: null,
        title: sharedDocForm.title,
        category: sharedDocForm.category,
        version: sharedDocForm.version || null,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()
    if (dbErr) { setSharedDocError('File uploaded but record failed: ' + dbErr.message) }
    else { setSharedDocs(prev => [inserted, ...prev]); setSharedDocForm({ title: '', category: 'policy', version: '' }) }
    setUploadingShared(false)
  }

  async function deleteSharedDoc(doc: SchoolDocument) {
    if (!confirm(`Remove "${doc.title}"?`)) return
    await supabase.storage.from('school-shared-docs').remove([doc.file_path])
    await supabase.from('school_documents').delete().eq('id', doc.id)
    setSharedDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  async function addSchool() {
    if (!addForm.name || !addForm.address || !addForm.session_time) return
    setSaving(true)
    const { error } = await supabase.from('schools').insert(addForm)
    if (!error) {
      await loadSchools()
      setAddForm(emptyForm)
      setShowAddForm(false)
    }
    setSaving(false)
  }

  function startEdit(school: School) {
    setEditingId(school.id)
    setEditForm({
      name: school.name,
      address: school.address,
      area: school.area || 'Hampshire',
      session_day: school.session_day,
      session_time: school.session_time,
    })
  }

  async function saveEdit(id: string) {
    if (!editForm.name || !editForm.address || !editForm.session_time) return
    setSaving(true)
    const { error } = await supabase.from('schools').update(editForm).eq('id', id)
    if (!error) {
      await loadSchools()
      setEditingId(null)
    }
    setSaving(false)
  }

  async function deleteSchool(id: string) {
    if (!confirm('Remove this school? This cannot be undone.')) return
    await supabase.from('schools').delete().eq('id', id)
    setSchools(prev => prev.filter(s => s.id !== id))
  }

  return (
    <Layout title="Schools" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> Add School
        </Button>

        {/* Shared ASO documents */}
        <Card>
          <button
            onClick={() => setShowSharedDocs(v => !v)}
            className="w-full flex items-center gap-3 text-left"
          >
            <FolderOpen size={18} className="text-[#1a3a6b]" />
            <div className="flex-1">
              <p className="font-bold text-[#1a3a6b]">Shared ASO Documents</p>
              <p className="text-xs text-gray-400">{sharedDocs.length} document{sharedDocs.length !== 1 ? 's' : ''} visible to all schools</p>
            </div>
            {showSharedDocs ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </button>

          {showSharedDocs && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="p-3 bg-gray-50 rounded-xl flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Shared Document</p>
                <Input
                  label="Document title"
                  placeholder="e.g. ASO Working with Schools Policy v1"
                  value={sharedDocForm.title}
                  onChange={e => setSharedDocForm(f => ({ ...f, title: e.target.value }))}
                />
                <Input
                  label="Version (optional)"
                  placeholder="e.g. v1.0"
                  value={sharedDocForm.version}
                  onChange={e => setSharedDocForm(f => ({ ...f, version: e.target.value }))}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                    value={sharedDocForm.category}
                    onChange={e => setSharedDocForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {SHARED_DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <input
                  ref={sharedDocInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) uploadSharedDoc(e.target.files[0]) }}
                />
                <Button
                  variant="primary"
                  onClick={() => sharedDocInputRef.current?.click()}
                  disabled={uploadingShared || !sharedDocForm.title}
                >
                  <Upload size={16} /> {uploadingShared ? 'Uploading…' : 'Choose File to Upload'}
                </Button>
                {sharedDocError && <p className="text-red-500 text-xs">{sharedDocError}</p>}
              </div>

              {sharedDocs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">No shared documents yet.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {sharedDocs.map(d => (
                    <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <FileText size={15} className="text-[#1a3a6b] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{d.title}</p>
                        <p className="text-xs text-gray-400">{d.version ? `${d.version} · ` : ''}{d.file_name}</p>
                      </div>
                      <button onClick={() => deleteSharedDoc(d)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {showAddForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New School</h3>
            <div className="flex flex-col gap-3">
              <SchoolFormFields form={addForm} set={setAddForm} />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={addSchool} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Save School'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : schools.length === 0 ? (
          <Card className="text-center py-8">
            <SchoolIcon size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No schools added yet.</p>
          </Card>
        ) : (
          DAYS.map(day => {
            const daySchools = sortByTime(schools.filter(s => s.session_day === day))
            if (daySchools.length === 0) return null
            return (
              <div key={day}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{day}</p>
                <div className="flex flex-col gap-3">
                  {daySchools.map(school => (
                    <Card key={school.id}>
                      {editingId === school.id ? (
                        <div className="flex flex-col gap-3">
                          <h3 className="font-semibold text-[#1a3a6b]">Edit School</h3>
                          <SchoolFormFields form={editForm} set={setEditForm} />
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
                            <Button onClick={() => saveEdit(school.id)} disabled={saving} className="flex-1">
                              {saving ? 'Saving…' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1a3a6b]">{school.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{school.address}</p>
                              {school.area && <p className="text-xs text-[#1a3a6b]/60 font-medium mt-0.5">{school.area}</p>}
                              <p className="text-xs text-gray-400 mt-1">{school.session_time}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(school)}
                                className="p-2 rounded-xl text-[#1a3a6b] hover:bg-blue-50 active:bg-blue-100 transition-colors"
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                onClick={() => deleteSchool(school.id)}
                                className="p-2 rounded-xl text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </div>
                          {/* Portal status + link */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              school.facility_form_completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {school.facility_form_completed
                                ? <CheckCircle size={11} />
                                : <AlertTriangle size={11} />
                              }
                              {school.facility_form_completed ? 'Form done' : 'Form pending'}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              school.dsl_name ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {school.dsl_name ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                              {school.dsl_name ? 'DSL on file' : 'DSL missing'}
                            </div>
                            <button
                              onClick={() => navigate(`/admin/school-portal/${school.id}`)}
                              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#1a3a6b] px-2 py-0.5 rounded-full bg-[#1a3a6b]/10 hover:bg-[#1a3a6b]/20 transition-colors"
                            >
                              <ExternalLink size={11} /> View Portal
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
