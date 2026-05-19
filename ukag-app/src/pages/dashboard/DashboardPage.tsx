import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, BookOpen, Award, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/layout/Layout'

interface Stats {
  clubs: number
  coaches: number
  openCourses: number
  expiringLicences: number
}

export function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ clubs: 0, coaches: 0, openCourses: 0, expiringLicences: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [clubsRes, coachesRes, coursesRes, licencesRes] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'coach'),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('coach_licences').select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .lt('expiry_date', new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]),
      ])
      setStats({
        clubs: clubsRes.count ?? 0,
        coaches: coachesRes.count ?? 0,
        openCourses: coursesRes.count ?? 0,
        expiringLicences: licencesRes.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const isAdmin = profile?.role === 'admin'
  const greeting = profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Welcome back'

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-gray-500 text-sm mt-0.5">UK Academies of Gymnastics — Training & Affiliation Portal</p>
        </div>

        {/* Stat cards */}
        {isAdmin && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Building2 className="text-ukag-600" size={22} />}
              label="Active Clubs"
              value={loading ? '—' : stats.clubs.toString()}
              to="/clubs"
            />
            <StatCard
              icon={<Users className="text-ukag-600" size={22} />}
              label="Coaches"
              value={loading ? '—' : stats.coaches.toString()}
              to="/coaches"
            />
            <StatCard
              icon={<BookOpen className="text-ukag-600" size={22} />}
              label="Open Courses"
              value={loading ? '—' : stats.openCourses.toString()}
              to="/courses"
            />
            <StatCard
              icon={<AlertTriangle className="text-amber-500" size={22} />}
              label="Licences Expiring"
              value={loading ? '—' : stats.expiringLicences.toString()}
              to="/coaches"
              alert={stats.expiringLicences > 0}
            />
          </div>
        )}

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            icon={<Building2 size={20} className="text-ukag-600" />}
            title="Affiliated Clubs"
            description="View and manage clubs affiliated with UKAG."
            to="/clubs"
          />
          <QuickLink
            icon={<BookOpen size={20} className="text-ukag-600" />}
            title="Training Courses"
            description="Browse and enrol in coach training courses."
            to="/courses"
          />
          <QuickLink
            icon={<Award size={20} className="text-ukag-600" />}
            title="Awards Programme"
            description="Explore the UKAG gymnastics and trampolining awards."
            to="/awards"
          />
          {isAdmin && (
            <QuickLink
              icon={<Users size={20} className="text-ukag-600" />}
              title="Coaches"
              description="Manage coach profiles, licences, and enrolments."
              to="/coaches"
            />
          )}
          <QuickLink
            icon={<CheckCircle size={20} className="text-ukag-600" />}
            title="My Profile"
            description="View your licences, courses, and awards."
            to="/profile"
          />
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ icon, label, value, to, alert }: {
  icon: React.ReactNode
  label: string
  value: string
  to: string
  alert?: boolean
}) {
  return (
    <Link
      to={to}
      className={`bg-white rounded-xl border p-4 flex items-center gap-3 hover:shadow-sm transition-shadow ${
        alert ? 'border-amber-200' : 'border-gray-200'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        alert ? 'bg-amber-50' : 'bg-ukag-50'
      }`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </Link>
  )
}

function QuickLink({ icon, title, description, to }: {
  icon: React.ReactNode
  title: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-ukag-200 transition-all group"
    >
      <div className="w-9 h-9 bg-ukag-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-ukag-100 transition-colors">
        {icon}
      </div>
      <div className="font-semibold text-gray-900 text-sm">{title}</div>
      <div className="text-gray-500 text-xs mt-0.5">{description}</div>
    </Link>
  )
}
