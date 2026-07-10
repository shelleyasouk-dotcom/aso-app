-- =============================================================================
-- ASO Onboarding — Content Seed
-- Source: Coach Work Handbook v1.0 + Operations Manual v1.0
-- Run after: onboarding_system_v2.sql, onboarding_system_rls.sql, onboarding_phase2.sql
-- Idempotent: guarded with WHERE NOT EXISTS on every INSERT
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 1: Welcome to Active School
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Welcome to Active School' LIMIT 1),
  'Welcome to Active School Org',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Welcome to the Team"},
      {"id":"2","order":2,"type":"paragraph","text":"You are now part of the Active School Org (ASO) coaching team. We deliver gymnastics and multi-sport after-school clubs in UK primary schools, working in partnership with schools to provide safe, structured, and enjoyable sessions for children aged 4 to 11."},
      {"id":"3","order":3,"type":"paragraph","text":"We operate using the UKAG (UK Academies of Gymnastics) Recreational Awards Framework — a structured progression system that gives children clear goals and coaches a clear curriculum. ASO manages all operational aspects including staffing, safeguarding, parent bookings, registers, communication, and equipment."},
      {"id":"4","order":4,"type":"heading","level":2,"text":"Our Values"},
      {"id":"5","order":5,"type":"paragraph","text":"Every decision, session, and interaction at ASO is guided by five core values. These are not just words — they are the standard we hold ourselves to every single day."},
      {"id":"6","order":6,"type":"bullet_list","items":["Safety first — in everything we do","Consistency — the same high standard at every school, every week","Inclusivity — every child is welcome and valued","Professionalism — we are guests in schools and ambassadors for ASO","Development — we invest in children and coaches alike"]},
      {"id":"7","order":7,"type":"heading","level":2,"text":"This Onboarding Programme"},
      {"id":"8","order":8,"type":"paragraph","text":"Before you work independently with children at ASO, you must complete every stage of this programme. It covers your role, safeguarding, health and safety, session procedures, qualifications, and more."},
      {"id":"9","order":9,"type":"numbered_list","items":["Complete all learning modules","Pass knowledge checks","Upload required documents and certificates","Sign your declarations","Receive and accept your school placement"]},
      {"id":"10","order":10,"type":"callout","variant":"important","title":"Two documents govern your work","text":"Your work at ASO is governed by two documents: the Coach Work Handbook and the Operations Manual. This onboarding is built from both. Read them fully and keep them accessible throughout your time with us."},
      {"id":"11","order":11,"type":"heading","level":2,"text":"Your First Point of Contact"},
      {"id":"12","order":12,"type":"paragraph","text":"Your Area Lead is your first point of contact for any question or concern. If something is not covered in your onboarding, ask your Area Lead before making a decision. Never guess when it comes to safety or safeguarding."},
      {"id":"13","order":13,"type":"acknowledgement","prompt":"I have read and understood the introduction to Active School Org. I know who to contact if I have any questions during my onboarding."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Welcome to Active School Org' AND s.title = 'Welcome to Active School'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 2: Personal Profile Review
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Personal Profile Review' LIMIT 1),
  'Your Personal Information',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Your Personal Information"},
      {"id":"2","order":2,"type":"paragraph","text":"ASO holds personal data about every member of staff. It is important that this information is accurate and up to date at all times — including your contact details, address, and personal profile."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Why This Matters"},
      {"id":"4","order":4,"type":"bullet_list","items":["We need accurate details to contact you about sessions","Your address is required for payroll and employment records","Out-of-date information can cause delays in pay, cover, and communications"]},
      {"id":"5","order":5,"type":"callout","variant":"info","title":"GDPR","text":"All personal data is held securely in line with GDPR. It is only used for operational purposes and is never shared externally without your consent."},
      {"id":"6","order":6,"type":"heading","level":2,"text":"What to Check"},
      {"id":"7","order":7,"type":"bullet_list","items":["Your full legal name (as it appears on official documents)","Your current home address","Your primary mobile number","Your personal email address","Your role at ASO"]},
      {"id":"8","order":8,"type":"paragraph","text":"If any of this information changes during your time with ASO, it is your responsibility to update it promptly. Contact your Area Lead or Naima directly."},
      {"id":"9","order":9,"type":"acknowledgement","prompt":"I have reviewed my personal profile and confirm that my name, address, contact number, and email address are correct and up to date."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Your Personal Information' AND s.title = 'Personal Profile Review'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 3: Emergency Contact and Medical Information
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Emergency Contact and Medical Information' LIMIT 1),
  'Emergency Contacts and Medical Information',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Emergency Contacts and Medical Information"},
      {"id":"2","order":2,"type":"paragraph","text":"ASO must hold emergency contact details for every member of staff. In the event of an incident at a session, we need to be able to reach someone who can support you immediately."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"What We Need From You"},
      {"id":"4","order":4,"type":"bullet_list","items":["Name and relationship of your primary emergency contact","Primary mobile number for your emergency contact","A secondary contact where possible"]},
      {"id":"5","order":5,"type":"heading","level":2,"text":"Medical Information"},
      {"id":"6","order":6,"type":"paragraph","text":"If you have any medical conditions, allergies, or health needs that could affect your ability to work safely, you must disclose these to ASO. This information is held confidentially and is only used to ensure your safety and the safety of the children you work with."},
      {"id":"7","order":7,"type":"bullet_list","items":["Conditions that may affect your physical ability during sessions","Allergies — including any epi-pen requirements","Any condition that may affect your response in an emergency"]},
      {"id":"8","order":8,"type":"callout","variant":"warning","title":"Update us if things change","text":"If your emergency contact details or medical information changes at any point during your employment, you must inform your Area Lead straight away. Keeping this current is your responsibility."},
      {"id":"9","order":9,"type":"acknowledgement","prompt":"I confirm that I have provided accurate emergency contact details and declared any relevant medical information. I understand I must inform my Area Lead promptly if this information changes."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Emergency Contacts and Medical Information' AND s.title = 'Emergency Contact and Medical Information'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 4: Role, Responsibilities and Reporting Structure
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'Your Role and the ASO Structure',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Your Role at Active School Org"},
      {"id":"2","order":2,"type":"paragraph","text":"There are four coaching roles at ASO. Every coach starts somewhere and can progress through the pathway. Your role determines your responsibilities in each session and your line of reporting."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"The Four Coach Roles"},
      {"id":"4","order":4,"type":"heading","level":3,"text":"Junior Coach"},
      {"id":"5","order":5,"type":"paragraph","text":"Junior Coaches attend sessions to observe, assist, and learn under direct supervision. They do not lead sessions or make operational decisions independently. They are building towards the Assistant Coach role via the UKAG Level 0 pathway."},
      {"id":"6","order":6,"type":"heading","level":3,"text":"Assistant Coach"},
      {"id":"7","order":7,"type":"paragraph","text":"Assistant Coaches support the Lead Coach in delivering sessions. They can run warm-up activities and manage stations under direction. They are not responsible for the register, medical protocol, safeguarding decisions, or dismissal."},
      {"id":"8","order":8,"type":"heading","level":3,"text":"Lead Coach"},
      {"id":"9","order":9,"type":"paragraph","text":"Lead Coaches carry full on-site responsibility for the session. They manage registers, medical checks, safeguarding decisions, and dismissal. A Lead Coach must hold all required qualifications before working independently. They report to their Area Lead."},
      {"id":"10","order":10,"type":"heading","level":3,"text":"Area Lead"},
      {"id":"11","order":11,"type":"paragraph","text":"Area Leads manage a group of schools and coaches in a defined region. They are the Deputy Designated Safeguarding Lead (DSL) for their area. They support and observe Lead Coaches, handle cover and absence, and are the first escalation point for all operational issues."},
      {"id":"12","order":12,"type":"heading","level":2,"text":"The Reporting Structure"},
      {"id":"13","order":13,"type":"paragraph","text":"ASO operates a clear reporting structure. Issues should be resolved at the lowest appropriate level before moving up the chain."},
      {"id":"14","order":14,"type":"numbered_list","items":["You — your first responsibility is your own session","Your Lead Coach — first point of contact for questions and concerns","Your Area Lead — first escalation for anything your Lead Coach cannot resolve","Operations Director (Naima) — final escalation only"]},
      {"id":"15","order":15,"type":"callout","variant":"important","title":"Never skip the chain","text":"Always follow the escalation chain. Do not contact Naima directly unless your Area Lead is unavailable and the matter is urgent. Your Area Lead is there to support you — use them."},
      {"id":"16","order":16,"type":"heading","level":2,"text":"What Every Role Has in Common"},
      {"id":"17","order":17,"type":"bullet_list","items":["Arriving on time, in uniform, and prepared","Following all protocols without cutting corners","Raising concerns early — never waiting until something becomes a problem","Communicating honestly and quickly when things go wrong"]},
      {"id":"18","order":18,"type":"acknowledgement","prompt":"I understand my role at Active School Org, who I report to, and how to escalate issues through the correct chain."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Your Role and the ASO Structure' AND s.title = 'Role, Responsibilities and Reporting Structure'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Role, Responsibilities and Reporting Structure' LIMIT 1),
  'Role and Responsibilities Quiz',
  'quiz', 2,
  80, 5, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Role and Responsibilities Quiz' AND s.title = 'Role, Responsibilities and Reporting Structure'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 5: Proof of Identity and Right to Work
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Proof of Identity and Right to Work' LIMIT 1),
  'Identity and Right to Work',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Proof of Identity and Right to Work"},
      {"id":"2","order":2,"type":"paragraph","text":"Before you begin working at ASO, we are legally required to verify your identity and your right to work in the UK. This is a mandatory step that applies to every member of staff without exception."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Photo ID"},
      {"id":"4","order":4,"type":"paragraph","text":"You must provide one of the following as proof of identity:"},
      {"id":"5","order":5,"type":"bullet_list","items":["Current valid passport (any nationality)","Current UK photocard driving licence"]},
      {"id":"6","order":6,"type":"heading","level":2,"text":"Right to Work"},
      {"id":"7","order":7,"type":"paragraph","text":"You must also provide documentation confirming your right to work in the United Kingdom. Acceptable documents include:"},
      {"id":"8","order":8,"type":"bullet_list","items":["UK or Irish passport","Biometric Residence Permit (BRP)","Share code from the Home Office online checking service","Other documents as listed in the Home Office Right to Work guidance"]},
      {"id":"9","order":9,"type":"callout","variant":"warning","title":"No work without verification","text":"You cannot work with children at ASO until your identity and right to work have been verified and confirmed by Naima. This is a legal requirement, not an administrative formality."},
      {"id":"10","order":10,"type":"paragraph","text":"Upload clear, legible copies using the tasks below. Documents must be in date. Blurry or cropped uploads will be rejected."},
      {"id":"11","order":11,"type":"acknowledgement","prompt":"I understand that I must provide verified proof of identity and right to work before I can begin working with ASO."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Identity and Right to Work' AND s.title = 'Proof of Identity and Right to Work'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Proof of Identity and Right to Work' LIMIT 1),
  'Photo ID Upload',
  'upload', 2,
  'photo_id', 'Photo ID (passport or driving licence)',
  false, false, false, false, true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Photo ID Upload' AND s.title = 'Proof of Identity and Right to Work'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Proof of Identity and Right to Work' LIMIT 1),
  'Right to Work Document',
  'upload', 3,
  'right_to_work', 'Right to Work document',
  false, false, false, false, true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Right to Work Document' AND s.title = 'Proof of Identity and Right to Work'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 6: Safeguarding Training
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Safeguarding Training' LIMIT 1),
  'Safeguarding — Your Responsibilities',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Safeguarding — Your Responsibilities"},
      {"id":"2","order":2,"type":"paragraph","text":"Safeguarding is the most important aspect of your role at ASO. Every single session, every decision you make, must be made with the safety and welfare of children at the forefront. This section covers the basics you must know before you step into any school."},
      {"id":"3","order":3,"type":"callout","variant":"important","title":"Non-negotiable","text":"Safeguarding responsibilities do not reduce based on staffing levels, session size, or circumstances. They apply at all times, without exception."},
      {"id":"4","order":4,"type":"heading","level":2,"text":"The Basics — Always"},
      {"id":"5","order":5,"type":"bullet_list","items":["Never be alone with a child in a closed or isolated space","Never take photos of children without explicit permission from ASO management","Never contact children or their families via personal social media or messaging accounts","Always work in sight or hearing of another adult","Never make promises of confidentiality to a child"]},
      {"id":"6","order":6,"type":"heading","level":2,"text":"If a Child Says Something That Worries You"},
      {"id":"7","order":7,"type":"paragraph","text":"A child may say something during a session that causes you concern — about their home life, their safety, or something happening to them. This is called a disclosure, and how you respond in the first moments matters enormously."},
      {"id":"8","order":8,"type":"numbered_list","items":["Stay calm — do not overreact or show alarm","Listen carefully and let them speak without interrupting","Do not ask leading questions — let them tell you in their own words","Do not promise confidentiality — you cannot keep this promise","As soon as the session ends, write down exactly what was said — word for word","Report it to your Lead Coach or Area Lead immediately after the session","Complete the Safeguarding Concern Form the same day"]},
      {"id":"9","order":9,"type":"callout","variant":"warning","title":"Do not delay","text":"If a child makes a disclosure, do not wait until the next day, the next session, or until you feel ready. Report it to your Lead Coach or Area Lead immediately after the session ends. The Area Lead will escalate to the Designated Safeguarding Lead (DSL)."},
      {"id":"10","order":10,"type":"heading","level":2,"text":"The Safeguarding Escalation Chain"},
      {"id":"11","order":11,"type":"numbered_list","items":["You — identify the concern and report it immediately after the session","Your Lead Coach — first report recipient (if you are not the Lead Coach)","Your Area Lead — escalates to the DSL; holds Deputy DSL responsibility for their area","Designated Safeguarding Lead (Naima) — escalates to external agencies where required"]},
      {"id":"12","order":12,"type":"heading","level":2,"text":"When Lone Working"},
      {"id":"13","order":13,"type":"paragraph","text":"Being the only adult in a session does not change your safeguarding responsibilities. If you need to address an individual concern, ensure the rest of the group is visible and in a safe, supervised position. If a child needs to leave the hall (for example, to use the toilet), follow the school's procedure — do not leave the group unattended."},
      {"id":"14","order":14,"type":"heading","level":2,"text":"Additional Needs and Safeguarding"},
      {"id":"15","order":15,"type":"paragraph","text":"Children with additional needs may disclose information or display behaviours that require safeguarding attention. Never assume that a behaviour is simply attention-seeking or need-related without considering whether there is an underlying safeguarding concern. When in doubt, report it."},
      {"id":"16","order":16,"type":"scenario","title":"Practice scenario","context":"During a session, a 7-year-old says to you: \"I don't like going home at the moment.\" When you gently acknowledge this, they add: \"Daddy gets angry sometimes and it scares me.\" The session still has 20 minutes to run.","question":"What do you do during the session, and what steps do you take after it ends?"},
      {"id":"17","order":17,"type":"acknowledgement","prompt":"I have read and understood my safeguarding responsibilities at ASO. I know the correct escalation chain and what to do if a child makes a disclosure."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Safeguarding — Your Responsibilities' AND s.title = 'Safeguarding Training'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Safeguarding Training' LIMIT 1),
  'Safeguarding Knowledge Check',
  'quiz', 2,
  80, 8, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Safeguarding Knowledge Check' AND s.title = 'Safeguarding Training'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_completion_date, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Safeguarding Training' LIMIT 1),
  'Safeguarding Certificate Upload',
  'upload', 3,
  'safeguarding_certificate', 'Safeguarding in Sport Certificate (minimum Level 1)',
  true, true, true, false, true, true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Safeguarding Certificate Upload' AND s.title = 'Safeguarding Training'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 7: DBS Information and Upload
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'DBS Information and Upload' LIMIT 1),
  'DBS Requirements',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"DBS Requirements"},
      {"id":"2","order":2,"type":"paragraph","text":"All staff at ASO must hold an Enhanced Disclosure and Barring Service (DBS) certificate, including the children's barred list check, before working independently with children. This is a legal safeguarding requirement and there are no exceptions."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"What Is Required"},
      {"id":"4","order":4,"type":"bullet_list","items":["Enhanced DBS certificate — not a basic or standard check","Children's barred list check must be included","No member of staff may work independently with children without a confirmed valid DBS"]},
      {"id":"5","order":5,"type":"heading","level":2,"text":"Renewal"},
      {"id":"6","order":6,"type":"bullet_list","items":["DBS certificates are renewed every three years","Alternatively, you may maintain your certificate via the DBS Update Service, which allows continuous checking","If you use the Update Service, please inform Naima so your record can be verified online"]},
      {"id":"7","order":7,"type":"heading","level":2,"text":"DBS From a Previous Organisation"},
      {"id":"8","order":8,"type":"paragraph","text":"If you hold a valid Enhanced DBS certificate from a previous employer or organisation, it may be accepted. You must confirm this with Naima before starting. Certificates that were not issued on the Update Service and are more than three years old will not be accepted."},
      {"id":"9","order":9,"type":"callout","variant":"important","title":"No DBS, no sessions","text":"You cannot work with children at ASO until your DBS has been confirmed. Do not attend sessions or work with children until Naima has confirmed your DBS is in order."},
      {"id":"10","order":10,"type":"acknowledgement","prompt":"I understand the DBS requirements for my role and that I cannot work independently with children until my DBS has been verified by Naima."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'DBS Requirements' AND s.title = 'DBS Information and Upload'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'DBS Information and Upload' LIMIT 1),
  'DBS Certificate Upload',
  'upload', 2,
  'dbs', 'Enhanced DBS Certificate (including children''s barred list check)',
  false, true, false, true, true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'DBS Certificate Upload' AND s.title = 'DBS Information and Upload'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 8: First Aid and Qualification Uploads
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'First Aid and Qualification Uploads' LIMIT 1),
  'First Aid and UKAG Qualifications',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"First Aid and UKAG Qualifications"},
      {"id":"2","order":2,"type":"paragraph","text":"Depending on your role, you are required to hold specific first aid and coaching qualifications. These must be in place before you take on independent session responsibilities."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"First Aid — Lead Coaches"},
      {"id":"4","order":4,"type":"paragraph","text":"Every Lead Coach must hold a valid first aid certificate. Either of the following is acceptable:"},
      {"id":"5","order":5,"type":"bullet_list","items":["Paediatric First Aid (PFA) certificate — recommended for working with children aged 4–11","First Aid at Work (FAW) certificate — also accepted","Certificate must be current and in date — expired certificates are not valid"]},
      {"id":"6","order":6,"type":"callout","variant":"warning","title":"Lead Coaches only","text":"The first aid requirement applies to Lead Coaches. Junior and Assistant Coaches are not required to hold a first aid certificate — but ASO funds UKAG training for eligible coaches who wish to progress to Lead Coach."},
      {"id":"7","order":7,"type":"heading","level":2,"text":"UKAG Coaching Qualifications"},
      {"id":"8","order":8,"type":"paragraph","text":"The UKAG awards pathway provides ASO coaches with a structured route to becoming qualified gymnastics and multi-sport coaches:"},
      {"id":"9","order":9,"type":"bullet_list","items":["UKAG Level 0 — Junior Coach (shadow/observation role)","UKAG Level 1 — Assistant Coach","UKAG Level 2 — Lead Coach (required before leading sessions independently)"]},
      {"id":"10","order":10,"type":"paragraph","text":"ASO funds UKAG Level 0, 1, and 2 training for eligible coaches. To qualify for funded training, you must complete your onboarding, work a minimum of one full term, remain on the active rota, and attend required shadow and CPD sessions."},
      {"id":"11","order":11,"type":"heading","level":2,"text":"Uploading Your Certificates"},
      {"id":"12","order":12,"type":"paragraph","text":"Upload clear, legible copies of your certificates below. If your qualification is in progress, upload a confirmation letter or interim certificate from the awarding body. Contact your Area Lead if you are unsure what to upload."},
      {"id":"13","order":13,"type":"acknowledgement","prompt":"I understand the first aid and qualification requirements for my role and that ASO funds UKAG training for eligible coaches."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'First Aid and UKAG Qualifications' AND s.title = 'First Aid and Qualification Uploads'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_completion_date, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'First Aid and Qualification Uploads' LIMIT 1),
  'First Aid Certificate Upload',
  'upload', 2,
  'first_aid', 'Paediatric First Aid or First Aid at Work Certificate',
  true, true, true, false, true, true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'First Aid Certificate Upload' AND s.title = 'First Aid and Qualification Uploads'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   required_doc_category, required_doc_label,
   requires_expiry_date, requires_issue_date, requires_provider,
   requires_cert_number, requires_completion_date, requires_approval, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'First Aid and Qualification Uploads' LIMIT 1),
  'UKAG Qualification Certificate Upload',
  'upload', 3,
  'ukag_qualification', 'UKAG Coaching Qualification Certificate',
  false, true, true, false, true, true, false, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'UKAG Qualification Certificate Upload' AND s.title = 'First Aid and Qualification Uploads'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 9: Staff Handbook
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Staff Handbook' LIMIT 1),
  'The ASO Staff Handbook',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"The ASO Staff Handbook"},
      {"id":"2","order":2,"type":"paragraph","text":"This section covers the core expectations, conduct standards, and policies that apply to every person working at ASO. Read it fully — these are not optional guidelines, they are the standards we hold each other to."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Uniform and Appearance"},
      {"id":"4","order":4,"type":"paragraph","text":"You represent Active School Org at every session. First impressions matter to schools and parents."},
      {"id":"5","order":5,"type":"bullet_list","items":["ASO branded t-shirt or hoodie (issued at induction)","Plain black or navy sports bottoms — leggings, joggers, or shorts","Trainers with good grip — no flat-soled shoes or boots","Hair tied back","No dangly jewellery, loose rings, or long necklaces"]},
      {"id":"6","order":6,"type":"callout","variant":"info","title":"Damaged or lost uniform","text":"If your uniform is damaged or lost, report it to your Area Lead immediately. Do not turn up out of uniform without flagging it first. Non-branded hoodies and casual clothing are not acceptable during sessions."},
      {"id":"7","order":7,"type":"heading","level":2,"text":"Conduct and Expectations"},
      {"id":"8","order":8,"type":"paragraph","text":"What ASO expects from you at every session:"},
      {"id":"9","order":9,"type":"bullet_list","items":["Arrive on time, in uniform, and prepared","Be enthusiastic, positive, and professional at every session","Follow all protocols in this handbook without cutting corners","Raise concerns early — do not wait until something becomes a problem","Communicate honestly and quickly when things go wrong"]},
      {"id":"10","order":10,"type":"paragraph","text":"The following are not acceptable under any circumstances:"},
      {"id":"11","order":11,"type":"bullet_list","items":["Lateness without communication","Using your phone during sessions (except for the register or in an emergency)","Unprofessional behaviour in front of children, parents, or school staff","Ignoring messages from your Lead Coach or Area Lead","Sharing session content or children's information without permission"]},
      {"id":"12","order":12,"type":"heading","level":2,"text":"If Standards Are Not Met"},
      {"id":"13","order":13,"type":"numbered_list","items":["Informal conversation with your Lead Coach","Written feedback from the Area Lead","Formal warning from the Operations Director","Removal from the rota"]},
      {"id":"14","order":14,"type":"heading","level":2,"text":"Absence and Cover"},
      {"id":"15","order":15,"type":"paragraph","text":"If you are unable to attend a session, you must contact your Lead Coach by phone call or voice note — not text — before 9:00am on the day of the session."},
      {"id":"16","order":16,"type":"bullet_list","items":["One unplanned absence per term is understandable — life happens","Two or more unplanned absences in a term will trigger a review with your Area Lead","Three or more may result in removal from the rota","Planned absences must be given with a minimum of 7 days notice in writing to your Lead Coach and Area Lead"]},
      {"id":"17","order":17,"type":"heading","level":2,"text":"Timesheet and Pay"},
      {"id":"18","order":18,"type":"paragraph","text":"All coaches must log their hours accurately on their timesheet each month. Timesheets must be submitted to your Area Lead by the 5th of the month, with payment on the 15th."},
      {"id":"19","order":19,"type":"bullet_list","items":["Include: your full name, school name, date, session type, your role, and total sessions worked","Pay queries: email accounts@activeschool.org.uk with your timesheet attached","Do not raise pay queries via WhatsApp"]},
      {"id":"20","order":20,"type":"heading","level":2,"text":"Your Development"},
      {"id":"21","order":21,"type":"paragraph","text":"ASO is built on developing young coaches. Termly reviews are conducted by your Area Lead — these are not disciplinary, they are designed to support your growth and identify your next steps. If you want to progress through the UKAG pathway, tell your Area Lead."},
      {"id":"22","order":22,"type":"acknowledgement","prompt":"I have read and understood the ASO Staff Handbook. I agree to work in line with all conduct standards, absence policies, and expectations set out above."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'The ASO Staff Handbook' AND s.title = 'Staff Handbook'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Staff Handbook' LIMIT 1),
  'Handbook Knowledge Check',
  'quiz', 2,
  80, 6, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Handbook Knowledge Check' AND s.title = 'Staff Handbook'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 10: Standard Operating Procedures
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Standard Operating Procedures' LIMIT 1),
  'Session Procedures',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Standard Operating Procedures"},
      {"id":"2","order":2,"type":"paragraph","text":"Every ASO session follows the same format regardless of location, coach, or school. Consistency is what makes us reliable to schools and parents. These procedures are mandatory — they are not suggestions."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Arrival and Set-Up"},
      {"id":"4","order":4,"type":"numbered_list","items":["Sign in at school reception — bring your ID lanyard","Follow the school's visitor procedure (some schools require an escort)","Go directly to the hall — do not enter classrooms or corridors without permission","Check the space: floor surface, equipment condition, exit routes, and toilet access","Complete the Daily Risk Assessment (paper or digital form)","Set up equipment according to that week's station rotation","Be ready and positioned at the hall entrance when children arrive"]},
      {"id":"5","order":5,"type":"heading","level":2,"text":"Register and Attendance"},
      {"id":"6","order":6,"type":"bullet_list","items":["Open the register at the start of every session","Mark every child present or absent by name","Note any late arrivals and the exact time they arrived","Note any early collections and who collected the child","Submit the register to your Area Lead or Naima within 24 hours of the session"]},
      {"id":"7","order":7,"type":"callout","variant":"important","title":"Child not on the register?","text":"Do not turn them away. Contact your Area Lead immediately. Record their name, time of arrival, and who brought them. Do not allow participation until confirmed by your Area Lead."},
      {"id":"8","order":8,"type":"heading","level":2,"text":"Dismissal"},
      {"id":"9","order":9,"type":"paragraph","text":"Dismissal is one of the highest-risk moments of the session. Follow this procedure exactly every time."},
      {"id":"10","order":10,"type":"numbered_list","items":["Line children up inside the hall — do not open the door until a parent or guardian is visible outside","Call each child's name individually","Only release a child to a named adult on their contact list — no name, no go","If you do not recognise the adult, ask for their name and check against the register","If someone is collecting who is not on the list — call your Area Lead before releasing the child","Record any late collections in the register with the exact time"]},
      {"id":"11","order":11,"type":"heading","level":2,"text":"Late Collection Protocol"},
      {"id":"12","order":12,"type":"paragraph","text":"If a child has not been collected 15 minutes after the session ends:"},
      {"id":"13","order":13,"type":"numbered_list","items":["Stay with the child — do not leave them alone under any circumstances","Check the register for the parent's emergency contact number","Call the parent or guardian directly","If no answer, call the secondary contact immediately","If still no answer — call your Area Lead straight away","Do not take the child off the premises under any circumstances","Do not hand the child to anyone not on their contact list","Log the full incident on the Incident Report Form the same day"]},
      {"id":"14","order":14,"type":"heading","level":2,"text":"Alternative Collection Arrangements"},
      {"id":"15","order":15,"type":"paragraph","text":"Before dismissal, check the register for any pre-agreed alternative collection arrangements. If no written confirmation exists, the arrangement cannot proceed. If an unconfirmed adult arrives, stay calm, explain you need to verify, and call your Area Lead immediately. Log any unconfirmed collection attempts on the Incident Report Form the same day."},
      {"id":"16","order":16,"type":"scenario","title":"Practice scenario","context":"The session ends at 4:00pm. By 4:15pm, one child has not been collected. There is no answer on the parent's primary mobile. The child is upset and says their aunt is probably coming instead, but no alternative collection arrangement is on the register.","question":"Walk through the exact steps you take from 4:15pm onwards."},
      {"id":"17","order":17,"type":"acknowledgement","prompt":"I have read and understood the arrival, register, dismissal, and late collection procedures. I know what to do if a child is not on the register or is not collected on time."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Session Procedures' AND s.title = 'Standard Operating Procedures'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Standard Operating Procedures' LIMIT 1),
  'SOP Knowledge Check',
  'quiz', 2,
  80, 6, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'SOP Knowledge Check' AND s.title = 'Standard Operating Procedures'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 11: Health, Safety and Risk Management
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Health, Safety and Risk Management' LIMIT 1),
  'Health, Safety and Medical Protocols',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Health, Safety and Medical Protocols"},
      {"id":"2","order":2,"type":"paragraph","text":"Managing health and safety at every session is a core part of the Lead Coach role. This section covers the daily risk assessment, medical bag protocol, allergy management, and how to handle a medical emergency."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Before Every Session — Medical Check"},
      {"id":"4","order":4,"type":"paragraph","text":"Before any child enters the hall, the Lead Coach must:"},
      {"id":"5","order":5,"type":"numbered_list","items":["Open the session register and check for any children with allergies or medical needs","Locate the medical bag — confirm it is present, accessible, and fully stocked","Check that any epi-pens or medication belonging to children are courtside and within reach","If a child has a severe allergy and their medication is not present — contact the parent immediately. Do not start the session.","Do not start the session until all medical needs are accounted for"]},
      {"id":"6","order":6,"type":"heading","level":2,"text":"The Medical Bag"},
      {"id":"7","order":7,"type":"callout","variant":"important","title":"Medical bag must be courtside at all times","text":"The medical bag must never be locked away, left in a kit bag, or kept in another room during a session. It must remain courtside and within reach throughout. At the end of every session, the Lead Coach takes it with them — it does not stay at the school."},
      {"id":"8","order":8,"type":"heading","level":2,"text":"Snack Protocol"},
      {"id":"9","order":9,"type":"paragraph","text":"Children are allowed a small snack before the session begins. Before making any decision about snacks, check the register for known allergies. Never assume you know a child's allergies from memory — always check. Do not allow snacks in the hall once the session is underway."},
      {"id":"10","order":10,"type":"heading","level":2,"text":"Medical Emergency — Epi-Pen"},
      {"id":"11","order":11,"type":"callout","variant":"important","title":"Epi-pen emergency — act immediately","text":"If a child needs their epi-pen during a session: use it immediately, then call 999. Do not delay to call anyone first. After calling 999, notify the Area Lead and the parent without delay. Record the incident on the Incident Report Form the same day."},
      {"id":"12","order":12,"type":"heading","level":2,"text":"End of Session — Medical Check Out"},
      {"id":"13","order":13,"type":"bullet_list","items":["Return any epi-pens or medication directly to the parent or guardian — do not leave medication with the child alone","Confirm the medical bag has been checked and repacked correctly","The medical bag leaves with you — it does not stay at the school"]},
      {"id":"14","order":14,"type":"heading","level":2,"text":"Common Mistakes to Avoid"},
      {"id":"15","order":15,"type":"bullet_list","items":["Assuming you know a child's allergies from memory — always check the register","Leaving the medical bag in a kit bag or cupboard during the session","Allowing snacks in the hall because it was fine last week","Letting children or parents manage their own epi-pens without coach awareness","Forgetting to return medication to the parent at the end of the session","Not recording a medical incident because it seemed minor"]},
      {"id":"16","order":16,"type":"heading","level":2,"text":"Daily Risk Assessment"},
      {"id":"17","order":17,"type":"paragraph","text":"Every session requires a Daily Risk Assessment before children arrive. Check the space: floor surface (wet/slippery?), equipment condition (any damage?), exit routes (clear and unlocked?), and toilet access. If you identify a hazard you cannot resolve, contact your Area Lead before starting the session."},
      {"id":"18","order":18,"type":"acknowledgement","prompt":"I have read and understood the health, safety, and medical protocols. I know what to do in a medical emergency and how to complete the pre-session medical check."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Health, Safety and Medical Protocols' AND s.title = 'Health, Safety and Risk Management'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Health, Safety and Risk Management' LIMIT 1),
  'Health and Safety Quiz',
  'quiz', 2,
  80, 6, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Health and Safety Quiz' AND s.title = 'Health, Safety and Risk Management'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 12: Role Specific Training
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Role Specific Training' LIMIT 1),
  'Lead Coach Requirements and Lone Working',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Lead Coach Requirements and Lone Working"},
      {"id":"2","order":2,"type":"paragraph","text":"This section covers the specific requirements for Lead Coaches and how to manage sessions when staffing is reduced. Even as a Junior or Assistant Coach, understanding these requirements is important — it tells you what you are working towards and what is expected around you."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"Lead Coach — Mandatory Training"},
      {"id":"4","order":4,"type":"paragraph","text":"A Lead Coach must hold all of the following before leading a session independently:"},
      {"id":"5","order":5,"type":"bullet_list","items":["Enhanced DBS certificate including the children's barred list check","Paediatric First Aid (PFA) or First Aid at Work (FAW) certificate — both are acceptable. Certificate must be current and in date.","Safeguarding in Sport — minimum Level 1. Must be renewed annually in line with KCSIE.","UKAG Level 2 Lead Coach qualification","Completed shadow session, signed off by their Area Lead"]},
      {"id":"6","order":6,"type":"heading","level":2,"text":"Area Lead — Additional Requirements"},
      {"id":"7","order":7,"type":"bullet_list","items":["Level 2 Safeguarding Certificate — required for the Deputy DSL function. Must be obtained before or as soon as possible after taking on the role.","Annual safeguarding refresher in line with KCSIE","If the Area Lead also delivers sessions — all Lead Coach training requirements also apply"]},
      {"id":"8","order":8,"type":"heading","level":2,"text":"Lone Working"},
      {"id":"9","order":9,"type":"paragraph","text":"There will be times when staffing is reduced due to absence or availability — particularly at the start of a new term. Lone working is planned for and permitted in certain circumstances. It is not a failure — it is something we prepare for."},
      {"id":"10","order":10,"type":"callout","variant":"warning","title":"One-off exception only","text":"A session may run with minimum staffing (one coach) as a one-off when cover cannot be found in time. This is acceptable as an exception — not a regular operating model. If a school is regularly running minimum staffing, escalate to Naima — it is a resourcing issue."},
      {"id":"11","order":11,"type":"heading","level":2,"text":"If You Are Lone Working"},
      {"id":"12","order":12,"type":"bullet_list","items":["Your safeguarding responsibilities remain exactly the same — no rules change","Never be alone with a single child in a closed or isolated space","If a child needs to leave the hall, follow the school's procedure — do not leave the group unattended","Log any lone working session in your end-of-week update to your Area Lead","Contact your Area Lead if you feel the session cannot be run safely with current staffing"]},
      {"id":"13","order":13,"type":"heading","level":2,"text":"Managing a Busy Session"},
      {"id":"14","order":14,"type":"bullet_list","items":["Use group challenges and whole-class activities rather than individual coaching","Rotate stations rather than running queues — keep everyone moving","Keep instructions short and repeat them clearly","Praise effort and behaviour, not just skill — this keeps the energy positive","Build in short water breaks to reset the group's focus","Use children's names — it builds connection and keeps attention"]},
      {"id":"15","order":15,"type":"callout","variant":"tip","title":"What a good session looks like","text":"A good session is not always a perfect session. Children are safe. Children are engaged. Children leave happy. You leave knowing you did your best. Not every session needs to be flawless — especially in the first weeks of a new term."},
      {"id":"16","order":16,"type":"acknowledgement","prompt":"I understand the training requirements for Lead Coaches, the rules around lone working, and what to do if a session becomes busier than expected."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Lead Coach Requirements and Lone Working' AND s.title = 'Role Specific Training'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Role Specific Training' LIMIT 1),
  'Role-Specific Knowledge Check',
  'quiz', 2,
  80, 5, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Role-Specific Knowledge Check' AND s.title = 'Role Specific Training'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 13: School Conduct and Professional Communication
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'School Conduct and Professional Communication' LIMIT 1),
  'Professional Communication Standards',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Professional Communication Standards"},
      {"id":"2","order":2,"type":"paragraph","text":"How you communicate with children, parents, school staff, and colleagues reflects on you and on ASO. These standards are not about being formal — they are about being trustworthy, professional, and clear."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"With Children"},
      {"id":"4","order":4,"type":"bullet_list","items":["Use first names, stay positive, and be patient","Never raise your voice in anger","Never use physical contact to manage a child's behaviour — use your voice and positioning","Never communicate with children via personal social media or messaging apps"]},
      {"id":"5","order":5,"type":"heading","level":2,"text":"With Parents"},
      {"id":"6","order":6,"type":"bullet_list","items":["Be polite, professional, and brief","Do not discuss other children with a parent","Do not make promises about refunds, bookings, or complaints","Refer anything beyond a quick question to your Lead Coach or Naima"]},
      {"id":"7","order":7,"type":"callout","variant":"warning","title":"No promises at the gate","text":"Parents may approach you at collection with complaints, refund requests, or questions about bookings. You are not in a position to action these — do not make any commitments. Take a note, be polite, and refer them to Naima."},
      {"id":"8","order":8,"type":"heading","level":2,"text":"With Schools"},
      {"id":"9","order":9,"type":"bullet_list","items":["Always sign in at reception — you are a visitor in the school","Be respectful of the school environment — you are a guest","If a teacher raises a concern, listen, thank them, and report it to your Area Lead the same day","Do not make commitments on behalf of ASO to school staff"]},
      {"id":"10","order":10,"type":"heading","level":2,"text":"On WhatsApp"},
      {"id":"11","order":11,"type":"bullet_list","items":["The staff WhatsApp group is for work communication only","Respond to messages relevant to you within a reasonable time","Do not share session information, photos, or children's details in personal chats","Area Leads are empowered to make announcements and share updates on the group chat"]},
      {"id":"12","order":12,"type":"heading","level":2,"text":"Social Media and Personal Accounts"},
      {"id":"13","order":13,"type":"paragraph","text":"You must never contact children, parents, or their families via your personal social media accounts, messaging apps, or any other personal channel. All communication with families goes through ASO's official channels only. Photos taken during sessions must not be shared via personal accounts under any circumstances."},
      {"id":"14","order":14,"type":"scenario","title":"Practice scenario","context":"After a session, a parent approaches you and says their child has been upset because another child at the club has been unkind to them. They want to know the other child's name so they can speak to that child's parent directly.","question":"How do you respond, and what do you do next?"},
      {"id":"15","order":15,"type":"acknowledgement","prompt":"I have read and understood the professional communication standards for children, parents, schools, and WhatsApp. I understand I must never contact children or families via personal channels."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Professional Communication Standards' AND s.title = 'School Conduct and Professional Communication'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'School Conduct and Professional Communication' LIMIT 1),
  'Communication Standards Quiz',
  'quiz', 2,
  80, 5, 3, 300, true,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Communication Standards Quiz' AND s.title = 'School Conduct and Professional Communication'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 14: Final Knowledge Assessment
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   pass_threshold_pct, questions_per_attempt, max_attempts, retry_delay_seconds, show_correct_answers,
   is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Final Knowledge Assessment' LIMIT 1),
  'Final Knowledge Assessment',
  'quiz', 1,
  80, 10, 3, 600, false,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Final Knowledge Assessment' AND s.title = 'Final Knowledge Assessment'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 15: Declarations and Contract Signing
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   declaration_text, requires_typed_name, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Declarations and Contract Signing' LIMIT 1),
  'Coach Work Handbook Declaration',
  'declaration', 1,
  'By signing below, I confirm that:

• I have received and read the ASO Coach Work Handbook in full
• I agree to work in line with all policies, procedures, and standards contained within it
• I understand my role, my responsibilities, and the escalation chain above me
• I understand this handbook works in partnership with the Operations Manual
• I will ask my Lead Coach or Area Lead if I am ever unsure about anything
• I understand that this handbook is a living document and will be updated — I will be notified of any significant changes

I understand that failure to follow the policies and standards in this handbook may result in disciplinary action up to and including removal from the rota.',
  true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Coach Work Handbook Declaration' AND s.title = 'Declarations and Contract Signing'
);

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order,
   declaration_text, requires_typed_name, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Declarations and Contract Signing' LIMIT 1),
  'Operations Manual Declaration',
  'declaration', 2,
  'By signing below, I confirm that:

• I have read and understood the ASO Operations Manual in full
• I agree to abide by all policies, procedures, and standards contained within it
• I understand my role, my responsibilities, and the escalation chain above me
• I understand that this document works in partnership with the Coach Work Handbook
• I will ask my Area Lead or Naima if I am ever unsure about anything
• I understand that this manual is a living document and will be updated — I will be notified of any significant changes

I understand that both the Operations Manual and the Coach Work Handbook are legally referenced documents that form part of my working agreement with Active School Org.',
  true, true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Operations Manual Declaration' AND s.title = 'Declarations and Contract Signing'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- STAGE 16: Coach Placement Offer and Acceptance
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO onboarding_tasks
  (stage_id, title, type, display_order, content_json, is_mandatory, version)
SELECT
  (SELECT id FROM onboarding_stages WHERE title = 'Coach Placement Offer and Acceptance' LIMIT 1),
  'Your School Placement',
  'content', 1,
  $j${
    "version": 1,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Your School Placement"},
      {"id":"2","order":2,"type":"paragraph","text":"Once you have completed all onboarding stages and your Area Lead has recommended you for activation, you will receive a formal placement offer. This will set out the school, session times, your role, and any specific information you need before your first session."},
      {"id":"3","order":3,"type":"heading","level":2,"text":"What Happens Next"},
      {"id":"4","order":4,"type":"numbered_list","items":["Your Area Lead issues a placement offer via this app","You review the offer — including school, session day and time, role, and expected arrival time","You accept or request clarification","Once accepted, your onboarding is complete and your account becomes active"]},
      {"id":"5","order":5,"type":"callout","variant":"info","title":"This stage is managed by your Area Lead","text":"You do not need to do anything yet. Your Area Lead will issue your placement offer once the rest of your onboarding is confirmed. If you have any questions about your placement in the meantime, contact your Area Lead directly."},
      {"id":"6","order":6,"type":"heading","level":2,"text":"Before Your First Session"},
      {"id":"7","order":7,"type":"bullet_list","items":["Read the placement offer carefully — note the school name, address, and session time","Ensure you know the arrival procedure for your school","Confirm that all your documents (DBS, first aid, safeguarding certificate) are in order","If anything is unclear, contact your Area Lead before your first session"]},
      {"id":"8","order":8,"type":"acknowledgement","prompt":"I understand that my placement offer will be issued by my Area Lead and that I must review and accept it before my onboarding is considered complete."}
    ]
  }$j$::jsonb,
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_tasks t JOIN onboarding_stages s ON t.stage_id = s.id
  WHERE t.title = 'Your School Placement' AND s.title = 'Coach Placement Offer and Acceptance'
);

-- =============================================================================
-- END OF TASKS SEED
-- Run onboarding_seed_quiz_bank.sql next to insert quiz questions.
-- =============================================================================
