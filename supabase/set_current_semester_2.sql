-- Sets Semester 2 (of whichever academic year is currently active) as the
-- current semester for Lesson Plans. Safe to re-run.

DO $$
DECLARE
  yr text;
BEGIN
  SELECT academic_year INTO yr FROM academic_semesters WHERE is_current = true LIMIT 1;
  IF yr IS NULL THEN
    RAISE EXCEPTION 'No current semester found in academic_semesters — check the table manually';
  END IF;

  -- Unset whatever is currently marked active
  UPDATE academic_semesters SET is_current = false WHERE is_current = true;

  -- Make sure Semester 2 exists for that academic year
  INSERT INTO academic_semesters (academic_year, semester_number, label)
  VALUES (yr, 2, 'Semester 2')
  ON CONFLICT (academic_year, semester_number) DO NOTHING;

  -- Mark it current and un-archive it
  UPDATE academic_semesters
  SET is_current = true, is_archived = false, archived_at = null
  WHERE academic_year = yr AND semester_number = 2;
END $$;

SELECT academic_year, semester_number, label, is_current, is_archived
FROM academic_semesters
ORDER BY academic_year DESC, semester_number;
