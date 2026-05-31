-- Academic semester tracking system.
-- Run once in Supabase SQL editor.

-- ── Table ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academic_semesters (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year    text        NOT NULL,                            -- e.g. '2025/2026'
  semester_number  integer     NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
  label            text,                                           -- optional friendly name
  start_date       date,
  end_date         date,
  is_current       boolean     NOT NULL DEFAULT false,
  is_archived      boolean     NOT NULL DEFAULT false,
  archived_at      timestamptz,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (academic_year, semester_number)
);

-- Only one current semester at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_semester
  ON academic_semesters (is_current) WHERE is_current = true;

ALTER TABLE academic_semesters ENABLE ROW LEVEL SECURITY;

-- All authenticated staff can read
CREATE POLICY "Staff read semesters"
  ON academic_semesters FOR SELECT
  USING (auth.role() = 'authenticated');

-- Directors / area leads manage semesters
CREATE POLICY "Directors manage semesters"
  ON academic_semesters FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('director', 'area_lead')
    )
  );

-- ── Add academic_year to session_feedback ──────────────────────────────────────

ALTER TABLE session_feedback
  ADD COLUMN IF NOT EXISTS academic_year text NOT NULL DEFAULT '2025/2026';

-- ── Seed 2025/2026 semesters ───────────────────────────────────────────────────
-- S1–S5 archived, S6 current

INSERT INTO academic_semesters (academic_year, semester_number, label, is_current, is_archived, archived_at)
VALUES
  ('2025/2026', 1, 'Semester 1', false, true,  now()),
  ('2025/2026', 2, 'Semester 2', false, true,  now()),
  ('2025/2026', 3, 'Semester 3', false, true,  now()),
  ('2025/2026', 4, 'Semester 4', false, true,  now()),
  ('2025/2026', 5, 'Semester 5', false, true,  now()),
  ('2025/2026', 6, 'Semester 6', true,  false, null)
ON CONFLICT (academic_year, semester_number) DO NOTHING;

-- Verify:
SELECT academic_year, semester_number, label, is_current, is_archived
FROM academic_semesters
ORDER BY academic_year DESC, semester_number;
