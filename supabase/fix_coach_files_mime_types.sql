-- Remove the allowed_mime_types restriction from the coach-files bucket.
-- The previous setup was too strict (e.g. blocked HEIC from iPhone cameras).
-- Rely on the app-level file input (accept="image/*") for type guidance instead.
-- Run this in the Supabase SQL editor.

update storage.buckets
set allowed_mime_types = null
where id = 'coach-files';
