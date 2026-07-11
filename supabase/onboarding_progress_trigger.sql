-- =============================================================================
-- ASO Onboarding - Progress tracking trigger
--
-- Keeps onboarding_enrollments.learning_completion_pct in sync with
-- onboarding_task_assignments status changes.
--
-- Counts only: mandatory tasks, active tasks, in stages not excluded from %.
-- Statuses counted as complete: 'completed', 'approved'.
--
-- Safe to re-run: uses CREATE OR REPLACE for the function and
-- DROP TRIGGER IF EXISTS before CREATE TRIGGER.
-- =============================================================================

-- ─── 1. Trigger function ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_update_learning_completion_pct()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE onboarding_enrollments oe
  SET learning_completion_pct = (
    SELECT COALESCE(
      ROUND(
        COUNT(*) FILTER (WHERE ota.status IN ('completed', 'approved')) * 100.0
        / NULLIF(COUNT(*), 0)
      )::integer,
      0
    )
    FROM   onboarding_task_assignments ota
    JOIN   onboarding_tasks t  ON t.id = ota.task_id
    JOIN   onboarding_stages s ON s.id = t.stage_id
    WHERE  ota.enrollment_id      = NEW.enrollment_id
      AND  t.is_mandatory         = true
      AND  t.is_active            = true
      AND  s.exclude_from_pct     = false
      AND  s.is_active            = true
  ),
  updated_at = now()
  WHERE oe.id = NEW.enrollment_id;

  RETURN NEW;
END;
$$;

-- ─── 2. Attach trigger ───────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_update_learning_completion_pct
  ON onboarding_task_assignments;

CREATE TRIGGER trg_update_learning_completion_pct
AFTER INSERT OR UPDATE OF status
ON onboarding_task_assignments
FOR EACH ROW
EXECUTE FUNCTION fn_update_learning_completion_pct();

-- ─── 3. Backfill existing enrollments ────────────────────────────────────────

UPDATE onboarding_enrollments oe
SET learning_completion_pct = (
  SELECT COALESCE(
    ROUND(
      COUNT(*) FILTER (WHERE ota.status IN ('completed', 'approved')) * 100.0
      / NULLIF(COUNT(*), 0)
    )::integer,
    0
  )
  FROM   onboarding_task_assignments ota
  JOIN   onboarding_tasks t  ON t.id = ota.task_id
  JOIN   onboarding_stages s ON s.id = t.stage_id
  WHERE  ota.enrollment_id  = oe.id
    AND  t.is_mandatory      = true
    AND  t.is_active         = true
    AND  s.exclude_from_pct  = false
    AND  s.is_active         = true
);
