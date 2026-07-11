import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  ChevronLeft,
  Bell,
  X,
  Inbox,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { AppNotification } from '../../types'

interface LayoutProps {
  children: ReactNode
  title?: string
  showBack?: boolean
}

export function Layout({ children, title, showBack }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications((data as AppNotification[]) ?? []))
  }, [profile])

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const isDirector = profile?.role === 'director'

  const isInOnboarding =
    profile?.onboarding_required === true ||
    (profile?.onboarding_status != null &&
      !['not_required', 'active'].includes(profile.onboarding_status))

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/my-area', icon: LayoutGrid, label: 'Coach Zone' },
    ...(isDirector ? [{ path: '/messages', icon: Inbox, label: 'Messages' }] : []),
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f9]">
      {/* Top header */}
      <header className="bg-[#1a3a6b] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        {isInOnboarding ? (
          <button
            onClick={() => navigate('/onboarding')}
            className="p-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        ) : showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <img src="/logo white.png" alt="ASO" className="h-8 w-auto object-contain" />
        )}
        <h1 className="flex-1 font-bold text-lg">{title || 'Active Schools'}</h1>
        <button
          onClick={() => setShowNotifs(v => !v)}
          className="relative p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Notifications panel */}
      {showNotifs && (
        <div className="fixed inset-0 z-20 flex flex-col" onClick={() => setShowNotifs(false)}>
          <div
            className="mx-4 mt-[64px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-[#1a3a6b] text-sm">Notifications</p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#1a3a6b] font-semibold">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); setShowNotifs(false); if (n.type === 'absence_request' || n.type === 'absence_update') navigate('/absences'); else if (n.type === 'contact_message') navigate('/messages'); else if (n.type === 'week_report') navigate('/weekly-reports') }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${n.read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <div className="w-2 h-2 rounded-full bg-[#1a3a6b] mt-1.5 shrink-0" />}
                      <div className={!n.read ? '' : 'ml-4'}>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>}
                        <p className="text-[10px] text-gray-300 mt-1">{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom navigation — hidden during onboarding */}
      {!isInOnboarding && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg z-10">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  active
                    ? 'text-[#1a3a6b]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
                {active && <div className="absolute bottom-0 w-8 h-0.5 bg-[#1a3a6b] rounded-full" />}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
