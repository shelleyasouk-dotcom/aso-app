import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronRight, Plus, X, Users, UserCheck,
  GraduationCap, Loader2, UserCog, Upload, CheckCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { APPARATUS_LIST, APPARATUS_LABELS } from '../../lib/skills'
import type { Apparatus } from '../../lib/skills'
import type { School, AcademicSemester, ClassChild, Profile } from '../../types'

interface ClassChildWithProgress extends ClassChild {
  progress: Record<Apparatus, number>
}

const MAX_CHILDREN = 24

export function AwardsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [semester, setSemester] = useState<AcademicSemester | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState(searchParams.get('school') ?? '')
  const [children, setChildren] = useState<ClassChildWithProgress[]>([])
  const [schoolCoaches, setSchoolCoaches] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  // Add child form
  const [showAdd, setShowAdd] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [adding, setAdding] = useState(false)

  // CSV upload
  const csvRef = useRef<HTMLInputElement>(null)
  const [showCsv, setShowCsv] = useState(false)
  const [csvParsed, setCsvParsed] = useState<{ first: string; last: string }[]>([])
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvDone, setCsvDone] = useState(false)

  const isLead = profile?.role === 'lead_coach' || profile?.role === 'area_lead' || profile?.role === 'director'
  const isAreaLead = profile?.role === 'area_lead' || profile?.role === 'director'

  // Directors/area leads see all coaches by default; coaches see their own class
  const [viewMode, setViewMode] = useState<'mine' | 'all'>(
    (searchParams.get('view') as 'mine' | 'all') ?? 'mine'
  )
  useEffect(() => { if (isAreaLead && !searchParams.get('view')) setViewMode('all') }, [isAreaLead])

  // Keep URL in sync with selected school and view mode so back-navigation restores state
  function selectSchool(id: string) {
    setSelectedSchoolId(id)
    setSearchParams(p => { p.set('school', id); return p }, { replace: true })
  }
  function selectViewMode(mode: 'mine' | 'all') {
    setViewMode(mode)
    setSearchParams(p => { p.set('view', mode); return p }, { replace: true })
  }

  // Load semester + schools
  useEffect(() => {
    if (!profile) return

    supabase.from('academic_semesters').select('*').eq('is_current', true).single()
      .then(({ data }) => setSemester(data as AcademicSemester))

    if (isAreaLead) {
      supabase.from('schools').select('*').order('name')
        .then(({ data }) => {
          const s = (data ?? []) as School[]
          setSchools(s)
          if (s.length === 1 && !searchParams.get('school')) selectSchool(s[0].id)
        })
    } else {
      supabase.from('staff_school_assignments')
        .select('school_id, schools(*)')
        .eq('staff_id', profile.id)
        .then(({ data }) => {
          const s = (data ?? []).map((a: any) => a.schools).filter(Boolean) as School[]
          setSchools(s)
          if (s.length === 1 && !searchParams.get('school')) selectSchool(s[0].id)
        })
    }
  }, [profile])

  // Load coaches at selected school (for lead reassign)
  useEffect(() => {
    if (!selectedSchoolId || !isLead) return
    supabase.from('staff_school_assignments')
      .select('staff:profiles(id, full_name, role)')
      .eq('school_id', selectedSchoolId)
      .then(({ data }) => {
        setSchoolCoaches((data ?? []).map((d: any) => d.staff).filter(Boolean) as Profile[])
      })
  }, [selectedSchoolId, isLead])

  // Load children when school/semester/viewMode changes
  useEffect(() => {
    if (!profile || !selectedSchoolId || !semester) return
    loadChildren()
  }, [profile, selectedSchoolId, semester, viewMode])

  async function loadChildren() {
    if (!profile || !selectedSchoolId || !semester) return
    setLoading(true)

    let query = supabase.from('class_children')
      .select('*, added_by_profile:profiles!added_by(id, full_name)')
      .eq('school_id', selectedSchoolId)
      .eq('academic_year', semester.academic_year)
      .eq('semester_number', semester.semester_number)
      .order('last_name')

    if (viewMode === 'mine') {
      query = query.eq('added_by', profile.id)
    }

    const { data: childrenData } = await query
    if (!childrenData) { setLoading(false); return }

    const childIds = childrenData.map(c => c.id)
    let certMap: Record<string, Record<Apparatus, number>> = {}
    childrenData.forEach(c => { certMap[c.id] = { floor: 0, bars: 0, beam: 0, rebound: 0 } })

    if (childIds.length > 0) {
      const { data: certs } = await supabase
        .from('class_certificates')
        .select('child_id, apparatus, level')
        .in('child_id', childIds)

      certs?.forEach((cert: any) => {
        const cur = certMap[cert.child_id]?.[cert.apparatus as Apparatus] ?? 0
        if (cert.level > cur) certMap[cert.child_id][cert.apparatus as Apparatus] = cert.level
      })
    }

    setChildren(childrenData.map(c => ({ ...c, progress: certMap[c.id] })))
    setLoading(false)
  }

  async function addChild() {
    if (!firstName.trim() || !lastName.trim() || !selectedSchoolId || !profile || !semester) return
    const myCount = children.filter(c => c.added_by === profile.id).length
    if (myCount >= MAX_CHILDREN) return
    setAdding(true)
    await supabase.from('class_children').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      school_id: selectedSchoolId,
      academic_year: semester.academic_year,
      semester_number: semester.semester_number,
      added_by: profile.id,
    })
    setFirstName('')
    setLastName('')
    await loadChildren()
    setAdding(false)
  }

  async function removeChild(childId: string) {
    await supabase.from('class_children').delete().eq('id', childId)
    setChildren(prev => prev.filter(c => c.id !== childId))
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      const parsed: { first: string; last: string }[] = []
      // Detect if first row is a header (contains "name" / "first" / "last")
      const firstRow = lines[0]?.toLowerCase() ?? ''
      const startIdx = (firstRow.includes('first') || firstRow.includes('name') || firstRow.includes('last')) ? 1 : 0
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim())
        const first = cols[0] ?? ''
        const last = cols[1] ?? ''
        if (first) parsed.push({ first, last })
      }
      setCsvParsed(parsed)
      setCsvDone(false)
    }
    reader.readAsText(file)
  }

  async function bulkInsertCsv() {
    if (!csvParsed.length || !selectedSchoolId || !profile || !semester) return
    setCsvUploading(true)
    // Fetch existing to avoid duplicates
    const { data: existing } = await supabase
      .from('class_children')
      .select('first_name, last_name')
      .eq('school_id', selectedSchoolId)
      .eq('academic_year', semester.academic_year)
      .eq('semester_number', semester.semester_number)
    const existingSet = new Set((existing ?? []).map((c: any) => `${c.first_name}|${c.last_name}`.toLowerCase()))
    const toInsert = csvParsed
      .filter(c => !existingSet.has(`${c.first}|${c.last}`.toLowerCase()))
      .map(c => ({
        first_name: c.first,
        last_name: c.last,
        school_id: selectedSchoolId,
        academic_year: semester.academic_year,
        semester_number: semester.semester_number,
        added_by: profile.id,
      }))
    if (toInsert.length > 0) {
      await supabase.from('class_children').insert(toInsert)
    }
    await loadChildren()
    setCsvUploading(false)
    setCsvDone(true)
  }

  async function reassignChild(childId: string, newCoachId: string) {
    const coach = schoolCoaches.find(c => c.id === newCoachId)
    await supabase.from('class_children').update({ added_by: newCoachId }).eq('id', childId)
    setChildren(prev => prev.map(c =>
      c.id === childId
        ? { ...c, added_by: newCoachId, added_by_profile: coach ? { id: coach.id, full_name: coach.full_name } : c.added_by_profile }
        : c
    ))
  }

  const myCount = children.filter(c => c.added_by === profile?.id).length

  return (
    <Layout title="Awards" showBack>
      <div className="flex flex-col gap-4 pb-10">

        {/* Hero banner */}
        <div className="bg-[#1a3a6b] px-4 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={18} className="text-[#f5c518]" />
            <p className="font-extrabold text-base">UKAG Award Tracker</p>
          </div>
          {semester && (
            <p className="text-white/70 text-sm">
              {semester.label ?? `Semester ${semester.semester_number}`} · {semester.academic_year}
            </p>
          )}
        </div>

        <div className="px-4 flex flex-col gap-4">

          {/* School selector */}
          {schools.length > 1 ? (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">School</label>
              <select
                value={selectedSchoolId}
                onChange={e => selectSchool(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
              >
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          ) : schools.length === 1 && (
            <div className="bg-[#1a3a6b]/5 border border-[#1a3a6b]/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1a3a6b]" />
              <p className="text-sm font-bold text-[#1a3a6b]">{schools[0].name}</p>
            </div>
          )}

          {!selectedSchoolId && (
            <p className="text-sm text-gray-400 text-center py-6">Select a school to view or add your class.</p>
          )}

          {selectedSchoolId && semester && (
            <>
              {/* View toggle — all roles can switch; area leads/directors default to "all" */}
              {!isAreaLead && (
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {([
                    { id: 'mine', label: 'My Class', icon: UserCheck },
                    { id: 'all', label: 'All Children', icon: Users },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => selectViewMode(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === tab.id ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'}`}
                    >
                      <tab.icon size={13} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Add child section — visible to all coaches and to area leads/directors */}
              {(viewMode === 'mine' || isAreaLead) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      My Class — {myCount} / {MAX_CHILDREN}
                    </p>
                    <div className="flex items-center gap-2">
                      {isLead && !showCsv && (
                        <button
                          onClick={() => { setShowCsv(true); setShowAdd(false); setCsvParsed([]); setCsvDone(false) }}
                          className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full"
                        >
                          <Upload size={12} /> Upload list
                        </button>
                      )}
                      {myCount < MAX_CHILDREN && !showAdd && (
                        <button
                          onClick={() => { setShowAdd(true); setShowCsv(false) }}
                          className="flex items-center gap-1 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-full"
                        >
                          <Plus size={12} /> Add child
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CSV upload panel */}
                  {showCsv && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 mb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-700">Upload children from CSV</p>
                        <button onClick={() => setShowCsv(false)} className="text-gray-300 hover:text-gray-500"><X size={16} /></button>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Create a spreadsheet with two columns: <strong>First Name</strong> and <strong>Last Name</strong>. Save as CSV and upload below.
                      </p>
                      <button
                        onClick={() => csvRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-1.5 text-gray-400 hover:border-gray-300 transition-colors"
                      >
                        <Upload size={20} />
                        <span className="text-xs font-semibold">Tap to select CSV file</span>
                      </button>
                      <input ref={csvRef} type="file" accept=".csv,.txt" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); e.target.value = '' }} />

                      {csvParsed.length > 0 && !csvDone && (
                        <>
                          <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                            {csvParsed.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                <span className="text-gray-700">{c.first} {c.last}</span>
                                <button onClick={() => setCsvParsed(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400"><X size={12} /></button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowCsv(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-2.5 rounded-xl">Cancel</button>
                            <button
                              onClick={bulkInsertCsv}
                              disabled={csvUploading}
                              className="flex-1 bg-[#1a3a6b] text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {csvUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              Add {csvParsed.length} children
                            </button>
                          </div>
                        </>
                      )}

                      {csvDone && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-3 py-2.5">
                          <CheckCircle size={16} />
                          <span className="text-sm font-semibold">Children added successfully!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {showAdd && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 mb-3">
                      <p className="text-sm font-bold text-gray-700">Add a child to your class</p>
                      <div className="flex gap-2">
                        <input
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                          onKeyDown={e => e.key === 'Enter' && addChild()}
                        />
                        <input
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                          onKeyDown={e => e.key === 'Enter' && addChild()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowAdd(false); setFirstName(''); setLastName('') }}
                          className="flex-1 border border-gray-200 text-gray-600 font-bold text-sm py-2.5 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addChild}
                          disabled={adding || !firstName.trim() || !lastName.trim()}
                          className="flex-1 bg-[#1a3a6b] text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Children list */}
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
              ) : children.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-8 text-center">
                  <p className="text-gray-500 font-semibold">No children yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {viewMode === 'mine'
                      ? 'Tap "Add child" above to add your class for this semester.'
                      : 'No coaches have added children for this school and semester yet.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Group by coach when leads are in "all" view */}
                  {viewMode === 'all' && isLead ? (
                    (() => {
                      const byCoach: Record<string, { name: string; children: ClassChildWithProgress[] }> = {}
                      children.forEach(c => {
                        const coachId = c.added_by
                        const coachName = (c.added_by_profile as any)?.full_name ?? 'Unknown'
                        if (!byCoach[coachId]) byCoach[coachId] = { name: coachName, children: [] }
                        byCoach[coachId].children.push(c)
                      })
                      return Object.entries(byCoach).map(([coachId, group]) => (
                        <div key={coachId}>
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide mb-1.5 mt-2">
                            {group.name} — {group.children.length} children
                          </p>
                          {group.children.map(child => (
                            <ChildCard
                              key={child.id}
                              child={child}
                              canRemove={child.added_by === profile?.id || isAreaLead}
                              onRemove={() => removeChild(child.id)}
                              onClick={() => navigate(`/awards/${child.id}`)}
                              coaches={isLead ? schoolCoaches : []}
                              onReassign={(newCoachId) => reassignChild(child.id, newCoachId)}
                            />
                          ))}
                        </div>
                      ))
                    })()
                  ) : viewMode === 'all' && !isLead ? (
                    /* Non-leads in "all" view: flat list with "Assign to me" for unassigned children */
                    children.map(child => (
                      <ChildCard
                        key={child.id}
                        child={child}
                        canRemove={false}
                        onRemove={() => {}}
                        onClick={() => navigate(`/awards/${child.id}`)}
                        assignedToMe={child.added_by === profile?.id}
                        onAssignToMe={child.added_by !== profile?.id ? () => reassignChild(child.id, profile!.id) : undefined}
                      />
                    ))
                  ) : (
                    children.map(child => (
                      <ChildCard
                        key={child.id}
                        child={child}
                        canRemove={child.added_by === profile?.id || isAreaLead}
                        onRemove={() => removeChild(child.id)}
                        onClick={() => navigate(`/awards/${child.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

function ChildCard({
  child, canRemove, onRemove, onClick, coaches = [], onReassign, assignedToMe, onAssignToMe,
}: {
  child: ClassChildWithProgress
  canRemove: boolean
  onRemove: () => void
  onClick: () => void
  coaches?: Profile[]
  onReassign?: (coachId: string) => void
  assignedToMe?: boolean
  onAssignToMe?: () => void
}) {
  const [showAssign, setShowAssign] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase()
  const fullName = `${child.first_name} ${child.last_name}`
  const coachName = (child.added_by_profile as any)?.full_name

  async function handleClaim() {
    if (!onAssignToMe) return
    setClaiming(true)
    await onAssignToMe()
    setClaiming(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm mb-1">
      <div className="flex items-center gap-3">
        <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1a3a6b] text-sm">{fullName}</p>
            {assignedToMe !== undefined && coachName && (
              <p className="text-[10px] text-gray-400 mt-0.5">{assignedToMe ? 'My class' : coachName}</p>
            )}
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {APPARATUS_LIST.map(app => {
                const level = child.progress[app]
                return (
                  <span
                    key={app}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      level > 0 ? 'bg-[#f5c518]/20 text-[#1a3a6b]' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {APPARATUS_LABELS[app]} {level > 0 ? `L${level}` : '–'}
                  </span>
                )
              })}
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {onAssignToMe && !assignedToMe && (
            <button
              onClick={e => { e.stopPropagation(); handleClaim() }}
              disabled={claiming}
              className="flex items-center gap-1 text-[10px] font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-2.5 py-1.5 rounded-full hover:bg-[#1a3a6b]/20 transition-colors disabled:opacity-50"
            >
              {claiming ? <Loader2 size={10} className="animate-spin" /> : <UserCheck size={10} />}
              Add to my class
            </button>
          )}
          {assignedToMe === true && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-full">
              <CheckCircle size={10} /> Mine
            </span>
          )}
          {coaches.length > 0 && onReassign && (
            <button
              onClick={e => { e.stopPropagation(); setShowAssign(v => !v) }}
              className={`p-1.5 rounded-lg transition-colors ${showAssign ? 'bg-[#1a3a6b]/10 text-[#1a3a6b]' : 'text-gray-300 hover:text-[#1a3a6b]'}`}
              title="Assign to coach"
            >
              <UserCog size={14} />
            </button>
          )}
          {canRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {showAssign && coaches.length > 0 && onReassign && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <UserCog size={13} className="text-gray-400 mt-2 shrink-0" />
          <select
            defaultValue={child.added_by}
            onChange={e => { onReassign(e.target.value); setShowAssign(false) }}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
          >
            {coaches.map(c => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
