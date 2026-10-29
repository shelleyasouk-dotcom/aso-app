import { useState, useEffect } from 'react'
import { X, Mail, Check } from 'lucide-react'
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase'

const DISMISS_KEY = 'newsletter_popup_dismissed_until_v1'
const SUBSCRIBED_KEY = 'newsletter_popup_subscribed_v1'
const SHOW_AFTER_MS = 6000
const RESHOW_AFTER_DAYS = 30

export function NewsletterSignupPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
    if (dismissedUntil && Date.now() < dismissedUntil) return
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setVisible(false)
    const until = Date.now() + RESHOW_AFTER_DAYS * 24 * 60 * 60 * 1000
    try { localStorage.setItem(DISMISS_KEY, String(until)) } catch { /* ignore */ }
  }

  async function submit() {
    if (!email.trim()) return
    setStatus('saving')
    setError('')
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/brevo-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('done')
      try { localStorage.setItem(SUBSCRIBED_KEY, '1') } catch { /* ignore */ }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0" onClick={dismiss}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-gray-500 rounded-lg" aria-label="Close">
          <X size={18} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-green-600" />
            </div>
            <p className="font-bold text-[#1a3a6b] text-lg">You're on the list!</p>
            <p className="text-sm text-gray-500 mt-1">Keep an eye on your inbox for news, new clubs and offers.</p>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 bg-[#1a3a6b]/10 rounded-2xl flex items-center justify-center mb-3">
              <Mail size={20} className="text-[#1a3a6b]" />
            </div>
            <p className="font-bold text-[#1a3a6b] text-lg leading-tight">Stay in the loop</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Get news, new club launches and offers from Active School straight to your inbox.
            </p>
            <div className="flex flex-col gap-2.5">
              <input
                type="text"
                placeholder="First name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
              />
              {status === 'error' && <p className="text-xs text-red-600">{error}</p>}
              <button
                onClick={submit}
                disabled={status === 'saving' || !email.trim()}
                className="w-full bg-[#1a3a6b] text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60"
              >
                {status === 'saving' ? 'Signing up…' : 'Sign me up'}
              </button>
              <button onClick={dismiss} className="text-xs text-gray-400 text-center">No thanks</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
