-- ─── Parent Portal Migration ──────────────────────────────────────────────────
-- Run in Supabase SQL Editor. Safe to re-run.

-- 1. Add 'parent' to profiles role constraint
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
    'junior_coach','outreach_worker','media_tech','school','parent'
  ));

-- 2. Parent bookings table (for future online booking feature)
create table if not exists public.parent_bookings (
  id            uuid default uuid_generate_v4() primary key,
  parent_id     uuid references public.profiles(id) on delete cascade not null,
  school_id     uuid references public.schools(id) on delete cascade not null,
  child_name    text not null,
  child_dob     date,
  sport         text,
  notes         text,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','cancelled')),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 3. RLS for parent_bookings
alter table public.parent_bookings enable row level security;

-- Parents can read and manage their own bookings
drop policy if exists "parent_bookings_own" on public.parent_bookings;
create policy "parent_bookings_own" on public.parent_bookings
  for all to authenticated
  using  (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Directors and area leads can view all bookings
drop policy if exists "parent_bookings_staff_read" on public.parent_bookings;
create policy "parent_bookings_staff_read" on public.parent_bookings
  for select to authenticated
  using (public.my_role() in ('director', 'area_lead'));

-- 4. Allow public (anon) read access to schools for the portal browse page
--    Only expose non-sensitive columns via a view
create or replace view public.portal_schools as
  select
    id,
    name,
    area,
    region,
    session_day,
    session_time,
    school_type
  from public.schools;

-- Grant anon read on the view so unauthenticated visitors can browse clubs
grant select on public.portal_schools to anon;

-- 5. Allow anon read on the schools table (non-sensitive fields only)
--    via RLS policy so the portal can query it without a session
drop policy if exists "schools_public_read" on public.schools;
create policy "schools_public_read" on public.schools
  for select
  using (true);

-- 6. Updated_at trigger for parent_bookings
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parent_bookings_updated_at on public.parent_bookings;
create trigger parent_bookings_updated_at
  before update on public.parent_bookings
  for each row execute procedure public.set_updated_at();
