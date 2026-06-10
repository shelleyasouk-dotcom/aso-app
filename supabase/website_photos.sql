-- Website photos: ensure coach-files bucket allows image types needed
-- Photos for the public website should be uploaded to coach-files/website/ folder

-- Ensure the coach-files bucket exists and is public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-files',
  'coach-files',
  true,
  10485760,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760;

-- Public read policy (so website photos load without auth)
drop policy if exists "coach-files: public read" on storage.objects;
create policy "coach-files: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'coach-files');

-- Authenticated upload
drop policy if exists "coach-files: authenticated insert" on storage.objects;
create policy "coach-files: authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'coach-files');

-- Authenticated update (upsert / overwrite)
drop policy if exists "coach-files: authenticated update" on storage.objects;
create policy "coach-files: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'coach-files');

-- Authenticated delete
drop policy if exists "coach-files: authenticated delete" on storage.objects;
create policy "coach-files: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'coach-files');
