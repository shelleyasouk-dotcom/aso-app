-- Staff contract templates (one per role)
CREATE TABLE IF NOT EXISTS public.staff_contracts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role        text NOT NULL UNIQUE,
  title       text NOT NULL,
  storage_path text,            -- path inside coach-files bucket, e.g. contracts/junior_coach.pdf
  version     text NOT NULL DEFAULT 'v1',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed contract template rows (storage_path filled in once PDFs are uploaded)
INSERT INTO public.staff_contracts (role, title, version) VALUES
  ('junior_coach',     'ASO Junior Coach Contract',     'v1'),
  ('assistant_coach',  'ASO Assistant Coach Contract',  'v1'),
  ('lead_coach',       'ASO Lead Coach Contract',       'v1'),
  ('area_lead',        'ASO Area Lead Contract',        'v1')
ON CONFLICT (role) DO NOTHING;

-- Track per-staff acknowledgement on the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contract_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS contract_version   text;

-- RLS: directors and area leads can read all contracts
ALTER TABLE public.staff_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_contracts"
  ON public.staff_contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "directors_manage_contracts"
  ON public.staff_contracts FOR ALL
  TO authenticated
  USING   (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director'));
