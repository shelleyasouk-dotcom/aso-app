-- Staff account archiving (soft delete) — preserves payroll/timesheet history.
-- Run in the Supabase SQL editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES public.profiles(id);
