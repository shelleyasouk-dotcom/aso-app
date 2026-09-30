-- Monthly timesheet confirmation (staff) + authorization (admin) checkpoint.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.timesheet_month_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month date NOT NULL, -- first of the month, e.g. 2026-08-01
  confirmed_at timestamptz,
  confirmed_note text,
  has_issue boolean NOT NULL DEFAULT false,
  authorized_by uuid REFERENCES public.profiles(id),
  authorized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, month)
);

ALTER TABLE public.timesheet_month_confirmations ENABLE ROW LEVEL SECURITY;

-- Staff can see and confirm their own row. Admin controls authorization via
-- app logic (the staff-facing UI never sets authorized_by/authorized_at).
DROP POLICY IF EXISTS "timesheet_confirmations_own" ON public.timesheet_month_confirmations;
CREATE POLICY "timesheet_confirmations_own" ON public.timesheet_month_confirmations
  FOR ALL USING (auth.uid() = staff_id);

DROP POLICY IF EXISTS "timesheet_confirmations_admin_all" ON public.timesheet_month_confirmations;
CREATE POLICY "timesheet_confirmations_admin_all" ON public.timesheet_month_confirmations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('director', 'operations_manager')
    )
  );
