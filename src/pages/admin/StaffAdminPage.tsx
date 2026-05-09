import { useState, useEffect } from 'react'
import { Plus, Users, School, Check, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import type { Profile, School as SchoolType, Role, StaffSchoolAssignment } from '../../types'
import { ROLE_LABELS, canManageStaff } from '../../lib/roles'

const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']
const ROLES: Role[] = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach']

interface StaffWithAssignments extends Profile {
  assignments?: (StaffSchoolAssignment & { school?: SchoolType })[]
}

interface AssignPanel {
  staffId: string
  staffName: string
  selected: Set<string>
}

export function StaffAdminPage() {
  const { profile } = useAuth()
  const isDirector = profile ? canManageStaff(profile.role) : false

  const [staff, setStaff] = useState<StaffWithAssignments[]>([])
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [assignPanel, setAssignPanel] = useState<AssignPanel | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: 'lead_coach' as Role, area: '' })
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'lead_coach' as Role })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: staffData }, { data: schoolData }] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
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
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        role: form.role,
      })
      await loadData()
      setForm({ email: '', full_name: '', password: '', role: 'lead_coach' })
      setShowForm(false)
    }
    setSaving(false)
  }

  function startEdit(member: StaffWithAssignments) {
    setEditingId(member.id)
    setEditForm({ full_name: member.full_name, email: member.email, role: member.role, area: member.area ?? '' })
    setAssignPanel(null)
  }

  async function saveEdit(id: string) {
    if (!editForm.full_name || !editForm.email) return
    setSaving(true)
    const needsArea = editForm.role === 'area_lead' || editForm.role === 'director'
    await supabase.from('profiles').update({
      full_name: editForm.full_name,
      email: editForm.email,
      role: editForm.role,
      area: needsArea ? (editForm.area || null) : null,
    }).eq('id', id)
    await loadData()
    setEditingId(null)
    setSaving(false)
  }

  function openAssignPanel(member: StaffWithAssignments) {
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
      await supabase.from('staff_school_assignments').insert(
        toAdd.map(school_id => ({ staff_id: assignPanel.staffId, school_id }))
      )
    }
    for (const school_id of toRemove) {
      await supabase.from('staff_school_assignments').delete()
        .eq('staff_id', assignPanel.staffId).eq('school_id', school_id)
    }

    await loadData()
    setAssignPanel(null)
    setSaving(false)
  }

  // Build area groups: each area → staff who have assignments in that area
  const areaGroups = AREAS.map(area => {
    const areaSchoolIds = new Set(schools.filter(s => s.area === area).map(s => s.id))
    const areaStaff = staff.filter(m =>
      m.assignments?.some(a => areaSchoolIds.has(a.school_id))
    )
    return { area, staff: areaStaff }
  })

  // Staff with no school assignments (show at bottom)
  const unassigned = staff.filter(m => !m.assignments || m.assignments.length === 0)

  function StaffCard({ member }: { member: StaffWithAssignments }) {
    if (editingId === member.id) {
      return (
        <Card>
          <h3 className="font-semibold text-[#1a3a6b] mb-3">Edit Staff Member</h3>
          <div className="flex flex-col gap-3">
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Area</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                  value={editForm.area}
                  onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                >
                  <option value="">No area assigned</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
              <Button onClick={() => saveEdit(member.id)} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card key={member.id}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-bold text-[#1a3a6b]">{member.full_name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <Badge color="blue">{ROLE_LABELS[member.role]}</Badge>
              {member.area && <Badge color="gray">{member.area}</Badge>}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => startEdit(member)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={() => openAssignPanel(member)}
              className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-2.5 py-1.5 rounded-lg"
            >
              <School size={13} /> Schools
            </button>
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

        {/* Multi-school assignment panel */}
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
              {/* Schools with no area set */}
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
                    {areaStaff.map(m => <StaffCard key={m.id} member={m} />)}
                  </div>
                </div>
              )
            })}

            {unassigned.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">No Schools Assigned</p>
                <div className="flex flex-col gap-3">
                  {unassigned.map(m => <StaffCard key={m.id} member={m} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
