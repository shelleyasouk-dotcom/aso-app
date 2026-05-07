import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../ui/Spinner'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <PageSpinner />

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
