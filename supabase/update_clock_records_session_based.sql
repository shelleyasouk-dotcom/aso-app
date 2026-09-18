-- Convert clock_records to session-based attendance log
-- Adds session_date (logical date of session) and session_role (role performed)
-- Backfills session_date from clock_in for all existing records

ALTER TABLE clock_records ADD COLUMN IF NOT EXISTS session_date date DEFAULT NULL;
ALTER TABLE clock_records ADD COLUMN IF NOT EXISTS session_role text DEFAULT NULL;

-- Backfill: set session_date from clock_in for all existing records
UPDATE clock_records
SET session_date = clock_in::date
WHERE session_date IS NULL;

-- Make session_date non-nullable going forward (after backfill)
-- (leave as nullable so old inserts without it don't break)
