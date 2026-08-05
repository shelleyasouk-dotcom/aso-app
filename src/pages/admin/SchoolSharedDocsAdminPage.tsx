import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, FileText, FolderOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { useAuth } from '../../contexts/AuthContext'

interface SharedDoc {
  id: string
  title: string
  category: string
  file_name: string
  file_size: number | null
  version: string | null
  created_at: string
  file_path: string
}

const CATEGORIES = [
  { value: 'policy',    label: 'ASO Policies & Procedures' },
  { value: 'insurance', label: 'Insurance & Certification' },
  { value: 'guidance',  label: 'Guidance & Resources' },
  { value: 'other',     label: 'Other Documents' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SchoolSharedDocsAdminPage() {
  const { profile } = useAuth()
  const [docs, setDocs] = useState<SharedDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('policy')
  const [version, setVersion] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('school_documents')
      .select('id, title, category, file_name, file_size, version, created_at, file_path')
      .is('school_id', null)
      .order('created_at', { ascending: false })
    setDocs((data ?? []) as SharedDoc[])
    setLoading(false)
  }

  async function upload() {
    if (!file || !title.trim()) { setError('Title and file are required'); return }
    if (!profile) return
    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `shared/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('school-shared-docs')
      .upload(path, file, { contentType: file.type })

    if (upErr) { setError(upErr.message); setUploading(false); return }

    const { error: dbErr } = await supabase.from('school_documents').insert({
      school_id: null,
      title: title.trim(),
      category,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      version: version.trim() || null,
      uploaded_by: profile.id,
    })

    if (dbErr) { setError(dbErr.message); setUploading(false); return }

    setTitle('')
    setCategory('policy')
    setVersion('')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
    load()
  }

  async function remove(doc: SharedDoc) {
    await supabase.storage.from('school-shared-docs').remove([doc.file_path])
    await supabase.from('school_documents').delete().eq('id', doc.id)
    setDocs(ds => ds.filter(d => d.id !== doc.id))
  }

  const grouped = CATEGORIES.reduce<Record<string, SharedDoc[]>>((acc, cat) => {
    acc[cat.value] = docs.filter(d => d.category === cat.value)
    return acc
  }, {})

  return (
    <Layout title="Shared Documents" showBack>
      <div className="px-4 pt-5 pb-10 flex flex-col gap-6 max-w-lg mx-auto">

        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-blue-800 font-medium leading-relaxed">
            Documents uploaded here are visible to <strong>all school portal users</strong>. For school-specific documents (letters of assurance, partnership agreements), go to <strong>Area Schools → select school → Portal Admin</strong>.
          </p>
        </div>

        {/* Upload form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5 flex flex-col gap-4">
          <p className="font-bold text-[#1a3a6b] text-sm">Upload Document</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Public Liability Insurance Certificate 2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3a6b] bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Version / date (optional)</label>
              <input
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="e.g. v2.1 or Jan 2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a3a6b]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">File *</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1a3a6b]/10 file:text-[#1a3a6b]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={upload}
            disabled={uploading || !file || !title.trim()}
            className="w-full py-3 rounded-xl bg-[#1a3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {uploading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Upload size={16} />
            }
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {/* Document list by category */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {CATEGORIES.map(cat => {
              const catDocs = grouped[cat.value] ?? []
              if (catDocs.length === 0) return null
              return (
                <div key={cat.value}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
                    <FolderOpen size={11} className="inline mr-1" />{cat.label}
                  </p>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {catDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                        <FileText size={16} className="text-[#1a3a6b] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{doc.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {CATEGORY_LABELS[doc.category] ?? doc.category}
                            {doc.version && ` · ${doc.version}`}
                            {doc.file_size && ` · ${formatBytes(doc.file_size)}`}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(doc)}
                          className="p-2 rounded-xl hover:bg-red-50 shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {docs.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                No shared documents uploaded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
