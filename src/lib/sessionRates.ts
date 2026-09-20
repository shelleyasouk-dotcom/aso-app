// Session-based pay rates by session_role (used for payroll, payslips, and reporting)

export const SESSION_RATES: Record<string, number> = {
  junior_coach:    10,
  assistant_coach: 15,
  lead_coach:      30,
  area_lead:       35,
  director:        35,
}

export const SESSION_ROLE_LABELS: Record<string, string> = {
  junior_coach:    'Junior Coach',
  assistant_coach: 'Assistant Coach',
  lead_coach:      'Lead Coach',
  area_lead:       'Senior Lead',
  director:        'Director',
}

export function rateForSessionRole(sessionRole: string | null): number {
  if (!sessionRole) return 0
  return SESSION_RATES[sessionRole] ?? 0
}
