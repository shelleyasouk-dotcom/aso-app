import { useState, useEffect } from 'react'
import { FileText, ChevronDown, ChevronUp, Plus, Trash2, Save, AlignLeft, List } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'

type ItemType = 'text' | 'bullet'

interface ContractItem {
  type: ItemType
  text: string
}

interface ContractSection {
  heading: string
  items: ContractItem[]
}

interface StaffContract {
  id: string
  role: string
  title: string
  version: string
  is_active: boolean
  content: ContractSection[] | null
}

const ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Area Lead',
}

const ROLE_COLORS: Record<string, string> = {
  junior_coach:    'bg-green-50 text-green-700 border-green-200',
  assistant_coach: 'bg-blue-50 text-blue-700 border-blue-200',
  lead_coach:      'bg-purple-50 text-purple-700 border-purple-200',
  area_lead:       'bg-amber-50 text-amber-700 border-amber-200',
}

export function StaffContractsAdminPage() {
  const [contracts, setContracts] = useState<StaffContract[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [sections, setSections] = useState<ContractSection[]>([])
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContracts()
  }, [])

  async function loadContracts() {
    setLoading(true)
    const { data } = await supabase
      .from('staff_contracts')
      .select('id, role, title, version, is_active, content')
      .order('role')
    setContracts(data ?? [])
    setLoading(false)
  }

  function selectContract(contract: StaffContract) {
    setSelectedRole(contract.role)
    setTitle(contract.title)
    setVersion(contract.version)
    setSections(contract.content ? JSON.parse(JSON.stringify(contract.content)) : [])
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

  function updateSectionHeading(idx: number, heading: string) {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, heading } : s))
  }

  function addSection() {
    const newIdx = sections.length
    setSections(prev => [...prev, { heading: `SECTION ${prev.length + 1} — NEW SECTION`, items: [] }])
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
    setSections(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveSectionDown(idx: number) {
    if (idx === sections.length - 1) return
    setSections(prev => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  function addItem(sectionIdx: number, type: ItemType) {
    setSections(prev => prev.map((s, i) =>
      i === sectionIdx ? { ...s, items: [...s.items, { type, text: '' }] } : s
    ))
  }

  function updateItem(sectionIdx: number, itemIdx: number, patch: Partial<ContractItem>) {
    setSections(prev => prev.map((s, i) =>
      i === sectionIdx
        ? { ...s, items: s.items.map((it, j) => j === itemIdx ? { ...it, ...patch } : it) }
        : s
    ))
  }

  function removeItem(sectionIdx: number, itemIdx: number) {
    setSections(prev => prev.map((s, i) =>
      i === sectionIdx ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) } : s
    ))
  }

  async function handleSave() {
    if (!selectedRole) return
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('staff_contracts')
      .update({ title, version, content: sections, updated_at: new Date().toISOString() })
      .eq('role', selectedRole)
    setSaving(false)
    if (error) {
      setSaveMsg('Error saving: ' + error.message)
    } else {
      setSaveMsg('Saved!')
      setContracts(prev => prev.map(c =>
        c.role === selectedRole ? { ...c, title, version, content: sections } : c
      ))
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  return (
    <Layout title="Employment Contracts">
      <div className="flex flex-col h-full">

        {/* Role picker */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Select a contract to edit</p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {contracts.map(c => (
                <button
                  key={c.role}
                  onClick={() => selectContract(c)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedRole === c.role
                      ? (ROLE_COLORS[c.role] ?? 'bg-[#1a3a6b]/10 text-[#1a3a6b] border-[#1a3a6b]/30') + ' ring-2 ring-offset-1 ring-[#1a3a6b]/30'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <FileText size={13} />
                    {ROLE_LABELS[c.role] ?? c.role}
                  </div>
                  <p className="text-[10px] font-normal text-gray-400 mt-0.5">{c.version} · {c.content?.length ?? 0} sections</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {!selectedRole ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 px-8 text-center">
            Select a contract above to start editing
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 flex flex-col gap-5">

            {/* Meta fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contract Details</p>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Version</label>
                <input
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="e.g. v1, v2, 2025-01"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sections ({sections.length})</p>

              {sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      value={section.heading}
                      onChange={e => updateSectionHeading(sIdx, e.target.value)}
                      className="flex-1 text-sm font-semibold text-[#1a3a6b] bg-transparent border-none outline-none min-w-0"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveSectionUp(sIdx)} disabled={sIdx === 0}
                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveSectionDown(sIdx)} disabled={sIdx === sections.length - 1}
                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30">
                        <ChevronDown size={14} />
                      </button>
                      <button onClick={() => toggleSection(sIdx)}
                        className="p-1 text-gray-400 hover:text-gray-600">
                        {expandedSections.has(sIdx) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Section body */}
                  {expandedSections.has(sIdx) && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 flex flex-col gap-3">

                      {/* Items */}
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-2 items-start">
                          <div className="flex flex-col gap-1 shrink-0 mt-2">
                            <button
                              onClick={() => updateItem(sIdx, iIdx, { type: item.type === 'text' ? 'bullet' : 'text' })}
                              title={item.type === 'text' ? 'Paragraph — click to make bullet' : 'Bullet — click to make paragraph'}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                                item.type === 'bullet'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {item.type === 'bullet' ? <List size={13} /> : <AlignLeft size={13} />}
                            </button>
                          </div>
                          <textarea
                            value={item.text}
                            onChange={e => updateItem(sIdx, iIdx, { text: e.target.value })}
                            rows={2}
                            placeholder={item.type === 'bullet' ? 'Bullet point text…' : 'Paragraph text…'}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                          />
                          <button onClick={() => removeItem(sIdx, iIdx)}
                            className="mt-2 p-1.5 text-red-300 hover:text-red-500 shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      {/* Add item buttons */}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => addItem(sIdx, 'text')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200"
                        >
                          <Plus size={11} /> Paragraph
                        </button>
                        <button
                          onClick={() => addItem(sIdx, 'bullet')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100"
                        >
                          <Plus size={11} /> Bullet
                        </button>
                        <button
                          onClick={() => removeSection(sIdx)}
                          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100"
                        >
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

        {/* Floating save bar */}
        {selectedRole && (
          <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 z-40">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1a3a6b] text-white text-sm font-bold shadow-lg disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Saving…' : saveMsg || `Save ${ROLE_LABELS[selectedRole] ?? selectedRole} Contract`}
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}
