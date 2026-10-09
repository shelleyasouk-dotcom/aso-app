-- Add URN (unique school reference number) to crm_contacts for reliable
-- duplicate detection when re-importing school lists from allschools.co.uk.
-- Run in the Supabase SQL editor.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS urn text;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_urn ON public.crm_contacts (urn) WHERE urn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts (lower(email)) WHERE email IS NOT NULL;
