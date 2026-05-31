-- Adds multi-area support to the profiles table.
-- The frontend already writes and reads profile.areas (text[])
-- but the column was never created, so only the first area was persisted.
-- Run once in the Supabase SQL editor.

-- 1. Add the column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS areas text[] DEFAULT NULL;

-- 2. Back-fill: for any area_lead / director whose areas is still null,
--    seed it from their existing single `area` value so nothing is lost.
UPDATE profiles
SET areas = ARRAY[area]
WHERE areas IS NULL
  AND area IS NOT NULL
  AND role IN ('area_lead', 'director');

-- Verify
SELECT id, full_name, role, area, areas
FROM profiles
WHERE role IN ('area_lead', 'director')
ORDER BY full_name;
