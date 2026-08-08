import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

interface Newsletter {
  id: string
  title: string
  brevo_campaign_id: string | null
  preview_url: string | null
  sent_at: string | null
  created_at: string
}

export function NewsletterAdminPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', preview_url: '', sent_at: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .order('sent_at', { ascending: false, nullsFirst: false })
    setNewsletters((data ?? []) as Newsletter[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function syncFromBrevo() {
    setSyncing(true)
    setSyncMsg(null)
    const { data, error } = await supabase.functions.invoke('sync-brevo-newsletters')
    if (error) {
      setSyncMsg('Sync failed: ' + error.message)
    } else {
      setSyncMsg(`Synced ${data?.synced ?? 0} campaign${data?.synced !== 1 ? 's' : ''} from Brevo.`)
      load()
    }
    setSyncing(false)
  }

  async function addManual() {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('newsletters').insert({
      title: form.title.trim(),
      preview_url: form.preview_url.trim() || null,
      sent_at: form.sent_at || null,
    })
    setForm({ title: '', preview_url: '', sent_at: '' })
    setShowAdd(false)
    setSaving(false)
    load()
  }

  async function deleteNewsletter(id: string) {
    if (!confirm('Remove this newsletter?')) return
    await supabase.from('newsletters').delete().eq('id', id)
    load()
  }

  return (
    <Layout title="Newsletters">
      <div className="px-4 pt-5 pb-10 max-w-3xl mx-auto flex flex-col gap-5">

        <p className="text-sm text-gray-400">
          Sync your Brevo email campaigns to show a newsletter archive on the website, or add them manually.
        </p>

        {/* Brevo sync */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <p className="font-bold text-blue-900 text-sm">Sync from Brevo</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Automatically pulls your sent email campaigns from Brevo. Requires <code className="bg-blue-100 px-1 rounded">BREVO_API_KEY</code> set in Supabase Edge Function secrets.
            </p>
          </div>
          {syncMsg && (
            <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${syncMsg.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {syncMsg}
            </p>
          )}
          <Button variant="primary" size="sm" onClick={syncFromBrevo} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        </div>

        {/* Manual add */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Newsletter Archive</p>
            <button
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-[#1a3a6b] hover:underline"
            >
              <Plus size={13} /> Add manually
            </button>
          </div>

          {showAdd && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 mb-4">
              <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. ASO Summer Newsletter 2026" />
              <Input label="View in browser URL (from Brevo)" value={form.preview_url} onChange={e => setForm(f => ({ ...f, preview_url: e.target.value }))} placeholder="https://..." type="url" />
              <Input label="Date sent" value={form.sent_at} onChange={e => setForm(f => ({ ...f, sent_at: e.target.value }))} type="date" />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={addManual} disabled={saving}>Save</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : newsletters.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No newsletters yet. Sync from Brevo or add manually.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {newsletters.map(n => (
                <div key={n.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.sent_at
                        ? new Date(n.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Date unknown'
                      }
                      {n.brevo_campaign_id && <span className="ml-2 text-blue-400">· Brevo #{n.brevo_campaign_id}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n.preview_url && (
                      <a href={n.preview_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <ExternalLink size={15} className="text-[#1a3a6b]" />
                      </a>
                    )}
                    <button onClick={() => deleteNewsletter(n.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
