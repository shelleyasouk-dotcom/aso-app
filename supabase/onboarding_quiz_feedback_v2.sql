-- =============================================================================
-- ASO Onboarding - Quiz feedback v2
--
-- Updates submit_quiz_attempt to:
--   1. Always include correct_option in feedback (removes show_correct_answers gate)
--   2. Include selected_option (the answer the user actually picked)
--
-- Run this AFTER onboarding_phase2.sql (it replaces the function in-place).
-- Safe to re-run: uses CREATE OR REPLACE FUNCTION.
-- =============================================================================

CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_attempt_id uuid,
  p_answers    jsonb   -- array of {question_id: "uuid", answer_index: int}
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt      onboarding_quiz_attempts%ROWTYPE;
  v_assignment   onboarding_task_assignments%ROWTYPE;
  v_task         onboarding_tasks%ROWTYPE;
  v_enrollment   onboarding_enrollments%ROWTYPE;

  v_answer       jsonb;
  v_question_id  uuid;
  v_answer_index integer;
  v_correct_idx  integer;
  v_score        integer := 0;
  v_max_score    integer;
  v_wrong_ids    uuid[]  := ARRAY[]::uuid[];

  v_score_pct    integer;
  v_passed       boolean;
  v_attempt_number integer;
  v_can_retry    boolean;

  v_feedback     jsonb;
  v_question_ids uuid[];
  v_qb           onboarding_quiz_banks%ROWTYPE;
BEGIN
  -- ── 1. Fetch attempt - must still be pending ──────────────────────────────
  SELECT * INTO v_attempt
  FROM   onboarding_quiz_attempts
  WHERE  id = p_attempt_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt_not_found'
      USING HINT = 'No quiz attempt with id ' || p_attempt_id;
  END IF;

  IF NOT v_attempt.is_pending THEN
    RAISE EXCEPTION 'attempt_already_submitted'
      USING HINT = 'This attempt has already been submitted';
  END IF;

  -- ── 2. Verify caller owns this attempt ────────────────────────────────────
  IF v_attempt.staff_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized'
      USING HINT = 'You do not own this attempt';
  END IF;

  -- ── 3. Fetch related records ──────────────────────────────────────────────
  SELECT * INTO v_assignment
  FROM   onboarding_task_assignments
  WHERE  id = v_attempt.task_assignment_id;

  SELECT * INTO v_task
  FROM   onboarding_tasks
  WHERE  id = v_assignment.task_id;

  SELECT * INTO v_enrollment
  FROM   onboarding_enrollments
  WHERE  id = v_assignment.enrollment_id;

  v_max_score := v_attempt.max_score;

  -- ── 4. Score each submitted answer ───────────────────────────────────────
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_question_id  := (v_answer->>'question_id')::uuid;
    v_answer_index := (v_answer->>'answer_index')::integer;

    SELECT correct_index INTO v_correct_idx
    FROM   onboarding_quiz_banks
    WHERE  id = v_question_id;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    IF v_answer_index = v_correct_idx THEN
      v_score := v_score + 1;
    ELSE
      v_wrong_ids := array_append(v_wrong_ids, v_question_id);
    END IF;
  END LOOP;

  -- ── 5. Calculate percentage and pass/fail ─────────────────────────────────
  IF v_max_score = 0 THEN
    v_score_pct := 0;
  ELSE
    v_score_pct := round((v_score::numeric / v_max_score::numeric) * 100)::integer;
  END IF;

  v_passed := v_score_pct >= COALESCE(v_task.pass_threshold_pct, 80);

  -- ── 6. Derive attempt number ──────────────────────────────────────────────
  v_attempt_number := v_assignment.attempts + 1;

  -- ── 7. Can the staff member retry? ───────────────────────────────────────
  v_can_retry := (NOT v_passed)
    AND (
      v_task.max_attempts IS NULL
      OR v_attempt_number < v_task.max_attempts
    );

  -- ── 8. Persist quiz attempt results ──────────────────────────────────────
  UPDATE onboarding_quiz_attempts
  SET
    score                  = v_score,
    max_score              = v_max_score,
    passed                 = v_passed,
    is_pending             = false,
    submitted_at           = now(),
    attempted_at           = now(),
    incorrect_question_ids = to_jsonb(v_wrong_ids)
  WHERE id = p_attempt_id;

  -- ── 9. Persist task assignment progress ──────────────────────────────────
  UPDATE onboarding_task_assignments
  SET
    attempts          = v_attempt_number,
    last_attempted_at = now(),
    best_score_pct    = GREATEST(COALESCE(best_score_pct, 0), v_score_pct),
    status            = CASE WHEN v_passed THEN 'completed' ELSE 'in_progress' END,
    completed_at      = CASE WHEN v_passed THEN now() ELSE NULL END,
    updated_at        = now()
  WHERE id = v_attempt.task_assignment_id;

  -- ── 10. Build per-question feedback ───────────────────────────────────────
  SELECT array_agg(q_id::uuid ORDER BY ordinality)
  INTO   v_question_ids
  FROM   jsonb_array_elements_text(v_attempt.question_ids)
           WITH ORDINALITY AS t(q_id, ordinality);

  SELECT jsonb_agg(
    jsonb_build_object(
      'question_id',    qb.id,
      'question',       qb.question,
      'correct',        NOT (qb.id = ANY(v_wrong_ids)),
      'explanation',    qb.explanation,
      'correct_option', qb.options->qb.correct_index,
      'selected_option', qb.options->(
        SELECT (elem->>'answer_index')::int
        FROM   jsonb_array_elements(p_answers) AS elem
        WHERE  (elem->>'question_id')::uuid = qb.id
        LIMIT  1
      )
    )
    ORDER BY array_position(v_question_ids, qb.id)
  )
  INTO v_feedback
  FROM onboarding_quiz_banks qb
  WHERE qb.id = ANY(v_question_ids);

  -- ── 11. Return scored result ──────────────────────────────────────────────
  RETURN jsonb_build_object(
    'score',               v_score,
    'max_score',           v_max_score,
    'score_pct',           v_score_pct,
    'passed',              v_passed,
    'attempt_number',      v_attempt_number,
    'can_retry',           v_can_retry,
    'retry_after_seconds', CASE
                             WHEN v_can_retry THEN v_task.retry_delay_seconds
                             ELSE 0
                           END,
    'feedback',            v_feedback
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_quiz_attempt(uuid, jsonb) TO authenticated;
