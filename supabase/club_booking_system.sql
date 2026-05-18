-- ─── Club Booking System Migration ────────────────────────────────────────────
-- Run in Supabase SQL Editor after parent_portal.sql

-- 1. Club Terms — one per school per half-term block
create table if not exists public.club_terms (
  id                      uuid primary key default gen_random_uuid(),
  school_id               uuid references public.schools(id) on delete cascade not null,
  term_name               text not null,       -- e.g. "Autumn 1 2026"
  start_date              date not null,
  end_date                date not null,
  num_sessions            int  not null default 6,
  price_pence             int  not null default 5400,  -- £54.00 in pence
  capacity                int  not null default 16,
  priority_booking_opens  date,                -- returning families
  open_booking_opens      date,                -- whole school
  is_active               boolean not null default true,
  notes                   text,
  created_at              timestamptz default now()
);

alter table public.club_terms enable row level security;

-- Public can read active terms (needed for portal browse)
create policy "public read active club terms"
  on public.club_terms for select
  using (is_active = true);

-- Admins manage all terms
create policy "admins manage club terms"
  on public.club_terms for all
  using  (exists (select 1 from public.profiles where id = auth.uid() and role in ('director','area_lead')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('director','area_lead')));


-- 2. Parent children — saved child profiles on parent account
create table if not exists public.parent_children (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid references public.profiles(id) on delete cascade not null,
  full_name         text not null,
  date_of_birth     date,
  year_group        text,
  class_name        text,
  additional_needs  text,
  created_at        timestamptz default now()
);

alter table public.parent_children enable row level security;

create policy "parents manage own children"
  on public.parent_children for all
  using  (parent_id = auth.uid())
  with check (parent_id = auth.uid());

create policy "admins view all parent children"
  on public.parent_children for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('director','area_lead')));


-- 3. Extend parent_bookings with booking-system columns
alter table public.parent_bookings
  add column if not exists club_term_id          uuid references public.club_terms(id),
  add column if not exists parent_child_id        uuid references public.parent_children(id),
  add column if not exists child_year_group       text,
  add column if not exists child_class            text,
  add column if not exists child_additional_needs text,
  add column if not exists stripe_session_id      text unique,
  add column if not exists stripe_payment_intent  text,
  add column if not exists amount_pence           int default 5400;

-- Widen status check to include payment states
alter table public.parent_bookings drop constraint if exists parent_bookings_status_check;
alter table public.parent_bookings add constraint parent_bookings_status_check
  check (status in ('pending_payment','confirmed','cancelled','refunded'));

-- School users can view bookings for their own school (name, class, needs only — enforced in query)
drop policy if exists "school views own club bookings" on public.parent_bookings;
create policy "school views own club bookings"
  on public.parent_bookings for select
  using (
    school_id = (select school_id from public.profiles where id = auth.uid())
  );
