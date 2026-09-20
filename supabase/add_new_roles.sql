-- Add new staff roles to the profiles role column constraint.
-- Run in the Supabase SQL editor BEFORE assigning these roles to any users.
--
-- If the role column has an enum or CHECK constraint, update it here.
-- If it's a plain text column, this may not be needed — just assign the role.

-- Check if there's a constraint:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'profiles'::regclass;

-- If there IS a check constraint like: CHECK (role IN ('director', 'area_lead', ...))
-- replace it with the expanded list:

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN (
    'director',
    'operations_manager',
    'operations_assistant',
    'area_lead',
    'senior_lead_coach',
    'lead_coach',
    'assistant_coach',
    'junior_coach',
    'outreach_worker',
    'marketing_assistant',
    'media_tech',
    'school',
    'parent'
  ));
