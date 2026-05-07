import { useState, useEffect } from 'react'
import { Plus, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import type { Child, School } from '../../types'

interface ChildWithSchool extends Child {
  school?: School
}

export function ChildrenAdminPage() {
  const [children, setChildren] = useState<ChildWithSchool[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', school_id: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterSchool, setFilterSchool] = useState('')

  useEffect(() => {
    loadSchools()
  }, [])

  useEffect(() => {
    loadChildren()
  }, [filterSchool])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('name')
    if (data) {
      setSchools(data)
      if (data.length === 1) setForm(f => ({ ...f, school_id: data[0].id }))
    }
  }

  async function loadChildren() {
    let query = supabase
      .from('children')
      .select('*, school:schools(*)')
      .order('full_name')

    if (filterSchool) query = query.eq('school_id', filterSchool)

    const { data } = await query
    if (data) setChildren(data)
    setLoading(false)
  }

  async function addChild() {
    if (!form.full_name || !form.school_id) return
    setSaving(true)
    const { error } = await supabase.from('children').insert({
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || null,
      school_id: form.school_id,
      is_active: true,
    })
    if (!error) {
      await loadChildren()
      setForm({ full_name: '', date_of_birth: '', school_id: schools.length === 1 ? schools[0].id : '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function toggleActive(child: ChildWithSchool) {
    await supabase.from('children').update({ is_active: !child.is_active }).eq('id', child.id)
    setChildren(prev => prev.map(c => c.id === child.id ? { ...c, is_active: !c.is_active } : c))
  }

  return (
    <Layout title="Children" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Child
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New Child</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Full Name"
                placeholder="e.g. Emma Johnson"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label="Date of Birth (optional)"
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
              />
              <Select
                label="School"
                value={form.school_id}
                onChange={e => setForm({ ...form, school_id: e.target.value })}
              >
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addChild} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Add Child'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* School filter */}
        <Select
          value={filterSchool}
          onChange={e => setFilterSchool(e.target.value)}
        >
          <option value="">All Schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : children.length === 0 ? (
          <Card className="text-center py-8">
            <BookOpen size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No children registered yet.</p>
          </Card>
        ) : (
          children.map(child => (
            <Card key={child.id}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">
                    {child.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a3a6b] truncate">{child.full_name}</p>
                  <p className="text-xs text-gray-400">{child.school?.name}</p>
                  {child.date_of_birth && (
                    <p className="text-xs text-gray-400">
                      {new Date(child.date_of_birth).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={child.is_active ? 'green' : 'gray'}>
                    {child.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => toggleActive(child)}
                    className="text-gray-400 hover:text-[#1a3a6b] p-1"
                  >
                    {child.is_active
                      ? <ToggleRight size={20} className="text-green-500" />
                      : <ToggleLeft size={20} />
                    }
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
