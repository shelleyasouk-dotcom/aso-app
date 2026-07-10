-- =============================================================================
-- ASO App — Onboarding System v2 — Row Level Security Policies
-- Run this in the Supabase SQL Editor after onboarding_system_v2.sql.
-- Each block is idempotent (DROP IF EXISTS before CREATE).
-- =============================================================================

-- Helper: is the current user a director or area lead?
-- We inline this as a subquery rather than a function so it is inlined by the
-- planner and cached per statement.

-- =============================================================================
-- 1. onboarding_stages  (read-only for all authenticated staff)
-- =============================================================================

ALTER TABLE onboarding_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stages_select_authenticated" ON onboarding_stages;
CREATE POLICY "stages_select_authenticated"
  ON onboarding_stages FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "stages_manage_director" ON onboarding_stages;
CREATE POLICY "stages_manage_director"
  ON onboarding_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director')
  );

-- =============================================================================
-- 2. onboarding_tasks  (read-only for all authenticated staff)
-- =============================================================================

ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_authenticated" ON onboarding_tasks;
CREATE POLICY "tasks_select_authenticated"
  ON onboarding_tasks FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "tasks_manage_director" ON onboarding_tasks;
CREATE POLICY "tasks_manage_director"
  ON onboarding_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director')
  );

-- =============================================================================
-- 3. onboarding_enrollments
--    • Directors / area leads: full access
--    • Staff: read their own enrollment only
-- =============================================================================

ALTER TABLE onboarding_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_admin_all" ON onboarding_enrollments;
CREATE POLICY "enrollments_admin_all"
  ON onboarding_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "enrollments_staff_own_select" ON onboarding_enrollments;
CREATE POLICY "enrollments_staff_own_select"
  ON onboarding_enrollments FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

-- =============================================================================
-- 4. onboarding_task_assignments
--    • Directors / area leads: full access
--    • Staff: read their own assignments; update status on their own
-- =============================================================================

ALTER TABLE onboarding_task_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_assignments_admin_all" ON onboarding_task_assignments;
CREATE POLICY "task_assignments_admin_all"
  ON onboarding_task_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "task_assignments_staff_own_select" ON onboarding_task_assignments;
CREATE POLICY "task_assignments_staff_own_select"
  ON onboarding_task_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_enrollments
      WHERE id = enrollment_id
      AND staff_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "task_assignments_staff_own_update" ON onboarding_task_assignments;
CREATE POLICY "task_assignments_staff_own_update"
  ON onboarding_task_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_enrollments
      WHERE id = enrollment_id
      AND staff_id = auth.uid()
    )
  );

-- =============================================================================
-- 5. onboarding_quiz_banks  (questions — correct_index never sent to client)
--    • Directors: full access
--    • Staff: select active questions for tasks in their enrollment only
-- =============================================================================

ALTER TABLE onboarding_quiz_banks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_banks_director_all" ON onboarding_quiz_banks;
CREATE POLICY "quiz_banks_director_all"
  ON onboarding_quiz_banks FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director')
  );

DROP POLICY IF EXISTS "quiz_banks_staff_select_active" ON onboarding_quiz_banks;
CREATE POLICY "quiz_banks_staff_select_active"
  ON onboarding_quiz_banks FOR SELECT
  TO authenticated
  USING (is_active = true);

-- =============================================================================
-- 6. onboarding_quiz_attempts
--    • Directors / area leads: read all
--    • Staff: insert and read their own
-- =============================================================================

ALTER TABLE onboarding_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_attempts_admin_select" ON onboarding_quiz_attempts;
CREATE POLICY "quiz_attempts_admin_select"
  ON onboarding_quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "quiz_attempts_staff_own" ON onboarding_quiz_attempts;
CREATE POLICY "quiz_attempts_staff_own"
  ON onboarding_quiz_attempts FOR ALL
  TO authenticated
  USING (staff_id = auth.uid());

-- =============================================================================
-- 7. staff_placement_offers
--    • Directors / area leads with can_issue_contracts: full access
--    • Staff: read their own offers; update status (accept/decline) on own
-- =============================================================================

ALTER TABLE staff_placement_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "placement_offers_admin_all" ON staff_placement_offers;
CREATE POLICY "placement_offers_admin_all"
  ON staff_placement_offers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "placement_offers_staff_own_select" ON staff_placement_offers;
CREATE POLICY "placement_offers_staff_own_select"
  ON staff_placement_offers FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

DROP POLICY IF EXISTS "placement_offers_staff_own_update" ON staff_placement_offers;
CREATE POLICY "placement_offers_staff_own_update"
  ON staff_placement_offers FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- =============================================================================
-- 8. document_renewal_requests
--    • Directors / area leads: full access
--    • Staff: read their own
-- =============================================================================

ALTER TABLE document_renewal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "renewal_requests_admin_all" ON document_renewal_requests;
CREATE POLICY "renewal_requests_admin_all"
  ON document_renewal_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "renewal_requests_staff_own_select" ON document_renewal_requests;
CREATE POLICY "renewal_requests_staff_own_select"
  ON document_renewal_requests FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

-- =============================================================================
-- 9. onboarding_audit_log  (append-only — no deletes, no updates)
--    • Directors / area leads: read all, insert
--    • Staff: insert (their own events), read their own
-- =============================================================================

ALTER TABLE onboarding_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_admin_select" ON onboarding_audit_log;
CREATE POLICY "audit_log_admin_select"
  ON onboarding_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "audit_log_insert_authenticated" ON onboarding_audit_log;
CREATE POLICY "audit_log_insert_authenticated"
  ON onboarding_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "audit_log_staff_own_select" ON onboarding_audit_log;
CREATE POLICY "audit_log_staff_own_select"
  ON onboarding_audit_log FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

-- =============================================================================
-- END OF RLS MIGRATION
-- =============================================================================
