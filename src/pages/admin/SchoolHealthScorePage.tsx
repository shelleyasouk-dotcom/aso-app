import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle, School } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

// ─── Types ────────────────────────────────────────────────────────────────────

type RAG = 'green' | 'amber' | 'red'

interface HealthScore {
  id: string
  school_id: string
  school_name?: string
  area_lead_id: string | null
  half_term: string
  scored_at: string
  communication: RAG
  attendance: RAG
  staffing: RAG
  session_quality: RAG
  safeguarding: RAG
  parent_satisfaction: RAG
  school_relationship: RAG
  additional_needs: RAG
  notes: Record<string, string>
  overall_rag: RAG
  created_at: string
  schools?: { name: string } | null
  area_lead?: { full_name: string } | null
}

interface SchoolRow {
  id: string
  name: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const INDICATORS: { key: keyof HealthScoreForm; label: string; green: string; amber: string; red: string }[] = [
  {
    key: 'communication', label: '1. Communication',
    green: 'School contact responds within 24hrs. All contact details working.',
    amber: 'Occasional slow responses. Minor contact issues flagged and resolved.',
    red:   'Contact details not working. School not responding. Communication breakdown.',
  },
  {
    key: 'attendance', label: '2. Attendance / Numbers',
    green: 'Sessions running at 75%+ capacity. Numbers stable or growing.',
    amber: 'Numbers below 75% for one half-term. One or two dropouts.',
    red:   'Numbers significantly down. Multiple dropouts. School questioning viability.',
  },
  {
    key: 'staffing', label: '3. Staffing',
    green: 'Full complement at every session. No unplanned absences.',
    amber: 'One or two covered absences per half-term. No sessions missed.',
    red:   'Multiple absences. Sessions running under-staffed or cancelled.',
  },
  {
    key: 'session_quality', label: '4. Session Quality',
    green: 'Area Lead observation — Good or Outstanding. No complaints about delivery.',
    amber: 'Area Lead observation — Requires Improvement. One parent quality complaint.',
    red:   'No observation completed. Multiple complaints. School raised delivery concerns.',
  },
  {
    key: 'safeguarding', label: '5. Safeguarding & Incidents',
    green: 'No incidents. Disclosures handled correctly. All reports submitted same day.',
    amber: 'Minor incident. Report submitted. Parent informed. Area Lead reviewed.',
    red:   'Serious incident. Report delayed or incomplete. Parent dissatisfied. School concerned.',
  },
  {
    key: 'parent_satisfaction', label: '6. Parent Satisfaction',
    green: 'Positive feedback from parents. No unresolved complaints.',
    amber: 'One or two complaints — resolved satisfactorily.',
    red:   'Multiple complaints. Unresolved issues. School receiving negative parent feedback.',
  },
  {
    key: 'school_relationship', label: '7. School Relationship',
    green: 'School contact positive. Proactive engagement. Renewal confirmed.',
    amber: 'School contact neutral. Renewal not yet confirmed. Limited engagement.',
    red:   'School contact dissatisfied. Renewal in doubt. School has raised formal concerns.',
  },
  {
    key: 'additional_needs', label: '8. Additional Needs',
    green: 'All SEND children have pre-assessment. Support plan in place. Inclusion achieved.',
    amber: 'One child without full pre-assessment. Flagged and being addressed.',
    red:   'SEND child enrolled without pre-assessment. Exclusion required or risk identified.',
  },
]

const HALF_TERMS = [
  'Autumn 1 2026', 'Autumn 2 2026',
  'Spring 1 2027', 'Spring 2 2027',
  'Summer 1 2027', 'Summer 2 2027',
]

type HealthScoreForm = {
  school_id: string
  half_term: string
  communication: RAG
  attendance: RAG
  staffing: RAG
  session_quality: RAG
  safeguarding: RAG
  parent_satisfaction: RAG
  school_relationship: RAG
  additional_needs: RAG
  notes: Record<string, string>
}

const emptyForm: HealthScoreForm = {
  school_id: '',
  half_term: HALF_TERMS[0],
  communication: 'green',
  attendance: 'green',
  staffing: 'green',
  session_quality: 'green',
  safeguarding: 'green',
  parent_satisfaction: 'green',
  school_relationship: 'green',
  additional_needs: 'green',
  notes: {},
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcOverall(form: HealthScoreForm): RAG {
  const vals: RAG[] = INDICATORS.map(i => form[i.key] as RAG)
  if (vals.includes('red')) return 'red'
  if (vals.includes('amber')) return 'amber'
  return 'green'
}

function ragConfig(rag: RAG) {
  if (rag === 'red')   return { label: 'Red',   bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    icon: <AlertTriangle size={14} className="text-red-600" /> }
  if (rag === 'amber') return { label: 'Amber', bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  icon: <AlertCircle size={14} className="text-amber-500" /> }
  return                       { label: 'Green', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  icon: <CheckCircle size={14} className="text-green-600" /> }
}

function RAGChip({ rag }: { rag: RAG }) {
  const c = ragConfig(rag)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  )
}

// ─── RAG selector ─────────────────────────────────────────────────────────────

function RAGSelector({ value, onChange }: { value: RAG; onChange: (v: RAG) => void }) {
  return (
    <div className="flex gap-2">
      {(['green', 'amber', 'red'] as RAG[]).map(r => {
        const c = ragConfig(r)
        return (
          <button key={r} onClick={() => onChange(r)} type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
              value === r ? `${c.bg} ${c.text} ${c.border}` : 'border-gray-100 text-gray-400 hover:border-gray-200'
            }`}>
            {c.icon} {c.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Score form ───────────────────────────────────────────────────────────────

function ScoreForm({ schools, onSave, onCancel, editScore }: {
  schools: SchoolRow[]
  onSave: (form: HealthScoreForm) => Promise<void>
  onCancel: () => void
  editScore?: HealthScore | null
}) {
  const [form, setForm] = useState<HealthScoreForm>(editScore ? {
    school_id: editScore.school_id,
    half_term: editScore.half_term,
    communication: editScore.communication,
    attendance: editScore.attendance,
    staffing: editScore.staffing,
    session_quality: editScore.session_quality,
    safeguarding: editScore.safeguarding,
    parent_satisfaction: editScore.parent_satisfaction,
    school_relationship: editScore.school_relationship,
    additional_needs: editScore.additional_needs,
    notes: editScore.notes ?? {},
  } : emptyForm)
  const [saving, setSaving] = useState(false)
  const overall = calcOverall(form)
  const oc = ragConfig(overall)

  function setRag(key: keyof HealthScoreForm, v: RAG) {
    setForm(f => ({ ...f, [key]: v }))
  }
  function setNote(key: string, v: string) {
    setForm(f => ({ ...f, notes: { ...f.notes, [key]: v } }))
  }

  async function submit() {
    if (!form.school_id) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Card>
      <h3 className="font-bold text-[#1a3a6b] mb-4">{editScore ? 'Edit Health Score' : 'New School Health Score'}</h3>

      <div className="flex flex-col gap-5">
        {/* School + half-term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">School</label>
            <select value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
              <option value="">Select a school…</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Half-Term</label>
            <select value={form.half_term} onChange={e => setForm(f => ({ ...f, half_term: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
              {HALF_TERMS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Overall preview */}
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 ${oc.border} ${oc.bg}`}>
          {oc.icon}
          <div>
            <p className={`text-sm font-extrabold ${oc.text}`}>Overall: {oc.label}</p>
            <p className={`text-xs ${oc.text} opacity-80`}>Determined by the lowest-scoring indicator</p>
          </div>
        </div>

        {/* 8 indicators */}
        {INDICATORS.map(ind => (
          <div key={ind.key} className="flex flex-col gap-2 border border-gray-100 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-800">{ind.label}</p>
            <RAGSelector value={form[ind.key] as RAG} onChange={v => setRag(ind.key, v)} />
            <div className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${ragConfig(form[ind.key] as RAG).bg} ${ragConfig(form[ind.key] as RAG).text}`}>
              {form[ind.key] === 'green' ? ind.green : form[ind.key] === 'amber' ? ind.amber : ind.red}
            </div>
            <textarea
              rows={1}
              placeholder="Notes / action required (optional)…"
              value={form.notes[ind.key] ?? ''}
              onChange={e => setNote(ind.key, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
            />
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1" onClick={submit} disabled={saving || !form.school_id}>
            {saving ? 'Saving…' : 'Save Score'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── Score card ───────────────────────────────────────────────────────────────

function ScoreCard({ score, onEdit }: { score: HealthScore; onEdit: (s: HealthScore) => void }) {
  const [expanded, setExpanded] = useState(false)
  const oc = ragConfig(score.overall_rag)

  return (
    <div className={`bg-white rounded-2xl border-2 ${oc.border} shadow-sm overflow-hidden`}>
      <button className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <RAGChip rag={score.overall_rag} />
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{score.schools?.name ?? 'Unknown school'}</p>
            <p className="text-xs text-gray-400">{score.half_term} · {score.area_lead?.full_name ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(score) }}
            className="text-xs font-semibold text-[#1a3a6b] bg-[#1a3a6b]/8 px-2.5 py-1 rounded-lg hover:bg-[#1a3a6b]/15 transition-colors">
            Edit
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
          {INDICATORS.map(ind => {
            const rag = score[ind.key] as RAG
            const c = ragConfig(rag)
            const note = score.notes?.[ind.key]
            return (
              <div key={ind.key} className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${c.bg} ${c.text}`}>{c.label}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{ind.label}</p>
                  {note && <p className="text-xs text-gray-500 mt-0.5">{note}</p>}
                </div>
              </div>
            )
          })}
          {score.overall_rag === 'red' && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-red-700">Required action: escalate to Director. Action plan within 5 working days.</p>
            </div>
          )}
          {score.overall_rag === 'amber' && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-amber-700">Required action: check-in call with school contact within 2 weeks.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SchoolHealthScorePage() {
  const { profile } = useAuth()
  const [scores, setScores] = useState<HealthScore[]>([])
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editScore, setEditScore] = useState<HealthScore | null>(null)
  const [filterRag, setFilterRag] = useState<RAG | 'all'>('all')

  useEffect(() => { load() }, [])

  async function load() {
    const [scoresRes, schoolsRes] = await Promise.all([
      supabase
        .from('school_health_scores')
        .select('*, schools(name), area_lead:profiles!area_lead_id(full_name)')
        .order('scored_at', { ascending: false }),
      supabase.from('schools').select('id, name').order('name'),
    ])
    setScores((scoresRes.data ?? []) as HealthScore[])
    setSchools((schoolsRes.data ?? []) as SchoolRow[])
    setLoading(false)
  }

  async function saveScore(form: HealthScoreForm) {
    const overall = calcOverall(form)
    const payload = {
      ...form,
      overall_rag: overall,
      area_lead_id: profile!.id,
      scored_at: new Date().toISOString().slice(0, 10),
    }
    if (editScore) {
      await supabase.from('school_health_scores').update(payload).eq('id', editScore.id)
    } else {
      await supabase.from('school_health_scores').insert(payload)
    }
    setShowForm(false)
    setEditScore(null)
    await load()
  }

  function startEdit(s: HealthScore) {
    setEditScore(s)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const redCount   = scores.filter(s => s.overall_rag === 'red').length
  const amberCount = scores.filter(s => s.overall_rag === 'amber').length
  const greenCount = scores.filter(s => s.overall_rag === 'green').length
  const filtered   = filterRag === 'all' ? scores : scores.filter(s => s.overall_rag === filterRag)

  return (
    <Layout title="School Health Scores" showBack>
      <div className="px-4 pt-6 pb-10 flex flex-col gap-4">

        {/* Summary bar */}
        {scores.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { rag: 'red' as RAG, count: redCount, label: 'Red' },
              { rag: 'amber' as RAG, count: amberCount, label: 'Amber' },
              { rag: 'green' as RAG, count: greenCount, label: 'Green' },
            ].map(({ rag, count, label }) => {
              const c = ragConfig(rag)
              return (
                <button key={rag} onClick={() => setFilterRag(filterRag === rag ? 'all' : rag)}
                  className={`rounded-2xl p-3 text-center border-2 transition-all ${
                    filterRag === rag ? `${c.bg} ${c.border}` : 'bg-white border-gray-100'
                  }`}>
                  <p className={`text-2xl font-extrabold ${c.text}`}>{count}</p>
                  <p className={`text-xs font-bold ${filterRag === rag ? c.text : 'text-gray-400'}`}>{label}</p>
                </button>
              )
            })}
          </div>
        )}

        <Button fullWidth onClick={() => { setShowForm(v => !v); setEditScore(null) }}>
          <Plus size={18} /> New Health Score
        </Button>

        {showForm && (
          <ScoreForm
            schools={schools}
            editScore={editScore}
            onSave={saveScore}
            onCancel={() => { setShowForm(false); setEditScore(null) }}
          />
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <School size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{filterRag === 'all' ? 'No scores recorded yet.' : `No ${filterRag} schools.`}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(s => <ScoreCard key={s.id} score={s} onEdit={startEdit} />)}
          </div>
        )}
      </div>
    </Layout>
  )
}
