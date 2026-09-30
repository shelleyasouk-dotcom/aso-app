-- Monthly expense confirmation checkpoint for admin.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.expense_month_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE, -- first of the month, e.g. 2026-08-01
  confirmed_by uuid REFERENCES public.profiles(id),
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_month_confirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expense_month_confirmations_admin_all" ON public.expense_month_confirmations;
CREATE POLICY "expense_month_confirmations_admin_all" ON public.expense_month_confirmations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager')
    )
  );
