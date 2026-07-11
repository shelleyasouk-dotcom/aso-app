-- =============================================================================
-- ASO Onboarding - Admin document review
--
-- 1. RLS policy: admins / directors / area_leads can SELECT staff_documents
-- 2. RPC review_onboarding_document: approves or rejects a document upload,
--    atomically updating both staff_documents and the task assignment.
--
-- Safe to re-run: DROP POLICY IF EXISTS, CREATE OR REPLACE FUNCTION.
-- =============================================================================

-- ─── 1. RLS: allow management roles to read all staff_documents ───────────────

DROP POLICY IF EXISTS "mgmt_read_staff_documents" ON staff_documents;

CREATE POLICY "mgmt_read_staff_documents"
ON staff_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id  = auth.uid()
      AND profiles.role IN ('admin', 'director', 'area_lead')
  )
);

-- ─── 2. RPC: review_onboarding_document ──────────────────────────────────────
--
-- Parameters:
--   p_assignment_id      uuid   - the onboarding_task_assignments.id to review
--   p_action             text   - 'approved' or 'rejected'
--   p_rejection_reason   text   - required when p_action = 'rejected'
--
-- Returns: jsonb { ok: true } on success; raises exception on failure.

CREATE OR REPLACE FUNCTION review_onboarding_document(
  p_assignment_id    uuid,
  p_action           text,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role  text;
  v_assignment   onboarding_task_assignments%ROWTYPE;
  v_new_status   text;
BEGIN
  -- ── 1. Verify caller is a management role ─────────────────────────────────
  SELECT role INTO v_caller_role
  FROM   profiles
  WHERE  id = auth.uid();

  IF v_caller_role NOT IN ('admin', 'director', 'area_lead') THEN
    RAISE EXCEPTION 'unauthorized'
      USING HINT = 'Only admin, director, or area_lead can review documents';
  END IF;

  -- ── 2. Validate action ────────────────────────────────────────────────────
  IF p_action NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid_action'
      USING HINT = 'p_action must be approved or rejected';
  END IF;

  IF p_action = 'rejected' AND (p_rejection_reason IS NULL OR trim(p_rejection_reason) = '') THEN
    RAISE EXCEPTION 'rejection_reason_required'
      USING HINT = 'A rejection reason is required when rejecting a document';
  END IF;

  -- ── 3. Fetch task assignment ──────────────────────────────────────────────
  SELECT * INTO v_assignment
  FROM   onboarding_task_assignments
  WHERE  id = p_assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'assignment_not_found'
      USING HINT = 'No task assignment found with id ' || p_assignment_id;
  END IF;

  IF v_assignment.status NOT IN ('awaiting_review', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'not_reviewable'
      USING HINT = 'This assignment is not in a reviewable state';
  END IF;

  v_new_status := CASE p_action
    WHEN 'approved' THEN 'approved'
    WHEN 'rejected' THEN 'rejected'
  END;

  -- ── 4. Update task assignment ─────────────────────────────────────────────
  UPDATE onboarding_task_assignments
  SET
    status            = v_new_status,
    reviewed_by       = auth.uid(),
    reviewed_at       = now(),
    rejection_reason  = CASE WHEN p_action = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at        = now()
  WHERE id = p_assignment_id;

  -- ── 5. Update linked document if present ──────────────────────────────────
  IF v_assignment.document_id IS NOT NULL THEN
    UPDATE staff_documents
    SET
      status           = v_new_status,
      verified_by      = auth.uid(),
      verified_at      = now(),
      rejection_reason = CASE WHEN p_action = 'rejected' THEN p_rejection_reason ELSE NULL END
    WHERE id = v_assignment.document_id;
  END IF;

  -- ── 6. Audit log ──────────────────────────────────────────────────────────
  INSERT INTO onboarding_audit_log (
    enrollment_id, staff_id, actor_id, actor_role,
    event_type, payload
  )
  SELECT
    v_assignment.enrollment_id,
    e.staff_id,
    auth.uid(),
    v_caller_role,
    CASE p_action
      WHEN 'approved' THEN 'document_approved'
      WHEN 'rejected' THEN 'document_rejected'
    END,
    jsonb_build_object(
      'assignment_id',    p_assignment_id,
      'document_id',      v_assignment.document_id,
      'rejection_reason', p_rejection_reason
    )
  FROM onboarding_enrollments e
  WHERE e.id = v_assignment.enrollment_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION review_onboarding_document(uuid, text, text) TO authenticated;
