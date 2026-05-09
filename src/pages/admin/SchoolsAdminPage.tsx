import { useState, useEffect } from 'react'
import { Plus, Trash2, School as SchoolIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { School } from '../../types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function SchoolsAdminPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', session_day: 'Monday', session_time: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSchools() }, [])

  async function loadSchools() {
    const { data } = await supabase.from('schools').select('*').order('name')
    if (data) setSchools(data)
    setLoading(false)
  }

  async function addSchool() {
    if (!form.name || !form.address || !form.session_time) return
    setSaving(true)
    const { error } = await supabase.from('schools').insert(form)
    if (!error) {
      await loadSchools()
      setForm({ name: '', address: '', session_day: 'Monday', session_time: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteSchool(id: string) {
    if (!confirm('Remove this school? This cannot be undone.')) return
    await supabase.from('schools').delete().eq('id', id)
    setSchools(prev => prev.filter(s => s.id !== id))
  }

  return (
    <Layout title="Schools" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add School
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">New School</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="School Name"
                placeholder="e.g. St Mary's Primary"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="e.g. Hackney, East London"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Session Day</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                  value={form.session_day}
                  onChange={e => setForm({ ...form, session_day: e.target.value })}
                >
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <Input
                label="Session Time"
                placeholder="e.g. 15:30 – 16:30"
                value={form.session_time}
                onChange={e => setForm({ ...form, session_time: e.target.value })}
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
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
          schools.map(school => (
            <Card key={school.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a3a6b]">{school.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{school.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {school.session_day} · {school.session_time}
                  </p>
                </div>
                <button
                  onClick={() => deleteSchool(school.id)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  )
}
