-- Job descriptions — one per staff role.
-- Admins write sections in the admin panel; staff see a popup and agree on login.

CREATE TABLE IF NOT EXISTS public.job_descriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role        text NOT NULL UNIQUE,
  title       text NOT NULL,
  version     text NOT NULL DEFAULT 'v1',
  content     jsonb,          -- [{heading, items:[{type:'text'|'bullet',text}]}]
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed one row per coaching/staff role so the editor can populate them
INSERT INTO public.job_descriptions (role, title, version) VALUES
  ('junior_coach',     'Junior Coach — Job Description',     'v1'),
  ('assistant_coach',  'Assistant Coach — Job Description',  'v1'),
  ('lead_coach',       'Lead Coach — Job Description',       'v1'),
  ('area_lead',        'Area Lead — Job Description',        'v1'),
  ('outreach_worker',  'Outreach Worker — Job Description',  'v1'),
  ('media_tech',       'Media & Tech — Job Description',     'v1'),
  ('director',         'Director — Job Description',         'v1')
ON CONFLICT (role) DO NOTHING;

-- Track per-staff agreement on the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jd_agreed_at      timestamptz,
  ADD COLUMN IF NOT EXISTS jd_agreed_version text,
  ADD COLUMN IF NOT EXISTS jd_agreed_role    text;

-- RLS
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_jd"
  ON public.job_descriptions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "directors_manage_jd"
  ON public.job_descriptions FOR ALL
  TO authenticated
  USING   (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'area_lead')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'area_lead')));
