-- ─── School Portal Migration ─────────────────────────────────────────────────
-- Run in Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS / IF EXISTS).

-- 1. Update profiles role constraint to include all roles
do $$
declare c text;
begin
  select constraint_name into c
  from information_schema.table_constraints
  where table_name = 'profiles' and table_schema = 'public'
    and constraint_type = 'CHECK' and constraint_name like '%role%';
  if c is not null then
    execute 'alter table public.profiles drop constraint ' || c;
  end if;
end $$;

alter table public.profiles add constraint profiles_role_check
  check (role in (
    'director','area_lead','lead_coach','assistant_coach',
    'junior_coach','outreach_worker','media_tech','school'
  ));

-- Allow directors to update any profile (needed to link school accounts)
drop policy if exists "profiles_update_director" on public.profiles;
create policy "profiles_update_director" on public.profiles
  for update to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- 2. Add school_id FK to profiles
alter table public.profiles add column if not exists school_id uuid references public.schools(id);

-- 3. Extend schools table with portal fields
alter table public.schools add column if not exists area              text;
alter table public.schools add column if not exists headteacher_name  text;
alter table public.schools add column if not exists contact_name      text;
alter table public.schools add column if not exists contact_email     text;
alter table public.schools add column if not exists contact_phone     text;
alter table public.schools add column if not exists dsl_name          text;
alter table public.schools add column if not exists dsl_email         text;
alter table public.schools add column if not exists dsl_phone         text;
alter table public.schools add column if not exists ddsl_name         text;
alter table public.schools add column if not exists ddsl_email        text;
alter table public.schools add column if not exists ddsl_phone        text;
alter table public.schools add column if not exists mat_name          text;
alter table public.schools add column if not exists school_type       text
  check (school_type in ('primary','secondary','all_through','special','other') or school_type is null);
alter table public.schools add column if not exists region            text;
alter table public.schools add column if not exists area_lead_id      uuid references public.profiles(id);
alter table public.schools add column if not exists facility_form_completed boolean not null default false;
alter table public.schools add column if not exists updated_at        timestamptz default now();

-- School users can update their own school's safeguarding / contact fields
drop policy if exists "schools_school_update" on public.schools;
create policy "schools_school_update" on public.schools
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = schools.id and role = 'school'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = schools.id and role = 'school'
    )
  );

-- 4. facility_assessments table
create table if not exists public.facility_assessments (
  id                  uuid default uuid_generate_v4() primary key,
  school_id           uuid references public.schools(id) on delete cascade not null unique,
  submitted_by        uuid references public.profiles(id),
  submitted_at        timestamptz default now(),
  -- Section 2: Available space
  space_description   text,
  space_size          text,
  -- Section 3: Availability
  availability_notes  text,
  -- Section 4: Changing and welfare
  changing_facilities text,
  welfare_facilities  text,
  -- Section 5: Equipment storage
  storage_available   boolean,
  storage_notes       text,
  -- Section 6: Existing equipment
  existing_equipment  text,
  -- Section 8: Additional
  additional_info     text,
  created_at          timestamptz default now()
);

alter table public.facility_assessments enable row level security;

drop policy if exists "facility_school" on public.facility_assessments;
create policy "facility_school" on public.facility_assessments
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = facility_assessments.school_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = facility_assessments.school_id
    )
  );

drop policy if exists "facility_director" on public.facility_assessments;
create policy "facility_director" on public.facility_assessments
  for all to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- 5. impact_reports table
create table if not exists public.impact_reports (
  id           uuid default uuid_generate_v4() primary key,
  school_id    uuid references public.schools(id) on delete cascade not null,
  term_name    text not null,
  sport        text,
  file_path    text not null,
  file_name    text not null,
  generated_at date,
  uploaded_by  uuid references public.profiles(id),
  created_at   timestamptz default now()
);

alter table public.impact_reports enable row level security;

drop policy if exists "reports_school_select" on public.impact_reports;
create policy "reports_school_select" on public.impact_reports
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = impact_reports.school_id
    )
  );

drop policy if exists "reports_director" on public.impact_reports;
create policy "reports_director" on public.impact_reports
  for all to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- 6. Extra SELECT policies on existing tables for school users
--    (additive — do not touch existing policies)

-- session_registers: school users can read their school's registers
drop policy if exists "registers_school_select" on public.session_registers;
create policy "registers_school_select" on public.session_registers
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = session_registers.school_id
    )
  );

-- register_entries: school users can read entries in their school's registers
drop policy if exists "entries_school_select" on public.register_entries;
create policy "entries_school_select" on public.register_entries
  for select to authenticated
  using (
    register_id in (
      select sr.id from public.session_registers sr
      join public.profiles p on p.school_id = sr.school_id
      where p.id = auth.uid()
    )
  );

-- children: school users can read children at their school
drop policy if exists "children_school_select" on public.children;
create policy "children_school_select" on public.children
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = children.school_id
    )
  );
