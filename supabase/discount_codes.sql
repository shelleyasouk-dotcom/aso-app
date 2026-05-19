-- discount_codes table
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  code text unique not null,               -- e.g. 'SIBLING10'
  description text,                        -- e.g. 'Sibling discount 10%'
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null check (value > 0), -- percentage: 5/10/etc; fixed: pence (100=£1, 200=£2)
  max_uses integer,                         -- null = unlimited
  uses integer not null default 0,
  valid_from date,
  valid_until date,
  is_active boolean not null default true,
  created_by uuid references profiles(id)
);

alter table discount_codes enable row level security;

-- Directors and area leads manage codes
create policy "admins manage discount codes"
  on discount_codes for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('director','area_lead')));

-- Any authenticated user can look up a code (needed for basket validation)
create policy "authenticated read discount codes"
  on discount_codes for select
  to authenticated
  using (true);

-- Add discount columns to parent_bookings
alter table parent_bookings
  add column if not exists discount_code text,
  add column if not exists discount_amount_pence integer not null default 0;
