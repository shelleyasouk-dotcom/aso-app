-- =============================================================================
-- Fix: learning_completion_pct denominator
--
-- BUG: The original trigger divided by COUNT(*) of task assignment rows
-- that already exist, NOT by the total number of qualifying tasks. So when
-- a new coach opens just one task, creates that assignment, and completes it,
-- they get 1/1 = 100% and auto-activate immediately.
--
-- FIX: Split the calculation into:
--   numerator   = assignments with status completed/approved (same as before)
--   denominator = ALL qualifying tasks in the system (from onboarding_tasks,
--                 not from onboarding_task_assignments)
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_update_learning_completion_pct()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_tasks integer;
  v_completed   integer;
BEGIN
  -- Total qualifying tasks in the system (independent of who has opened them)
  SELECT COUNT(*)
  INTO   v_total_tasks
  FROM   onboarding_tasks t
  JOIN   onboarding_stages s ON s.id = t.stage_id
  WHERE  t.is_mandatory     = true
    AND  t.is_active        = true
    AND  s.exclude_from_pct = false
    AND  s.is_active        = true;

  -- How many of those this enrollment has actually completed/approved
  SELECT COUNT(*)
  INTO   v_completed
  FROM   onboarding_task_assignments ota
  JOIN   onboarding_tasks t  ON t.id = ota.task_id
  JOIN   onboarding_stages s ON s.id = t.stage_id
  WHERE  ota.enrollment_id   = NEW.enrollment_id
    AND  ota.status         IN ('completed', 'approved')
    AND  t.is_mandatory      = true
    AND  t.is_active         = true
    AND  s.exclude_from_pct  = false
    AND  s.is_active         = true;

  UPDATE onboarding_enrollments
  SET    learning_completion_pct = CASE
           WHEN v_total_tasks = 0 THEN 0
           ELSE ROUND(v_completed * 100.0 / v_total_tasks)::integer
         END,
         updated_at = now()
  WHERE  id = NEW.enrollment_id;

  RETURN NEW;
END;
$$;

-- Trigger already exists — just replacing the function is enough.
-- Run this to be safe:
DROP TRIGGER IF EXISTS trg_update_learning_completion_pct
  ON onboarding_task_assignments;

CREATE TRIGGER trg_update_learning_completion_pct
AFTER INSERT OR UPDATE OF status
ON onboarding_task_assignments
FOR EACH ROW
EXECUTE FUNCTION fn_update_learning_completion_pct();

-- Backfill all existing enrollments to correct values
UPDATE onboarding_enrollments oe
SET    learning_completion_pct = (
  SELECT CASE
    WHEN (
      SELECT COUNT(*)
      FROM   onboarding_tasks t
      JOIN   onboarding_stages s ON s.id = t.stage_id
      WHERE  t.is_mandatory     = true
        AND  t.is_active        = true
        AND  s.exclude_from_pct = false
        AND  s.is_active        = true
    ) = 0 THEN 0
    ELSE ROUND(
      (
        SELECT COUNT(*)
        FROM   onboarding_task_assignments ota
        JOIN   onboarding_tasks t  ON t.id = ota.task_id
        JOIN   onboarding_stages s ON s.id = t.stage_id
        WHERE  ota.enrollment_id   = oe.id
          AND  ota.status         IN ('completed', 'approved')
          AND  t.is_mandatory      = true
          AND  t.is_active         = true
          AND  s.exclude_from_pct  = false
          AND  s.is_active         = true
      ) * 100.0
      / (
        SELECT COUNT(*)
        FROM   onboarding_tasks t
        JOIN   onboarding_stages s ON s.id = t.stage_id
        WHERE  t.is_mandatory     = true
          AND  t.is_active        = true
          AND  s.exclude_from_pct = false
          AND  s.is_active        = true
      )
    )::integer
  END
);
