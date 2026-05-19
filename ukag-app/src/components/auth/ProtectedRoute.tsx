import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types'

interface Props {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ukag-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
