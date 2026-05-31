-- Lesson plans and weekly session feedback system.
-- Run once in Supabase SQL editor.

-- ── Lesson plans ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_plans (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  semester           text        NOT NULL DEFAULT 'Semester 6',
  week_number        integer     NOT NULL,
  title              text        NOT NULL,
  objectives         text,
  warm_up            text,
  activities         text[]      NOT NULL DEFAULT '{}',
  cool_down          text,
  coaching_points    text,
  equipment_needed   text,
  resource_url       text,        -- optional downloadable PDF/doc URL
  is_published       boolean     NOT NULL DEFAULT false,
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff read published plans"
  ON lesson_plans FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

CREATE POLICY "Staff manage lesson plans"
  ON lesson_plans FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('director', 'area_lead')
    )
  );

-- ── Session feedback ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_feedback (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id        uuid        REFERENCES lesson_plans(id) ON DELETE SET NULL,
  school_id             uuid        REFERENCES schools(id),
  coach_id              uuid        REFERENCES profiles(id),
  session_date          date,
  overall_notes         text,
  activities_completed  text[]      NOT NULL DEFAULT '{}',
  highlights            text,
  challenges            text,
  photos                text[]      NOT NULL DEFAULT '{}',
  submitted_at          timestamptz DEFAULT now()
);

ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;

-- Coaches submit their own
CREATE POLICY "Coaches insert own feedback"
  ON session_feedback FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- Coaches update their own
CREATE POLICY "Coaches update own feedback"
  ON session_feedback FOR UPDATE
  USING (auth.uid() = coach_id);

-- All staff can read (for area leads / directors viewing reports)
CREATE POLICY "Authenticated staff read feedback"
  ON session_feedback FOR SELECT
  USING (auth.role() = 'authenticated');

-- Storage: feedback photos go into the existing coach-files bucket
-- under feedback/<feedback_id>/ — no new bucket needed.
