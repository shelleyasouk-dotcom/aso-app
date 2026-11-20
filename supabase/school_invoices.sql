-- Hall hire invoice checking & bulk payment export.
-- Run once in the Supabase SQL editor.

-- ── Hall hire + bank details on schools ─────────────────────────────────────
-- Only set on schools that charge ASO for hall hire (most schools won't have
-- these filled in at all).

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS hire_charge numeric,
  ADD COLUMN IF NOT EXISTS bank_account_name text,
  ADD COLUMN IF NOT EXISTS bank_sort_code text,
  ADD COLUMN IF NOT EXISTS bank_account_number text;

-- ── Invoices table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.school_invoices (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  month            text NOT NULL, -- 'YYYY-MM'
  expected_amount  numeric,       -- snapshot of schools.hire_charge at upload time
  invoiced_amount  numeric NOT NULL,
  approved_amount  numeric NOT NULL,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  file_path        text,
  notes            text,
  uploaded_by      uuid REFERENCES public.profiles(id),
  reviewed_by      uuid REFERENCES public.profiles(id),
  reviewed_at      timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_invoices_month ON public.school_invoices (month);
CREATE INDEX IF NOT EXISTS idx_school_invoices_school ON public.school_invoices (school_id);

ALTER TABLE public.school_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Finance roles manage school invoices" ON public.school_invoices;
CREATE POLICY "Finance roles manage school invoices"
  ON public.school_invoices FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant'))
  );

-- ── Storage bucket: create manually in Supabase dashboard ───────────────────
-- Name: school-invoices
-- Public: false (invoices are financial documents — keep private)

DROP POLICY IF EXISTS "Finance roles read school invoice files" ON storage.objects;
CREATE POLICY "Finance roles read school invoice files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'school-invoices'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant'))
  );

DROP POLICY IF EXISTS "Finance roles upload school invoice files" ON storage.objects;
CREATE POLICY "Finance roles upload school invoice files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-invoices'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant'))
  );

DROP POLICY IF EXISTS "Finance roles delete school invoice files" ON storage.objects;
CREATE POLICY "Finance roles delete school invoice files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'school-invoices'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director', 'operations_manager', 'operations_assistant'))
  );
