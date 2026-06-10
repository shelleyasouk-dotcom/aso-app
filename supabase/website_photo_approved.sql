-- Allow directors to approve a staff profile photo for use on the public website
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website_photo_approved boolean NOT NULL DEFAULT false;
