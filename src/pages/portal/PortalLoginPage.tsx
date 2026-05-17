import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'

export function PortalLoginPage() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Already logged in as parent
  if (profile?.role === 'parent') {
    navigate('/portal/my-bookings', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }
    navigate('/portal/my-bookings', { replace: true })
  }

  return (
    <PortalLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <img src="/Untitled-2 (1).png" alt="Active School" className="w-20 h-20 object-contain mx-auto mb-2" />
              <h1 className="text-xl font-extrabold text-gray-900">Parent Login</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to manage your bookings</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a6b] text-white font-bold py-3 rounded-xl hover:bg-[#142f58] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/portal/register" className="text-[#1a3a6b] font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Are you an ASO staff member?{' '}
            <Link to="/login" className="text-[#1a3a6b] hover:underline">
              Staff login →
            </Link>
          </p>
        </div>
      </div>
    </PortalLayout>
  )
}
