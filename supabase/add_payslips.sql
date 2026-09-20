-- Payslips feature
-- Run in the Supabase SQL editor.

-- 1. Extra fields on staff_employment for PAYE staff (NI category + pension)
ALTER TABLE public.staff_employment
  ADD COLUMN IF NOT EXISTS ni_category text DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS pension_opted_in boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS pension_employee_percent numeric DEFAULT 5;

-- Note: employment_type for payslips is derived from contract_type:
--   contract_type = 'employee'  -> PAYE payslip (tax/NI/pension deducted)
--   anything else / null        -> self-employed earnings statement (no deductions)
-- For PAYE staff, set pay_frequency = 'monthly' and pay_rate = their monthly
-- gross salary (annual salary ÷ 12).

-- 2. Payslips table
CREATE TABLE IF NOT EXISTS public.payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_month date NOT NULL, -- first of the month, e.g. 2026-08-01
  employment_type text NOT NULL CHECK (employment_type IN ('self_employed', 'paye')),
  session_count integer NOT NULL DEFAULT 0,
  session_gross numeric NOT NULL DEFAULT 0,
  salary_gross numeric NOT NULL DEFAULT 0,
  gross_pay numeric NOT NULL DEFAULT 0,
  expenses_total numeric NOT NULL DEFAULT 0,
  tax_deducted numeric NOT NULL DEFAULT 0,
  ni_deducted numeric NOT NULL DEFAULT 0,
  pension_deducted numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  breakdown jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'released')),
  generated_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  released_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, period_month)
);

ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payslips_staff_view_own_released" ON public.payslips;
CREATE POLICY "payslips_staff_view_own_released" ON public.payslips
  FOR SELECT USING (
    auth.uid() = staff_id AND status = 'released'
  );

DROP POLICY IF EXISTS "payslips_admin_full_access" ON public.payslips;
CREATE POLICY "payslips_admin_full_access" ON public.payslips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager')
    )
  );
