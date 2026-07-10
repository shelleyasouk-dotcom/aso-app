-- =============================================================================
-- ASO App — Onboarding System v2
-- Run this entire file in the Supabase SQL Editor.
-- Each block is idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- =============================================================================

-- ─── 1. Extend profiles ───────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_status       text    NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS dbs_status              text,
  ADD COLUMN IF NOT EXISTS linked_application_id   uuid    REFERENCES job_applications(id) ON DELETE SET NULL,
  -- Granular permission flags (director sets these per person)
  ADD COLUMN IF NOT EXISTS can_approve_safeguarding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_issue_contracts      boolean NOT NULL DEFAULT false;

-- ─── 2. Extend staff_documents ────────────────────────────────────────────────
ALTER TABLE staff_documents
  ADD COLUMN IF NOT EXISTS onboarding_task_assignment_id uuid,   -- FK added after task_assignments table exists
  ADD COLUMN IF NOT EXISTS issued_date        date,
  ADD COLUMN IF NOT EXISTS expiry_date        date,
  ADD COLUMN IF NOT EXISTS training_provider  text,
  ADD COLUMN IF NOT EXISTS course_name        text,
  ADD COLUMN IF NOT EXISTS status             text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS rejection_reason   text,
  ADD COLUMN IF NOT EXISTS verified_by        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at        timestamptz,
  ADD COLUMN IF NOT EXISTS replaces_document_id uuid REFERENCES staff_documents(id) ON DELETE SET NULL;

-- ─── 3. Onboarding Stages ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_stages (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text    NOT NULL,
  description     text,
  display_order   integer NOT NULL,
  role_assignments text[] NOT NULL DEFAULT ARRAY['all'],
  enrollment_types text[] NOT NULL DEFAULT ARRAY['initial'],
  is_mandatory    boolean NOT NULL DEFAULT true,
  exclude_from_pct boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  created_by      uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── 4. Onboarding Tasks ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id                      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id                uuid    NOT NULL REFERENCES onboarding_stages(id) ON DELETE RESTRICT,
  title                   text    NOT NULL,
  type                    text    NOT NULL CHECK (type IN ('content','quiz','upload','declaration','contract','placement')),
  display_order           integer NOT NULL,
  role_assignments        text[],
  content_json            jsonb,
  pass_threshold_pct      integer,
  questions_per_attempt   integer,
  required_doc_category   text,
  required_doc_label      text,
  requires_expiry_date    boolean NOT NULL DEFAULT false,
  requires_issue_date     boolean NOT NULL DEFAULT false,
  requires_provider       boolean NOT NULL DEFAULT false,
  declaration_text        text,
  requires_typed_name     boolean NOT NULL DEFAULT true,
  version                 integer NOT NULL DEFAULT 1,
  is_mandatory            boolean NOT NULL DEFAULT true,
  is_active               boolean NOT NULL DEFAULT true,
  created_by              uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── 5. Onboarding Enrollments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_enrollments (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        uuid    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  enrollment_type text    NOT NULL DEFAULT 'initial'
    CHECK (enrollment_type IN ('initial','refresher','cpd','sop_acknowledgment')),
  status          text    NOT NULL DEFAULT 'invited',
  enrolled_by     uuid    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  enrolled_at     timestamptz NOT NULL DEFAULT now(),

  -- Computed completion percentages (updated on every task status change)
  learning_completion_pct  integer NOT NULL DEFAULT 0,
  overall_completion_pct   integer NOT NULL DEFAULT 0,

  -- Activation gate fields
  activation_recommended_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  activation_recommended_at   timestamptz,
  activation_recommendation_note text,
  activation_ready_at         timestamptz,  -- set by system when all 5 gates pass
  activated_at                timestamptz,
  activated_by                uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Milestone timestamps (mirrored from task assignments for fast queries)
  modules_completed_at    timestamptz,
  documents_approved_at   timestamptz,
  contract_signed_at      timestamptz,
  placement_accepted_at   timestamptz,

  -- Hold / withdrawal
  on_hold_at        timestamptz,
  on_hold_by        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  on_hold_reason    text,
  pre_hold_status   text,
  withdrawn_at      timestamptz,
  withdrawn_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  withdrawal_reason text,

  notes             text,
  last_activity_at  timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── 6. Onboarding Task Assignments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_task_assignments (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid    NOT NULL REFERENCES onboarding_enrollments(id) ON DELETE CASCADE,
  task_id       uuid    NOT NULL REFERENCES onboarding_tasks(id) ON DELETE RESTRICT,
  task_version  integer NOT NULL,
  status        text    NOT NULL DEFAULT 'not_started',

  started_at    timestamptz,
  completed_at  timestamptz,

  -- Quiz fields
  best_score_pct    integer,
  attempts          integer NOT NULL DEFAULT 0,
  last_attempted_at timestamptz,

  -- Upload / document fields
  document_id     uuid REFERENCES staff_documents(id) ON DELETE SET NULL,
  reviewed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  rejection_reason text,

  -- Declaration / contract fields
  declaration_name        text,
  declaration_signed_at   timestamptz,
  declaration_version     integer,

  -- Director manual override
  manually_completed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  manually_completed_at     timestamptz,
  manually_completed_reason text,

  display_order integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Now safe to add the FK on staff_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_staff_docs_task_assignment'
  ) THEN
    ALTER TABLE staff_documents
      ADD CONSTRAINT fk_staff_docs_task_assignment
      FOREIGN KEY (onboarding_task_assignment_id)
      REFERENCES onboarding_task_assignments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── 7. Quiz Banks ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_quiz_banks (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       uuid    NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
  question      text    NOT NULL,
  options       jsonb   NOT NULL,
  correct_index integer NOT NULL,   -- NEVER returned to client
  explanation   text,
  category_tag  text,
  difficulty    text CHECK (difficulty IN ('easy','medium','hard')),
  is_active     boolean NOT NULL DEFAULT true,
  created_by    uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── 8. Quiz Attempts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_quiz_attempts (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  task_assignment_id   uuid    NOT NULL REFERENCES onboarding_task_assignments(id) ON DELETE CASCADE,
  staff_id             uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_ids         jsonb   NOT NULL,  -- array of question UUIDs drawn (audit only)
  score                integer NOT NULL,
  max_score            integer NOT NULL,
  passed               boolean NOT NULL,
  attempted_at         timestamptz NOT NULL DEFAULT now()
);

-- ─── 9. Placement Offers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_placement_offers (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      uuid    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  enrollment_id uuid    REFERENCES onboarding_enrollments(id) ON DELETE SET NULL,

  -- School / venue
  school_id               uuid REFERENCES schools(id) ON DELETE SET NULL,
  school_name_override    text,
  school_address          text,
  region                  text,
  programme_name          text,

  -- Schedule
  session_day             text,
  session_start_time      text,
  session_finish_time     text,
  expected_arrival_time   text,

  -- Role & pay
  role                    text NOT NULL,
  pay_rate                numeric(10,2),
  pay_basis               text CHECK (pay_basis IN ('per_session','per_hour')),

  -- Dates & term
  planned_start_date      date,
  placement_end_date      date,
  term_or_semester        text,
  placement_type          text CHECK (placement_type IN ('permanent','temporary','cover','trial')),

  -- Personnel
  lead_coach_id           uuid REFERENCES profiles(id) ON DELETE SET NULL,
  area_lead_id            uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reporting_contact       text,

  -- Children & class
  class_age_group         text,
  expected_num_children   integer,

  -- Requirements
  required_qualifications text,
  required_first_aid      boolean,
  required_dbs_status     text,

  -- Logistics
  uniform_requirements              text,
  equipment_access_info             text,
  school_arrival_signin_instructions text,
  parking_travel_info               text,
  additional_responsibilities       text,
  special_placement_notes           text,

  -- Offer admin
  issued_by           uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  issued_at           timestamptz NOT NULL DEFAULT now(),
  acceptance_deadline timestamptz,

  -- Staff response
  status              text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','withdrawn','clarification_requested')),
  responded_at        timestamptz,
  decline_reason      text,
  clarification_message text,

  -- Acceptance declaration
  acceptance_declaration_confirmed boolean NOT NULL DEFAULT false,
  acceptance_declaration_name      text,
  acceptance_declaration_at        timestamptz,

  admin_notes     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── 10. Document Renewal Requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_renewal_requests (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id              uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_category     text    NOT NULL,
  original_document_id  uuid    REFERENCES staff_documents(id) ON DELETE SET NULL,
  reason                text    NOT NULL
    CHECK (reason IN ('expiry_approaching','expired','rejected','policy_change')),
  due_date              date,
  status                text    NOT NULL DEFAULT 'outstanding'
    CHECK (status IN ('outstanding','submitted','approved','waived')),
  requested_by          uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  requested_at          timestamptz NOT NULL DEFAULT now(),
  fulfilled_document_id uuid    REFERENCES staff_documents(id) ON DELETE SET NULL,
  fulfilled_at          timestamptz,
  waived_by             uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  waived_at             timestamptz,
  waiver_reason         text,
  notes                 text
);

-- ─── 11. Audit Log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_audit_log (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid    REFERENCES onboarding_enrollments(id) ON DELETE SET NULL,
  staff_id      uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id      uuid    NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  actor_role    text    NOT NULL,
  event_type    text    NOT NULL,
  payload       jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_staff      ON onboarding_audit_log(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_enrollment ON onboarding_audit_log(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created    ON onboarding_audit_log(created_at DESC);

-- Useful index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_enrollments_staff    ON onboarding_enrollments(staff_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status   ON onboarding_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_enrollment ON onboarding_task_assignments(enrollment_id);

-- ─── 12. Seed the 16 Stages ─────────────────────────────────────────────────
INSERT INTO onboarding_stages (title, description, display_order, role_assignments, enrollment_types, exclude_from_pct)
VALUES
  ('Welcome to Active School',
   'Introduction to who we are, what we do and what to expect',
   1, ARRAY['all'], ARRAY['initial'], false),

  ('Personal Profile Review',
   'Confirm and update your personal information',
   2, ARRAY['all'], ARRAY['initial'], false),

  ('Emergency Contact and Medical Information',
   'Emergency contacts and any relevant medical information we need to hold',
   3, ARRAY['all'], ARRAY['initial'], false),

  ('Role, Responsibilities and Reporting Structure',
   'Your role at Active School, who you report to, and how we work as a team',
   4, ARRAY['all'], ARRAY['initial'], false),

  ('Proof of Identity and Right to Work',
   'Required identity documents and employment eligibility',
   5, ARRAY['all'], ARRAY['initial'], false),

  ('Safeguarding Training',
   'Mandatory safeguarding learning, knowledge check and certificate upload',
   6, ARRAY['all'], ARRAY['initial','refresher'], false),

  ('DBS Information and Upload',
   'DBS requirements for your role and certificate upload where applicable',
   7, ARRAY['all'], ARRAY['initial'], false),

  ('First Aid and Qualification Uploads',
   'First aid certification and any other required qualifications',
   8, ARRAY['all'], ARRAY['initial'], false),

  ('Staff Handbook',
   'Active School policies, expectations and standards of conduct',
   9, ARRAY['all'], ARRAY['initial','refresher'], false),

  ('Standard Operating Procedures',
   'Mandatory operational procedures for your role',
   10, ARRAY['all'], ARRAY['initial','refresher'], false),

  ('Health, Safety and Risk Management',
   'Equipment safety, dynamic risk assessment, emergencies, allergies and when to stop a session',
   11, ARRAY['all'], ARRAY['initial'], false),

  ('Role Specific Training',
   'Training content and responsibilities specific to your role',
   12, ARRAY['all'], ARRAY['initial'], false),

  ('School Conduct and Professional Communication',
   'Standards for working in schools and communicating with staff, parents and children',
   13, ARRAY['all'], ARRAY['initial'], false),

  ('Final Knowledge Assessment',
   'A final assessment covering all areas of your onboarding',
   14, ARRAY['all'], ARRAY['initial'], false),

  ('Declarations and Contract Signing',
   'Final declarations and your employment contract',
   15, ARRAY['all'], ARRAY['initial'], false),

  ('Coach Placement Offer and Acceptance',
   'Your school placement details — issued by your area lead once you are ready',
   16, ARRAY['all'], ARRAY['initial'], true)   -- exclude_from_pct = true

ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF MIGRATION
-- All tables created. Run onboarding_system_rls.sql next to add RLS policies.
-- =============================================================================
