-- Adds a "queried" status for invoices where you've spotted a problem and
-- are waiting on the school to confirm or correct something.

ALTER TABLE public.school_invoices DROP CONSTRAINT IF EXISTS school_invoices_status_check;
ALTER TABLE public.school_invoices ADD CONSTRAINT school_invoices_status_check
  CHECK (status IN ('pending', 'queried', 'approved', 'paid'));

ALTER TABLE public.school_invoices
  ADD COLUMN IF NOT EXISTS queried_at timestamptz,
  ADD COLUMN IF NOT EXISTS queried_by uuid REFERENCES public.profiles(id);
