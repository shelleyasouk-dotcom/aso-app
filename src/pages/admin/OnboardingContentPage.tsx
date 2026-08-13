import { useState, useEffect } from 'react'
import {
  ChevronDown, ChevronUp, ChevronRight, BookOpen, HelpCircle,
  Upload, FileSignature, Eye, EyeOff, CheckCircle, Plus, Trash2,
  PenLine, X, Save,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stage {
  id: string
  title: string
  description: string | null
  display_order: number
  is_active: boolean
  is_mandatory: boolean
  role_assignments: string[]
}

interface Task {
  id: string
  stage_id: string
  title: string
  type: 'content' | 'quiz' | 'upload' | 'declaration' | 'contract' | 'placement'
  display_order: number
  is_active: boolean
  is_mandatory: boolean
  declaration_text: string | null
  required_doc_category: string | null
  required_doc_label: string | null
  requires_expiry_date: boolean
  pass_threshold_pct: number | null
  questions_per_attempt: number | null
  content_json: unknown[] | null
}

interface QuizQuestion {
  id: string
  task_id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string | null
  difficulty: string | null
  is_active: boolean
}

const TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  content:     { label: 'Content',     color: 'bg-blue-100 text-blue-700',    icon: BookOpen },
  quiz:        { label: 'Quiz',        color: 'bg-purple-100 text-purple-700', icon: HelpCircle },
  upload:      { label: 'Upload',      color: 'bg-orange-100 text-orange-700', icon: Upload },
  declaration: { label: 'Declaration', color: 'bg-green-100 text-green-700',   icon: FileSignature },
  contract:    { label: 'Contract',    color: 'bg-red-100 text-red-700',       icon: FileSignature },
  placement:   { label: 'Placement',   color: 'bg-gray-100 text-gray-600',     icon: CheckCircle },
}

const BLANK_Q = { question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ContentPreview({ blocks }: { blocks: unknown[] }) {
  if (!blocks || blocks.length === 0) return <p className="text-xs text-gray-400 italic">No content blocks</p>
  return (
    <div className="flex flex-col gap-2">
      {(blocks as Record<string, unknown>[]).map((b, i) => {
        const type = b.type as string
        if (type === 'heading') return (
          <p key={i} className="font-bold text-sm text-gray-800">{b.text as string}</p>
        )
        if (type === 'paragraph') return (
          <p key={i} className="text-xs text-gray-600 leading-relaxed">{b.text as string}</p>
        )
        if (type === 'bullet_list' || type === 'numbered_list') {
          const items = b.items as string[]
          return (
            <ul key={i} className="flex flex-col gap-1">
              {items?.map((item, j) => (
                <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-gray-400 shrink-0">{type === 'numbered_list' ? `${j+1}.` : '•'}</span>
                  {item}
                </li>
              ))}
            </ul>
          )
        }
        if (type === 'callout') return (
          <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-800">
            {b.text as string}
          </div>
        )
        if (type === 'acknowledgement') return (
          <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 text-xs text-yellow-800">
            ✅ Acknowledgement: {b.label as string}
          </div>
        )
        if (type === 'downloadable_file') return (
          <div key={i} className="text-xs text-gray-500 italic">📎 Downloadable: {b.label as string}</div>
        )
        if (type === 'divider') return <hr key={i} className="border-gray-200" />
        return <p key={i} className="text-[10px] text-gray-300 italic">[{type} block]</p>
      })}
    </div>
  )
}

// ─── Quiz question row ────────────────────────────────────────────────────────

function QuestionRow({
  q, onToggle, onDelete,
}: {
  q: QuizQuestion
  onToggle: (q: QuizQuestion) => void
  onDelete: (q: QuizQuestion) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border ${q.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">Q</span>
        <p className="flex-1 text-sm text-gray-800 font-medium leading-snug">{q.question}</p>
        <div className="flex items-center gap-1 shrink-0">
          {q.difficulty && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${q.difficulty === 'easy' ? 'bg-green-100 text-green-600' : q.difficulty === 'hard' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {q.difficulty}
            </span>
          )}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${i === q.correct_index ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
              <span className={`text-xs font-bold shrink-0 mt-0.5 ${i === q.correct_index ? 'text-green-600' : 'text-gray-400'}`}>
                {i === q.correct_index ? '✓' : String.fromCharCode(65 + i)}
              </span>
              <span className={i === q.correct_index ? 'text-green-800 font-semibold' : 'text-gray-600'}>{opt}</span>
            </div>
          ))}
          {q.explanation && (
            <p className="text-xs text-gray-500 italic mt-1 pl-2 border-l-2 border-gray-200">
              Explanation: {q.explanation}
            </p>
          )}
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onToggle(q)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {q.is_active ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
            </button>
            <button
              onClick={() => onDelete(q)}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add question form ────────────────────────────────────────────────────────

function AddQuestionForm({ taskId, onSaved }: { taskId: string; onSaved: () => void }) {
  const [form, setForm] = useState(BLANK_Q)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    if (!form.question.trim()) { setErr('Question text is required.'); return }
    if (form.options.some(o => !o.trim())) { setErr('All 4 answer options must be filled in.'); return }
    setErr(null); setSaving(true)
    const { error } = await supabase.from('onboarding_quiz_banks').insert({
      task_id: taskId,
      question: form.question.trim(),
      options: form.options.map(o => o.trim()),
      correct_index: form.correct_index,
      explanation: form.explanation.trim() || null,
    })
    setSaving(false)
    if (error) { setErr(error.message); return }
    setForm(BLANK_Q)
    onSaved()
  }

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-purple-800">New Question</p>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <textarea
        value={form.question}
        onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
        placeholder="Question text…"
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div className="flex flex-col gap-2">
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setForm(f => ({ ...f, correct_index: i }))}
              className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${form.correct_index === i ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
              title="Mark as correct"
            />
            <input
              value={opt}
              onChange={e => {
                const opts = [...form.options]; opts[i] = e.target.value
                setForm(f => ({ ...f, options: opts }))
              }}
              placeholder={`Option ${String.fromCharCode(65 + i)}${form.correct_index === i ? ' (correct)' : ''}`}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        ))}
      </div>
      <input
        value={form.explanation}
        onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
        placeholder="Explanation (shown after answering — optional)"
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add Question'}</Button>
      </div>
    </div>
  )
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task, questions, onToggleTask, onToggleQuestion, onDeleteQuestion, onQuestionSaved,
}: {
  task: Task
  questions: QuizQuestion[]
  onToggleTask: (t: Task) => void
  onToggleQuestion: (q: QuizQuestion) => void
  onDeleteQuestion: (q: QuizQuestion) => void
  onQuestionSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [addingQ, setAddingQ] = useState(false)
  const meta = TYPE_META[task.type] ?? TYPE_META.content
  const Icon = meta.icon

  return (
    <div className={`rounded-2xl border ${task.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
          <Icon size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-tight ${task.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
            {!task.is_active && <span className="text-[9px] text-gray-400 font-semibold uppercase">Hidden</span>}
            {task.type === 'quiz' && questions.length > 0 && (
              <span className="text-[9px] text-gray-400">{questions.filter(q => q.is_active).length} questions</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleTask(task) }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={task.is_active ? 'Hide task' : 'Show task'}
          >
            {task.is_active ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-gray-300" />}
          </button>
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4">

          {/* Content preview */}
          {task.type === 'content' && task.content_json && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Content</p>
              <ContentPreview blocks={task.content_json as unknown[]} />
            </div>
          )}

          {/* Declaration text */}
          {task.type === 'declaration' && task.declaration_text && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Declaration Text</p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                {task.declaration_text}
              </div>
            </div>
          )}

          {/* Upload requirements */}
          {task.type === 'upload' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Document Requirements</p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-700 flex flex-col gap-1 border border-gray-100">
                {task.required_doc_label && <p><span className="font-semibold">Label:</span> {task.required_doc_label}</p>}
                {task.required_doc_category && <p><span className="font-semibold">Category:</span> {task.required_doc_category}</p>}
                {task.requires_expiry_date && <p className="text-orange-600">⚠ Expiry date required</p>}
              </div>
            </div>
          )}

          {/* Quiz questions */}
          {task.type === 'quiz' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Questions ({questions.filter(q => q.is_active).length} active
                  {task.questions_per_attempt ? `, ${task.questions_per_attempt} drawn per attempt` : ''})
                  {task.pass_threshold_pct ? ` · Pass: ${task.pass_threshold_pct}%` : ''}
                </p>
                <button
                  onClick={() => setAddingQ(v => !v)}
                  className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                >
                  {addingQ ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Add question</>}
                </button>
              </div>

              {addingQ && (
                <AddQuestionForm taskId={task.id} onSaved={() => { setAddingQ(false); onQuestionSaved() }} />
              )}

              <div className="flex flex-col gap-2">
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No questions yet.</p>
                ) : questions.map(q => (
                  <QuestionRow
                    key={q.id}
                    q={q}
                    onToggle={onToggleQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stage row ────────────────────────────────────────────────────────────────

function StageRow({
  stage, tasks, questions, onToggleStage, onToggleTask, onToggleQuestion, onDeleteQuestion, onQuestionSaved,
}: {
  stage: Stage
  tasks: Task[]
  questions: QuizQuestion[]
  onToggleStage: (s: Stage) => void
  onToggleTask: (t: Task) => void
  onToggleQuestion: (q: QuizQuestion) => void
  onDeleteQuestion: (q: QuizQuestion) => void
  onQuestionSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const activeTasks = tasks.filter(t => t.is_active).length

  return (
    <div className={`rounded-2xl border shadow-sm ${stage.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${stage.is_active ? 'bg-[#1a3a6b] text-white' : 'bg-gray-200 text-gray-400'}`}>
          {stage.display_order}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${stage.is_active ? 'text-gray-900' : 'text-gray-400'}`}>{stage.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeTasks}/{tasks.length} tasks active
            {!stage.is_active && ' · Stage hidden'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleStage(stage) }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={stage.is_active ? 'Hide stage' : 'Show stage'}
          >
            {stage.is_active ? <Eye size={15} className="text-green-500" /> : <EyeOff size={15} className="text-gray-300" />}
          </button>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 flex flex-col gap-2">
          {stage.description && (
            <p className="text-xs text-gray-500 mb-2 italic">{stage.description}</p>
          )}
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No tasks in this stage.</p>
          ) : (
            tasks.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                questions={questions.filter(q => q.task_id === t.id)}
                onToggleTask={onToggleTask}
                onToggleQuestion={onToggleQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onQuestionSaved={onQuestionSaved}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OnboardingContentPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [{ data: sData }, { data: tData }, { data: qData }] = await Promise.all([
      supabase.from('onboarding_stages').select('*').order('display_order'),
      supabase.from('onboarding_tasks').select('*').order('display_order'),
      supabase.from('onboarding_quiz_banks').select('*').order('created_at'),
    ])
    setStages((sData ?? []) as Stage[])
    setTasks((tData ?? []) as Task[])
    setQuestions((qData ?? []) as QuizQuestion[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStage(s: Stage) {
    await supabase.from('onboarding_stages').update({ is_active: !s.is_active }).eq('id', s.id)
    setStages(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function toggleTask(t: Task) {
    await supabase.from('onboarding_tasks').update({ is_active: !t.is_active }).eq('id', t.id)
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function toggleQuestion(q: QuizQuestion) {
    await supabase.from('onboarding_quiz_banks').update({ is_active: !q.is_active }).eq('id', q.id)
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function deleteQuestion(q: QuizQuestion) {
    if (!confirm(`Delete this question?\n\n"${q.question}"\n\nThis cannot be undone.`)) return
    await supabase.from('onboarding_quiz_banks').delete().eq('id', q.id)
    setQuestions(prev => prev.filter(x => x.id !== q.id))
  }

  const totalTasks = tasks.filter(t => t.is_active).length
  const totalQuestions = questions.filter(q => q.is_active).length
  const quizTaskCount = tasks.filter(t => t.type === 'quiz' && t.is_active).length

  return (
    <Layout title="Onboarding Programme">
      <div className="px-4 pt-5 pb-12 max-w-3xl mx-auto flex flex-col gap-5">

        <p className="text-sm text-gray-400">
          All onboarding stages, tasks and quiz questions. Click any stage or task to expand it. Use the eye icon to show/hide from coaches.
        </p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Stages', value: stages.filter(s => s.is_active).length, total: stages.length },
            { label: 'Active tasks', value: totalTasks, total: tasks.length },
            { label: 'Quiz questions', value: totalQuestions, note: `${quizTaskCount} quiz${quizTaskCount !== 1 ? 'es' : ''}` },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-[#1a3a6b]">{s.value}</p>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                {s.label}{'total' in s ? ` / ${s.total}` : ''}
              </p>
              {'note' in s && s.note && <p className="text-[10px] text-gray-300">{s.note}</p>}
            </div>
          ))}
        </div>

        {/* Stages list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {stages.map(stage => (
              <StageRow
                key={stage.id}
                stage={stage}
                tasks={tasks.filter(t => t.stage_id === stage.id)}
                questions={questions}
                onToggleStage={toggleStage}
                onToggleTask={toggleTask}
                onToggleQuestion={toggleQuestion}
                onDeleteQuestion={deleteQuestion}
                onQuestionSaved={load}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}
