export type Role = 'director' | 'area_lead' | 'lead_coach' | 'assistant_coach' | 'junior_coach'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  created_at: string
}

export interface School {
  id: string
  name: string
  address: string
  area: string
  session_day: string
  session_time: string
  created_at: string
}

export interface StaffSchoolAssignment {
  id: string
  staff_id: string
  school_id: string
  is_lead: boolean
  school?: School
  staff?: Profile
}

export interface Child {
  id: string
  full_name: string
  date_of_birth: string | null
  contact_email: string | null
  school_id: string
  assigned_coach_id: string | null
  is_active: boolean
  created_at: string
  school?: School
  assigned_coach?: Profile
}

export interface ClockRecord {
  id: string
  staff_id: string
  school_id: string
  clock_in: string
  clock_out: string | null
  created_at: string
  staff?: Profile
  school?: School
}

export interface SessionRegister {
  id: string
  school_id: string
  session_date: string
  lead_coach_id: string
  notes: string | null
  created_at: string
  school?: School
  lead_coach?: Profile
  entries?: RegisterEntry[]
}

export interface RegisterEntry {
  id: string
  register_id: string
  child_id: string
  present: boolean
  child?: Child
}

export type AwardLevel =
  | 'none'
  | 'ukag_level_1'
  | 'ukag_level_2'
  | 'ukag_level_3'
  | 'ukag_level_4'
  | 'ukag_level_5'

export const AWARD_LEVEL_LABELS: Record<AwardLevel, string> = {
  none: 'No Award',
  ukag_level_1: 'UKAG Level 1',
  ukag_level_2: 'UKAG Level 2',
  ukag_level_3: 'UKAG Level 3',
  ukag_level_4: 'UKAG Level 4',
  ukag_level_5: 'UKAG Level 5',
}

export interface ChildAward {
  id: string
  child_id: string
  level: AwardLevel
  awarded_by: string
  awarded_at: string
  notes: string | null
  child?: Child
  awarded_by_profile?: Profile
}
