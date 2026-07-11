-- =============================================================================
-- ASO Onboarding - Reset erroneously auto-completed quiz assignments
--
-- Background: when the quiz bank was empty, draw_quiz_questions returned 0
-- questions, which were auto-submitted as 0/0 = 100% and marked as passed.
-- This script resets those assignments so staff can retake the quizzes
-- properly once the quiz bank is populated.
--
-- Run AFTER: onboarding_seed_quiz_bank.sql
-- Safe to re-run: only resets assignments where best_score_pct = 100 AND
-- the corresponding quiz task now has questions in the bank.
-- =============================================================================

UPDATE onboarding_task_assignments ota
SET
  status             = 'not_started',
  completed_at       = NULL,
  attempts           = 0,
  best_score_pct     = NULL,
  updated_at         = now()
WHERE
  -- Only quiz-type tasks
  task_id IN (
    SELECT id FROM onboarding_tasks WHERE task_type = 'quiz'
  )
  -- Only assignments that were auto-passed with 0 questions (perfect score, 0 attempts logged)
  AND status = 'completed'
  AND best_score_pct = 100
  -- Only where the quiz bank now has real questions
  AND task_id IN (
    SELECT DISTINCT task_id FROM onboarding_quiz_banks
  );
