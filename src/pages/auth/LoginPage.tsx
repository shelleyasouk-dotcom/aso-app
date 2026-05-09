import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

export function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetSubmitting, setResetSubmitting] = useState(false)

  if (loading) return <PageSpinner />
  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    setResetSubmitting(true)
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/change-password`,
    })
    setResetSent(true)
    setResetSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#1a3a6b] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/logo white.png" alt="ASO" className="w-20 h-20 object-contain mx-auto mb-4" />
        <h1 className="text-white text-3xl font-bold">Active School</h1>
        <p className="text-blue-200 text-lg mt-1">Organisation</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

        {!showForgot ? (
          <>
            <h2 className="text-[#1a3a6b] text-xl font-bold mb-6 text-center">Staff Login</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
              />
              <Input
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" fullWidth disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-[#1a3a6b] text-center hover:underline"
              >
                Forgot your password?
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-[#1a3a6b] text-xl font-bold mb-2 text-center">Reset Password</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Enter your email and we'll send you a reset link
            </p>

            {resetSent ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle size={40} className="text-green-500" />
                <p className="text-green-700 font-semibold text-center">Reset email sent!</p>
                <p className="text-gray-500 text-sm text-center">
                  Check your inbox and click the link to set a new password.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setResetSent(false) }}
                  className="text-sm text-[#1a3a6b] hover:underline mt-2"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <Input
                  id="forgot-email"
                  name="forgot-email"
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                />
                <Button type="submit" size="lg" fullWidth disabled={resetSubmitting}>
                  {resetSubmitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-sm text-gray-400 text-center hover:underline"
                >
                  Back to login
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <p className="text-blue-300 text-sm mt-8 text-center">
        Issues signing in? Contact your Area Lead or Director.
      </p>
    </div>
  )
}
