import { useState, useEffect } from 'react'
import { FileText, ChevronDown, ChevronUp, Plus, Trash2, Save, AlignLeft, List } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'

type ItemType = 'text' | 'bullet'
interface JDItem { type: ItemType; text: string }
interface JDSection { heading: string; items: JDItem[] }
interface JobDescription {
  id: string
  role: string
  title: string
  version: string
  is_active: boolean
  content: JDSection[] | null
}

const ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Area Lead',
  outreach_worker: 'Outreach Worker',
  media_tech:      'Media & Tech',
  director:        'Director',
}

const ROLE_COLORS: Record<string, string> = {
  junior_coach:    'bg-green-50 text-green-700 border-green-200',
  assistant_coach: 'bg-blue-50 text-blue-700 border-blue-200',
  lead_coach:      'bg-purple-50 text-purple-700 border-purple-200',
  area_lead:       'bg-amber-50 text-amber-700 border-amber-200',
  outreach_worker: 'bg-teal-50 text-teal-700 border-teal-200',
  media_tech:      'bg-pink-50 text-pink-700 border-pink-200',
  director:        'bg-[#1a3a6b]/10 text-[#1a3a6b] border-[#1a3a6b]/20',
}

export function JobDescriptionsAdminPage() {
  const [jds, setJds] = useState<JobDescription[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [sections, setSections] = useState<JDSection[]>([])
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadJds() }, [])

  async function loadJds() {
    setLoading(true)
    const { data } = await supabase
      .from('job_descriptions')
      .select('id, role, title, version, is_active, content')
      .order('role')
    setJds(data ?? [])
    setLoading(false)
  }

  function selectJd(jd: JobDescription) {
    setSelectedRole(jd.role)
    setTitle(jd.title)
    setVersion(jd.version)
    setSections(jd.content ? JSON.parse(JSON.stringify(jd.content)) : [])
    setExpandedSections(new Set())
    setSaveMsg('')
  }

  function toggleSection(idx: number) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function updateHeading(idx: number, heading: string) {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, heading } : s))
  }

  function addSection() {
    const newIdx = sections.length
    setSections(prev => [...prev, { heading: 'New Section', items: [] }])
    setExpandedSections(prev => new Set([...prev, newIdx]))
  }

  function removeSection(idx: number) {
    setSections(prev => prev.filter((_, i) => i !== idx))
    setExpandedSections(prev => {
      const next = new Set<number>()
      prev.forEach(i => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1) })
      return next
    })
  }

  function moveSectionUp(idx: number) {
    if (idx === 0) return
    setSections(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
  }

  function moveSectionDown(idx: number) {
    if (idx === sections.length - 1) return
    setSections(prev => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
  }

  function addItem(sIdx: number, type: ItemType) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: [...s.items, { type, text: '' }] } : s
    ))
  }

  function updateItem(sIdx: number, iIdx: number, patch: Partial<JDItem>) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.map((it, j) => j === iIdx ? { ...it, ...patch } : it) } : s
    ))
  }

  function removeItem(sIdx: number, iIdx: number) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.filter((_, j) => j !== iIdx) } : s
    ))
  }

  async function handleSave() {
    if (!selectedRole) return
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('job_descriptions')
      .update({ title, version, content: sections, updated_at: new Date().toISOString() })
      .eq('role', selectedRole)
    setSaving(false)
    if (error) {
      setSaveMsg('Error: ' + error.message)
    } else {
      setSaveMsg('Saved!')
      setJds(prev => prev.map(j =>
        j.role === selectedRole ? { ...j, title, version, content: sections } : j
      ))
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  return (
    <Layout title="Job Descriptions">
      <div className="flex flex-col h-full">

        {/* Role picker */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Select a role to write its job description</p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {jds.map(jd => (
                <button
                  key={jd.role}
                  onClick={() => selectJd(jd)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedRole === jd.role
                      ? (ROLE_COLORS[jd.role] ?? 'bg-gray-100 text-gray-700 border-gray-300') + ' ring-2 ring-offset-1 ring-[#1a3a6b]/30'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <FileText size={13} />
                    {ROLE_LABELS[jd.role] ?? jd.role}
                  </div>
                  <p className="text-[10px] font-normal text-gray-400 mt-0.5">
                    {jd.version} · {jd.content?.length ?? 0} sections
                    {!jd.content?.length && <span className="text-amber-500"> · Empty</span>}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {!selectedRole ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 px-8 text-center">
            Select a role above to write or edit its job description
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 flex flex-col gap-5">

            {/* Meta */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Description Details</p>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Version <span className="text-gray-400 font-normal">(bump this to require all staff to re-agree)</span></label>
                <input
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="e.g. v1, 2025-09"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sections ({sections.length})</p>

              {sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      value={section.heading}
                      onChange={e => updateHeading(sIdx, e.target.value)}
                      className="flex-1 text-sm font-semibold text-[#1a3a6b] bg-transparent border-none outline-none min-w-0"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveSectionUp(sIdx)} disabled={sIdx === 0} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button onClick={() => moveSectionDown(sIdx)} disabled={sIdx === sections.length - 1} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30"><ChevronDown size={14} /></button>
                      <button onClick={() => toggleSection(sIdx)} className="p-1 text-gray-400 hover:text-gray-600">
                        {expandedSections.has(sIdx) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {expandedSections.has(sIdx) && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 flex flex-col gap-3">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-2 items-start">
                          <button
                            onClick={() => updateItem(sIdx, iIdx, { type: item.type === 'text' ? 'bullet' : 'text' })}
                            title={item.type === 'text' ? 'Paragraph — click to bullet' : 'Bullet — click to paragraph'}
                            className={`mt-2 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'bullet' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {item.type === 'bullet' ? <List size={13} /> : <AlignLeft size={13} />}
                          </button>
                          <textarea
                            value={item.text}
                            onChange={e => updateItem(sIdx, iIdx, { text: e.target.value })}
                            rows={2}
                            placeholder={item.type === 'bullet' ? 'Bullet point…' : 'Paragraph…'}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                          />
                          <button onClick={() => removeItem(sIdx, iIdx)} className="mt-2 p-1.5 text-red-300 hover:text-red-500 shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => addItem(sIdx, 'text')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200">
                          <Plus size={11} /> Paragraph
                        </button>
                        <button onClick={() => addItem(sIdx, 'bullet')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100">
                          <Plus size={11} /> Bullet
                        </button>
                        <button onClick={() => removeSection(sIdx)} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100">
                          <Trash2 size={11} /> Delete section
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addSection}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-[#1a3a6b]/30 hover:text-[#1a3a6b] transition-colors"
              >
                <Plus size={16} /> Add Section
              </button>
            </div>
          </div>
        )}

        {selectedRole && (
          <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 z-40">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold shadow-lg disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving…' : saveMsg || `Save ${ROLE_LABELS[selectedRole] ?? selectedRole} Job Description`}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
