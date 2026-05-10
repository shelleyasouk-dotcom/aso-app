import type { Role } from '../types'

export const ROLE_LABELS: Record<Role, string> = {
  director: 'Director',
  area_lead: 'Area Lead',
  lead_coach: 'Lead Coach',
  assistant_coach: 'Assistant Coach',
  junior_coach: 'Junior Coach',
  outreach_worker: 'Outreach Worker',
  media_tech: 'Media & Tech',
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

export function canClockIn(_role: Role): boolean {
  return true // all roles can clock in
}

export function clocksInAnywhere(role: Role): boolean {
  return role === 'director' || role === 'area_lead' || role === 'outreach_worker' || role === 'media_tech'
}

export function canUseCrm(role: Role): boolean {
  return role === 'director' || role === 'area_lead' || role === 'outreach_worker'
}

// Directors and Area Leads can edit/delete anything to fix errors
export function canEditAll(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}

// Area Leads can manage children at their schools
export function canManageChildren(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}

// Area Leads can view and manage staff at their schools
export function canManageAreaStaff(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}

// Area Leads can edit clock records to fix errors
export function canEditClockRecords(role: Role): boolean {
  return role === 'director' || role === 'area_lead'
}
