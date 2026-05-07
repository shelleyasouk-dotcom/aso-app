-- ============================================================
-- ASO Coaching App — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- Extends auth.users with role and display name
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('director','area_lead','lead_coach','assistant_coach','junior_coach')),
  created_at timestamptz default now() not null
);

-- Auto-create profile on signup using user metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'junior_coach')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- SCHOOLS
-- ────────────────────────────────────────────────────────────
create table public.schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  session_day text not null,
  session_time text not null,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- STAFF → SCHOOL ASSIGNMENTS
-- Many-to-many: a coach can be at multiple schools
-- ────────────────────────────────────────────────────────────
create table public.staff_school_assignments (
  id uuid default uuid_generate_v4() primary key,
  staff_id uuid references public.profiles(id) on delete cascade not null,
  school_id uuid references public.schools(id) on delete cascade not null,
  is_lead boolean default false not null,
  unique(staff_id, school_id)
);

-- ────────────────────────────────────────────────────────────
-- CHILDREN
-- ────────────────────────────────────────────────────────────
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  date_of_birth date,
  school_id uuid references public.schools(id) on delete cascade not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- CLOCK RECORDS
-- ────────────────────────────────────────────────────────────
create table public.clock_records (
  id uuid default uuid_generate_v4() primary key,
  staff_id uuid references public.profiles(id) on delete cascade not null,
  school_id uuid references public.schools(id) on delete cascade not null,
  clock_in timestamptz default now() not null,
  clock_out timestamptz,
  created_at timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- SESSION REGISTERS
-- ────────────────────────────────────────────────────────────
create table public.session_registers (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  session_date date not null,
  lead_coach_id uuid references public.profiles(id) not null,
  notes text,
  created_at timestamptz default now() not null
);

create table public.register_entries (
  id uuid default uuid_generate_v4() primary key,
  register_id uuid references public.session_registers(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete cascade not null,
  present boolean default false not null,
  unique(register_id, child_id)
);

-- ────────────────────────────────────────────────────────────
-- CHILD AWARDS
-- ────────────────────────────────────────────────────────────
create table public.child_awards (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  level text not null check (level in ('ukag_level_1','ukag_level_2','ukag_level_3','ukag_level_4','ukag_level_5')),
  awarded_by uuid references public.profiles(id) not null,
  awarded_at timestamptz default now() not null,
  notes text
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables and define access policies
-- ────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.staff_school_assignments enable row level security;
alter table public.children enable row level security;
alter table public.clock_records enable row level security;
alter table public.session_registers enable row level security;
alter table public.register_entries enable row level security;
alter table public.child_awards enable row level security;

-- Helper: get the role of the currently logged-in user
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: check if current user is assigned to a school
create or replace function public.my_school_ids()
returns setof uuid language sql security definer stable as $$
  select school_id from public.staff_school_assignments where staff_id = auth.uid();
$$;

-- PROFILES: all authenticated users can read; only own row can be updated
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid());
create policy "profiles_insert_director" on public.profiles
  for insert to authenticated with check (public.my_role() = 'director');

-- SCHOOLS: all authenticated users can read; directors can write
create policy "schools_select" on public.schools
  for select to authenticated using (true);
create policy "schools_write" on public.schools
  for all to authenticated using (public.my_role() = 'director');

-- ASSIGNMENTS: all authenticated can read; directors can write
create policy "assignments_select" on public.staff_school_assignments
  for select to authenticated using (true);
create policy "assignments_write" on public.staff_school_assignments
  for all to authenticated using (public.my_role() = 'director');

-- CHILDREN: coaches see their school's children; directors/leads see all
create policy "children_select" on public.children
  for select to authenticated using (
    public.my_role() in ('director', 'area_lead')
    or school_id in (select public.my_school_ids())
  );
create policy "children_write" on public.children
  for all to authenticated using (public.my_role() = 'director');

-- CLOCK RECORDS: own records always; directors/area_leads see all
create policy "clock_select_own" on public.clock_records
  for select to authenticated using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );
create policy "clock_insert_own" on public.clock_records
  for insert to authenticated with check (staff_id = auth.uid());
create policy "clock_update_own" on public.clock_records
  for update to authenticated using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

-- SESSION REGISTERS
create policy "registers_select" on public.session_registers
  for select to authenticated using (
    public.my_role() in ('director', 'area_lead')
    or school_id in (select public.my_school_ids())
  );
create policy "registers_insert" on public.session_registers
  for insert to authenticated with check (
    lead_coach_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

-- REGISTER ENTRIES
create policy "entries_select" on public.register_entries
  for select to authenticated using (
    register_id in (
      select id from public.session_registers
      where public.my_role() in ('director', 'area_lead')
         or school_id in (select public.my_school_ids())
    )
  );
create policy "entries_insert" on public.register_entries
  for insert to authenticated with check (true);

-- CHILD AWARDS
create policy "awards_select" on public.child_awards
  for select to authenticated using (
    public.my_role() in ('director', 'area_lead')
    or child_id in (
      select id from public.children
      where school_id in (select public.my_school_ids())
    )
  );
create policy "awards_insert" on public.child_awards
  for insert to authenticated with check (
    awarded_by = auth.uid()
    and public.my_role() in ('director', 'area_lead', 'lead_coach')
  );
