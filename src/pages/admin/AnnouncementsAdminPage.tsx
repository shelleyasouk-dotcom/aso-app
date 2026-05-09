import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Pin, Megaphone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { Announcement } from '../../types'

const AREAS = ['Hampshire', 'Wiltshire', 'Dorset', 'Bath and North East Somerset', 'Oxfordshire']

type AnnouncementForm = {
  title: string
  body: string
  link_url: string
  link_label: string
  area: string
  is_pinned: boolean
}

const emptyForm: AnnouncementForm = {
  title: '',
  body: '',
  link_url: '',
  link_label: '',
  area: '',
  is_pinned: false,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function AnnouncementsAdminPage() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('announcements')
      .select('*, author:profiles!created_by(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setLoading(false)
  }

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      area: form.area || null,
      is_pinned: form.is_pinned,
      created_by: profile!.id,
    }
    if (editingId) {
      await supabase.from('announcements').update(payload).eq('id', editingId)
    } else {
      await supabase.from('announcements').insert(payload)
    }
    await load()
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      body: a.body ?? '',
      link_url: a.link_url ?? '',
      link_label: a.link_label ?? '',
      area: a.area ?? '',
      is_pinned: a.is_pinned,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function togglePin(a: Announcement) {
    await supabase.from('announcements').update({ is_pinned: !a.is_pinned }).eq('id', a.id)
    await load()
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <Layout title="Announcements" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={() => { cancelForm(); setShowForm(s => !s) }}>
          <Plus size={20} /> New Announcement
        </Button>

        {showForm && (
          <Card>
            <h3 className="font-semibold text-[#1a3a6b] mb-4">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Title"
                placeholder="e.g. Updated Staff Handbook"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Message (optional)</label>
                <textarea
                  rows={4}
                  placeholder="Write your message here…"
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none"
                />
              </div>
              <Input
                label="Link URL (optional)"
                placeholder="https://…"
                value={form.link_url}
                onChange={e => setForm({ ...form, link_url: e.target.value })}
              />
              {form.link_url && (
                <Input
                  label="Link Button Label"
                  placeholder="e.g. View Staff Handbook"
                  value={form.link_label}
                  onChange={e => setForm({ ...form, link_label: e.target.value })}
                />
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Audience</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                >
                  <option value="">All Staff</option>
                  {AREAS.map(a => <option key={a} value={a}>{a} only</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                    form.is_pinned ? 'bg-[#1a3a6b]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.is_pinned ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Pin to top</span>
              </label>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={cancelForm} className="flex-1">Cancel</Button>
                <Button onClick={save} disabled={saving || !form.title.trim()} className="flex-1">
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Post'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : announcements.length === 0 ? (
          <Card className="text-center py-8">
            <Megaphone size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No announcements yet.</p>
          </Card>
        ) : (
          announcements.map(a => (
            <Card key={a.id} className={a.is_pinned ? 'border border-amber-300 bg-amber-50' : ''}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {a.is_pinned && <Pin size={13} className="text-amber-500 shrink-0" />}
                    <p className="font-bold text-[#1a3a6b]">{a.title}</p>
                  </div>
                  {a.body && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.body}</p>}
                  {a.link_url && (
                    <a
                      href={a.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm font-medium text-[#1a3a6b] underline"
                    >
                      {a.link_label || a.link_url}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {timeAgo(a.created_at)}
                    {a.area ? ` · ${a.area}` : ' · All Staff'}
                    {(a as any).author?.full_name ? ` · ${(a as any).author.full_name}` : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => togglePin(a)}
                    className={`p-1.5 rounded-lg transition-colors ${a.is_pinned ? 'text-amber-500 bg-amber-100' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={a.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={15} />
                  </button>
                  <button
                    onClick={() => startEdit(a)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
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
