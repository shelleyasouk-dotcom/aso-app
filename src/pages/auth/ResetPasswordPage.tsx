import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the reset hash is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true)
        setExpired(false)
      }
    })

    // Also check for an existing session (in case the event already fired before mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    // If nothing happens within 5 s the link is likely expired or malformed
    const timer = setTimeout(() => {
      setExpired(prev => {
        if (!ready) return true
        return prev
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [ready])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setSuccess(true)
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
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle size={44} className="text-green-500" />
            <p className="font-bold text-gray-800 text-lg">Password updated!</p>
            <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
          </div>
        ) : expired && !ready ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle size={44} className="text-amber-500" />
            <p className="font-bold text-gray-800 text-lg">Link expired or invalid</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              This reset link has expired or already been used. Please request a new one.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 text-sm font-semibold text-[#1a3a6b] underline"
            >
              Back to sign in
            </button>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Verifying reset link…</p>
          </div>
        ) : (
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  {error}
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
