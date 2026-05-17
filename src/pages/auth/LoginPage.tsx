import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CheckCircle, Users, School, ChevronLeft, Heart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

type Portal = 'staff' | 'school'

export function LoginPage() {
  const { user, profile, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [portal, setPortal] = useState<Portal | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetSubmitting, setResetSubmitting] = useState(false)

  if (loading) return <PageSpinner />
  if (user) {
    if (!profile) return <PageSpinner />
    if (profile.role === 'parent') return <Navigate to="/portal/my-bookings" replace />
    if (profile.role === 'school') return <Navigate to="/school-portal" replace />
    const isAdmin = profile.role === 'director' || profile.role === 'area_lead'
    if (portal === 'school' && isAdmin) return <Navigate to="/admin/schools" replace />
    return <Navigate to="/dashboard" replace />
  }

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

  function goBack() {
    setPortal(null)
    setEmail('')
    setPassword('')
    setError(null)
    setShowForgot(false)
    setResetSent(false)
  }

  const isSchool = portal === 'school'

  return (
    <div className="min-h-screen bg-[#1a3a6b] flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">

      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/logo white.png" alt="ASO" className="w-20 h-20 object-contain mx-auto mb-4" />
        <h1 className="text-white text-3xl font-bold">Active School</h1>
        <p className="text-blue-200 text-lg mt-1">Organisation</p>
      </div>

      {/* Portal selection */}
      {!portal ? (
        <div className="w-full max-w-sm flex flex-col gap-4">
          <p className="text-blue-200 text-sm text-center mb-2">Choose your portal to sign in</p>

          <button
            onClick={() => setPortal('staff')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1a3a6b] flex items-center justify-center shrink-0">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1a3a6b] text-base">Staff Portal</p>
              <p className="text-gray-500 text-sm mt-0.5">Coaches, leads & directors</p>
            </div>
          </button>

          <button
            onClick={() => setPortal('school')}
            className="w-full bg-[#f5c518] rounded-2xl p-5 flex items-center gap-4 shadow-xl hover:bg-[#f5c518]/90 active:bg-[#f5c518]/80 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1a3a6b] flex items-center justify-center shrink-0">
              <School size={24} className="text-[#f5c518]" />
            </div>
            <div>
              <p className="font-bold text-[#1a3a6b] text-base">School Portal</p>
              <p className="text-[#1a3a6b]/70 text-sm mt-0.5">School staff & administrators</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/portal')}
            className="w-full bg-emerald-500 rounded-2xl p-5 flex items-center gap-4 shadow-xl hover:bg-emerald-400 active:bg-emerald-600 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Community Hub</p>
              <p className="text-white/75 text-sm mt-0.5">Clubs, sports, affiliations & more</p>
            </div>
          </button>
        </div>
      ) : (
        /* Login form */
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

          {/* Back button + portal badge */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={goBack}
              className="p-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 ${isSchool ? 'bg-[#f5c518]/20' : 'bg-[#1a3a6b]/10'}`}>
              {isSchool
                ? <School size={16} className="text-[#1a3a6b]" />
                : <Users size={16} className="text-[#1a3a6b]" />
              }
              <span className="text-sm font-semibold text-[#1a3a6b]">
                {isSchool ? 'School Portal' : 'Staff Portal'}
              </span>
            </div>
          </div>

          {!showForgot ? (
            <>
              <h2 className="text-[#1a3a6b] text-xl font-bold mb-5 text-center">
                {isSchool ? 'School Sign In' : 'Staff Sign In'}
              </h2>
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
      )}

      <p className="text-blue-300 text-sm mt-8 text-center">
        Issues signing in? Contact admin —{' '}
        <a href="mailto:info@activeschool.org.uk" className="text-white underline hover:text-blue-200">
          info@activeschool.org.uk
        </a>
      </p>
    </div>
  )
}
