import { useEffect, useState } from 'react'
import { Award, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import type { Award as AwardType, Discipline } from '../../types'

export function AwardsPage() {
  const { profile } = useAuth()
  const [awards, setAwards] = useState<AwardType[]>([])
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => { loadAwards() }, [])

  async function loadAwards() {
    const { data } = await supabase.from('awards').select('*').order('discipline').order('level')
    setAwards(data ?? [])
    setLoading(false)
  }

  const filtered = disciplineFilter === 'all' ? awards : awards.filter(a => a.discipline === disciplineFilter)

  const byDiscipline = filtered.reduce<Record<string, AwardType[]>>((acc, award) => {
    const key = award.discipline
    if (!acc[key]) acc[key] = []
    acc[key].push(award)
    return acc
  }, {})

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Awards Programme</h1>
            <p className="text-gray-500 text-sm mt-0.5">UKAG recreational gymnastics and trampolining awards</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-ukag-600 hover:bg-ukag-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={16} /> Add Award
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(['all', 'gymnastics', 'trampolining', 'both'] as const).map(d => (
            <button key={d} onClick={() => setDisciplineFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                disciplineFilter === d
                  ? 'bg-ukag-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-ukag-300'
              }`}>
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-ukag-600" /></div>
        ) : Object.keys(byDiscipline).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Award size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No awards defined yet</p>
            {isAdmin && <p className="text-sm mt-1">Use the Add Award button to create the awards framework.</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byDiscipline).map(([discipline, disciplineAwards]) => (
              <div key={discipline}>
                <h2 className="text-base font-semibold text-gray-900 mb-3 capitalize">{discipline}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {disciplineAwards.map(award => (
                    <div key={award.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                          discipline === 'gymnastics' ? 'bg-purple-100 text-purple-700' :
                          discipline === 'trampolining' ? 'bg-blue-100 text-blue-700' :
                          'bg-ukag-100 text-ukag-700'
                        }`}>
                          {award.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{award.name}</div>
                          {award.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{award.description}</p>
                          )}
                          {award.requirements && (
                            <details className="mt-2">
                              <summary className="text-xs text-ukag-600 cursor-pointer hover:text-ukag-800">View requirements</summary>
                              <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-line">{award.requirements}</p>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && isAdmin && (
        <AddAwardModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); loadAwards() }} />
      )}
    </Layout>
  )
}

function AddAwardModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', discipline: 'gymnastics' as Discipline, level: 1,
    description: '', requirements: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const { error } = await supabase.from('awards').insert(form)
    if (error) { setError(error.message); setSaving(false) }
    else onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Add Award</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" placeholder="e.g. Gymnastics Proficiency Award Level 1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
              <select value={form.discipline} onChange={e => setForm(f => ({ ...f, discipline: e.target.value as Discipline }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500">
                <option value="gymnastics">Gymnastics</option>
                <option value="trampolining">Trampolining</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <input type="number" min="1" max="10" value={form.level} onChange={e => setForm(f => ({ ...f, level: +e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea rows={3} value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="Skills and criteria to achieve this award…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 resize-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Saving…' : 'Add Award'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
