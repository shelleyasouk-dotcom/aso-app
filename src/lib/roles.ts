import type { Role } from '../types'

export const ROLE_LABELS: Record<Role, string> = {
  director: 'Director',
  area_lead: 'Area Lead',
  lead_coach: 'Lead Coach',
  assistant_coach: 'Assistant Coach',
  junior_coach: 'Junior Coach',
}

export function canViewAllSchools(role: Role): boolean {
  return role === 'director'
}

export function canViewAreaSchools(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}

export function canManageStaff(role: Role): boolean {
  return role === 'director'
}

export function canManageSchools(role: Role): boolean {
  return role === 'director'
}

export function canViewTimesheets(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}

export function canViewRegisters(role: Role): boolean {
  return role === 'director' || role === 'area_lead' || role === 'lead_coach'
}

export function canTakeRegister(role: Role): boolean {
  return role === 'lead_coach' || role === 'assistant_coach'
}

export function canManageAwards(role: Role): boolean {
  return role === 'director' || role === 'area_lead' || role === 'lead_coach'
}

export function canClockIn(role: Role): boolean {
  return ['lead_coach', 'assistant_coach', 'junior_coach', 'area_lead'].includes(role)
}
