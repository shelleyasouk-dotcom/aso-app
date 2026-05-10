import { useState, useEffect, useRef } from 'react'
import { Plus, FileText, Download, Trash2, Upload, Eye, X, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import type { OrgDocument } from '../../types'

const CATEGORIES = ['Policy', 'Handbook', 'Form', 'Training', 'Safeguarding', 'Other']
const SELECT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

const CATEGORY_COLORS: Record<string, 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray'> = {
  Policy: 'blue',
  Handbook: 'green',
  Form: 'yellow',
  Training: 'purple',
  Safeguarding: 'red',
  Other: 'gray',
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

function FileIcon({ fileName }: { fileName: string }) {
  const type = getFileType(fileName)
  const ext = fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
  const color = type === 'pdf' ? 'text-red-500' : type === 'image' ? 'text-blue-500' : 'text-gray-500'
  return (
    <div className="w-10 h-10 bg-[#f4f6f9] rounded-xl flex flex-col items-center justify-center shrink-0">
      <FileText size={14} className={color} />
      <span className="text-[8px] font-bold text-gray-400 leading-none mt-0.5">{ext.slice(0, 4)}</span>
    </div>
  )
}

interface ViewerState {
  doc: OrgDocument
  url: string
}

function DocumentViewer({ viewer, onClose }: { viewer: ViewerState; onClose: () => void }) {
  const type = getFileType(viewer.doc.file_name)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a3a6b] text-white shrink-0">
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm">{viewer.doc.title}</p>
          <p className="text-xs text-blue-200 truncate">{viewer.doc.file_name}</p>
        </div>
        <a
          href={viewer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
        >
          <ExternalLink size={13} />
          Open
        </a>
        <a
          href={viewer.url}
          download={viewer.doc.file_name}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
        >
          <Download size={13} />
          Save
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center">
        {type === 'image' && (
          <img
            src={viewer.url}
            alt={viewer.doc.title}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {type === 'pdf' && (
          <div className="w-full h-full flex flex-col">
            <iframe
              src={viewer.url}
              title={viewer.doc.title}
              className="flex-1 w-full border-none"
            />
            {/* iOS Safari fallback notice */}
            <div className="bg-gray-800 text-gray-400 text-xs text-center py-2 px-4 shrink-0">
              PDF not loading?{' '}
              <a href={viewer.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                Open in browser
              </a>
            </div>
          </div>
        )}

        {type === 'other' && (
          <div className="text-center px-8">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold mb-1">{viewer.doc.file_name}</p>
            <p className="text-gray-400 text-sm mb-6">This file type can't be previewed in the app.</p>
            <a
              href={viewer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold"
            >
              <Download size={16} />
              Download file
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export function DocumentsPage() {
  const { profile } = useAuth()
  const canUpload = profile?.role === 'director' || profile?.role === 'area_lead'

  const [docs, setDocs] = useState<OrgDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'Policy' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  async function uploadDoc() {
    if (!form.title.trim() || !selectedFile || !profile) return
    setUploading(true)
    setUploadError(null)

    const ext = selectedFile.name.split('.').pop()
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, selectedFile)

    if (storageError) {
      setUploadError(`Storage error: ${storageError.message}`)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase.from('org_documents').insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      file_path: filePath,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      uploaded_by: profile.id,
    })

    if (dbError) {
      setUploadError(`Database error: ${dbError.message}`)
      setUploading(false)
      return
    }

    await load()
    setForm({ title: '', description: '', category: 'Policy' })
    setSelectedFile(null)
    setShowForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
  }

  async function openViewer(doc: OrgDocument) {
    setLoadingViewer(doc.id)
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 3600)
    setLoadingViewer(null)
    if (data?.signedUrl) setViewer({ doc, url: data.signedUrl })
  }

  async function download(doc: OrgDocument) {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 300, { download: doc.file_name })
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function remove(doc: OrgDocument) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    await supabase.storage.from('documents').remove([doc.file_path])
    await supabase.from('org_documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  const filtered = filterCategory ? docs.filter(d => d.category === filterCategory) : docs

  const grouped = CATEGORIES.reduce<Record<string, OrgDocument[]>>((acc, cat) => {
    const items = filtered.filter(d => d.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <Layout title="Documents" showBack>
      {viewer && <DocumentViewer viewer={viewer} onClose={() => setViewer(null)} />}

      <div className="px-4 pt-6 flex flex-col gap-4">

        {canUpload && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Upload Document
          </Button>
        )}

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Upload Document</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Title"
                placeholder="e.g. Staff Handbook 2025"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <Input
                label="Description (optional)"
                placeholder="Brief description…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select className={SELECT_CLASS} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  id="doc-file-upload"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="doc-file-upload"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-colors cursor-pointer"
                >
                  <Upload size={18} />
                  <span className="text-sm">{selectedFile ? selectedFile.name : 'Tap to select file…'}</span>
                </label>
              </div>
              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{uploadError}</p>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setShowForm(false); setSelectedFile(null); setUploadError(null) }} className="flex-1">Cancel</Button>
                <Button onClick={uploadDoc} disabled={uploading || !form.title.trim() || !selectedFile} className="flex-1">
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterCategory ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <Card className="text-center py-8">
            <FileText size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents yet.</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat}</p>
              <div className="flex flex-col gap-2">
                {items.map(doc => (
                  <Card key={doc.id} className="cursor-pointer active:bg-gray-50" onClick={() => openViewer(doc)}>
                    <div className="flex items-start gap-3">
                      <FileIcon fileName={doc.file_name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1a3a6b] truncate">{doc.title}</p>
                        {doc.description && <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color={CATEGORY_COLORS[doc.category] ?? 'gray'}>{doc.category}</Badge>
                          <span className="text-xs text-gray-400">{formatBytes(doc.file_size)}</span>
                          <span className="text-xs text-gray-400">{timeAgo(doc.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openViewer(doc)}
                          disabled={loadingViewer === doc.id}
                          className="p-2 rounded-xl text-[#1a3a6b] hover:bg-blue-50 transition-colors disabled:opacity-50"
                          title="View"
                        >
                          {loadingViewer === doc.id
                            ? <span className="text-xs">…</span>
                            : <Eye size={17} />
                          }
                        </button>
                        <button
                          onClick={() => download(doc)}
                          className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
                          title="Download"
                        >
                          <Download size={17} />
                        </button>
                        {canUpload && (
                          <button
                            onClick={() => remove(doc)}
                            className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
