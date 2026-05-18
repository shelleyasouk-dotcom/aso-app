-- ─── Fix profile photo uploads ────────────────────────────────────────────────
-- Run this in the Supabase SQL editor (Settings → SQL Editor → New query).
-- It is safe to run multiple times (all statements are idempotent).

-- 1. Create the coach-files bucket (or update it to be public with no type restrictions)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-files',
  'coach-files',
  true,
  20971520,   -- 20 MB
  null        -- no mime-type restriction (handles iPhone HEIC, HEIF, etc.)
)
on conflict (id) do update set
  public            = true,
  file_size_limit   = 20971520,
  allowed_mime_types = null;

-- 2. RLS policies on storage.objects

-- Public read — needed so photo_url links load everywhere
drop policy if exists "coach-files: public read" on storage.objects;
create policy "coach-files: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'coach-files');

-- Any authenticated user can upload
drop policy if exists "coach-files: authenticated insert" on storage.objects;
create policy "coach-files: authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'coach-files');

-- Any authenticated user can overwrite (upsert)
drop policy if exists "coach-files: authenticated update" on storage.objects;
create policy "coach-files: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'coach-files');

-- Any authenticated user can delete their own uploads
drop policy if exists "coach-files: authenticated delete" on storage.objects;
create policy "coach-files: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'coach-files');
