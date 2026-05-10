export type Role = 'director' | 'area_lead' | 'lead_coach' | 'assistant_coach' | 'junior_coach' | 'outreach_worker' | 'media_tech'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  area?: string
  areas?: string[]
  photo_url?: string
  phone?: string
  dbs_number?: string
  dbs_expiry?: string
  safeguarding_expiry?: string
  first_aid_expiry?: string
  can_clock_anywhere?: boolean
  created_at: string
}

export interface OrgDocument {
  id: string
  title: string
  description: string | null
  category: string
  file_path: string
  file_name: string
  file_size: number | null
  uploaded_by: string
  created_at: string
  uploader?: Profile
}

export interface CoachCertificate {
  id: string
  coach_id: string
  title: string
  file_path: string | null
  issued_date: string | null
  expiry_date: string | null
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

export interface Announcement {
  id: string
  title: string
  body: string | null
  link_url: string | null
  link_label: string | null
  area: string | null
  is_pinned: boolean
  created_by: string
  created_at: string
  author?: Profile
}

export interface ClockRecord {
  id: string
  staff_id: string
  school_id: string | null
  location_override?: string | null
  clock_in: string
  clock_out: string | null
  created_at: string
  staff?: Profile
  school?: School
}

export type ExpenseType = 'mileage' | 'travel' | 'other'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected'

export interface Expense {
  id: string
  staff_id: string
  date: string
  type: ExpenseType
  description: string
  miles: number | null
  amount: number
  status: ExpenseStatus
  approved_by: string | null
  approved_at: string | null
  admin_note: string | null
  created_at: string
  staff?: Profile
  approver?: Profile
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

// prospect → initial_sent → following_up → interested (amber) / onboarded (green) / do_not_contact (red)
export type CrmStatus = 'prospect' | 'initial_sent' | 'following_up' | 'interested' | 'onboarded' | 'do_not_contact'
export type CrmInteractionType = 'email' | 'call' | 'visit' | 'meeting' | 'other'
export type CrmOutcome = 'positive' | 'neutral' | 'negative'

export interface CrmContact {
  id: string
  school_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  area: string | null
  school_type: string | null
  status: CrmStatus
  notes: string | null
  follow_up_number: number
  last_contacted_date: string | null
  next_follow_up_date: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  assignee?: Profile
}

export interface CrmInteraction {
  id: string
  contact_id: string
  staff_id: string
  type: CrmInteractionType
  date: string
  notes: string
  follow_up_date: string | null
  outcome: CrmOutcome | null
  created_at: string
  staff?: Profile
}
