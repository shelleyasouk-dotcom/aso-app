-- Adds agreed hire terms (days, confirmed weeks) and actual-usage
-- cross-referencing to school hall-hire invoices.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS hire_days text,              -- e.g. 'Tuesday' or 'Tuesday & Thursday'
  ADD COLUMN IF NOT EXISTS hire_weeks_confirmed integer; -- agreed number of weeks for the current block

ALTER TABLE public.school_invoices
  ADD COLUMN IF NOT EXISTS period_start date,
  ADD COLUMN IF NOT EXISTS period_end date,
  ADD COLUMN IF NOT EXISTS sessions_held integer,   -- actual sessions found in your registers for the period
  ADD COLUMN IF NOT EXISTS sessions_agreed integer; -- snapshot of schools.hire_weeks_confirmed at upload time
