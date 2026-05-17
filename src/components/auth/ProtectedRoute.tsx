import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../ui/Spinner'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <PageSpinner />

  const isSchoolPortal = location.pathname.startsWith('/school-portal')
  const isAdminViewingPortal = isSchoolPortal && (profile.role === 'director' || profile.role === 'area_lead')

  // Parent accounts belong in the parent portal
  if (profile.role === 'parent') {
    return <Navigate to="/portal/my-bookings" replace />
  }

  // School users must stay in the school portal
  if (profile.role === 'school' && !isSchoolPortal) {
    return <Navigate to="/school-portal" replace />
  }

  // Non-school, non-admin users cannot access school portal routes
  if (!isAdminViewingPortal && profile.role !== 'school' && isSchoolPortal) {
    return <Navigate to="/dashboard" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
