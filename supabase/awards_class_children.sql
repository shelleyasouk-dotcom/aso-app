-- ─────────────────────────────────────────────────────────────
-- AWARDS v2: Coach-managed class rosters
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- 1. Coach-managed class roster per school/semester
CREATE TABLE IF NOT EXISTS public.class_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  academic_year text NOT NULL,
  semester_number integer NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
  added_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Individual skill completions per class child
CREATE TABLE IF NOT EXISTS public.class_skill_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.class_children(id) ON DELETE CASCADE NOT NULL,
  apparatus text NOT NULL CHECK (apparatus IN ('floor', 'bars', 'beam', 'rebound')),
  level integer NOT NULL CHECK (level BETWEEN 1 AND 6),
  skill_index integer NOT NULL,
  completed_by uuid REFERENCES public.profiles(id) NOT NULL,
  completed_by_name text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (child_id, apparatus, level, skill_index)
);

-- 3. Award certificates per class child
CREATE TABLE IF NOT EXISTS public.class_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.class_children(id) ON DELETE CASCADE NOT NULL,
  apparatus text NOT NULL CHECK (apparatus IN ('floor', 'bars', 'beam', 'rebound')),
  level integer NOT NULL CHECK (level BETWEEN 1 AND 6),
  awarded_by uuid REFERENCES public.profiles(id) NOT NULL,
  coach_name text NOT NULL,
  certificate_handed_out boolean NOT NULL DEFAULT false,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE (child_id, apparatus, level)
);

-- Enable RLS
ALTER TABLE public.class_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_skill_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_certificates ENABLE ROW LEVEL SECURITY;

-- ── class_children RLS ──────────────────────────────────────
-- Coaches see their own; lead_coaches see all at their schools; area_lead/director see all
CREATE POLICY "class_children_select" ON public.class_children
  FOR SELECT USING (
    added_by = auth.uid()
    OR my_role() IN ('area_lead', 'director')
    OR (
      my_role() = 'lead_coach'
      AND school_id IN (
        SELECT school_id FROM public.staff_school_assignments WHERE staff_id = auth.uid()
      )
    )
  );

CREATE POLICY "class_children_insert" ON public.class_children
  FOR INSERT WITH CHECK (added_by = auth.uid());

CREATE POLICY "class_children_delete" ON public.class_children
  FOR DELETE USING (
    added_by = auth.uid()
    OR my_role() IN ('area_lead', 'director')
  );

-- ── class_skill_completions RLS ─────────────────────────────
CREATE POLICY "class_skill_comps_select" ON public.class_skill_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_children cc WHERE cc.id = child_id
      AND (
        cc.added_by = auth.uid()
        OR my_role() IN ('area_lead', 'director')
        OR (
          my_role() = 'lead_coach'
          AND cc.school_id IN (
            SELECT school_id FROM public.staff_school_assignments WHERE staff_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "class_skill_comps_insert" ON public.class_skill_completions
  FOR INSERT WITH CHECK (
    completed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.class_children cc WHERE cc.id = child_id
      AND (
        cc.added_by = auth.uid()
        OR my_role() IN ('lead_coach', 'area_lead', 'director')
      )
    )
  );

CREATE POLICY "class_skill_comps_delete" ON public.class_skill_completions
  FOR DELETE USING (
    completed_by = auth.uid()
    OR my_role() IN ('lead_coach', 'area_lead', 'director')
  );

-- ── class_certificates RLS ──────────────────────────────────
CREATE POLICY "class_certs_select" ON public.class_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_children cc WHERE cc.id = child_id
      AND (
        cc.added_by = auth.uid()
        OR my_role() IN ('area_lead', 'director')
        OR (
          my_role() = 'lead_coach'
          AND cc.school_id IN (
            SELECT school_id FROM public.staff_school_assignments WHERE staff_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "class_certs_insert" ON public.class_certificates
  FOR INSERT WITH CHECK (
    awarded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.class_children cc WHERE cc.id = child_id
      AND (
        cc.added_by = auth.uid()
        OR my_role() IN ('lead_coach', 'area_lead', 'director')
      )
    )
  );

CREATE POLICY "class_certs_update" ON public.class_certificates
  FOR UPDATE USING (
    awarded_by = auth.uid()
    OR my_role() IN ('lead_coach', 'area_lead', 'director')
  );
