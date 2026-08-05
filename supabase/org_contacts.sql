-- Organisation contacts: ASO's own DSL/DDSL (shown on school safeguarding page)
-- and useful contacts (shown on school portal contacts page).

create table if not exists public.org_contacts (
  id            uuid default uuid_generate_v4() primary key,
  type          text not null,           -- 'dsl' | 'ddsl' | 'useful'
  name          text not null,
  title         text,
  email         text,
  phone         text,
  notes         text,
  display_order integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.org_contacts enable row level security;

-- All authenticated users (staff + school portal) can read active contacts
create policy "authenticated can read org_contacts"
  on public.org_contacts for select
  to authenticated
  using (is_active = true);

-- Directors and area leads can manage all rows
create policy "admins can manage org_contacts"
  on public.org_contacts for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('director', 'area_lead')
    )
  );
