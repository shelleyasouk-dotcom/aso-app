-- =============================================================================
-- ASO Onboarding — Content Updates v2
-- Run after: onboarding_seed_content.sql, onboarding_seed_quiz_bank.sql,
--            onboarding_profile_cta.sql
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1: staff_documents INSERT policy
-- Fixes "new row violates row-level security policy for table staff_documents"
-- when coaches upload documents during onboarding.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS staff_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_documents_own_insert" ON staff_documents;
CREATE POLICY "staff_documents_own_insert"
  ON staff_documents FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = auth.uid());

DROP POLICY IF EXISTS "staff_documents_own_select" ON staff_documents;
CREATE POLICY "staff_documents_own_select"
  ON staff_documents FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "staff_documents_own_update" ON staff_documents;
CREATE POLICY "staff_documents_own_update"
  ON staff_documents FOR UPDATE
  TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('director', 'area_lead')
    )
  );

DROP POLICY IF EXISTS "staff_documents_admin_delete" ON staff_documents;
CREATE POLICY "staff_documents_admin_delete"
  ON staff_documents FOR DELETE
  TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('director', 'area_lead')
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 1: Safeguarding — add High Speed Training course external link
-- Inserts the CTA button before the final acknowledgement block.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version = 2,
  content_json = jsonb_insert(
    content_json,
    ARRAY['blocks', (jsonb_array_length(content_json->'blocks') - 1)::text],
    '{
      "id": "sg-cta-hst",
      "order": 17,
      "type": "cta_button",
      "label": "Book Safeguarding in Sport course (High Speed Training)",
      "route": "https://www.highspeedtraining.co.uk/courses/safeguarding/safeguarding-in-sport"
    }'::jsonb,
    false
  )
WHERE title = 'Safeguarding — Your Responsibilities';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 2: DBS Requirements — add Care Check process and 1–6 week timeline
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version = 2,
  content_json = $dbs2${
    "version": 2,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"DBS Requirements"},
      {"id":"2","order":2,"type":"paragraph","text":"All staff at ASO must hold an Enhanced Disclosure and Barring Service (DBS) certificate, including the children's barred list check, before working independently with children. This is a legal safeguarding requirement and there are no exceptions."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"What Is Required"},
      {"id":"4","order":4,"type":"bullet_list","items":["Enhanced DBS certificate — not a basic or standard check","Children's barred list check must be included","No member of staff may work independently with children without a confirmed valid DBS"]},
      {"id":"5","order":5,"type":"heading","level":2,"text":"How to Get Your DBS — Care Check"},
      {"id":"6","order":6,"type":"paragraph","text":"ASO processes DBS checks through Care Check, a government-approved umbrella body. Once your onboarding is underway, Naima will send you a secure link to complete your DBS application online through the Care Check portal. You will need to provide identification documents as part of the process — your Area Lead will advise you on what to bring."},
      {"id":"7","order":7,"type":"callout","variant":"warning","title":"Allow 1–6 weeks","text":"DBS processing times vary. A standard Enhanced DBS can take between 1 and 6 weeks to come back. Apply as soon as you receive the link from Naima — do not delay. You cannot work independently with children until your DBS has been confirmed by Naima."},
      {"id":"8","order":8,"type":"heading","level":2,"text":"When You Receive Your Certificate"},
      {"id":"9","order":9,"type":"paragraph","text":"Your DBS certificate will arrive by post to the address you provided in your application. Once it arrives, return to Stage 7 of your onboarding and upload a clear photo or scan of it using the document upload task. You can come back to this at any time — you do not need to complete it immediately. Keep the original certificate safe."},
      {"id":"10","order":10,"type":"heading","level":2,"text":"Renewal"},
      {"id":"11","order":11,"type":"bullet_list","items":["DBS certificates are renewed every three years","Alternatively, you may maintain your certificate via the DBS Update Service, which allows continuous online checking","If you use the Update Service, please inform Naima so your record can be verified online rather than posting a certificate"]},
      {"id":"12","order":12,"type":"heading","level":2,"text":"DBS From a Previous Organisation"},
      {"id":"13","order":13,"type":"paragraph","text":"If you hold a valid Enhanced DBS certificate from a previous employer or organisation, it may be accepted. You must confirm this with Naima before starting. Certificates that were not issued on the Update Service and are more than three years old will not be accepted."},
      {"id":"14","order":14,"type":"callout","variant":"important","title":"No DBS, no sessions","text":"You cannot work with children at ASO until your DBS has been confirmed. Do not attend sessions or work with children until Naima has confirmed your DBS is in order."},
      {"id":"15","order":15,"type":"acknowledgement","prompt":"I understand the DBS requirements for my role. I will apply as soon as I receive the Care Check link from Naima, and I understand that I cannot work independently with children until my DBS has been confirmed."}
    ]
  }$dbs2$::jsonb
WHERE title = 'DBS Requirements';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 3: First Aid and UKAG Qualifications
-- Clarifies role-based requirements; non-lead coaches do not need first aid.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version = 2,
  content_json = $fa2${
    "version": 2,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"First Aid and UKAG Qualifications"},
      {"id":"2","order":2,"type":"callout","variant":"info","title":"Your role determines what you need","text":"First aid requirements depend on your role at ASO. Read this section carefully and complete the acknowledgement that matches your current role."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"First Aid — Lead Coaches Only"},
      {"id":"4","order":4,"type":"paragraph","text":"Every Lead Coach must hold a valid first aid certificate before leading sessions independently. Either of the following is acceptable:"},
      {"id":"5","order":5,"type":"bullet_list","items":["Paediatric First Aid (PFA) — recommended for working with children aged 4–11","First Aid at Work (FAW) — also accepted","Certificate must be current and in date — expired certificates are not valid"]},
      {"id":"6","order":6,"type":"heading","level":2,"text":"Junior and Assistant Coaches"},
      {"id":"7","order":7,"type":"paragraph","text":"If you are joining as a Junior or Assistant Coach, you are not required to hold a first aid certificate at this stage. The upload task that follows is optional for you. ASO can fund first aid training when you are ready to progress towards the Lead Coach role — speak to your Area Lead when you reach that stage."},
      {"id":"8","order":8,"type":"heading","level":2,"text":"UKAG Coaching Qualifications"},
      {"id":"9","order":9,"type":"paragraph","text":"All ASO coaches work within the UKAG (UK Academies of Gymnastics) Recreational Awards Framework. The UKAG pathway provides a structured, recognised route to becoming a qualified gymnastics and multi-sport coach:"},
      {"id":"10","order":10,"type":"bullet_list","items":["UKAG Level 0 — Junior Coach: shadow and observation role; no independent delivery","UKAG Level 1 — Assistant Coach: can run warm-ups and manage stations under direction of a Lead Coach","UKAG Level 2 — Lead Coach: required before leading sessions independently"]},
      {"id":"11","order":11,"type":"callout","variant":"tip","title":"ASO funds your UKAG training","text":"All ASO coaches have the opportunity to receive funding for UKAG courses. To qualify, you must complete your onboarding, work a minimum of one full term, remain on the active rota, and attend the required shadow and CPD sessions. Your Area Lead will register you for the next available course when you are ready."},
      {"id":"12","order":12,"type":"heading","level":2,"text":"Uploading Your Certificates"},
      {"id":"13","order":13,"type":"paragraph","text":"Lead Coaches: upload clear, legible copies of your first aid and UKAG certificates using the upload tasks that follow this module. If a qualification is in progress, upload a confirmation letter or interim certificate from the awarding body. Junior and Assistant Coaches: the first aid upload is optional — skip it if it does not apply to you."},
      {"id":"14","order":14,"type":"acknowledgement","prompt":"I understand the first aid and UKAG qualification requirements for my role. If I am a Lead Coach, I will upload my certificates. I understand that ASO funds UKAG training for eligible coaches and I will speak to my Area Lead when I am ready to progress."}
    ]
  }$fa2$::jsonb
WHERE title = 'First Aid and UKAG Qualifications';

-- Make the First Aid Certificate Upload task optional for non-lead coaches
UPDATE onboarding_tasks
SET is_mandatory = false
WHERE title = 'First Aid Certificate Upload';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 4: Staff Handbook — add CTA button to Coach Zone (/handbook)
-- and update acknowledgement to say "thoroughly read".
-- ─────────────────────────────────────────────────────────────────────────────

WITH inserted AS (
  SELECT
    id,
    jsonb_insert(
      content_json,
      ARRAY['blocks', (jsonb_array_length(content_json->'blocks') - 1)::text],
      '{
        "id": "hb-cta-zone",
        "order": 23,
        "type": "cta_button",
        "label": "Read the full Staff Handbook in the Coach Zone",
        "route": "/handbook"
      }'::jsonb,
      false
    ) AS j
  FROM onboarding_tasks
  WHERE title = 'The ASO Staff Handbook'
)
UPDATE onboarding_tasks t
SET
  version = 2,
  content_json = jsonb_set(
    inserted.j,
    ARRAY['blocks', (jsonb_array_length(inserted.j->'blocks') - 1)::text, 'prompt'],
    '"I have thoroughly read the full ASO Staff Handbook in the Coach Zone. I agree to work in line with all conduct standards, absence policies, and expectations set out in it."'::jsonb
  )
FROM inserted
WHERE t.id = inserted.id;


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 5: Session Procedures (SOP) — first day: no lanyard, bring DBS and ID
-- Inserts a callout before the arrival numbered list (currently at index 3).
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version = 2,
  content_json = jsonb_insert(
    content_json,
    ARRAY['blocks', '3'],
    '{
      "id": "sop-firstday",
      "order": 4,
      "type": "callout",
      "variant": "info",
      "title": "Your first day — no lanyard yet",
      "text": "On your first day you will not yet have your ASO ID lanyard. Bring your DBS certificate and a photo ID (passport or driving licence) to sign in at school reception. Do not arrive without identification — schools will not admit you without it. Your lanyard will be arranged through your Area Lead."
    }'::jsonb,
    false
  )
WHERE title = 'Session Procedures';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 6: Lead Coach Requirements and Lone Working (Stage 12)
-- Expands role descriptions, adds UKAG website link and funding info.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version = 2,
  content_json = $role2${
    "version": 2,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Role-Specific Training and Requirements"},
      {"id":"2","order":2,"type":"paragraph","text":"This section explains the specific responsibilities and training requirements for each role at ASO, and how UKAG qualifications support your development. Whatever your current role, understanding the full picture helps you work effectively as part of the team."},

      {"id":"3","order":3,"type":"heading","level":2,"text":"Junior Coach"},
      {"id":"4","order":4,"type":"paragraph","text":"Junior Coaches are at the start of their coaching journey. This is a shadow and observation role — you attend sessions to watch, assist, and learn under the direct supervision of a Lead Coach."},
      {"id":"5","order":5,"type":"bullet_list","items":["You do not lead sessions or make operational decisions independently","You follow the Lead Coach's direction at all times","You assist with set-up, equipment, and managing stations when directed","You must still hold a valid Enhanced DBS and Safeguarding in Sport certificate","You do not need a first aid certificate at this stage"]},
      {"id":"6","order":6,"type":"callout","variant":"info","title":"UKAG Level 0 — Junior Coach award","text":"The UKAG Level 0 Junior Coach award formalises your role and gives you a recognised coaching qualification. ASO funds this for eligible coaches. Speak to your Area Lead about registering for the next available course."},

      {"id":"7","order":7,"type":"heading","level":2,"text":"Assistant Coach"},
      {"id":"8","order":8,"type":"paragraph","text":"Assistant Coaches support the Lead Coach in delivering sessions. You can take a more active role than a Junior Coach, but you remain under the direction of the Lead."},
      {"id":"9","order":9,"type":"bullet_list","items":["You can run warm-up activities and manage stations under direction","You are not responsible for the register, medical protocol, safeguarding decisions, or dismissal — these remain with the Lead Coach","You must hold a valid Enhanced DBS and Safeguarding in Sport certificate","A first aid certificate is not required at this stage but is recommended if you are working towards Lead Coach"]},
      {"id":"10","order":10,"type":"callout","variant":"info","title":"UKAG Level 1 — Assistant Coach award","text":"The UKAG Level 1 Assistant Coach award is the next step in your development. ASO funds this training for eligible coaches who have completed a minimum of one term on the rota."},

      {"id":"11","order":11,"type":"heading","level":2,"text":"Lead Coach"},
      {"id":"12","order":12,"type":"paragraph","text":"Lead Coaches carry full on-site responsibility for the session. Before working independently, a Lead Coach must hold all of the following:"},
      {"id":"13","order":13,"type":"bullet_list","items":["Enhanced DBS certificate including the children's barred list check","Paediatric First Aid (PFA) or First Aid at Work (FAW) — current and in date","Safeguarding in Sport — minimum Level 1, renewed annually in line with KCSIE","UKAG Level 2 Lead Coach qualification","Completed shadow session signed off by their Area Lead"]},
      {"id":"14","order":14,"type":"callout","variant":"tip","title":"UKAG Level 2 — Lead Coach award","text":"The UKAG Level 2 award is required before leading sessions independently. ASO funds this training for eligible coaches. Completion of Levels 0 and 1 is expected before applying for Level 2."},

      {"id":"15","order":15,"type":"heading","level":2,"text":"Area Lead"},
      {"id":"16","order":16,"type":"bullet_list","items":["Holds all Lead Coach requirements","Level 2 Safeguarding Certificate — required for the Deputy DSL function","Annual safeguarding refresher in line with KCSIE","Area Leads manage a group of schools and coaches, handle cover and absence, and are the first escalation point for all operational issues"]},

      {"id":"17","order":17,"type":"heading","level":2,"text":"UKAG — Further Training"},
      {"id":"18","order":18,"type":"paragraph","text":"The UKAG website has full details of all qualifications, course dates, and the Recreational Awards Framework. All ASO coaches have the opportunity to receive funding for courses delivered by UKAG — eligibility is confirmed by your Area Lead after your first term on the rota."},
      {"id":"19","order":19,"type":"cta_button","label":"Visit the UKAG website for course information","route":"https://www.ukacademiesofgymnastics.com/"},
      {"id":"20","order":20,"type":"cta_button","label":"View UKAG courses in the app","route":"/ukag"},

      {"id":"21","order":21,"type":"heading","level":2,"text":"Lone Working"},
      {"id":"22","order":22,"type":"paragraph","text":"There will be times when staffing is reduced — particularly at the start of a new term. Lone working is planned for and permitted as a one-off exception when cover cannot be found in time."},
      {"id":"23","order":23,"type":"callout","variant":"warning","title":"One-off exception only","text":"A session may run with minimum staffing as a one-off when cover cannot be found in time. This is not a regular operating model. If a school is regularly running with minimum staffing, escalate to Naima — it is a resourcing issue."},
      {"id":"24","order":24,"type":"bullet_list","items":["Your safeguarding responsibilities remain exactly the same — no rules change when lone working","Never be alone with a single child in a closed or isolated space","If a child needs to leave the hall, follow the school's procedure — do not leave the group unattended","Log any lone working session in your end-of-week update to your Area Lead","Contact your Area Lead if you feel the session cannot be run safely with current staffing"]},

      {"id":"25","order":25,"type":"acknowledgement","prompt":"I understand the training requirements and responsibilities for my role at ASO. I understand that ASO funds UKAG training for eligible coaches and I will speak to my Area Lead about the next available course when I am ready."}
    ]
  }$role2$::jsonb
WHERE title = 'Lead Coach Requirements and Lone Working';
