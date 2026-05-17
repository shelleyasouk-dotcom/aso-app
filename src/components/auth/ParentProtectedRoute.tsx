import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../ui/Spinner'

export function ParentProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/portal/login" replace />
  if (!profile) return <PageSpinner />
  if (profile.role !== 'parent') return <Navigate to="/portal/login" replace />

  return <>{children}</>
}
