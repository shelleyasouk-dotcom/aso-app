import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [status, setStatus] = useState<'verifying' | 'ready' | 'expired' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // ── 1. PKCE flow: URL has ?code=... ──────────────────────────────────
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled) {
          if (error) { setStatus('expired'); setErrorMsg(error.message) }
          else setStatus('ready')
        }
        return
      }

      // ── 2. Implicit flow: hash has #access_token=...&type=recovery ────────
      const hash = window.location.hash
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        // Supabase client processes the hash automatically via detectSessionInUrl.
        // Wait briefly for onAuthStateChange to fire.
        const timeout = setTimeout(() => {
          if (!cancelled) setStatus('expired')
        }, 8000)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled) return
          if (event === 'PASSWORD_RECOVERY' && session) {
            clearTimeout(timeout)
            setStatus('ready')
          }
          if (event === 'SIGNED_IN' && session) {
            clearTimeout(timeout)
            setStatus('ready')
          }
        })

        return () => {
          cancelled = true
          clearTimeout(timeout)
          subscription.unsubscribe()
        }
      }

      // ── 3. Already have a live session (user navigated back to the page) ──
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled) {
        if (session) setStatus('ready')
        else setStatus('expired')
      }
    }

    init()
    return () => { cancelled = true }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (newPassword.length < 8) { setFormError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setFormError('Passwords do not match'); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setFormError(error.message)
      setSaving(false)
    } else {
      setStatus('success')
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a3a6b] flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <img src="/logo white.png" alt="ASO" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h1 className="text-white text-2xl font-bold">Active School Organisation</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle size={44} className="text-green-500" />
            <p className="font-bold text-gray-800 text-lg">Password updated!</p>
            <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
          </div>
        )}

        {(status === 'expired' || status === 'error') && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle size={44} className="text-amber-500" />
            <p className="font-bold text-gray-800 text-lg">Link expired or invalid</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              This reset link has expired or already been used.
              {errorMsg && <><br /><span className="text-xs text-gray-400 mt-1 block">{errorMsg}</span></>}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mt-1">
              Please return to sign in and request a new reset link.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 bg-[#1a3a6b] text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              Back to sign in
            </button>
          </div>
        )}

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Verifying reset link…</p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center shrink-0">
                <KeyRound size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-[#1a3a6b]">Set New Password</p>
                <p className="text-xs text-gray-500">Choose a strong password</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <Button type="submit" size="lg" fullWidth disabled={saving}>
                {saving ? 'Saving…' : 'Set New Password'}
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
