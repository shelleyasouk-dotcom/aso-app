import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, FileText, Download, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SchoolLayout } from '../../components/layout/SchoolLayout'
import { useSchoolId } from '../../hooks/useSchoolId'
import type { SchoolDocument } from '../../types'

const CATEGORY_LABELS: Record<string, string> = {
  policy:              'ASO Policies & Procedures',
  letter_of_assurance: 'Letter of Assurance',
  partnership:         'Partnership Agreement',
  guidance:            'Guidance & Resources',
  other:               'Other Documents',
}

const CATEGORY_ORDER = ['policy', 'letter_of_assurance', 'partnership', 'guidance', 'other']

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AccordionSection({
  title,
  docs,
  defaultOpen = false,
  onDownload,
  downloading,
}: {
  title: string
  docs: SchoolDocument[]
  defaultOpen?: boolean
  onDownload: (doc: SchoolDocument) => void
  downloading: string | null
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (docs.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
          <FolderOpen size={18} className="text-[#1a3a6b]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1a3a6b] text-sm">{title}</p>
          <p className="text-xs text-gray-400">{docs.length} {docs.length === 1 ? 'document' : 'documents'}</p>
        </div>
        {open
          ? <ChevronDown size={18} className="text-gray-400 shrink-0" />
          : <ChevronRight size={18} className="text-gray-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {docs.map((doc, i) => (
            <div
              key={doc.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < docs.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <FileText size={16} className="text-[#1a3a6b] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{doc.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {doc.version && <span className="mr-2">{doc.version}</span>}
                  {formatBytes(doc.file_size)}
                  {doc.file_size ? '  ·  ' : ''}
                  {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => onDownload(doc)}
                disabled={downloading === doc.id}
                className="p-2.5 rounded-xl bg-[#1a3a6b] text-white hover:bg-[#1a3a6b]/90 active:bg-[#1a3a6b]/80 transition-colors disabled:opacity-50 shrink-0"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SchoolDocumentsPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const [docs, setDocs] = useState<SchoolDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Fetch shared docs (school_id IS NULL) + this school's specific docs
      const { data } = await supabase
        .from('school_documents')
        .select('*')
        .or(schoolId ? `school_id.is.null,school_id.eq.${schoolId}` : 'school_id.is.null')
        .order('created_at', { ascending: false })
      setDocs(data ?? [])
      setLoading(false)
    }
    load()
  }, [schoolId])

  async function handleDownload(doc: SchoolDocument) {
    setDownloading(doc.id)
    const bucket = doc.school_id ? 'school-docs' : 'school-shared-docs'
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(doc.file_path, 300, { download: doc.file_name })
    if (!error && data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    setDownloading(null)
  }

  const grouped = CATEGORY_ORDER.reduce<Record<string, SchoolDocument[]>>((acc, cat) => {
    acc[cat] = docs.filter(d => d.category === cat)
    return acc
  }, {})

  const sharedDocs = docs.filter(d => d.school_id === null)
  const schoolDocs = docs.filter(d => d.school_id !== null)

  if (loading) {
    return (
      <SchoolLayout title="Documents" showBack>
        <div className="px-4 pt-6 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </SchoolLayout>
    )
  }

  return (
    <SchoolLayout title="Documents" showBack>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">

        {/* Partnership Policies — always visible */}
        <button
          onClick={() => navigate('/school-portal/policies')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-[#1a3a6b] text-white text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Partnership Policies</p>
            <p className="text-xs text-white/70">ASO Working with Schools Policy v1.0 — 14 sections</p>
          </div>
          <ChevronRight size={18} className="text-white/60 shrink-0" />
        </button>

        <>
          {/* ASO shared documents */}
          {sharedDocs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  ASO Policies &amp; Guidance
                </p>
                <div className="flex flex-col gap-2">
                  {CATEGORY_ORDER.filter(c => grouped[c].some(d => d.school_id === null)).map(cat => (
                    <AccordionSection
                      key={cat}
                      title={CATEGORY_LABELS[cat] ?? cat}
                      docs={grouped[cat].filter(d => d.school_id === null)}
                      defaultOpen={cat === 'policy'}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Per-school documents */}
            {schoolDocs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  Your Documents
                </p>
                <div className="flex flex-col gap-2">
                  {CATEGORY_ORDER.filter(c => grouped[c].some(d => d.school_id !== null)).map(cat => (
                    <AccordionSection
                      key={cat}
                      title={CATEGORY_LABELS[cat] ?? cat}
                      docs={grouped[cat].filter(d => d.school_id !== null)}
                      defaultOpen={true}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  ))}
                </div>
              </div>
            )}
        </>

      </div>
    </SchoolLayout>
  )
}
