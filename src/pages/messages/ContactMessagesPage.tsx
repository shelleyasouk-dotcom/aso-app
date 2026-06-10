import { useState, useEffect } from 'react'
import { Mail, Phone, Clock, CheckCircle, ChevronDown, ChevronUp, Inbox } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  enquiry_type: string
  message: string
  is_read: boolean
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  partnership: '🏫 Partnership',
  parent:      '👨‍👩‍👧 Parent / Guardian',
  careers:     '🏃 Work With Us',
  general:     '💬 General',
  summer_camp: '☀️ Summer Camp',
}

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages((data ?? []) as ContactMessage[])
    setLoading(false)
  }

  async function markRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  async function markUnread(id: string) {
    await supabase.from('contact_messages').update({ is_read: false }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: false } : m))
  }

  async function markAllRead() {
    await supabase.from('contact_messages').update({ is_read: true }).eq('is_read', false)
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
  }

  function toggle(id: string) {
    setExpanded(v => v === id ? null : id)
    const msg = messages.find(m => m.id === id)
    if (msg && !msg.is_read) markRead(id)
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <Layout title="Contact Messages">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Inbox size={20} className="text-[#1a3a6b]" />
              <h1 className="text-xl font-extrabold text-gray-900">Contact Messages</h1>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <p className="text-sm text-gray-500">Messages submitted via the website contact form</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-[#1a3a6b] hover:underline">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No messages yet — they'll appear here when someone submits the contact form.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border transition-all ${
                  msg.is_read ? 'border-gray-100' : 'border-[#1a3a6b]/30 shadow-sm'
                }`}
              >
                {/* Row */}
                <button
                  onClick={() => toggle(msg.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left"
                >
                  {!msg.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[#1a3a6b] mt-2 shrink-0" />
                  )}
                  <div className={`flex-1 min-w-0 ${msg.is_read ? '' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{msg.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {TYPE_LABELS[msg.enquiry_type] ?? msg.enquiry_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.email}</p>
                    {expanded !== msg.id && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{msg.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-gray-300">
                      {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {expanded === msg.id ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded */}
                {expanded === msg.id && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-[#1a3a6b]" />
                        <a href={`mailto:${msg.email}`} className="text-[#1a3a6b] hover:underline font-medium">{msg.email}</a>
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-[#1a3a6b]" />
                          <a href={`tel:${msg.phone}`} className="text-[#1a3a6b] hover:underline font-medium">{msg.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(msg.created_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${msg.email}?subject=Re: Your enquiry to Active School`}
                        className="inline-flex items-center gap-1.5 bg-[#1a3a6b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#142f58] transition-colors"
                      >
                        <Mail size={12} /> Reply by email
                      </a>
                      {msg.is_read ? (
                        <button
                          onClick={() => markUnread(msg.id)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          Mark unread
                        </button>
                      ) : (
                        <button
                          onClick={() => markRead(msg.id)}
                          className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={12} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
