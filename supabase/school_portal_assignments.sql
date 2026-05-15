-- School portal assignments: one user can be linked to multiple schools
create table if not exists school_portal_assignments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  school_id  uuid not null references schools(id) on delete cascade,
  label      text null,          -- optional e.g. 'KS1', 'KS2', 'Primary'
  created_at timestamptz not null default now(),
  unique (user_id, school_id)
);

alter table school_portal_assignments enable row level security;

-- School users can read their own assignments
create policy "portal_assignments_school_select"
  on school_portal_assignments for select
  using (user_id = auth.uid());

-- Directors and area leads can manage all assignments
create policy "portal_assignments_director"
  on school_portal_assignments for all
  using (public.my_role() in ('director', 'area_lead'));
