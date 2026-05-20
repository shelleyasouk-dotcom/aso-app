-- Fix RLS policies so area leads can approve/reject absences and edit clock records.
-- Run this in the Supabase SQL editor (dashboard → SQL Editor → New query).

-- ─── ABSENCES ─────────────────────────────────────────────────────────────────

-- Drop any existing policies first
drop policy if exists "absences_select"       on public.absences;
drop policy if exists "absences_insert"       on public.absences;
drop policy if exists "absences_update"       on public.absences;
drop policy if exists "absences_delete"       on public.absences;

-- Make sure RLS is on
alter table public.absences enable row level security;

-- SELECT: staff see own; directors and area leads see all
create policy "absences_select" on public.absences
  for select to authenticated
  using (
    staff_id    = auth.uid()
    or reviewed_by = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

-- INSERT: staff submit their own absence requests
create policy "absences_insert" on public.absences
  for insert to authenticated
  with check (staff_id = auth.uid());

-- UPDATE: staff can only update their own pending requests;
--         directors and area leads can update any (for approval/rejection)
create policy "absences_update" on public.absences
  for update to authenticated
  using (
    (staff_id = auth.uid() and status = 'pending')
    or public.my_role() in ('director', 'area_lead')
  );

-- DELETE: own pending only, or director
create policy "absences_delete" on public.absences
  for delete to authenticated
  using (
    (staff_id = auth.uid() and status = 'pending')
    or public.my_role() = 'director'
  );

-- ─── CLOCK RECORDS ────────────────────────────────────────────────────────────
-- Re-apply these in case they were not deployed from the earlier fix file.

drop policy if exists "clock_select_own"  on public.clock_records;
drop policy if exists "clock_insert_own"  on public.clock_records;
drop policy if exists "clock_update_own"  on public.clock_records;
drop policy if exists "clock_delete"      on public.clock_records;

alter table public.clock_records enable row level security;

create policy "clock_select_own" on public.clock_records
  for select to authenticated
  using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

create policy "clock_insert_own" on public.clock_records
  for insert to authenticated
  with check (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

create policy "clock_update_own" on public.clock_records
  for update to authenticated
  using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

create policy "clock_delete" on public.clock_records
  for delete to authenticated
  using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );
