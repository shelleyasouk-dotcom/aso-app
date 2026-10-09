-- Ensure crm_contacts has every column the app expects.
-- Run in the Supabase SQL editor. Safe to re-run — only adds what's missing.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS school_type text,
  ADD COLUMN IF NOT EXISTS urn text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS follow_up_number integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contacted_date date,
  ADD COLUMN IF NOT EXISTS next_follow_up_date date,
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_crm_contacts_urn ON public.crm_contacts (urn) WHERE urn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts (lower(email)) WHERE email IS NOT NULL;

-- Same safety net for crm_interactions (call/email log entries per school)
ALTER TABLE public.crm_interactions
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS date date,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Verify everything the app relies on is now present:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'crm_contacts'
ORDER BY ordinal_position;
