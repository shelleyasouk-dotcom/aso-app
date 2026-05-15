import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function useSchoolId(): string | null {
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const adminOverride = params.get('schoolId')

  if (profile?.role === 'director' || profile?.role === 'area_lead') {
    return adminOverride ?? null
  }
  return profile?.school_id ?? null
}

export function useIsAdminView(): boolean {
  const { profile } = useAuth()
  const [params] = useSearchParams()
  return (
    (profile?.role === 'director' || profile?.role === 'area_lead') &&
    !!params.get('schoolId')
  )
}
