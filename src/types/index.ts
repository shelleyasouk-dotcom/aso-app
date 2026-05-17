export type Role = 'director' | 'area_lead' | 'lead_coach' | 'assistant_coach' | 'junior_coach' | 'outreach_worker' | 'media_tech' | 'school' | 'parent'

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
  school_id?: string | null
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
  // Portal fields (added via school_portal.sql migration)
  headteacher_name?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  dsl_name?: string | null
  dsl_email?: string | null
  dsl_phone?: string | null
  ddsl_name?: string | null
  ddsl_email?: string | null
  ddsl_phone?: string | null
  mat_name?: string | null
  school_type?: string | null
  region?: string | null
  area_lead_id?: string | null
  facility_form_completed?: boolean
  updated_at?: string
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
  contact_phone: string | null
  parent_name: string | null
  year_group: string | null
  additional_needs: string | null
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

export type AbsenceType = 'sick' | 'annual_leave' | 'personal' | 'emergency' | 'training' | 'other'
export type AbsenceStatus = 'pending' | 'approved' | 'rejected'

export interface Absence {
  id: string
  staff_id: string
  date_from: string
  date_to: string
  type: AbsenceType
  reason: string | null
  status: AbsenceStatus
  reviewed_by: string | null
  reviewed_at: string | null
  reviewer_note: string | null
  created_at: string
  staff?: Profile
  reviewer?: Profile
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string | null
  type: string
  related_id: string | null
  read: boolean
  created_at: string
}

export type OnboardingDocCategory = 'contract' | 'right_to_work' | 'reference' | 'certificate' | 'dbs' | 'other'

export interface StaffDocument {
  id: string
  staff_id: string
  title: string
  category: OnboardingDocCategory
  file_path: string
  file_name: string
  uploaded_by: string
  notes: string | null
  created_at: string
  uploader?: Profile
}

// prospect → initial_sent → following_up → interested (amber) / onboarded (green) / do_not_contact (red)
export type ContractType = 'employee' | 'self_employed' | 'zero_hours' | 'casual'
export type PayFrequency = 'hourly' | 'per_session' | 'monthly' | 'weekly'

export interface StaffPersonal {
  staff_id: string
  date_of_birth: string | null
  address_line1: string | null
  address_line2: string | null
  address_city: string | null
  address_postcode: string | null
  ni_number: string | null
  bank_account_name: string | null
  bank_name: string | null
  bank_sort_code: string | null
  bank_account_number: string | null
  ec1_name: string | null
  ec1_relationship: string | null
  ec1_phone: string | null
  ec2_name: string | null
  ec2_relationship: string | null
  ec2_phone: string | null
  additional_needs: string | null
  updated_at: string
}

export interface StaffEmployment {
  staff_id: string
  contract_type: ContractType | null
  contract_start_date: string | null
  contract_end_date: string | null
  pay_rate: number | null
  pay_frequency: PayFrequency | null
  utr_number: string | null
  tax_code: string | null
  admin_notes: string | null
  updated_at: string
  updated_by: string | null
}

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

export interface FacilityAssessment {
  id: string
  school_id: string
  submitted_by: string | null
  submitted_at: string
  space_description: string | null
  space_size: string | null
  availability_notes: string | null
  changing_facilities: string | null
  welfare_facilities: string | null
  storage_available: boolean | null
  storage_notes: string | null
  existing_equipment: string | null
  additional_info: string | null
  created_at: string
}

export interface ImpactReport {
  id: string
  school_id: string
  term_name: string
  sport: string | null
  file_path: string
  file_name: string
  generated_at: string | null
  uploaded_by: string | null
  created_at: string
}

export interface SchoolDocument {
  id: string
  school_id: string | null  // null = shared with all schools
  title: string
  category: string
  file_path: string
  file_name: string
  file_size: number | null
  version: string | null
  uploaded_by: string | null
  created_at: string
}

export interface SchoolInfoForm {
  id: string
  school_id: string
  submitted_by: string | null
  submitted_at: string
  headteacher_name: string | null
  contact_name: string | null
  contact_title: string | null
  contact_email: string | null
  contact_phone: string | null
  school_address: string | null
  school_type_desc: string | null
  number_on_roll: string | null
  space_types: string | null
  space_size: string | null
  floor_surface: string | null
  max_pupils_space: string | null
  obstructions: string | null
  available_days: string | null
  school_finish_time: string | null
  pickup_time: string | null
  has_lockup_contact: boolean | null
  lockup_contact: string | null
  toilets_accessible: boolean | null
  storage_available: boolean | null
  has_existing_equipment: boolean | null
  existing_equipment: string | null
  dsl_name: string | null
  dsl_contact: string | null
  backup_contact: string | null
  visitor_signin: string | null
  year_groups: string | null
  num_clubs: string | null
  additional_info: string | null
  created_at: string
}
