-- =============================================================================
-- ASO App — Onboarding System Phase 2
-- Run this file in the Supabase SQL Editor after onboarding_system_v2.sql
-- and onboarding_system_rls.sql.
-- Fully idempotent: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout.
-- =============================================================================


-- =============================================================================
-- SECTION 1: Extend onboarding_tasks
-- =============================================================================

ALTER TABLE onboarding_tasks
  ADD COLUMN IF NOT EXISTS max_attempts               integer,        -- NULL = unlimited
  ADD COLUMN IF NOT EXISTS retry_delay_seconds        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_correct_answers       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_cert_number       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_completion_date   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_approval          boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allowed_file_types         text[]  NOT NULL DEFAULT ARRAY['pdf','jpg','jpeg','png','doc','docx'],
  ADD COLUMN IF NOT EXISTS max_file_size_mb           integer NOT NULL DEFAULT 10;


-- =============================================================================
-- SECTION 2: Extend onboarding_task_assignments
-- =============================================================================

ALTER TABLE onboarding_task_assignments
  ADD COLUMN IF NOT EXISTS content_version_completed    integer,
  ADD COLUMN IF NOT EXISTS declaration_text_snapshot    text,
  ADD COLUMN IF NOT EXISTS progress_data                jsonb;

-- Unique index on (enrollment_id, task_id) to support ON CONFLICT upsert.
-- We guard with a DO block so re-running this file is safe.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_indexes
    WHERE  schemaname = 'public'
    AND    tablename  = 'onboarding_task_assignments'
    AND    indexname  = 'uq_task_assignments_enrollment_task'
  ) THEN
    CREATE UNIQUE INDEX uq_task_assignments_enrollment_task
      ON onboarding_task_assignments (enrollment_id, task_id);
  END IF;
END $$;


-- =============================================================================
-- SECTION 3: Extend onboarding_quiz_attempts
-- =============================================================================

ALTER TABLE onboarding_quiz_attempts
  ADD COLUMN IF NOT EXISTS is_pending              boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS drawn_at                timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS submitted_at            timestamptz,
  ADD COLUMN IF NOT EXISTS incorrect_question_ids  jsonb;


-- =============================================================================
-- SECTION 4: Task prerequisites table
-- =============================================================================

CREATE TABLE IF NOT EXISTS onboarding_task_prerequisites (
  task_id          uuid NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
  required_task_id uuid NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, required_task_id),
  CHECK (task_id <> required_task_id)
);

-- RLS: enable and create policies
ALTER TABLE onboarding_task_prerequisites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_prerequisites_select_authenticated" ON onboarding_task_prerequisites;
CREATE POLICY "task_prerequisites_select_authenticated"
  ON onboarding_task_prerequisites FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "task_prerequisites_manage_director" ON onboarding_task_prerequisites;
CREATE POLICY "task_prerequisites_manage_director"
  ON onboarding_task_prerequisites FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND   role = 'director'
    )
  );


-- =============================================================================
-- SECTION 5: Staff INSERT policy on onboarding_task_assignments
-- Allows a staff member to create their own task assignment row (e.g. when
-- the draw_quiz_questions RPC needs to upsert via the client, or for content
-- tasks where the front end calls upsert directly).
-- =============================================================================

DROP POLICY IF EXISTS "task_assignments_staff_own_insert" ON onboarding_task_assignments;
CREATE POLICY "task_assignments_staff_own_insert"
  ON onboarding_task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM onboarding_enrollments
      WHERE  id       = enrollment_id
      AND    staff_id = auth.uid()
      AND    status NOT IN ('withdrawn', 'inactive')
    )
  );


-- =============================================================================
-- SECTION 6: draw_quiz_questions RPC
--
-- Draws a fresh set of quiz questions for a task assignment, or resumes an
-- existing pending attempt.  Returns question data WITHOUT correct_index.
-- =============================================================================

CREATE OR REPLACE FUNCTION draw_quiz_questions(
  p_task_assignment_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment   onboarding_task_assignments%ROWTYPE;
  v_enrollment   onboarding_enrollments%ROWTYPE;
  v_task         onboarding_tasks%ROWTYPE;
  v_pending_attempt onboarding_quiz_attempts%ROWTYPE;
  v_question_ids uuid[];
  v_new_attempt_id uuid;
  v_questions    jsonb;
  v_seconds_remaining numeric;
BEGIN
  -- ── 1. Fetch task assignment ───────────────────────────────────────────────
  SELECT * INTO v_assignment
  FROM   onboarding_task_assignments
  WHERE  id = p_task_assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'task_assignment_not_found'
      USING HINT = 'No task assignment with id ' || p_task_assignment_id;
  END IF;

  -- ── 2. Verify caller owns this enrollment ─────────────────────────────────
  SELECT * INTO v_enrollment
  FROM   onboarding_enrollments
  WHERE  id = v_assignment.enrollment_id;

  IF v_enrollment.staff_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized'
      USING HINT = 'You do not own this enrollment';
  END IF;

  -- ── 3. Verify the task is a quiz ──────────────────────────────────────────
  SELECT * INTO v_task
  FROM   onboarding_tasks
  WHERE  id = v_assignment.task_id;

  IF v_task.type <> 'quiz' THEN
    RAISE EXCEPTION 'not_a_quiz_task'
      USING HINT = 'Task type is ' || v_task.type || ', expected quiz';
  END IF;

  -- ── 4. Check enrollment is active ────────────────────────────────────────
  IF v_enrollment.status IN ('withdrawn', 'inactive', 'on_hold') THEN
    RAISE EXCEPTION 'enrollment_not_active'
      USING HINT = 'Enrollment status is ' || v_enrollment.status;
  END IF;

  -- ── 5. Check max_attempts cap ─────────────────────────────────────────────
  IF v_task.max_attempts IS NOT NULL
     AND v_assignment.attempts >= v_task.max_attempts
  THEN
    RAISE EXCEPTION 'max_attempts_reached'
      USING HINT = 'Maximum of ' || v_task.max_attempts || ' attempt(s) allowed';
  END IF;

  -- ── 6. Check retry delay ──────────────────────────────────────────────────
  IF v_assignment.last_attempted_at IS NOT NULL
     AND v_task.retry_delay_seconds > 0
     AND now() < v_assignment.last_attempted_at + (v_task.retry_delay_seconds || ' seconds')::interval
  THEN
    v_seconds_remaining := EXTRACT(EPOCH FROM (
      v_assignment.last_attempted_at
      + (v_task.retry_delay_seconds || ' seconds')::interval
      - now()
    ));
    RAISE EXCEPTION 'retry_delay_not_elapsed: % seconds remaining',
      ceil(v_seconds_remaining)::text
      USING HINT = 'Wait before retrying';
  END IF;

  -- ── 7. Check for an existing pending attempt (resume) ─────────────────────
  SELECT * INTO v_pending_attempt
  FROM   onboarding_quiz_attempts
  WHERE  task_assignment_id = p_task_assignment_id
  AND    is_pending          = true
  LIMIT  1;

  IF FOUND THEN
    -- Extract the previously drawn question IDs
    SELECT array_agg(q_id::uuid ORDER BY ordinality)
    INTO   v_question_ids
    FROM   jsonb_array_elements_text(v_pending_attempt.question_ids)
             WITH ORDINALITY AS t(q_id, ordinality);

    -- Return existing questions WITHOUT correct_index
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',           qb.id,
        'question',     qb.question,
        'options',      qb.options,
        'category_tag', qb.category_tag
      )
    )
    INTO v_questions
    FROM onboarding_quiz_banks qb
    WHERE qb.id = ANY(v_question_ids);

    RETURN jsonb_build_object(
      'attempt_id', v_pending_attempt.id,
      'resumed',    true,
      'questions',  v_questions
    );
  END IF;

  -- ── 8. Draw new questions at random ───────────────────────────────────────
  SELECT array_agg(id)
  INTO   v_question_ids
  FROM (
    SELECT id
    FROM   onboarding_quiz_banks
    WHERE  task_id   = v_assignment.task_id
    AND    is_active = true
    ORDER  BY random()
    LIMIT  COALESCE(v_task.questions_per_attempt, 10)
  ) AS drawn;

  IF v_question_ids IS NULL OR array_length(v_question_ids, 1) = 0 THEN
    RAISE EXCEPTION 'no_questions_available'
      USING HINT = 'No active questions found for task ' || v_assignment.task_id;
  END IF;

  -- ── 9. Insert new pending attempt ────────────────────────────────────────
  INSERT INTO onboarding_quiz_attempts (
    task_assignment_id,
    staff_id,
    question_ids,
    score,
    max_score,
    passed,
    is_pending,
    drawn_at,
    attempted_at
  )
  VALUES (
    p_task_assignment_id,
    auth.uid(),
    to_jsonb(v_question_ids),
    0,
    array_length(v_question_ids, 1),
    false,
    true,
    now(),
    now()
  )
  RETURNING id INTO v_new_attempt_id;

  -- ── 10. Update task assignment to in-progress ─────────────────────────────
  UPDATE onboarding_task_assignments
  SET
    started_at  = COALESCE(started_at, now()),
    status      = CASE
                    WHEN status = 'not_started' THEN 'in_progress'
                    ELSE status
                  END,
    updated_at  = now()
  WHERE id = p_task_assignment_id;

  -- ── 11. Fetch and return questions WITHOUT correct_index ──────────────────
  SELECT jsonb_agg(
    jsonb_build_object(
      'id',           qb.id,
      'question',     qb.question,
      'options',      qb.options,
      'category_tag', qb.category_tag
    )
    ORDER BY array_position(v_question_ids, qb.id)
  )
  INTO v_questions
  FROM onboarding_quiz_banks qb
  WHERE qb.id = ANY(v_question_ids);

  RETURN jsonb_build_object(
    'attempt_id', v_new_attempt_id,
    'resumed',    false,
    'questions',  v_questions
  );
END;
$$;


-- =============================================================================
-- SECTION 7: submit_quiz_attempt RPC
--
-- Scores an in-progress quiz attempt, persists results, and returns detailed
-- per-question feedback.  correct_index is only exposed back to the client
-- if the task has show_correct_answers = true.
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
  -- ── 1. Fetch attempt — must still be pending ──────────────────────────────
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
      -- Skip questions not in the bank (defensive; shouldn't happen)
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
  -- Extract ordered question IDs from the attempt
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
      'correct_option', CASE
                          WHEN v_task.show_correct_answers
                          THEN qb.options->qb.correct_index
                          ELSE NULL
                        END
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


-- =============================================================================
-- SECTION 8: Grant execute permissions to authenticated users
-- =============================================================================

GRANT EXECUTE ON FUNCTION draw_quiz_questions(uuid)        TO authenticated;
GRANT EXECUTE ON FUNCTION submit_quiz_attempt(uuid, jsonb) TO authenticated;


-- =============================================================================
-- END OF PHASE 2 MIGRATION
-- =============================================================================
