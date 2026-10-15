-- Adds the fields needed to track stages 1-5 of the Schools Acquisition SOP
-- (route, demand check, written agreement) on each CRM school record.
-- Safe to re-run.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS route text,
  ADD COLUMN IF NOT EXISTS decision_maker_role text,
  ADD COLUMN IF NOT EXISTS trust_name text,
  ADD COLUMN IF NOT EXISTS day_offered text,
  ADD COLUMN IF NOT EXISTS hall_free_time text,
  ADD COLUMN IF NOT EXISTS hall_other_uses text,
  ADD COLUMN IF NOT EXISTS year_groups text,
  ADD COLUMN IF NOT EXISTS term_block_dates text,
  ADD COLUMN IF NOT EXISTS loi_permission boolean,
  ADD COLUMN IF NOT EXISTS loi_sent_date date,
  ADD COLUMN IF NOT EXISTS loi_closing_date date,
  ADD COLUMN IF NOT EXISTS interest_count integer,
  ADD COLUMN IF NOT EXISTS viability_figure integer,
  ADD COLUMN IF NOT EXISTS risk_assessment_date date,
  ADD COLUMN IF NOT EXISTS risk_assessment_by text,
  ADD COLUMN IF NOT EXISTS risk_assessment_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hire_charge numeric,
  ADD COLUMN IF NOT EXISTS pack_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreement_confirmed_date date,
  ADD COLUMN IF NOT EXISTS return_date date;

SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'crm_contacts'
ORDER BY ordinal_position;
