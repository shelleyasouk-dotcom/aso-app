-- Lesson Plans v2 — restructure session_feedback to use semester/week template model.
-- Lesson plan content is now static (TypeScript data) — no DB table needed for plans.
-- Run once in Supabase SQL editor.

-- ── Drop old lesson_plans table (content is now static TypeScript) ─────────────

-- First remove FK reference in session_feedback
ALTER TABLE session_feedback DROP COLUMN IF EXISTS lesson_plan_id;
ALTER TABLE session_feedback DROP COLUMN IF EXISTS session_date;
ALTER TABLE session_feedback DROP COLUMN IF EXISTS activities_completed;

-- ── Add new columns to session_feedback ──────────────────────────────────────

ALTER TABLE session_feedback
  ADD COLUMN IF NOT EXISTS semester_number  integer     NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS week_number      integer     NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS feedback_type    text        NOT NULL DEFAULT 'coach',
  ADD COLUMN IF NOT EXISTS days_worked      text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_dates    text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills_covered   text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS award_sign_offs  text;

-- ── Add check constraints ──────────────────────────────────────────────────────

ALTER TABLE session_feedback
  ADD CONSTRAINT chk_semester_number CHECK (semester_number BETWEEN 1 AND 6),
  ADD CONSTRAINT chk_week_number     CHECK (week_number BETWEEN 1 AND 6),
  ADD CONSTRAINT chk_feedback_type   CHECK (feedback_type IN ('lead', 'coach'));

-- ── Useful index for per-coach, per-semester/week lookups ─────────────────────

CREATE INDEX IF NOT EXISTS idx_sf_semester_week
  ON session_feedback (semester_number, week_number);

CREATE INDEX IF NOT EXISTS idx_sf_coach_semester
  ON session_feedback (coach_id, semester_number, week_number);

-- ── Drop old lesson_plans table (no longer needed) ────────────────────────────
-- Only run this line once you're sure there's no data you need to keep:
-- DROP TABLE IF EXISTS lesson_plans CASCADE;

-- ── RLS policies remain unchanged (coaches INSERT/UPDATE own; all staff SELECT)

-- Verify structure:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'session_feedback'
ORDER BY ordinal_position;
