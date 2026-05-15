import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  ShieldCheck,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SchoolLayoutProps {
  children: ReactNode
  title?: string
  showBack?: boolean
}

const NAV_ITEMS = [
  { path: '/school-portal',              icon: LayoutDashboard, label: 'Home' },
  { path: '/school-portal/register',     icon: ClipboardList,   label: 'Register' },
  { path: '/school-portal/club',         icon: Calendar,        label: 'Club' },
  { path: '/school-portal/safeguarding', icon: ShieldCheck,     label: 'Safeguarding' },
]

export function SchoolLayout({ children, title, showBack }: SchoolLayoutProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f9]">
      {/* Top header — matches existing Layout */}
      <header className="bg-[#1a3a6b] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center">
            <span className="text-[#1a3a6b] font-black text-xs">ASO</span>
          </div>
        )}
        <h1 className="flex-1 font-bold text-lg">{title || 'School Portal'}</h1>
        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg z-10">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || (path !== '/school-portal' && location.pathname.startsWith(path))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors relative ${
                active ? 'text-[#1a3a6b]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 bg-[#1a3a6b] rounded-full" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
