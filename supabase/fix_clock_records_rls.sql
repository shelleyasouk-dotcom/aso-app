-- Fix: allow directors and area leads to insert and delete clock records
-- Run this in the Supabase SQL editor.

-- INSERT: previously only allowed staff_id = own user
drop policy if exists "clock_insert_own" on public.clock_records;
create policy "clock_insert_own" on public.clock_records
  for insert to authenticated
  with check (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );

-- DELETE: no policy existed — staff can delete their own, managers can delete any
drop policy if exists "clock_delete" on public.clock_records;
create policy "clock_delete" on public.clock_records
  for delete to authenticated
  using (
    staff_id = auth.uid()
    or public.my_role() in ('director', 'area_lead')
  );
