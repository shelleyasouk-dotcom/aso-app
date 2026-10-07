-- Ensure staff can edit/cancel their own expenses, and admin can edit/cancel any.
-- Run in the Supabase SQL editor. Safe to re-run.

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_staff_manage_own" ON public.expenses;
CREATE POLICY "expenses_staff_manage_own" ON public.expenses
  FOR ALL USING (auth.uid() = staff_id);

DROP POLICY IF EXISTS "expenses_admin_manage_all" ON public.expenses;
CREATE POLICY "expenses_admin_manage_all" ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager', 'area_lead')
    )
  );
