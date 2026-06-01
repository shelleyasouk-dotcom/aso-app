-- Leadership Course progress and certificates
CREATE TABLE IF NOT EXISTS public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id text NOT NULL DEFAULT 'leadership_v1',
  module_id text NOT NULL,
  quiz_score integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id text NOT NULL,
  course_title text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_progress_own" ON public.course_progress
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_certs_select" ON public.course_certificates
  FOR SELECT USING (
    user_id = auth.uid()
    OR my_role() IN ('area_lead', 'director')
  );

CREATE POLICY "course_certs_insert" ON public.course_certificates
  FOR INSERT WITH CHECK (user_id = auth.uid());
