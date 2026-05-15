-- ─── School Documents & Info Form Migration ─────────────────────────────────
-- Run in Supabase SQL Editor. Safe to re-run.

-- 1. school_documents — shared (school_id IS NULL) or per-school
create table if not exists public.school_documents (
  id           uuid default uuid_generate_v4() primary key,
  school_id    uuid references public.schools(id) on delete cascade,  -- null = shared with all schools
  title        text not null,
  category     text not null default 'other',
  file_path    text not null,
  file_name    text not null,
  file_size    bigint,
  version      text,
  uploaded_by  uuid references public.profiles(id),
  created_at   timestamptz default now()
);

alter table public.school_documents enable row level security;

-- School users can read shared docs + their own school's docs
drop policy if exists "school_docs_school_select" on public.school_documents;
create policy "school_docs_school_select" on public.school_documents
  for select to authenticated
  using (
    school_id is null   -- shared document visible to all authenticated
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = school_documents.school_id
    )
  );

-- Directors can manage all school documents
drop policy if exists "school_docs_director" on public.school_documents;
create policy "school_docs_director" on public.school_documents
  for all to authenticated
  using  (public.my_role() in ('director', 'area_lead'))
  with check (public.my_role() in ('director', 'area_lead'));

-- 2. school_info_forms — replaces facility_assessments with the proper ASO form
create table if not exists public.school_info_forms (
  id                    uuid default uuid_generate_v4() primary key,
  school_id             uuid references public.schools(id) on delete cascade not null unique,
  submitted_by          uuid references public.profiles(id),
  submitted_at          timestamptz default now(),
  -- Section 1: School
  headteacher_name      text,
  contact_name          text,
  contact_title         text,
  contact_email         text,
  contact_phone         text,
  school_address        text,
  school_type_desc      text,
  number_on_roll        text,
  -- Section 2: Space
  space_types           text,   -- comma-separated: school_hall, sports_hall, gymnasium, outdoor_hard, outdoor_grass, other
  space_size            text,
  floor_surface         text,
  max_pupils_space      text,
  obstructions          text,
  -- Section 3: Availability
  available_days        text,   -- comma-separated day names
  school_finish_time    text,
  pickup_time           text,
  has_lockup_contact    boolean,
  lockup_contact        text,
  -- Section 4: Quick questions
  toilets_accessible    boolean,
  storage_available     boolean,
  has_existing_equipment boolean,
  existing_equipment    text,   -- comma-separated: balance_beam, vaulting_table, springboard, crash_mats, floor_mats, wall_bars, trampoline, benches
  -- Section 5: Safeguarding
  dsl_name              text,
  dsl_contact           text,
  backup_contact        text,
  visitor_signin        text,
  -- Section 6: Club
  year_groups           text,   -- ks1_only | ks2_only | combined | undecided
  num_clubs             text,   -- one_combined | two_separate | one_per_ks | unsure
  additional_info       text,
  created_at            timestamptz default now()
);

alter table public.school_info_forms enable row level security;

drop policy if exists "info_form_school" on public.school_info_forms;
create policy "info_form_school" on public.school_info_forms
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = school_info_forms.school_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and school_id = school_info_forms.school_id
    )
  );

drop policy if exists "info_form_director" on public.school_info_forms;
create policy "info_form_director" on public.school_info_forms
  for all to authenticated
  using  (public.my_role() in ('director', 'area_lead'))
  with check (public.my_role() in ('director', 'area_lead'));
