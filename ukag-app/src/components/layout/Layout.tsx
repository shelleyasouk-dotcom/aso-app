import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  Award,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { ReactNode } from 'react'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Clubs', to: '/clubs', icon: <Building2 size={18} /> },
  { label: 'Coaches', to: '/coaches', icon: <Users size={18} />, roles: ['admin'] },
  { label: 'Training Courses', to: '/courses', icon: <BookOpen size={18} /> },
  { label: 'Awards', to: '/awards', icon: <Award size={18} /> },
]

function UkagLogo({ size = 36 }: { size?: number }) {
  const s = size
  const dot = s * 0.18
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue dots */}
      <rect x="10" y="8" width="18" height="18" rx="2" fill="#2B4EAD" />
      <rect x="52" y="8" width="18" height="18" rx="2" fill="#2B4EAD" />
      {/* Red U */}
      <path d="M10 28 L10 62 Q10 78 28 78 Q46 78 46 62 L46 28 L32 28 L32 62 Q32 66 28 66 Q24 66 24 62 L24 28 Z" fill="#E8391C" />
      {/* Red K */}
      <rect x="52" y="28" width="13" height="50" fill="#E8391C" />
      <path d="M65 53 L87 28 L72 28 L52 53 L72 78 L87 78 Z" fill="#E8391C" />
    </svg>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = NAV_ITEMS.filter(item =>
    !item.roles || (profile && item.roles.includes(profile.role))
  )

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const roleBadge: Record<string, string> = {
    admin: 'Admin',
    coach: 'Coach',
    club_manager: 'Club Manager',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700">
          <UkagLogo size={44} />
          <div>
            <div className="font-bold text-sm leading-tight">
              <span className="text-ukag-500">UK</span>
              <span style={{ color: '#F9C400' }}>AG</span>
            </div>
            <div className="text-gray-400 text-xs leading-tight">UK Academies of Gymnastics</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ukag-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-700 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-ukag-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <User size={18} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{profile?.full_name ?? 'My Profile'}</div>
              {profile && (
                <div className="text-gray-400 text-xs">{roleBadge[profile.role]}</div>
              )}
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm">
            <span className="text-ukag-500">UK</span>
            <span style={{ color: '#F9C400' }}>AG</span>
            <span className="text-gray-700 font-normal ml-1.5">UK Academies of Gymnastics</span>
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
