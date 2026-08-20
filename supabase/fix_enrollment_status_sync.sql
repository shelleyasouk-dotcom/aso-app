-- Fix stale onboarding enrollment statuses.
-- Staff who completed their onboarding (profiles.onboarding_required = false,
-- profiles.onboarding_status = 'active') still had their enrollment row stuck
-- at 'not_started' because it was never updated when they signed their contract.
-- Run this once in the Supabase SQL Editor to sync them.

UPDATE public.onboarding_enrollments oe
SET
  status       = 'active',
  activated_at = COALESCE(oe.activated_at, now())
FROM public.profiles p
WHERE
  oe.staff_id            = p.id
  AND oe.enrollment_type = 'initial'
  AND p.onboarding_status   = 'active'
  AND p.onboarding_required = false
  AND oe.status IN ('not_started', 'in_progress', 'invited');

-- Also fix profiles that somehow have onboarding_required = false but
-- onboarding_status still null or a non-active value (cleanup edge cases).
UPDATE public.profiles
SET onboarding_status = 'active'
WHERE
  onboarding_required = false
  AND (onboarding_status IS NULL OR onboarding_status NOT IN ('active', 'not_required', 'withdrawn'));
