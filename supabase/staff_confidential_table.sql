-- ─── Staff Confidential Data — Director Only ─────────────────────────────────
-- Run this in the Supabase SQL editor.
-- RLS ensures ONLY directors can read or write this table — no other role,
-- not even area leads, can access it even via direct API calls.

create table if not exists public.staff_confidential (
  id              uuid default uuid_generate_v4() primary key,
  staff_id        uuid references public.profiles(id) on delete cascade not null unique,

  -- Emergency contact 1
  ec1_name            text,
  ec1_relationship    text,
  ec1_phone           text,

  -- Emergency contact 2
  ec2_name            text,
  ec2_relationship    text,
  ec2_phone           text,

  -- Bank details
  bank_account_name   text,
  bank_sort_code      text,
  bank_account_number text,
  bank_name           text,

  -- Contract
  contract_type       text check (contract_type in ('employee','self_employed','zero_hours','casual') or contract_type is null),
  contract_start_date date,
  contract_end_date   date,

  -- Pay
  pay_rate            numeric(10,2),
  pay_frequency       text check (pay_frequency in ('hourly','per_session','monthly','weekly') or pay_frequency is null),

  -- HR / Tax
  ni_number           text,
  utr_number          text,
  tax_code            text,

  -- Admin notes (free text, internal use only)
  admin_notes         text,

  updated_at          timestamptz default now(),
  updated_by          uuid references public.profiles(id)
);

-- Enable RLS
alter table public.staff_confidential enable row level security;

-- Director-only policy: no other role can SELECT, INSERT, UPDATE or DELETE
drop policy if exists "confidential_director_only" on public.staff_confidential;
create policy "confidential_director_only"
  on public.staff_confidential
  for all
  to authenticated
  using  (public.my_role() = 'director')
  with check (public.my_role() = 'director');
