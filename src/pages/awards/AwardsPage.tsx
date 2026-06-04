import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, Plus, X, Users, UserCheck,
  GraduationCap, Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { APPARATUS_LIST, APPARATUS_LABELS } from '../../lib/skills'
import type { Apparatus } from '../../lib/skills'
import type { School, AcademicSemester, ClassChild } from '../../types'

interface ClassChildWithProgress extends ClassChild {
  progress: Record<Apparatus, number>
}

const MAX_CHILDREN = 24

export function AwardsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [semester, setSemester] = useState<AcademicSemester | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [children, setChildren] = useState<ClassChildWithProgress[]>([])
  const [loading, setLoading] = useState(false)

  // Add child form
  const [showAdd, setShowAdd] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [adding, setAdding] = useState(false)

  const isLead = profile?.role === 'lead_coach' || profile?.role === 'area_lead' || profile?.role === 'director'
  const isAreaLead = profile?.role === 'area_lead' || profile?.role === 'director'

  // Directors/area leads see all coaches by default; coaches see their own class
  const [viewMode, setViewMode] = useState<'mine' | 'all'>('mine')
  useEffect(() => { if (isAreaLead) setViewMode('all') }, [isAreaLead])

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
          if (s.length === 1) setSelectedSchoolId(s[0].id)
        })
    } else {
      supabase.from('staff_school_assignments')
        .select('school_id, schools(*)')
        .eq('staff_id', profile.id)
        .then(({ data }) => {
          const s = (data ?? []).map((a: any) => a.schools).filter(Boolean) as School[]
          setSchools(s)
          if (s.length === 1) setSelectedSchoolId(s[0].id)
        })
    }
  }, [profile])

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

    if (!isLead || viewMode === 'mine') {
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
                onChange={e => setSelectedSchoolId(e.target.value)}
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
              {/* Lead view toggle — lead coaches can switch; directors/area leads always see all */}
              {isLead && !isAreaLead && (
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {([
                    { id: 'mine', label: 'My Class', icon: UserCheck },
                    { id: 'all', label: 'All Coaches', icon: Users },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === tab.id ? 'bg-white text-[#1a3a6b] shadow-sm' : 'text-gray-500'}`}
                    >
                      <tab.icon size={13} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Add child section — only for coaches in their own class view */}
              {viewMode === 'mine' && !isAreaLead && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      My Class — {myCount} / {MAX_CHILDREN}
                    </p>
                    {myCount < MAX_CHILDREN && !showAdd && (
                      <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1 text-xs font-bold text-[#1a3a6b] bg-[#1a3a6b]/10 px-3 py-1.5 rounded-full"
                      >
                        <Plus size={12} /> Add child
                      </button>
                    )}
                  </div>

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
                  {/* Group by coach when in "all" view */}
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
                            />
                          ))}
                        </div>
                      ))
                    })()
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
  child, canRemove, onRemove, onClick,
}: {
  child: ClassChildWithProgress
  canRemove: boolean
  onRemove: () => void
  onClick: () => void
}) {
  const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase()
  const fullName = `${child.first_name} ${child.last_name}`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1a3a6b] text-sm">{fullName}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {APPARATUS_LIST.map(app => {
              const level = child.progress[app]
              return (
                <span
                  key={app}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    level > 0
                      ? 'bg-[#f5c518]/20 text-[#1a3a6b]'
                      : 'bg-gray-100 text-gray-400'
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
      {canRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
