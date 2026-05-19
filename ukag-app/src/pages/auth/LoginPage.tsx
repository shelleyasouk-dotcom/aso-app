import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center p-12 flex-col gap-8">
        {/* UKAG logo mark — red UK, yellow AG, blue dots */}
        <svg width="160" height="160" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue dots */}
          <rect x="4" y="4" width="16" height="16" rx="2" fill="#2B4EAD" />
          <rect x="44" y="4" width="16" height="16" rx="2" fill="#2B4EAD" />
          {/* Red U */}
          <path d="M4 22 L4 56 Q4 72 22 72 Q40 72 40 56 L40 22 L27 22 L27 56 Q27 60 22 60 Q17 60 17 56 L17 22 Z" fill="#E8391C" />
          {/* Red K */}
          <rect x="46" y="22" width="12" height="50" fill="#E8391C" />
          <path d="M58 47 L80 22 L66 22 L46 47 L66 72 L80 72 Z" fill="#E8391C" />
          {/* Yellow A */}
          <path d="M4 98 L18 68 L32 98 L26 98 L22 88 L14 88 L10 98 Z M16 82 L22 82 L19 75 Z" fill="#F9C400" transform="translate(0 -2)" />
          {/* Yellow G */}
          <path d="M56 70 Q44 70 44 82 Q44 96 56 96 L68 96 L68 82 L60 82 L60 88 L62 88 L62 90 L56 90 Q52 90 52 82 Q52 76 56 76 Q60 76 60 79 L68 79 Q68 70 56 70 Z" fill="#F9C400" transform="translate(18 -4)" />
        </svg>
        <div className="text-center">
          <div className="text-3xl font-bold">
            <span className="text-ukag-500">UK</span>
            <span style={{ color: '#F9C400' }}>AG</span>
          </div>
          <div className="text-gray-300 text-lg font-medium mt-1">UK Academies of Gymnastics</div>
          <div className="text-gray-500 text-sm mt-2">Training & Affiliation Portal</div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-3xl font-bold mb-1">
              <span className="text-ukag-500">UK</span>
              <span style={{ color: '#F9C400' }}>AG</span>
            </div>
            <div className="text-gray-700 font-medium">UK Academies of Gymnastics</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm mb-6">Access the UKAG training portal</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 focus:border-ukag-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ukag-500 focus:border-ukag-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ukag-600 hover:bg-ukag-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
