import { useState, useEffect } from 'react'
import { Plus, Trash2, Users, School } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import type { Profile, School as SchoolType, Role, StaffSchoolAssignment } from '../../types'
import { ROLE_LABELS } from '../../lib/roles'

const ROLES: Role[] = ['director', 'area_lead', 'lead_coach', 'assistant_coach', 'junior_coach']

interface StaffWithAssignments extends Profile {
  assignments?: (StaffSchoolAssignment & { school?: SchoolType })[]
}

export function StaffAdminPage() {
  const [staff, setStaff] = useState<StaffWithAssignments[]>([])
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [assignForm, setAssignForm] = useState<{ staffId: string; schoolId: string } | null>(null)
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'lead_coach' as Role })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

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
    }
    setLoading(false)
  }

  async function inviteStaff() {
    if (!form.email || !form.full_name || !form.password) return
    setSaving(true)

    // Create auth user (in production use Supabase Admin API or invite flow)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: form.role },
      },
    })

    if (!error && data.user) {
      // Upsert profile
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

  async function assignToSchool() {
    if (!assignForm) return
    setSaving(true)
    await supabase.from('staff_school_assignments').upsert({
      staff_id: assignForm.staffId,
      school_id: assignForm.schoolId,
    })
    await loadData()
    setAssignForm(null)
    setSaving(false)
  }

  async function removeAssignment(staffId: string, schoolId: string) {
    await supabase
      .from('staff_school_assignments')
      .delete()
      .eq('staff_id', staffId)
      .eq('school_id', schoolId)
    await loadData()
  }

  return (
    <Layout title="Staff" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Staff Member
        </Button>

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
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={inviteStaff} disabled={saving} className="flex-1">
                  {saving ? 'Creating…' : 'Create Account'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {assignForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-3">Assign to School</h3>
            <Select
              label="School"
              value={assignForm.schoolId}
              onChange={e => setAssignForm({ ...assignForm, schoolId: e.target.value })}
            >
              <option value="">Select a school…</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" onClick={() => setAssignForm(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={assignToSchool} disabled={saving || !assignForm.schoolId} className="flex-1">
                {saving ? 'Assigning…' : 'Assign'}
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
          staff.map(member => (
            <Card key={member.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-[#1a3a6b]">{member.full_name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <Badge color="blue" >{ROLE_LABELS[member.role]}</Badge>
                </div>
                <button
                  onClick={() => setAssignForm({ staffId: member.id, schoolId: '' })}
                  className="flex items-center gap-1 text-xs font-medium text-[#1a3a6b] bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <School size={13} /> Assign
                </button>
              </div>

              {member.assignments && member.assignments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {member.assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-[#f4f6f9] rounded-xl px-3 py-2">
                      <span className="text-sm text-gray-700">{a.school?.name}</span>
                      <button
                        onClick={() => removeAssignment(member.id, a.school_id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
