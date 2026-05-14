-- ─── Staff Personal & Employment Tables ──────────────────────────────────────
-- Replaces staff_confidential. Run in Supabase SQL editor.

-- Remove old table if it was created from a previous migration
drop table if exists public.staff_confidential;

-- ── staff_personal ────────────────────────────────────────────────────────────
-- Filled in by the staff member themselves.
-- Visible to: the staff member + directors.
create table if not exists public.staff_personal (
  staff_id          uuid references public.profiles(id) on delete cascade primary key,
  date_of_birth     date,
  address_line1     text,
  address_line2     text,
  address_city      text,
  address_postcode  text,
  ni_number         text,
  bank_account_name text,
  bank_name         text,
  bank_sort_code    text,
  bank_account_number text,
  ec1_name          text,
  ec1_relationship  text,
  ec1_phone         text,
  ec2_name          text,
  ec2_relationship  text,
  ec2_phone         text,
  additional_needs  text,
  updated_at        timestamptz default now()
);

alter table public.staff_personal enable row level security;

drop policy if exists "personal_own"      on public.staff_personal;
drop policy if exists "personal_director" on public.staff_personal;

-- Staff can read and write their own record
create policy "personal_own" on public.staff_personal
  for all to authenticated
  using  (staff_id = auth.uid())
  with check (staff_id = auth.uid());

-- Directors can read and write all records
create policy "personal_director" on public.staff_personal
  for all to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');

-- ── staff_employment ──────────────────────────────────────────────────────────
-- Filled in by directors only.
-- Staff can READ their own record (so they can see their contract/pay).
-- Admin notes are fetched by the app but only rendered for directors.
create table if not exists public.staff_employment (
  staff_id            uuid references public.profiles(id) on delete cascade primary key,
  contract_type       text check (contract_type in ('employee','self_employed','zero_hours','casual') or contract_type is null),
  contract_start_date date,
  contract_end_date   date,
  pay_rate            numeric(10,2),
  pay_frequency       text check (pay_frequency in ('hourly','per_session','monthly','weekly') or pay_frequency is null),
  utr_number          text,
  tax_code            text,
  admin_notes         text,
  updated_at          timestamptz default now(),
  updated_by          uuid references public.profiles(id)
);

alter table public.staff_employment enable row level security;

drop policy if exists "employment_staff_read" on public.staff_employment;
drop policy if exists "employment_director"   on public.staff_employment;

-- Staff can read their own employment record (so they can see contract/pay)
create policy "employment_staff_read" on public.staff_employment
  for select to authenticated
  using (staff_id = auth.uid());

-- Directors can read and write all employment records
create policy "employment_director" on public.staff_employment
  for all to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');
