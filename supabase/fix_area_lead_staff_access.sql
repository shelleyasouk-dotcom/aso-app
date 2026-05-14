-- Allow area leads to read staff personal and employment details.
-- Run in Supabase SQL editor.

-- staff_personal: area leads can read all records
drop policy if exists "personal_area_lead" on public.staff_personal;
create policy "personal_area_lead" on public.staff_personal
  for select to authenticated
  using (public.my_role() = 'area_lead');

-- staff_employment: area leads can read all records
drop policy if exists "employment_area_lead" on public.staff_employment;
create policy "employment_area_lead" on public.staff_employment
  for select to authenticated
  using (public.my_role() = 'area_lead');
