import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SESSION_KEY = 'aso_active_school_id'

export function getActiveSchoolId(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setActiveSchoolId(id: string | null) {
  if (id) sessionStorage.setItem(SESSION_KEY, id)
  else sessionStorage.removeItem(SESSION_KEY)
}

export function useSchoolId(): string | null {
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const adminOverride = params.get('schoolId')

  if (profile?.role === 'director' || profile?.role === 'area_lead') {
    return adminOverride ?? null
  }
  if (profile?.role === 'school') {
    return getActiveSchoolId() ?? profile?.school_id ?? null
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
