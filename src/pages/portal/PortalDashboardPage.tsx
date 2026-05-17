import { useNavigate } from 'react-router-dom'
import { Search, LogOut, ChevronRight, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { PortalLayout } from '../../components/layout/PortalLayout'

export function PortalDashboardPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hi, {firstName}! 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome to your ASO parent account.</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        {/* My Bookings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-[#1a3a6b]" />
            <h2 className="font-bold text-gray-800">My Bookings</h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-gray-300" />
            </div>
            <p className="font-medium text-sm text-gray-500">No bookings yet</p>
            <p className="text-xs mt-1 text-gray-400">Once you book your child into a club, it will appear here.</p>
          </div>
          <div className="mt-2 bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Online booking coming soon</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              We're setting up online booking. In the meantime, contact your school office or the ASO coach at your school to register your child.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate('/portal/clubs')}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3a6b] transition-colors group text-left"
          >
            <div className="w-10 h-10 bg-[#1a3a6b]/10 rounded-xl flex items-center justify-center shrink-0">
              <Search size={18} className="text-[#1a3a6b]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Find a Club</p>
              <p className="text-xs text-gray-500 mt-0.5">Browse clubs at schools near you</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
          </button>

          <button
            onClick={() => navigate('/portal/sports')}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3a6b] transition-colors group text-left"
          >
            <div className="w-10 h-10 bg-[#f5c518]/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">⚽</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Our Sports</p>
              <p className="text-xs text-gray-500 mt-0.5">See what sports ASO offers</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
          </button>

          <button
            onClick={() => navigate('/portal/about')}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3a6b] transition-colors group text-left"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">🏅</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">About ASO</p>
              <p className="text-xs text-gray-500 mt-0.5">Our mission, values &amp; coaches</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
          </button>
        </div>
      </div>
    </PortalLayout>
  )
}
