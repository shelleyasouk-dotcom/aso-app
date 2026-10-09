-- Links a CRM contact to the school record created when they're onboarded,
-- so onboarding only ever creates one school per contact.
-- Run in the Supabase SQL editor.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);
