import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, School as SchoolIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School } from '../../types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']

type SchoolForm = { name: string; address: string; area: string; session_day: string; session_time: string }

const emptyForm: SchoolForm = { name: '', address: '', area: 'Hampshire', session_day: 'Monday', session_time: '' }

function sortByDay(schools: School[]): School[] {
  return [...schools].sort((a, b) => DAYS.indexOf(a.session_day) - DAYS.indexOf(b.session_day))
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"

export function SchoolsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<SchoolForm>(emptyForm)
  const [editForm, setEditForm] = useState<SchoolForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSchools() }, [])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('name')
    if (data) setSchools(sortByDay(data))
    setLoading(false)
  }

  async function addSchool() {
    if (!addForm.name || !addForm.address || !addForm.session_time) return
    setSaving(true)
    const { error } = await supabase.from('schools').insert(addForm)
    if (!error) {
      await loadSchools()
      setAddForm(emptyForm)
      setShowAddForm(false)
    }
    setSaving(false)
  }

  function startEdit(school: School) {
    setEditingId(school.id)
    setEditForm({
      name: school.name,
      address: school.address,
      area: school.area || 'Hampshire',
      session_day: school.session_day,
      session_time: school.session_time,
    })
  }

  async function saveEdit(id: string) {
    if (!editForm.name || !editForm.address || !editForm.session_time) return
    setSaving(true)
    const { error } = await supabase.from('schools').update(editForm).eq('id', id)
    if (!error) {
      await loadSchools()
      setEditingId(null)
    }
    setSaving(false)
  }

  async function deleteSchool(id: string) {
    if (!confirm('Remove this school? This cannot be undone.')) return
    await supabase.from('schools').delete().eq('id', id)
    setSchools(prev => prev.filter(s => s.id !== id))
  }

  function SchoolFormFields({ form, set }: { form: SchoolForm; set: (f: SchoolForm) => void }) {
    return (
      <>
        <Input
          label="School Name"
          placeholder="e.g. St Mary's Primary"
          value={form.name}
          onChange={e => set({ ...form, name: e.target.value })}
        />
        <Input
          label="Location"
          placeholder="e.g. Andover, Hampshire"
          value={form.address}
          onChange={e => set({ ...form, address: e.target.value })}
        />
        <FieldGroup label="Area">
          <select className={selectClass} value={form.area} onChange={e => set({ ...form, area: e.target.value })}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </FieldGroup>
        <FieldGroup label="Session Day">
          <select className={selectClass} value={form.session_day} onChange={e => set({ ...form, session_day: e.target.value })}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FieldGroup>
        <Input
          label="Session Time"
          placeholder="e.g. 15:30 – 16:30"
          value={form.session_time}
          onChange={e => set({ ...form, session_time: e.target.value })}
        />
      </>
    )
  }

  return (
    <Layout title="Schools" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> Add School
        </Button>

        {showAddForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New School</h3>
            <div className="flex flex-col gap-3">
              <SchoolFormFields form={addForm} set={setAddForm} />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={addSchool} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Save School'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : schools.length === 0 ? (
          <Card className="text-center py-8">
            <SchoolIcon size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No schools added yet.</p>
          </Card>
        ) : (
          DAYS.map(day => {
            const daySchools = schools.filter(s => s.session_day === day)
            if (daySchools.length === 0) return null
            return (
              <div key={day}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{day}</p>
                <div className="flex flex-col gap-3">
                  {daySchools.map(school => (
                    <Card key={school.id}>
                      {editingId === school.id ? (
                        <div className="flex flex-col gap-3">
                          <h3 className="font-semibold text-[#1a3a6b]">Edit School</h3>
                          <SchoolFormFields form={editForm} set={setEditForm} />
                          <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
                            <Button onClick={() => saveEdit(school.id)} disabled={saving} className="flex-1">
                              {saving ? 'Saving…' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1a3a6b]">{school.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{school.address}</p>
                            {school.area && <p className="text-xs text-[#1a3a6b]/60 font-medium mt-0.5">{school.area}</p>}
                            <p className="text-xs text-gray-400 mt-1">{school.session_time}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(school)}
                              className="p-2 rounded-xl text-[#1a3a6b] hover:bg-blue-50 active:bg-blue-100 transition-colors"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              onClick={() => deleteSchool(school.id)}
                              className="p-2 rounded-xl text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
