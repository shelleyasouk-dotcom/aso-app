import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Download, Info, AlertTriangle, Lightbulb, Star, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { TaskComponentProps, ContentBlock, ContentJson } from '../../../types/onboarding'

// ─── Content block renderer ───────────────────────────────────────────────────

interface ContentBlockRendererProps {
  block: ContentBlock
  ackStates: Record<string, boolean>
  onAckChange: (id: string, checked: boolean) => void
}

function ContentBlockRenderer({ block, ackStates, onAckChange }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'heading': {
      const { level, text } = block
      if (level === 1) return <h2 className="text-[#1a3a6b] font-bold text-xl leading-snug">{text}</h2>
      if (level === 2) return <h3 className="text-[#1a3a6b] font-bold text-base leading-snug">{text}</h3>
      return <h4 className="text-[#1a3a6b] font-bold text-sm leading-snug">{text}</h4>
    }

    case 'paragraph':
      return <p className="text-sm text-gray-700 leading-relaxed">{block.text}</p>

    case 'bullet_list':
      return (
        <ul className="list-disc list-inside flex flex-col gap-1">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{item}</li>
          ))}
        </ul>
      )

    case 'numbered_list':
      return (
        <ol className="list-decimal list-inside flex flex-col gap-1">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{item}</li>
          ))}
        </ol>
      )

    case 'image':
      return (
        <div className="flex flex-col gap-1.5">
          <img src={block.url} alt={block.alt ?? ''} className="w-full rounded-2xl object-cover" />
          {block.caption && (
            <p className="text-xs text-gray-400 text-center">{block.caption}</p>
          )}
        </div>
      )

    case 'video':
      return (
        <div className="flex flex-col gap-1.5">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe src={block.url} className="w-full h-full" allowFullScreen />
          </div>
          {block.caption && (
            <p className="text-xs text-gray-400 text-center">{block.caption}</p>
          )}
        </div>
      )

    case 'callout': {
      const variantStyles: Record<string, { bg: string; border: string; text: string; iconColor: string }> = {
        info:      { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  iconColor: 'text-blue-500'  },
        warning:   { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-500' },
        important: { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   iconColor: 'text-red-500'   },
        tip:       { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
      }
      const styles = variantStyles[block.variant] ?? variantStyles.info
      const Icon =
        block.variant === 'info'      ? Info :
        block.variant === 'tip'       ? Lightbulb :
        AlertTriangle

      return (
        <div className={`${styles.bg} ${styles.border} border rounded-2xl px-4 py-3 flex gap-3`}>
          <Icon size={16} className={`${styles.iconColor} mt-0.5 shrink-0`} />
          <div className="flex flex-col gap-0.5 min-w-0">
            {block.title && (
              <p className={`text-sm font-bold ${styles.text}`}>{block.title}</p>
            )}
            <p className={`text-sm ${styles.text} leading-relaxed`}>{block.text}</p>
          </div>
        </div>
      )
    }

    case 'downloadable_file':
      return (
        <a
          href={block.url}
          download
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-[#1a3a6b] text-sm font-bold w-fit"
        >
          <FileText size={16} className="shrink-0" />
          <Download size={14} className="shrink-0" />
          <span>{block.label ?? block.filename}</span>
        </a>
      )

    case 'divider':
      return <hr className="border-gray-100" />

    case 'scenario':
      return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex flex-col gap-1.5">
          {block.title && (
            <p className="text-sm font-bold text-gray-800">{block.title}</p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{block.context}</p>
          {block.question && (
            <p className="text-sm text-gray-500 italic leading-relaxed">{block.question}</p>
          )}
        </div>
      )

    case 'acknowledgement':
      return (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ackStates[block.id] ?? false}
            onChange={e => onAckChange(block.id, e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1a3a6b] shrink-0"
          />
          <span className="text-sm text-gray-700 leading-relaxed">{block.prompt}</span>
        </label>
      )

    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContentTask({ task, assignment, onComplete, onRefresh }: TaskComponentProps) {
  const contentJson: ContentJson | null = task.content_json
  const blocks: ContentBlock[] = contentJson?.blocks ?? []

  const isCompleted = assignment.status === 'completed'
  const versionCurrent =
    isCompleted &&
    assignment.content_version_completed != null &&
    assignment.content_version_completed >= task.version

  const needsReRead =
    isCompleted &&
    (assignment.content_version_completed == null ||
      assignment.content_version_completed < task.version)

  // Build initial ack states keyed by block id
  const initialAckStates: Record<string, boolean> = {}
  for (const b of blocks) {
    if (b.type === 'acknowledgement') initialAckStates[b.id] = false
  }

  const [ackStates, setAckStates] = useState<Record<string, boolean>>(initialAckStates)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [saving, setSaving] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setReachedEnd(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleAckChange(id: string, checked: boolean) {
    setAckStates(prev => ({ ...prev, [id]: checked }))
  }

  const allAcksChecked =
    Object.keys(ackStates).length === 0 ||
    Object.values(ackStates).every(v => v)

  const canMarkRead = reachedEnd && allAcksChecked

  async function markAsRead() {
    setSaving(true)
    await supabase.from('onboarding_task_assignments').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      content_version_completed: task.version,
      updated_at: new Date().toISOString(),
    }).eq('id', assignment.id)
    setSaving(false)
    onRefresh()
    onComplete()
  }

  // ── Completed + up-to-date: show completion screen ─────────────────────────
  if (isCompleted && versionCurrent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <div>
          <p className="font-bold text-[#1a3a6b] text-base">Completed</p>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            You've read and acknowledged this module.
          </p>
        </div>
        <button
          onClick={onComplete}
          className="text-sm font-bold text-[#1a3a6b]"
        >
          ← Back to stage
        </button>
      </div>
    )
  }

  // ── No content placeholder ──────────────────────────────────────────────────
  if (!contentJson || blocks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Star size={20} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">No content yet.</p>
      </div>
    )
  }

  // ── Content view (normal or re-read) ────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-4 pt-5 pb-4 max-w-lg mx-auto w-full flex flex-col gap-4 flex-1">

        {needsReRead && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              This content has been updated. Please re-read and confirm below.
            </p>
          </div>
        )}

        {blocks.map(block => (
          <ContentBlockRenderer
            key={block.id}
            block={block}
            ackStates={ackStates}
            onAckChange={handleAckChange}
          />
        ))}

        <div ref={sentinelRef} className="h-px w-full" />
      </div>

      <div className="sticky bottom-0 bg-[#f5f7fc] border-t border-gray-100 px-4 py-3 pb-safe-bottom">
        <button
          onClick={canMarkRead && !saving ? markAsRead : undefined}
          disabled={!canMarkRead || saving}
          className={`w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            canMarkRead && !saving
              ? 'bg-[#1a3a6b] text-white'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Mark as read
            </>
          )}
        </button>
      </div>
    </div>
  )
}
