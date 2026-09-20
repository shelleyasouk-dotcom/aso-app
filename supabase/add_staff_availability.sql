-- Add staff availability fields to profiles
-- Run in the Supabase SQL editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS availability      text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_areas   text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS travel_distance_miles integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS availability_notes text   DEFAULT NULL;
