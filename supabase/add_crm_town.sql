-- Add a dedicated "town" field to crm_contacts for filtering/bulk-grouping,
-- separate from the broader "area" (county/region) used for school territory assignment.
-- Run in the Supabase SQL editor.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS town text;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_town ON public.crm_contacts (town) WHERE town IS NOT NULL;
