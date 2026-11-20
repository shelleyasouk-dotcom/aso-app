-- Replaces the single flat "hire days / weeks confirmed" fields with proper
-- hire terms, so a school with 6 semesters a year (plus sometimes summer
-- holidays) can have each period's agreed days/weeks/rate tracked
-- separately, and every invoice is tied to a specific term.

CREATE TABLE IF NOT EXISTS public.school_hire_terms (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  label            text NOT NULL,   -- e.g. 'Semester 1 2026/27' or 'Summer Holiday 2026'
  start_date       date NOT NULL,
  end_date         date NOT NULL,
  hire_days        text,            -- e.g. 'Tuesday'
  weeks_confirmed  integer,         -- agreed number of weeks for this term
  rate             numeric,         -- per-session rate for this term; blank = use the school's default hire_charge
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_hire_terms_school ON public.school_hire_terms (school_id);

ALTER TABLE public.school_hire_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Finance roles manage hire terms" ON public.school_hire_terms;
CREATE POLICY "Finance roles manage hire terms"
  ON public.school_hire_terms FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')));

-- Tie each invoice to the hire term it covers
ALTER TABLE public.school_invoices
  ADD COLUMN IF NOT EXISTS hire_term_id uuid REFERENCES public.school_hire_terms(id) ON DELETE SET NULL;

-- The old per-school flat fields are superseded by hire terms above — safe
-- to leave in place (unused) or drop once you've re-entered everything as
-- terms. Uncomment to drop:
-- ALTER TABLE public.schools DROP COLUMN IF EXISTS hire_days;
-- ALTER TABLE public.schools DROP COLUMN IF EXISTS hire_weeks_confirmed;
