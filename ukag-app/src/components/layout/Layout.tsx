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
        fixed inset-y-0 left-0 z-30 w-64 bg-ukag-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-ukag-700">
          <div className="w-9 h-9 bg-ukag-500 rounded-lg flex items-center justify-center font-bold text-sm">
            UK
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">UK Academies</div>
            <div className="text-ukag-300 text-xs leading-tight">of Gymnastics</div>
          </div>
          <button
            className="ml-auto lg:hidden text-ukag-300 hover:text-white"
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
                    : 'text-ukag-200 hover:bg-ukag-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-ukag-700 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-ukag-600 text-white'
                  : 'text-ukag-200 hover:bg-ukag-800 hover:text-white'
              }`
            }
          >
            <User size={18} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{profile?.full_name ?? 'My Profile'}</div>
              {profile && (
                <div className="text-ukag-400 text-xs">{roleBadge[profile.role]}</div>
              )}
            </div>
            <ChevronRight size={14} className="text-ukag-400" />
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ukag-200 hover:bg-ukag-800 hover:text-white transition-colors"
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
          <span className="font-semibold text-ukag-900 text-sm">UK Academies of Gymnastics</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
