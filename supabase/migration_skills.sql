-- ============================================================
-- Migration: Add skills tracking tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add contact_email to children if not already added
alter table public.children add column if not exists contact_email text;

-- ────────────────────────────────────────────────────────────
-- CHILD SKILL COMPLETIONS
-- Tracks each individual skill ticked off per child
-- ────────────────────────────────────────────────────────────
create table if not exists public.child_skill_completions (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  apparatus text not null check (apparatus in ('floor','bars','beam','rebound')),
  level int not null check (level between 1 and 6),
  skill_index int not null,
  completed_by uuid references public.profiles(id) not null,
  completed_by_name text not null,
  completed_at timestamptz default now() not null,
  unique(child_id, apparatus, level, skill_index)
);

-- ────────────────────────────────────────────────────────────
-- CHILD CERTIFICATES
-- Awarded when all skills in a level/apparatus are complete
-- ────────────────────────────────────────────────────────────
create table if not exists public.child_certificates (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  apparatus text not null check (apparatus in ('floor','bars','beam','rebound')),
  level int not null check (level between 1 and 6),
  awarded_by uuid references public.profiles(id) not null,
  coach_name text not null,
  completed_at timestamptz default now() not null,
  certificate_handed_out boolean default false not null,
  unique(child_id, apparatus, level)
);

-- Enable RLS
alter table public.child_skill_completions enable row level security;
alter table public.child_certificates enable row level security;

-- Skill completions: coaches see their school's children; directors/leads see all
create policy "skill_completions_select" on public.child_skill_completions
  for select to authenticated using (
    public.my_role() in ('director', 'area_lead')
    or child_id in (
      select id from public.children
      where school_id in (select public.my_school_ids())
    )
  );

create policy "skill_completions_insert" on public.child_skill_completions
  for insert to authenticated with check (
    completed_by = auth.uid()
    and public.my_role() in ('director', 'area_lead', 'lead_coach', 'assistant_coach')
  );

create policy "skill_completions_delete" on public.child_skill_completions
  for delete to authenticated using (
    completed_by = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

-- Certificates
create policy "certificates_select" on public.child_certificates
  for select to authenticated using (
    public.my_role() in ('director', 'area_lead')
    or child_id in (
      select id from public.children
      where school_id in (select public.my_school_ids())
    )
  );

create policy "certificates_insert" on public.child_certificates
  for insert to authenticated with check (
    awarded_by = auth.uid()
    and public.my_role() in ('director', 'area_lead', 'lead_coach')
  );

create policy "certificates_update" on public.child_certificates
  for update to authenticated using (
    public.my_role() in ('director', 'area_lead', 'lead_coach')
  );
