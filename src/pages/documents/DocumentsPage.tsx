import { useState, useEffect, useRef } from 'react'
import { Plus, FileText, Download, Trash2, Upload, Eye, X, ExternalLink, ChevronDown, ChevronUp, BookOpen, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { OrgDocument } from '../../types'

const CATEGORIES = ['Policy', 'Handbook', 'Form', 'Training', 'Safeguarding', 'Other']
const SELECT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

const CATEGORY_ICONS: Record<string, string> = {
  Policy: '📋',
  Handbook: '📖',
  Form: '📝',
  Training: '🎓',
  Safeguarding: '🛡️',
  Other: '📁',
}

const CATEGORY_COLORS: Record<string, string> = {
  Policy: 'bg-blue-50 border-blue-100',
  Handbook: 'bg-green-50 border-green-100',
  Form: 'bg-yellow-50 border-yellow-100',
  Training: 'bg-purple-50 border-purple-100',
  Safeguarding: 'bg-red-50 border-red-100',
  Other: 'bg-gray-50 border-gray-100',
}

const CATEGORY_HEADER: Record<string, string> = {
  Policy: 'text-blue-800',
  Handbook: 'text-green-800',
  Form: 'text-yellow-800',
  Training: 'text-purple-800',
  Safeguarding: 'text-red-800',
  Other: 'text-gray-700',
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getFileType(fileName: string): 'pdf' | 'image' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  return 'other'
}

function FileTypeTag({ fileName }: { fileName: string }) {
  const type = getFileType(fileName)
  const ext = fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
  const style = type === 'pdf' ? 'bg-red-100 text-red-600' : type === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style}`}>{ext}</span>
}

// ─── Document viewer ─────────────────────────────────────────────────────────

interface ViewerState { doc: OrgDocument; url: string }

function DocumentViewer({ viewer, onClose }: { viewer: ViewerState; onClose: () => void }) {
  const type = getFileType(viewer.doc.file_name)
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a3a6b] text-white shrink-0">
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm">{viewer.doc.title}</p>
          <p className="text-xs text-blue-200 truncate">{viewer.doc.file_name}</p>
        </div>
        <a href={viewer.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
          <ExternalLink size={13} /> Open
        </a>
        <a href={viewer.url} download={viewer.doc.file_name}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
          <Download size={13} /> Save
        </a>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center">
        {type === 'image' && <img src={viewer.url} alt={viewer.doc.title} className="max-w-full max-h-full object-contain" />}
        {type === 'pdf' && (
          <div className="w-full h-full flex flex-col">
            <iframe src={viewer.url} title={viewer.doc.title} className="flex-1 w-full border-none" />
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-2 px-4 shrink-0">
              PDF not loading?{' '}
              <a href={viewer.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Open in browser</a>
            </div>
          </div>
        )}
        {type === 'other' && (
          <div className="text-center px-8">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold mb-1">{viewer.doc.file_name}</p>
            <p className="text-gray-400 text-sm mb-6">This file type can't be previewed in the app.</p>
            <a href={viewer.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold">
              <Download size={16} /> Download file
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Category accordion section ───────────────────────────────────────────────

interface CategorySectionProps {
  category: string
  docs: OrgDocument[]
  canUpload: boolean
  onView: (doc: OrgDocument) => void
  onDownload: (doc: OrgDocument) => void
  onDelete: (doc: OrgDocument) => void
  loadingViewer: string | null
  defaultOpen?: boolean
}

function CategorySection({ category, docs, canUpload, onView, onDownload, onDelete, loadingViewer, defaultOpen = false }: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const colorClass = CATEGORY_COLORS[category] ?? 'bg-gray-50 border-gray-100'
  const headerClass = CATEGORY_HEADER[category] ?? 'text-gray-700'
  const icon = CATEGORY_ICONS[category] ?? '📁'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className={`font-semibold text-sm ${headerClass}`}>{category}</p>
            <p className="text-xs text-gray-400">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {docs.map((doc, i) => (
            <div
              key={doc.id}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
              onClick={() => onView(doc)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#1a3a6b] text-sm truncate">{doc.title}</p>
                  <FileTypeTag fileName={doc.file_name} />
                </div>
                {doc.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>}
                <p className="text-xs text-gray-300 mt-0.5">
                  {[formatBytes(doc.file_size), timeAgo(doc.created_at)].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onView(doc)}
                  disabled={loadingViewer === doc.id}
                  className="p-2 rounded-xl text-[#1a3a6b] hover:bg-blue-50 transition-colors disabled:opacity-50"
                  title="View"
                >
                  {loadingViewer === doc.id ? <span className="text-xs px-1">…</span> : <Eye size={16} />}
                </button>
                <button onClick={() => onDownload(doc)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors" title="Download">
                  <Download size={16} />
                </button>
                {canUpload && (
                  <button onClick={() => onDelete(doc)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DocumentsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const canUpload = profile?.role === 'director' || profile?.role === 'area_lead'

  const [docs, setDocs] = useState<OrgDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'Policy' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [viewer, setViewer] = useState<ViewerState | null>(null)
  const [loadingViewer, setLoadingViewer] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('org_documents')
      .select('*, uploader:profiles!uploaded_by(full_name)')
      .order('created_at', { ascending: false })
    if (data) setDocs(data)
    setLoading(false)
  }

  async function uploadDoc() {
    if (!form.title.trim() || !selectedFile || !profile) return
    setUploading(true)
    setUploadError(null)
    const ext = selectedFile.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: storageError } = await supabase.storage.from('documents').upload(filePath, selectedFile)
    if (storageError) { setUploadError(`Storage error: ${storageError.message}`); setUploading(false); return }
    const { error: dbError } = await supabase.from('org_documents').insert({
      title: form.title.trim(), description: form.description.trim() || null,
      category: form.category, file_path: filePath,
      file_name: selectedFile.name, file_size: selectedFile.size, uploaded_by: profile.id,
    })
    if (dbError) { setUploadError(`Database error: ${dbError.message}`); setUploading(false); return }
    await load()
    setForm({ title: '', description: '', category: 'Policy' })
    setSelectedFile(null)
    setShowForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
  }

  async function openViewer(doc: OrgDocument) {
    setLoadingViewer(doc.id)
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
    setLoadingViewer(null)
    if (data?.signedUrl) setViewer({ doc, url: data.signedUrl })
  }

  async function download(doc: OrgDocument) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 300, { download: doc.file_name })
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function remove(doc: OrgDocument) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    await supabase.storage.from('documents').remove([doc.file_path])
    await supabase.from('org_documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  const grouped = CATEGORIES.reduce<Record<string, OrgDocument[]>>((acc, cat) => {
    const items = docs.filter(d => d.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const totalDocs = docs.length

  return (
    <Layout title="Documents" showBack>
      {viewer && <DocumentViewer viewer={viewer} onClose={() => setViewer(null)} />}

      {/* Header strip */}
      <div className="bg-[#1a3a6b] px-4 pt-2 pb-5">
        <p className="text-white/60 text-sm">{totalDocs} document{totalDocs !== 1 ? 's' : ''} across {Object.keys(grouped).length} categories</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3 pb-8">

        {/* Coach Handbook — in-app */}
        <button
          onClick={() => navigate('/handbook')}
          className="w-full flex items-center gap-4 bg-[#1a3a6b] rounded-2xl px-4 py-4 text-left shadow-sm"
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Coach Work Handbook</p>
            <p className="text-white/60 text-xs mt-0.5">All 18 sections · Read in-app</p>
          </div>
          <ChevronRight size={16} className="text-white/40 shrink-0" />
        </button>

        {canUpload && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Upload Document
          </Button>
        )}

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Upload Document</h3>
            <div className="flex flex-col gap-3">
              <Input label="Title" placeholder="e.g. Staff Handbook 2025" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input label="Description (optional)" placeholder="Brief description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select className={SELECT_CLASS} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">File</label>
                <input ref={fileInputRef} type="file" id="doc-file-upload" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                <label htmlFor="doc-file-upload"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-colors cursor-pointer">
                  <Upload size={18} />
                  <span className="text-sm">{selectedFile ? selectedFile.name : 'Tap to select file…'}</span>
                </label>
              </div>
              {uploadError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{uploadError}</p>}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setShowForm(false); setSelectedFile(null); setUploadError(null) }} className="flex-1">Cancel</Button>
                <Button onClick={uploadDoc} disabled={uploading || !form.title.trim() || !selectedFile} className="flex-1">
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <Card className="text-center py-8">
            <FileText size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents yet.</p>
          </Card>
        ) : (
          CATEGORIES.filter(cat => grouped[cat]).map((cat, i) => (
            <CategorySection
              key={cat}
              category={cat}
              docs={grouped[cat]}
              canUpload={canUpload}
              onView={openViewer}
              onDownload={download}
              onDelete={remove}
              loadingViewer={loadingViewer}
              defaultOpen={i === 0}
            />
          ))
        )}
      </div>
    </Layout>
  )
}
