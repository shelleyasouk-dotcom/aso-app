import { useState, useRef, useEffect } from 'react'
import { Upload, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { TaskComponentProps } from '../../../types/onboarding'

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  txt: 'text/plain',
  heic: 'image/heic',
  heif: 'image/heif',
}

export function UploadTask({ task, assignment, enrollment: _enrollment, profileId, onComplete, onRefresh }: TaskComponentProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [provider, setProvider] = useState('')
  const [certNumber, setCertNumber] = useState('')
  const [completionDate, setCompletionDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [currentDocUrl, setCurrentDocUrl] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (assignment.document_id) {
      fetchExistingDoc()
    }
  }, [assignment.document_id])

  async function fetchExistingDoc() {
    if (!assignment.document_id) return

    const { data: doc } = await supabase
      .from('staff_documents')
      .select('file_path, file_name')
      .eq('id', assignment.document_id)
      .single()

    if (!doc) return

    setCurrentFileName(doc.file_name)

    const { data: signed } = await supabase.storage
      .from('coach-files')
      .createSignedUrl(doc.file_path, 3600)

    if (signed?.signedUrl) {
      setCurrentDocUrl(signed.signedUrl)
    }
  }

  function validateFile(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!task.allowed_file_types.includes(ext)) {
      return `File type not allowed. Please upload: ${task.allowed_file_types.join(', ')}`
    }
    if (file.size > task.max_file_size_mb * 1024 * 1024) {
      return `File too large. Maximum size: ${task.max_file_size_mb}MB`
    }
    return null
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    setFileError(err)
    setSelectedFile(err ? null : file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploadError(null)
    setUploading(true)

    const timestamp = Date.now()
    const storagePath = `onboarding/${profileId}/tasks/${assignment.id}/${timestamp}-${selectedFile.name}`

    const { error: storageError } = await supabase.storage
      .from('coach-files')
      .upload(storagePath, selectedFile, { upsert: true })

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: doc, error: docError } = await supabase
      .from('staff_documents')
      .insert({
        staff_id: profileId,
        title: task.required_doc_label ?? task.title,
        category: task.required_doc_category ?? 'other',
        file_path: storagePath,
        file_name: selectedFile.name,
        uploaded_by: profileId,
        issued_date: issueDate || null,
        expiry_date: expiryDate || null,
        training_provider: provider || null,
        course_name: certNumber || null,
        onboarding_task_assignment_id: assignment.id,
        status: 'pending_review',
      })
      .select('id')
      .single()

    if (docError || !doc) {
      setUploadError(docError?.message ?? 'Failed to save document record.')
      setUploading(false)
      return
    }

    const newStatus = task.requires_approval ? 'awaiting_review' : 'completed'
    await supabase.from('onboarding_task_assignments').update({
      document_id: doc.id,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', assignment.id)

    setUploading(false)
    setSelectedFile(null)
    onRefresh()
    if (newStatus === 'completed') onComplete()
  }

  const isCompleted = assignment.status === 'completed' || assignment.status === 'approved'
  const isAwaitingReview = assignment.status === 'awaiting_review'
  const isRejected = assignment.status === 'rejected' || assignment.status === 'action_required'

  const canUpload =
    selectedFile !== null &&
    (!task.requires_expiry_date || expiryDate !== '') &&
    (!task.requires_issue_date || issueDate !== '') &&
    (!task.requires_provider || provider !== '') &&
    (!task.requires_cert_number || certNumber !== '') &&
    (!task.requires_completion_date || completionDate !== '') &&
    !uploading

  const acceptAttr = task.allowed_file_types
    .map(ext => MIME_MAP[ext] ?? `.${ext}`)
    .join(',')

  if (isCompleted) {
    return (
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 max-w-lg mx-auto w-full flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <div>
            <p className="font-bold text-[#1a3a6b] text-base">Document verified</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Your document has been received and verified. No further action is required.
            </p>
          </div>
          {currentDocUrl && currentFileName && (
            <a
              href={currentDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#1a3a6b] font-medium"
            >
              <FileText size={15} />
              {currentFileName}
            </a>
          )}
          <button
            onClick={onComplete}
            className="mt-2 text-sm font-bold text-[#1a3a6b]"
          >
            ← Back to stage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 max-w-lg mx-auto w-full flex flex-col gap-4">

      {/* Requirements card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Requirements</p>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-[#1a3a6b]">
            {task.required_doc_label ?? task.title}
          </p>
          <p className="text-xs text-gray-400">
            Accepted formats: {task.allowed_file_types.join(', ').toUpperCase()}
          </p>
          <p className="text-xs text-gray-400">
            Maximum size: {task.max_file_size_mb}MB
          </p>
        </div>
        {(task.requires_expiry_date || task.requires_issue_date || task.requires_provider || task.requires_cert_number || task.requires_completion_date) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {task.requires_expiry_date && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                Expiry date required
              </span>
            )}
            {task.requires_issue_date && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                Issue date required
              </span>
            )}
            {task.requires_provider && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                Provider required
              </span>
            )}
            {task.requires_cert_number && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                Certificate number required
              </span>
            )}
            {task.requires_completion_date && (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                Completion date required
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status card */}
      {assignment.document_id && (
        <div className={`rounded-2xl p-4 shadow-sm flex flex-col gap-2 ${
          isAwaitingReview
            ? 'bg-amber-50 border border-amber-200'
            : isRejected
            ? 'bg-red-50 border border-red-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            {isAwaitingReview ? (
              <>
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="text-sm font-bold text-amber-800">Under review</p>
              </>
            ) : isRejected ? (
              <>
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-800">Action required</p>
              </>
            ) : null}
          </div>
          {isAwaitingReview && (
            <p className="text-xs text-amber-700 leading-relaxed">
              Your document has been submitted and is being reviewed. You will be notified once it has been processed.
            </p>
          )}
          {isRejected && assignment.rejection_reason && (
            <div className="bg-red-100 rounded-xl p-3 mt-1">
              <p className="text-xs font-semibold text-red-800 mb-0.5">Reason for rejection</p>
              <p className="text-xs text-red-700 leading-relaxed">{assignment.rejection_reason}</p>
            </div>
          )}
          {currentFileName && (
            <div className="flex items-center gap-2 mt-1">
              <FileText size={13} className={isAwaitingReview ? 'text-amber-600' : 'text-red-600'} />
              {currentDocUrl ? (
                <a
                  href={currentDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-medium underline underline-offset-2 ${isAwaitingReview ? 'text-amber-700' : 'text-red-700'}`}
                >
                  {currentFileName}
                </a>
              ) : (
                <p className={`text-xs font-medium ${isAwaitingReview ? 'text-amber-700' : 'text-red-700'}`}>
                  {currentFileName}
                </p>
              )}
            </div>
          )}
          {isAwaitingReview && (
            <p className="text-xs text-amber-600 font-medium mt-1">
              If you uploaded the wrong document, you can replace it below.
            </p>
          )}
        </div>
      )}

      {/* Required fields form */}
      {(task.requires_issue_date || task.requires_expiry_date || task.requires_provider || task.requires_cert_number || task.requires_completion_date) && (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Document details</p>

          {task.requires_issue_date && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#1a3a6b]">Issue date</span>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </label>
          )}

          {task.requires_expiry_date && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#1a3a6b]">Expiry date</span>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </label>
          )}

          {task.requires_completion_date && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#1a3a6b]">Completion date</span>
              <input
                type="date"
                value={completionDate}
                onChange={e => setCompletionDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </label>
          )}

          {task.requires_provider && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#1a3a6b]">Training provider</span>
              <input
                type="text"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="e.g. Red Cross, St John Ambulance"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </label>
          )}

          {task.requires_cert_number && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#1a3a6b]">Certificate number</span>
              <input
                type="text"
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                placeholder="e.g. CERT-12345"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </label>
          )}
        </div>
      )}

      {/* File picker */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {isAwaitingReview ? 'Replace document' : isRejected ? 'Upload new document' : 'Select file'}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          onChange={onFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-3">
            <FileText size={18} className="text-blue-500 shrink-0" />
            <p className="flex-1 text-sm font-medium text-blue-800 truncate min-w-0">
              {selectedFile.name}
            </p>
            <button
              onClick={() => {
                setSelectedFile(null)
                setFileError(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center shrink-0"
            >
              <X size={12} className="text-blue-700" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-8 active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/8 flex items-center justify-center">
              <Upload size={18} className="text-[#1a3a6b]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1a3a6b]">Tap to select file</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {task.allowed_file_types.join(', ').toUpperCase()} up to {task.max_file_size_mb}MB
              </p>
            </div>
          </button>
        )}

        {fileError && (
          <div className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{fileError}</p>
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!canUpload}
        className={`w-full rounded-2xl py-3.5 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
          canUpload
            ? 'bg-[#1a3a6b] text-white active:bg-[#142d56]'
            : 'bg-gray-100 text-gray-300'
        }`}
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={15} />
            {isAwaitingReview ? 'Replace document' : 'Upload document'}
          </>
        )}
      </button>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">{uploadError}</p>
        </div>
      )}
    </div>
  )
}
