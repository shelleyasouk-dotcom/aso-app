import { useState, useEffect } from 'react'
import { Phone, PhoneIncoming, Check, Clock, Inbox } from 'lucide-react'
import { supabase, supabaseUrl } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

interface PhoneMessage {
  id: string
  call_sid: string
  from_number: string | null
  to_number: string | null
  recording_url: string | null
  recording_duration_seconds: number | null
  transcription: string | null
  status: 'new' | 'handled'
  handled_by: string | null
  handled_at: string | null
  received_at: string
  handler?: { full_name: string } | null
}

function formatDuration(seconds: number | null) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PhoneMessagesPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<PhoneMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'new' | 'all'>('new')
  const [handling, setHandling] = useState<string | null>(null)
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('phone_messages')
      .select('*, handler:profiles!handled_by(full_name)')
      .order('received_at', { ascending: false })
    const msgs = (data ?? []) as PhoneMessage[]
    setMessages(msgs)
    setLoading(false)
    msgs.forEach(m => { if (m.recording_url) loadAudio(m.id) })
  }

  async function loadAudio(id: string) {
    setAudioUrls(prev => (prev[id] ? prev : { ...prev, [id]: '' }))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/twilio-audio?id=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const blob = await res.blob()
      setAudioUrls(prev => ({ ...prev, [id]: URL.createObjectURL(blob) }))
    } catch {
      // leave unset — player stays hidden for this message
    }
  }

  async function markHandled(id: string) {
    if (!profile) return
    setHandling(id)
    const { error } = await supabase.from('phone_messages').update({
      status: 'handled',
      handled_by: profile.id,
      handled_at: new Date().toISOString(),
    }).eq('id', id)
    if (!error) await load()
    setHandling(null)
  }

  const newCount = messages.filter(m => m.status === 'new').length
  const visible = filter === 'new' ? messages.filter(m => m.status === 'new') : messages

  return (
    <Layout title="Phone Messages" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4 pb-8 max-w-2xl mx-auto w-full">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIncoming size={20} className="text-[#1a3a6b]" />
            <h1 className="text-xl font-extrabold text-gray-900">Phone Messages</h1>
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 -mt-2">Voicemails left on the main enquiry line</p>

        <div className="flex gap-2">
          {(['new', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-[#1a3a6b] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {f === 'new' ? 'New' : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {filter === 'new' ? "No new messages — you're all caught up." : 'No messages yet.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map(m => (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border p-4 flex flex-col gap-3 ${
                  m.status === 'new' ? 'border-[#1a3a6b]/30 shadow-sm' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#f4f6f9] rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[#1a3a6b]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{m.from_number ?? 'Unknown number'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(m.received_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {m.recording_duration_seconds ? ` · ${formatDuration(m.recording_duration_seconds)}` : ''}
                      </p>
                    </div>
                  </div>
                  {m.status === 'handled' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">
                      <Check size={11} /> Dealt with
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full shrink-0">
                      <Clock size={11} /> New
                    </span>
                  )}
                </div>

                {m.transcription && (
                  <p className="text-sm text-gray-700 bg-[#f4f6f9] rounded-xl px-3 py-2 leading-snug">
                    "{m.transcription}"
                  </p>
                )}

                {m.recording_url && (
                  audioUrls[m.id] ? (
                    <audio controls className="w-full h-10" src={audioUrls[m.id]} />
                  ) : (
                    <p className="text-xs text-gray-400">Loading recording…</p>
                  )
                )}

                {m.status === 'handled' ? (
                  <p className="text-xs text-gray-400">
                    Dealt with by {m.handler?.full_name ?? 'someone'}
                    {m.handled_at && ` · ${new Date(m.handled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                  </p>
                ) : (
                  <button
                    onClick={() => markHandled(m.id)}
                    disabled={handling === m.id}
                    className="flex items-center justify-center gap-1.5 bg-[#1a3a6b] text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60"
                  >
                    <Check size={14} /> {handling === m.id ? 'Saving…' : "I've dealt with this"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
