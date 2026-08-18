-- Patch contract content: Before You Start + Safeguarding sections
-- Run this in the Supabase SQL editor.

-- Update "BEFORE YOU START" and "SAFEGUARDING" sections for all four roles.
-- We update each role's full content array, replacing only the relevant sections
-- while keeping the rest of the content intact.

-- ── Junior Coach ─────────────────────────────────────────────────────────────

UPDATE public.staff_contracts
SET content = (
  SELECT jsonb_agg(
    CASE
      WHEN s->>'heading' ILIKE '%BEFORE YOU START%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"You cannot attend any session until ALL of the following have been completed and verified by your Area Lead:"},
            {"type":"bullet","text":"Complete the full ASO onboarding programme in the app"},
            {"type":"bullet","text":"Hold a valid DBS check (Enhanced, on the Update Service or renewed within 3 years)"},
            {"type":"bullet","text":"Complete Safeguarding in Sport (UK Coaching or equivalent, Level 1 minimum)"},
            {"type":"bullet","text":"Complete the ASO Online Safeguarding quiz inside the app"},
            {"type":"bullet","text":"Read and acknowledge the ASO Safeguarding Policy and Code of Conduct"},
            {"type":"text","text":"Your Area Lead will confirm when you are cleared to start."}
          ]'::jsonb
        )
      WHEN s->>'heading' ILIKE '%SAFEGUARDING%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"Safeguarding children is everyone''s responsibility. As an ASO coach you must:"},
            {"type":"bullet","text":"Never be alone with a child — always remain visible to another adult"},
            {"type":"bullet","text":"Report any concern immediately to your Lead Coach or Area Lead on the same day"},
            {"type":"bullet","text":"Use the Incident Report section of the app to log any accidents, incidents, or disclosures"},
            {"type":"bullet","text":"Never take photos or videos of children on a personal device — use the school''s or ASO''s approved process only"},
            {"type":"bullet","text":"Never share children''s personal details outside of official ASO channels"},
            {"type":"text","text":"Our Designated Safeguarding Lead (DSL) is Naima Asouk — contact info@activeschool.org.uk. In an emergency, always call 999 first."},
            {"type":"text","text":"Failure to follow safeguarding procedures will result in immediate suspension pending investigation."}
          ]'::jsonb
        )
      ELSE s
    END
  )
  FROM jsonb_array_elements(content) s
)
WHERE role = 'junior_coach';


-- ── Assistant Coach ───────────────────────────────────────────────────────────

UPDATE public.staff_contracts
SET content = (
  SELECT jsonb_agg(
    CASE
      WHEN s->>'heading' ILIKE '%BEFORE YOU START%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"You cannot attend any session until ALL of the following have been completed and verified by your Area Lead:"},
            {"type":"bullet","text":"Complete the full ASO onboarding programme in the app"},
            {"type":"bullet","text":"Hold a valid DBS check (Enhanced, on the Update Service or renewed within 3 years)"},
            {"type":"bullet","text":"Complete Safeguarding in Sport (UK Coaching or equivalent, Level 1 minimum)"},
            {"type":"bullet","text":"Complete the ASO Online Safeguarding quiz inside the app"},
            {"type":"bullet","text":"Read and acknowledge the ASO Safeguarding Policy and Code of Conduct"},
            {"type":"text","text":"Your Area Lead will confirm when you are cleared to start."}
          ]'::jsonb
        )
      WHEN s->>'heading' ILIKE '%SAFEGUARDING%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"Safeguarding children is everyone''s responsibility. As an ASO coach you must:"},
            {"type":"bullet","text":"Never be alone with a child — always remain visible to another adult"},
            {"type":"bullet","text":"Report any concern immediately to your Lead Coach or Area Lead on the same day"},
            {"type":"bullet","text":"Use the Incident Report section of the app to log any accidents, incidents, or disclosures"},
            {"type":"bullet","text":"Never take photos or videos of children on a personal device"},
            {"type":"bullet","text":"Never share children''s personal details outside of official ASO channels"},
            {"type":"text","text":"Our DSL is Naima Asouk — contact info@activeschool.org.uk. In an emergency, always call 999 first."},
            {"type":"text","text":"Failure to follow safeguarding procedures will result in immediate suspension pending investigation."}
          ]'::jsonb
        )
      ELSE s
    END
  )
  FROM jsonb_array_elements(content) s
)
WHERE role = 'assistant_coach';


-- ── Lead Coach ────────────────────────────────────────────────────────────────

UPDATE public.staff_contracts
SET content = (
  SELECT jsonb_agg(
    CASE
      WHEN s->>'heading' ILIKE '%BEFORE YOU START%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"You cannot lead any session until ALL of the following have been completed and verified by your Area Lead:"},
            {"type":"bullet","text":"Complete the full ASO onboarding programme in the app"},
            {"type":"bullet","text":"Hold a valid DBS check (Enhanced, on the Update Service or renewed within 3 years)"},
            {"type":"bullet","text":"Complete Safeguarding in Sport (UK Coaching or equivalent, Level 1 minimum)"},
            {"type":"bullet","text":"Hold a valid Emergency First Aid at Work (EFAW) certificate"},
            {"type":"bullet","text":"Complete the ASO Online Safeguarding quiz inside the app"},
            {"type":"bullet","text":"Read and acknowledge the ASO Safeguarding Policy and Code of Conduct"},
            {"type":"bullet","text":"Complete the ASO Leadership & Coaching online course (in the app)"},
            {"type":"text","text":"Your Area Lead will confirm when you are cleared to lead sessions."}
          ]'::jsonb
        )
      WHEN s->>'heading' ILIKE '%SAFEGUARDING%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"As Lead Coach, you hold primary safeguarding responsibility for every session you run. You must:"},
            {"type":"bullet","text":"Never be alone with a child — always remain visible to another adult"},
            {"type":"bullet","text":"Report any concern to your Area Lead immediately — the same day it occurs"},
            {"type":"bullet","text":"Log all accidents, incidents, and disclosures in the Incident Report section of the app"},
            {"type":"bullet","text":"Ensure children are collected only by an authorised adult at the end of every session"},
            {"type":"bullet","text":"Never take photos or videos of children on a personal device"},
            {"type":"bullet","text":"Never share children''s personal details outside of official ASO channels"},
            {"type":"text","text":"Our DSL is Naima Asouk — info@activeschool.org.uk. Deputy DSL is your Area Lead. In an emergency, always call 999 first."},
            {"type":"text","text":"Failure to follow safeguarding procedures will result in immediate suspension pending investigation."}
          ]'::jsonb
        )
      ELSE s
    END
  )
  FROM jsonb_array_elements(content) s
)
WHERE role = 'lead_coach';


-- ── Area Lead ─────────────────────────────────────────────────────────────────

UPDATE public.staff_contracts
SET content = (
  SELECT jsonb_agg(
    CASE
      WHEN s->>'heading' ILIKE '%QUALIFICATIONS%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"To carry out this role you must hold and keep current:"},
            {"type":"bullet","text":"Valid DBS check (Enhanced, on the Update Service or renewed within 3 years)"},
            {"type":"bullet","text":"Safeguarding in Sport — Level 2 minimum (required for Deputy DSL designation)"},
            {"type":"bullet","text":"Emergency First Aid at Work (EFAW) — renewable every 3 years"},
            {"type":"bullet","text":"ASO Leadership & Coaching online course (completed in the app)"},
            {"type":"text","text":"You are responsible for keeping all certificates up to date and uploading renewals to the app. Expired certificates will trigger an immediate review of your role."}
          ]'::jsonb
        )
      WHEN s->>'heading' ILIKE '%SAFEGUARDING%' AND s->>'heading' NOT ILIKE '%QUALIFICATIONS%' THEN
        jsonb_build_object(
          'heading', s->>'heading',
          'items', '[
            {"type":"text","text":"As Deputy DSL for your area, you are the first escalation point for all safeguarding concerns from your coaches. You must:"},
            {"type":"bullet","text":"Act on any concern raised by a coach on the same day"},
            {"type":"bullet","text":"Escalate all safeguarding concerns to Naima Asouk (DSL) immediately"},
            {"type":"bullet","text":"Ensure all incidents in your area are logged in the app within 24 hours"},
            {"type":"bullet","text":"Never share children''s personal information outside official channels"},
            {"type":"bullet","text":"Ensure every coach in your area holds a current DBS and safeguarding certificate before they step on site"},
            {"type":"text","text":"DSL: Naima Asouk — info@activeschool.org.uk. In an emergency, always call 999 first."},
            {"type":"text","text":"Failure to act on a safeguarding concern will result in immediate suspension pending investigation and may be referred to statutory authorities."}
          ]'::jsonb
        )
      ELSE s
    END
  )
  FROM jsonb_array_elements(content) s
)
WHERE role = 'area_lead';
