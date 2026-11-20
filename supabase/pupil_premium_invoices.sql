-- Pupil Premium / school-funded place invoicing.
-- Run once in the Supabase SQL editor.

-- ── Flag funded children ─────────────────────────────────────────────────────

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS is_funded_place boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS funded_reason text,
  ADD COLUMN IF NOT EXISTS funded_rate numeric; -- per-session override; blank = use the default rate in invoice_settings

-- ── Invoice settings (one row — your company/bank details for the PDF) ──────

CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id                     int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name           text NOT NULL DEFAULT 'Active School Organisation Ltd',
  company_number         text,
  registered_address     text,
  bank_account_name      text,
  bank_sort_code         text,
  bank_account_number    text,
  default_rate           numeric NOT NULL DEFAULT 9.50,
  footer_note            text DEFAULT 'Payment due within 30 days by bank transfer, quoting the invoice number as reference.',
  updated_at             timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.invoice_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Finance roles manage invoice settings" ON public.invoice_settings;
CREATE POLICY "Finance roles manage invoice settings"
  ON public.invoice_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')));

-- ── Invoices to schools for funded places ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pp_invoices (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  invoice_number   text NOT NULL UNIQUE,
  period_start     date NOT NULL,
  period_end       date NOT NULL,
  rate_per_session numeric NOT NULL,
  total_amount     numeric NOT NULL,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  sent_at          timestamptz,
  paid_at          timestamptz,
  created_by       uuid REFERENCES public.profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pp_invoice_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES public.pp_invoices(id) ON DELETE CASCADE,
  child_id        uuid REFERENCES public.children(id),
  child_name      text NOT NULL, -- snapshot, survives the child record changing/being archived
  sessions_count  integer NOT NULL,
  rate            numeric NOT NULL,
  amount          numeric NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pp_invoices_school ON public.pp_invoices (school_id);
CREATE INDEX IF NOT EXISTS idx_pp_invoice_lines_invoice ON public.pp_invoice_lines (invoice_id);

ALTER TABLE public.pp_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_invoice_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Finance roles manage pp invoices" ON public.pp_invoices;
CREATE POLICY "Finance roles manage pp invoices"
  ON public.pp_invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')));

DROP POLICY IF EXISTS "Finance roles manage pp invoice lines" ON public.pp_invoice_lines;
CREATE POLICY "Finance roles manage pp invoice lines"
  ON public.pp_invoice_lines FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant')));
