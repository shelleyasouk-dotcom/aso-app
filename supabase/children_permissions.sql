-- Add permission and emergency contact fields to children table
alter table public.children add column if not exists photo_permission       boolean;
alter table public.children add column if not exists first_aid_consent      boolean;
alter table public.children add column if not exists parent_relationship    text;

alter table public.children add column if not exists secondary_contact_name         text;
alter table public.children add column if not exists secondary_contact_phone        text;
alter table public.children add column if not exists secondary_contact_relationship text;

alter table public.children add column if not exists tertiary_contact_name         text;
alter table public.children add column if not exists tertiary_contact_phone        text;
alter table public.children add column if not exists tertiary_contact_relationship text;
