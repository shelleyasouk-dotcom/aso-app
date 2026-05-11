import { useState, useEffect } from 'react'
import { Plus, Users, School, Check, Pencil, UserCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import type { Profile, School as SchoolType, Role, StaffSchoolAssignment } from '../../types'
import { ROLE_LABELS, canManageStaff } from '../../lib/roles'

const AREA_LEAD_VISIBLE_ROLES: Role[] = ['lead_coach', 'assistant_coach', 'junior_coach']

const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']
const ROLES: Role[] = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach', 'outreach_worker', 'media_tech']

interface StaffWithAssignments extends Profile {
  assignments?: (StaffSchoolAssignment & { school?: SchoolType })[]
}

interface AssignPanel {
  staffId: string
  staffName: string
  selected: Set<string>
}

type EditForm = { full_name: string; email: string; role: Role; areas: string[]; can_clock_anywhere: boolean }

interface StaffCardProps {
  member: StaffWithAssignments
  canManage: boolean
  canAssignSchools: boolean
  editingId: string | null
  editForm: EditForm
  editError: string | null
  setEditForm: (f: EditForm) => void
  setEditingId: (id: string | null) => void
  saving: boolean
  onEdit: (member: StaffWithAssignments) => void
  onAssign: (member: StaffWithAssignments) => void
  onSaveEdit: (id: string) => void
  onProfile: (id: string) => void
}

// Defined at module level — never remounted between renders
function StaffCard({ member, canManage, canAssignSchools, editingId, editForm, editError, setEditForm, setEditingId, saving, onEdit, onAssign, onSaveEdit, onProfile }: StaffCardProps) {
  if (editingId === member.id) {
    return (
      <Card>
        <h3 className="font-semibold text-[#1a3a6b] mb-3">Edit Staff Member</h3>
        <div className="flex flex-col gap-3">
          {editError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{editError}</p>
          )}
          <Input
            label="Full Name"
            value={editForm.full_name}
            onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Select
            label="Role"
            value={editForm.role}
            onChange={e => setEditForm({ ...editForm, role: e.target.value as Role })}
          >
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
          {(editForm.role === 'area_lead' || editForm.role === 'director') && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Areas</label>
              <div className="flex flex-col gap-1.5">
                {AREAS.map(a => {
                  const checked = editForm.areas.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        const next = checked
                          ? editForm.areas.filter(x => x !== a)
                          : [...editForm.areas, a]
                        setEditForm({ ...editForm, areas: next })
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
                        checked
                          ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-[#1a3a6b]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-white border-white' : 'border-gray-300'}`}>
                        {checked && <Check size={10} className="text-[#1a3a6b]" />}
                      </div>
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={editForm.can_clock_anywhere}
              onClick={() => setEditForm({ ...editForm, can_clock_anywhere: !editForm.can_clock_anywhere })}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${editForm.can_clock_anywhere ? 'bg-[#1a3a6b]' : 'bg-gray-200'}`}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: editForm.can_clock_anywhere ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-700">Can clock in anywhere</p>
              <p className="text-xs text-gray-400">Allows clock-in from any or custom location</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => onSaveEdit(member.id)} disabled={saving} className="flex-1">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-bold text-[#1a3a6b]">{member.full_name}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <Badge color="blue">{ROLE_LABELS[member.role]}</Badge>
            {(member.areas && member.areas.length > 0 ? member.areas : member.area ? [member.area] : []).map(a => (
              <Badge key={a} color="gray">{a}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onProfile(member.id)}
            className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg"
          >
            <UserCircle size={13} /> Profile
          </button>
          {canManage && (
            <button
              onClick={() => onEdit(member)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
          {canAssignSchools && (
            <button
              onClick={() => onAssign(member)}
              className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-2.5 py-1.5 rounded-lg"
            >
              <School size={13} /> Schools
            </button>
          )}
        </div>
      </div>
      {member.assignments && member.assignments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {member.assignments.map(a => (
            <span key={a.id} className="text-xs bg-[#f4f6f9] text-gray-600 px-2 py-1 rounded-lg">
              {a.school?.name}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

export function StaffAdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isDirector = profile ? canManageStaff(profile.role) : false

  const [staff, setStaff] = useState<StaffWithAssignments[]>([])
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [assignPanel, setAssignPanel] = useState<AssignPanel | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ full_name: '', email: '', role: 'lead_coach', areas: [], can_clock_anywhere: false })
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'lead_coach' as Role })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    let profilesQuery = supabase.from('profiles').select('*').order('full_name')

    if (profile?.role === 'area_lead') {
      // Area leads see coaching staff only
      profilesQuery = profilesQuery.in('role', AREA_LEAD_VISIBLE_ROLES)
    } else if (!isDirector) {
      // Outreach, media_tech etc. — only their own record
      profilesQuery = profilesQuery.eq('id', profile?.id ?? '')
    }

    const [{ data: staffData }, { data: schoolData }] = await Promise.all([
      profilesQuery,
      supabase.from('schools').select('*').order('name'),
    ])

    const staffList = staffData ?? []
    const schoolList = schoolData ?? []
    setSchools(schoolList)

    if (staffList.length > 0) {
      const { data: assignments } = await supabase
        .from('staff_school_assignments')
        .select('*, school:schools(*)')
        .in('staff_id', staffList.map(s => s.id))

      setStaff(staffList.map(s => ({
        ...s,
        assignments: assignments?.filter(a => a.staff_id === s.id) ?? [],
      })))
    } else {
      setStaff([])
    }
    setLoading(false)
  }

  async function inviteStaff() {
    if (!form.email || !form.full_name || !form.password) return
    setSaving(true)

    // Save director's session — signUp() auto-logs-in as the new user
    const { data: { session: directorSession } } = await supabase.auth.getSession()

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    })

    if (!error && data.user) {
      // Upsert profile while new user's session is active (passes RLS)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        role: form.role,
      })
    }

    // Always restore director's session
    if (directorSession) {
      await supabase.auth.setSession({
        access_token: directorSession.access_token,
        refresh_token: directorSession.refresh_token,
      })
    }

    if (!error && data.user) {
      await loadData()
      setForm({ email: '', full_name: '', password: '', role: 'lead_coach' })
      setShowForm(false)
    }
    setSaving(false)
  }

  function startEdit(member: StaffWithAssignments) {
    setEditingId(member.id)
    setEditError(null)
    setEditForm({
      full_name: member.full_name,
      email: member.email,
      role: member.role,
      areas: Array.isArray(member.areas) && member.areas.length > 0
        ? member.areas
        : member.area ? [member.area] : [],
      can_clock_anywhere: member.can_clock_anywhere ?? false,
    })
    setAssignPanel(null)
  }

  async function saveEdit(id: string) {
    if (!editForm.full_name || !editForm.email) return
    setSaving(true)
    setEditError(null)
    const needsArea = editForm.role === 'area_lead' || editForm.role === 'director'
    const areas = needsArea ? editForm.areas : []
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name,
      email: editForm.email,
      role: editForm.role,
      area: areas[0] ?? null,
      areas: areas.length > 0 ? areas : null,
      can_clock_anywhere: editForm.can_clock_anywhere,
    }).eq('id', id)
    if (error) {
      setEditError(error.message)
      setSaving(false)
      return
    }
    await loadData()
    setEditingId(null)
    setSaving(false)
  }

  const [assignError, setAssignError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  function openAssignPanel(member: StaffWithAssignments) {
    setAssignError(null)
    setAssignPanel({
      staffId: member.id,
      staffName: member.full_name,
      selected: new Set(member.assignments?.map(a => a.school_id) ?? []),
    })
  }

  function toggleSchool(schoolId: string) {
    if (!assignPanel) return
    const next = new Set(assignPanel.selected)
    if (next.has(schoolId)) next.delete(schoolId)
    else next.add(schoolId)
    setAssignPanel({ ...assignPanel, selected: next })
  }

  async function saveAssignments() {
    if (!assignPanel) return
    setSaving(true)
    const member = staff.find(s => s.id === assignPanel.staffId)
    const currentIds = new Set(member?.assignments?.map(a => a.school_id) ?? [])

    const toAdd = [...assignPanel.selected].filter(id => !currentIds.has(id))
    const toRemove = [...currentIds].filter(id => !assignPanel.selected.has(id))

    if (toAdd.length > 0) {
      const { error } = await supabase.from('staff_school_assignments').insert(
        toAdd.map(school_id => ({ staff_id: assignPanel.staffId, school_id, is_lead: false }))
      )
      if (error) {
        setAssignError(error.message)
        setSaving(false)
        return
      }
    }
    for (const school_id of toRemove) {
      await supabase.from('staff_school_assignments').delete()
        .eq('staff_id', assignPanel.staffId).eq('school_id', school_id)
    }

    await loadData()
    setAssignPanel(null)
    setAssignError(null)
    setSaving(false)
  }

  const areaGroups = AREAS.map(area => {
    const areaSchoolIds = new Set(schools.filter(s => s.area === area).map(s => s.id))
    const areaStaff = staff.filter(m => m.assignments?.some(a => areaSchoolIds.has(a.school_id)))
    return { area, staff: areaStaff }
  })

  const unassigned = staff.filter(m => !m.assignments || m.assignments.length === 0)

  const canAssignSchools = profile?.role === 'director' || profile?.role === 'area_lead' || profile?.role === 'lead_coach'
  const cardProps = { canManage: isDirector, canAssignSchools, editingId, editForm, editError, setEditForm, setEditingId, saving, onEdit: startEdit, onAssign: openAssignPanel, onSaveEdit: saveEdit, onProfile: (id: string) => navigate(`/profile/${id}`) }

  return (
    <Layout title="Staff" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        {isDirector && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Add Staff Member
          </Button>
        )}

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New Staff Member</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Full Name"
                placeholder="e.g. John Smith"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Temporary Password"
                type="password"
                placeholder="Set a temporary password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <Select
                label="Role"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as Role })}
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={inviteStaff} disabled={saving} className="flex-1">
                  {saving ? 'Creating…' : 'Create Account'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {assignPanel && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-1">Assign Schools</h3>
            <p className="text-sm text-gray-500 mb-3">{assignPanel.staffName}</p>
            <div className="flex flex-col gap-1 mb-4 max-h-72 overflow-y-auto">
              {AREAS.map(area => {
                const areaSchools = schools.filter(s => s.area === area)
                if (areaSchools.length === 0) return null
                return (
                  <div key={area}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 py-2">{area}</p>
                    {areaSchools.map(s => (
                      <button
                        key={s.id}
                        onClick={() => toggleSchool(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 transition-colors ${
                          assignPanel.selected.has(s.id)
                            ? 'bg-[#1a3a6b] text-white'
                            : 'bg-[#f4f6f9] text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className={`text-xs ${assignPanel.selected.has(s.id) ? 'text-white/70' : 'text-gray-400'}`}>
                            {s.session_day} · {s.session_time}
                          </p>
                        </div>
                        {assignPanel.selected.has(s.id) && <Check size={16} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                )
              })}
              {schools.filter(s => !s.area || !AREAS.includes(s.area)).map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSchool(s.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 transition-colors ${
                    assignPanel.selected.has(s.id)
                      ? 'bg-[#1a3a6b] text-white'
                      : 'bg-[#f4f6f9] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium">{s.name}</span>
                  {assignPanel.selected.has(s.id) && <Check size={16} className="shrink-0" />}
                </button>
              ))}
            </div>
            {assignError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-2">{assignError}</p>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAssignPanel(null)} className="flex-1">Cancel</Button>
              <Button onClick={saveAssignments} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : `Save (${assignPanel.selected.size} school${assignPanel.selected.size !== 1 ? 's' : ''})`}
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : staff.length === 0 ? (
          <Card className="text-center py-8">
            <Users size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No staff members yet.</p>
          </Card>
        ) : (
          <>
            {areaGroups.map(({ area, staff: areaStaff }) => {
              if (areaStaff.length === 0) return null
              return (
                <div key={area}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{area}</p>
                  <div className="flex flex-col gap-3">
                    {areaStaff.map(m => <StaffCard key={m.id} member={m} {...cardProps} />)}
                  </div>
                </div>
              )
            })}
            {unassigned.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">No Schools Assigned</p>
                <div className="flex flex-col gap-3">
                  {unassigned.map(m => <StaffCard key={m.id} member={m} {...cardProps} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
