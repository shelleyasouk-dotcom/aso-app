import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, User, ChevronDown, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBasket } from '../../contexts/BasketContext'

const NAV_LINKS = [
  { path: '/portal', label: 'Home', exact: true },
  { path: '/portal/clubs', label: 'Find Clubs' },
  { path: '/portal/sports', label: 'Sports' },
  { path: '/portal/about', label: 'About' },
  { path: '/portal/affiliations', label: 'Affiliations' },
]

interface PortalLayoutProps {
  children: ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { items } = useBasket()

  const isParent = profile?.role === 'parent'

  function isActive(path: string, exact?: boolean) {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3a6b] text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="bg-white rounded-xl p-1 shrink-0">
              <img src="/Untitled-2 (1).png" alt="Active School" className="h-8 w-8 object-contain" />
            </div>
            <img src="/Untitled-1.png" alt="Active School" className="h-7 object-contain hidden sm:block" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path, link.exact)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth area */}
          <div className="ml-auto flex items-center gap-2">
            {/* Basket icon */}
            {items.length > 0 && (
              <button
                onClick={() => navigate('/portal/basket')}
                className="relative p-2 rounded-lg bg-[#f5c518] text-[#1a3a6b] hover:bg-yellow-400 transition-colors"
              >
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 bg-[#1a3a6b] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              </button>
            )}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <User size={16} />
                  <span className="hidden sm:block max-w-32 truncate">{profile.full_name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-52 text-gray-800 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{profile.full_name}</p>
                      {profile.role !== 'parent' && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block capitalize">
                          {profile.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {isParent && (
                      <>
                        <button
                          onClick={() => { navigate('/portal/my-bookings'); setUserMenuOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 font-medium"
                        >
                          My Bookings
                        </button>
                        <button
                          onClick={() => { navigate('/portal/my-children'); setUserMenuOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 font-medium"
                        >
                          My Children
                        </button>
                      </>
                    )}
                    {!isParent && (
                      <button
                        onClick={() => { navigate('/dashboard'); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 font-medium text-[#1a3a6b]"
                      >
                        ← Back to Staff Portal
                      </button>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/portal/login')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/portal/register')}
                  className="text-sm font-medium bg-[#f5c518] text-[#1a3a6b] rounded-lg px-3 py-1.5 hover:bg-yellow-400 transition-colors"
                >
                  Register
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#142f58] px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path, link.exact)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
            {!profile && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => { navigate('/portal/login'); setMenuOpen(false) }}
                  className="flex-1 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => { navigate('/portal/register'); setMenuOpen(false) }}
                  className="flex-1 py-2 text-sm font-medium bg-[#f5c518] text-[#1a3a6b] rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1a3a6b] text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white rounded-lg p-0.5">
                  <img src="/Untitled-2 (1).png" alt="Active School" className="h-8 w-8 object-contain" />
                </div>
                <img src="/Untitled-1.png" alt="Active School" className="h-6 object-contain" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Inspiring young people through sport and physical activity across UK schools.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Quick Links</p>
              <div className="flex flex-col gap-2">
                {NAV_LINKS.slice(1).map(link => (
                  <Link key={link.path} to={link.path} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">For Parents</p>
              <div className="flex flex-col gap-2">
                <Link to="/portal/login" className="text-white/60 hover:text-white text-sm transition-colors">Parent Login</Link>
                <Link to="/portal/register" className="text-white/60 hover:text-white text-sm transition-colors">Create Account</Link>
                <Link to="/portal/clubs" className="text-white/60 hover:text-white text-sm transition-colors">Find a Club</Link>
                <Link to="/portal/terms" className="text-white/60 hover:text-white text-sm transition-colors">Terms &amp; Conditions</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Active School Organisation. All rights reserved.</p>
            <Link to="/login" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              ← Back to main login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
