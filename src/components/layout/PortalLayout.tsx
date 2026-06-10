import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, User, ChevronDown, ShoppingCart, Copy, Check, Tag } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBasket } from '../../contexts/BasketContext'

// ─── Early Bird Banner ────────────────────────────────────────────────────────

const EARLY_BIRD_EXPIRES = new Date('2026-06-21T23:59:59')
const DISMISS_KEY = 'earlybird_banner_dismissed_v1'

function EarlyBirdBanner() {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (new Date() < EARLY_BIRD_EXPIRES && !localStorage.getItem(DISMISS_KEY)) {
      // Slight delay so it slides in after page load
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText('EARLYBIRDSUMMER1')
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  if (!visible) return null

  return (
    <div className="bg-green-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 animate-[slideDown_0.4s_ease-out]">
      <div className="flex items-center gap-2 flex-wrap justify-center flex-1 text-center sm:text-left">
        <Tag size={14} className="shrink-0 hidden sm:block" />
        <span className="text-sm font-semibold">
          ☀️ Early Bird — save <strong>£7.50</strong> on Summer GymCamps (ends 21 June).
          Use code:
        </span>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 bg-white text-green-700 font-extrabold text-sm px-3 py-1 rounded-lg hover:bg-green-50 transition-colors tracking-wide"
        >
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> EARLYBIRDSUMMER1</>}
        </button>
        <span className="text-green-200 text-xs hidden sm:inline">at checkout on activeschool.shop</span>
      </div>
      <button onClick={dismiss} className="shrink-0 text-white/70 hover:text-white transition-colors" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavItem =
  | { type: 'link';     path: string; label: string; exact?: boolean; badge?: string }
  | { type: 'dropdown'; label: string; items: { path: string; label: string; badge?: string; desc?: string }[] }

const NAV: NavItem[] = [
  { type: 'link', path: '/home', label: 'Home', exact: true },
  { type: 'link', path: '/portal/clubs', label: 'Find Clubs' },
  {
    type: 'dropdown',
    label: 'Activities',
    items: [
      { path: '/portal/summer-camps', label: 'Summer Camps', badge: 'New', desc: 'Holiday camps open to all children' },
      { path: '/portal/sports',       label: 'Sports',                     desc: 'All the sports we coach' },
    ],
  },
  {
    type: 'dropdown',
    label: 'About',
    items: [
      { path: '/portal/about',        label: 'About ASO',    desc: 'Our story, values & team' },
      { path: '/portal/for-schools',  label: 'For Schools',  desc: 'Partner with us' },
      { path: '/portal/affiliations', label: 'Affiliations', desc: 'Our governing bodies' },
      { path: '/portal/contact',      label: 'Contact Us',   desc: 'Get in touch with our team' },
    ],
  },
  { type: 'link', path: '/portal/careers', label: 'Work With Us' },
]

// Flat list for footer / mobile
const ALL_LINKS = NAV.flatMap(item =>
  item.type === 'link' ? [item] : item.items.map(i => ({ ...i, type: 'link' as const }))
)

// ─── Dropdown component ───────────────────────────────────────────────────────

function NavDropdown({
  label,
  items,
  isAnyActive,
}: {
  label: string
  items: { path: string; label: string; badge?: string; desc?: string }[]
  isAnyActive: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
          isAnyActive || open ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50">
          {items.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-[#1a3a6b]">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold bg-[#f5c518] text-[#1a3a6b] px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.desc && <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface PortalLayoutProps {
  children: ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loginMenuOpen, setLoginMenuOpen] = useState(false)
  const { items } = useBasket()

  const isParent = profile?.role === 'parent'

  function isActive(path: string, exact?: boolean) {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <EarlyBirdBanner />
      {/* Header */}
      <header className="bg-[#1a3a6b] text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo */}
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-xl p-1 shrink-0">
              <img src="/Untitled-2 (1).png" alt="Active School" className="h-8 w-8 object-contain" />
            </div>
            <img src="/Untitled-1.png" alt="Active School" className="h-7 object-contain hidden sm:block" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
            {NAV.map(item => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive(item.path, item.exact)
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] font-extrabold bg-[#f5c518] text-[#1a3a6b] px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              }
              const isAnyActive = item.items.some(i => isActive(i.path))
              return (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.items}
                  isAnyActive={isAnyActive}
                />
              )
            })}
          </nav>

          {/* Auth area */}
          <div className="ml-auto flex items-center gap-2">
            {/* Basket */}
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

            {/* User menu */}
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
              <div className="flex items-center gap-2">
                {/* Log In dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLoginMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Log In <ChevronDown size={14} />
                  </button>
                  {loginMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 z-50">
                      {[
                        { label: 'Coach Login',  path: '/login' },
                        { label: 'Parent Login', path: '/portal/login' },
                        { label: 'School Login', path: '/school-portal' },
                      ].map(item => (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setLoginMenuOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/portal/register')}
                  className="text-sm font-bold bg-[#f5c518] text-[#1a3a6b] rounded-lg px-3 py-1.5 hover:bg-yellow-400 transition-colors"
                >
                  Register
                </button>
              </div>
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

        {/* Mobile menu — flat list of all links */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#142f58] px-4 py-3 flex flex-col gap-1">
            {ALL_LINKS.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[9px] font-extrabold bg-[#f5c518] text-[#1a3a6b] px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            {!profile && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-white/40 px-3 mb-1.5">Log in as</p>
                {[
                  { label: 'Coach Login',  path: '/login' },
                  { label: 'Parent Login', path: '/portal/login' },
                  { label: 'School Login', path: '/school-portal' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { navigate('/portal/register'); setMenuOpen(false) }}
                  className="w-full mt-2 py-2.5 text-sm font-bold bg-[#f5c518] text-[#1a3a6b] rounded-lg hover:bg-yellow-400 transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
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
                {ALL_LINKS.filter(l => l.path !== '/home').map(link => (
                  <Link key={link.path} to={link.path} className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                    {link.label}
                    {link.badge && (
                      <span className="text-[9px] font-extrabold bg-[#f5c518] text-[#1a3a6b] px-1.5 py-0.5 rounded-full leading-none uppercase">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">For Parents</p>
              <div className="flex flex-col gap-2">
                <Link to="/portal/login"    className="text-white/60 hover:text-white text-sm transition-colors">Parent Login</Link>
                <Link to="/portal/register" className="text-white/60 hover:text-white text-sm transition-colors">Create Account</Link>
                <Link to="/portal/clubs"    className="text-white/60 hover:text-white text-sm transition-colors">Find a Club</Link>
                <Link to="/portal/terms"    className="text-white/60 hover:text-white text-sm transition-colors">Terms &amp; Conditions</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">For Schools &amp; Partners</p>
              <div className="flex flex-col gap-2">
                <Link to="/portal/for-schools"  className="text-white/60 hover:text-white text-sm transition-colors">Partner with ASO</Link>
                <Link to="/portal/for-schools"  className="text-white/60 hover:text-white text-sm transition-colors">Multi-Academy Trusts</Link>
                <Link to="/portal/for-schools"  className="text-white/60 hover:text-white text-sm transition-colors">Local Authorities</Link>
                <Link to="/portal/affiliations" className="text-white/60 hover:text-white text-sm transition-colors">Affiliations</Link>
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
