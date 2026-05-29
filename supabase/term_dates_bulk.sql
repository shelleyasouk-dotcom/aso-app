-- Bulk insert all term dates for 2025-26 Summer Term 2 and full 2026-27 academic year.
-- Clears existing test data first. Run once in Supabase SQL editor.

-- 1. Remove existing term data
TRUNCATE club_terms CASCADE;

-- 2. Add excluded_dates column (stores teacher training days / exceptions)
ALTER TABLE club_terms ADD COLUMN IF NOT EXISTS excluded_dates date[] DEFAULT '{}';

-- 3. Bulk insert terms for every school that has a session_day set
WITH term_defs(term_name, start_date, end_date, pence_per_session) AS (
  VALUES
    ('Summer Term 2 2025-26',  '2026-06-01'::date, '2026-07-18'::date, 900),
    ('Autumn Term 1 2026-27',  '2026-09-07'::date, '2026-10-16'::date, 975),
    ('Autumn Term 2 2026-27',  '2026-11-02'::date, '2026-12-11'::date, 975),
    ('Spring Term 1 2026-27',  '2027-01-05'::date, '2027-02-12'::date, 975),
    ('Spring Term 2 2026-27',  '2027-02-22'::date, '2027-03-25'::date, 975),
    ('Summer Term 1 2026-27',  '2027-04-12'::date, '2027-05-28'::date, 975),
    ('Summer Term 2 2026-27',  '2027-06-07'::date, '2027-07-16'::date, 975)
),
school_dow AS (
  SELECT
    id,
    session_day,
    CASE session_day
      WHEN 'Sunday'    THEN 0
      WHEN 'Monday'    THEN 1
      WHEN 'Tuesday'   THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday'  THEN 4
      WHEN 'Friday'    THEN 5
      WHEN 'Saturday'  THEN 6
    END AS dow
  FROM schools
  WHERE session_day IS NOT NULL AND session_day != ''
),
session_counts AS (
  SELECT
    s.id      AS school_id,
    t.term_name,
    COUNT(d)::int AS num_sessions
  FROM school_dow s
  CROSS JOIN term_defs t
  CROSS JOIN LATERAL generate_series(t.start_date, t.end_date, '1 day'::interval) AS d
  WHERE EXTRACT(DOW FROM d) = s.dow
  GROUP BY s.id, t.term_name
)
INSERT INTO club_terms
  (school_id, term_name, start_date, end_date, num_sessions, price_pence, capacity, is_active, open_booking_opens, excluded_dates)
SELECT
  sc.school_id,
  sc.term_name,
  t.start_date,
  t.end_date,
  sc.num_sessions,
  sc.num_sessions * t.pence_per_session   AS price_pence,
  16                                       AS capacity,
  true                                     AS is_active,
  CURRENT_DATE                             AS open_booking_opens,
  '{}'::date[]                             AS excluded_dates
FROM session_counts sc
JOIN term_defs t ON t.term_name = sc.term_name
WHERE sc.num_sessions > 0;

-- Verify counts
SELECT term_name, COUNT(*) AS schools_with_term, SUM(num_sessions) AS total_sessions
FROM club_terms
GROUP BY term_name
ORDER BY MIN(start_date);
