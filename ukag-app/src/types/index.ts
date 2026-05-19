export type UserRole = 'admin' | 'coach' | 'club_manager'

export type ClubStatus = 'active' | 'suspended' | 'lapsed' | 'pending'
export type Discipline = 'gymnastics' | 'trampolining' | 'both'
export type LicenceStatus = 'active' | 'expired' | 'suspended' | 'pending'
export type EnrolmentStatus = 'enrolled' | 'completed' | 'cancelled' | 'failed'
export type CourseStatus = 'open' | 'full' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  club_id?: string | null
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  name: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  town?: string
  county?: string
  postcode?: string
  status: ClubStatus
  affiliation_date?: string
  renewal_date?: string
  licence_number?: string
  disciplines: Discipline[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CoachLicence {
  id: string
  profile_id: string
  licence_type: string
  licence_number?: string
  status: LicenceStatus
  issue_date?: string
  expiry_date?: string
  cpd_hours_required: number
  cpd_hours_completed: number
  notes?: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Course {
  id: string
  title: string
  discipline: Discipline
  course_type: string
  description?: string
  date?: string
  end_date?: string
  location?: string
  capacity?: number
  status: CourseStatus
  tutor?: string
  cost?: number
  created_at: string
  updated_at: string
  enrolment_count?: number
}

export interface CourseEnrolment {
  id: string
  course_id: string
  profile_id: string
  status: EnrolmentStatus
  completion_date?: string
  certificate_issued: boolean
  certificate_number?: string
  notes?: string
  created_at: string
  updated_at: string
  profile?: Profile
  course?: Course
}

export interface Award {
  id: string
  name: string
  discipline: Discipline
  level: number
  description?: string
  requirements?: string
  created_at: string
}

export interface CoachAward {
  id: string
  profile_id: string
  award_id: string
  date_achieved?: string
  awarded_by?: string
  notes?: string
  created_at: string
  profile?: Profile
  award?: Award
}
