import type { Role } from '../types'

export const ROLE_LABELS: Record<Role, string> = {
  director:             'Director',
  operations_manager:   'Operations Manager',
  operations_assistant: 'Operations Assistant',
  area_lead:            'Super Lead',
  senior_lead_coach:    'Senior Lead Coach',
  lead_coach:           'Lead Coach',
  assistant_coach:      'Assistant Coach',
  junior_coach:         'Junior Coach',
  outreach_worker:      'Schools Outreach',
  marketing_assistant:  'Marketing Assistant',
  media_tech:           'Media & Tech',
  school:               'School',
  parent:               'Parent',
}

// ─── Role group helpers ───────────────────────────────────────────────────────

/** Full director-level access */
export function isAdmin(role: Role): boolean {
  return role === 'director' || role === 'operations_manager'
}

/** Super Leads and above */
export function isAreaManagement(role: Role): boolean {
  return role === 'director' || role === 'operations_manager' || role === 'area_lead'
}

/** Any coaching role */
export function isCoach(role: Role): boolean {
  return ['lead_coach', 'senior_lead_coach', 'assistant_coach', 'junior_coach'].includes(role)
}

export function isSchoolUser(role: Role): boolean {
  return role === 'school'
}

// ─── Permission functions ─────────────────────────────────────────────────────

export function canViewAllSchools(role: Role): boolean {
  return isAdmin(role)
}

export function canViewAreaSchools(role: Role): boolean {
  return isAreaManagement(role)
}

export function canManageStaff(role: Role): boolean {
  return isAdmin(role)
}

export function canManageSchools(role: Role): boolean {
  return isAdmin(role)
}

export function canViewTimesheets(role: Role): boolean {
  return isAreaManagement(role) || role === 'senior_lead_coach'
}

export function canViewSessions(role: Role): boolean {
  return isAreaManagement(role) || role === 'senior_lead_coach' || role === 'lead_coach'
}

export function canViewRegisters(role: Role): boolean {
  return isAreaManagement(role) || role === 'senior_lead_coach' || role === 'lead_coach'
}

export function canTakeRegister(role: Role): boolean {
  return ['lead_coach', 'senior_lead_coach', 'assistant_coach'].includes(role)
}

export function canManageAwards(role: Role): boolean {
  return isAreaManagement(role) || role === 'senior_lead_coach' || role === 'lead_coach'
}

export function canClockIn(_role: Role): boolean {
  return true
}

export function clocksInAnywhere(role: Role): boolean {
  return ['director', 'operations_manager', 'operations_assistant', 'area_lead',
          'outreach_worker', 'marketing_assistant', 'media_tech'].includes(role)
}

export function canUseCrm(role: Role): boolean {
  return isAreaManagement(role) || role === 'outreach_worker'
}

/** Directors and Super Leads can edit/delete anything to fix errors */
export function canEditAll(role: Role): boolean {
  return isAreaManagement(role)
}

/** Can manage children at their schools */
export function canManageChildren(role: Role): boolean {
  return isAreaManagement(role)
}

/** Can view and manage staff at their schools */
export function canManageAreaStaff(role: Role): boolean {
  return isAreaManagement(role)
}

/** Can edit clock records to fix errors */
export function canEditClockRecords(role: Role): boolean {
  return isAreaManagement(role)
}

export function canViewCoachPool(role: Role): boolean {
  return isAreaManagement(role) || role === 'outreach_worker'
}

/** Can view reports (lesson plans, session feedback, weekly reports) */
export function canViewReports(role: Role): boolean {
  return isAreaManagement(role) || role === 'operations_assistant' || role === 'senior_lead_coach'
}

/** Can manage content (blog, newsletters, holiday camps, ad banners) */
export function canManageContent(role: Role): boolean {
  return isAdmin(role) || role === 'marketing_assistant' || role === 'media_tech'
}

/** Can post announcements */
export function canPostAnnouncements(role: Role): boolean {
  return isAreaManagement(role) || role === 'operations_assistant' ||
         role === 'marketing_assistant' || role === 'media_tech'
}
