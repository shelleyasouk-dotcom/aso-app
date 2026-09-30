-- Manual pay entries (e.g. admin hours) for Payroll / Payslips.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.manual_pay_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  hours numeric,
  hourly_rate numeric,
  amount numeric NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_pay_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manual_pay_entries_admin_all" ON public.manual_pay_entries;
CREATE POLICY "manual_pay_entries_admin_all" ON public.manual_pay_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager', 'area_lead')
    )
  );
