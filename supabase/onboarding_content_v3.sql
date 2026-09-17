-- =============================================================================
-- Onboarding content v3 fixes:
--
--   1. Disable all quiz tasks (replaced by declarations and contract signing)
--   2. Staff Handbook — full replacement (version 3):
--        - Single CTA button (fixes duplicate from v2 update)
--        - Pay section updated: paid on 15th for previous full month,
--          no manual timesheets (app records sessions)
--   3. First Aid and UKAG Qualifications — add CTA button to UKAG profile page
-- =============================================================================


-- ─── 1. Disable all quiz tasks ───────────────────────────────────────────────

UPDATE onboarding_tasks
SET    is_active = false
WHERE  type = 'quiz';


-- ─── 2. Staff Handbook — full content replacement ────────────────────────────

UPDATE onboarding_tasks
SET
  version      = 3,
  content_json = $j${
    "version": 3,
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

      {"id":"17","order":17,"type":"heading","level":2,"text":"Pay"},
      {"id":"18","order":18,"type":"paragraph","text":"Coaches are paid on the 15th of every month for the previous full calendar month's work. For example, you will be paid on 15th October for all sessions completed between 1st and 30th September."},
      {"id":"19","order":19,"type":"bullet_list","items":["Your sessions are recorded through the app — no separate timesheet is required","Pay is calculated from the sessions logged in your name for the previous month","Pay queries: email accounts@activeschool.org.uk — include your name and the month in question","Do not raise pay queries via WhatsApp"]},
      {"id":"20","order":20,"type":"callout","variant":"info","title":"Payment date","text":"Payment date is the 15th of each month. If the 15th falls on a weekend or bank holiday, payment will be made on the nearest working day. Contact accounts@activeschool.org.uk for any queries."},

      {"id":"21","order":21,"type":"heading","level":2,"text":"Your Development"},
      {"id":"22","order":22,"type":"paragraph","text":"ASO is built on developing young coaches. Termly reviews are conducted by your Area Lead — these are not disciplinary, they are designed to support your growth and identify your next steps. If you want to progress through the UKAG pathway, tell your Area Lead."},

      {"id":"23","order":23,"type":"cta_button","label":"Read the full Staff Handbook","route":"/handbook"},
      {"id":"24","order":24,"type":"acknowledgement","prompt":"I have thoroughly read the ASO Staff Handbook. I agree to work in line with all conduct standards, absence policies, and expectations set out in it."}
    ]
  }$j$::jsonb
WHERE title = 'The ASO Staff Handbook';


-- ─── 3. First Aid and UKAG Qualifications — add UKAG CTA button ──────────────
-- Full replacement to add the UKAG profile link and first aid pending note.

UPDATE onboarding_tasks
SET
  version      = 2,
  content_json = $j${
    "version": 2,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"First Aid and UKAG Qualifications"},
      {"id":"2","order":2,"type":"paragraph","text":"Depending on your role, you are required to hold specific first aid and coaching qualifications. These must be in place before you take on independent session responsibilities."},

      {"id":"3","order":3,"type":"heading","level":2,"text":"First Aid — Lead Coaches Only"},
      {"id":"4","order":4,"type":"paragraph","text":"Every Lead Coach must hold a valid first aid certificate. Either of the following is acceptable:"},
      {"id":"5","order":5,"type":"bullet_list","items":["Paediatric First Aid (PFA) certificate — recommended for working with children aged 4–11","First Aid at Work (FAW) certificate — also accepted","Certificate must be current and in date — expired certificates are not valid"]},
      {"id":"6","order":6,"type":"callout","variant":"warning","title":"Lead Coaches only","text":"The first aid requirement applies to Lead Coaches only. Junior and Assistant Coaches are not required to hold a first aid certificate — but ASO funds UKAG training for eligible coaches who wish to progress to Lead Coach."},
      {"id":"7","order":7,"type":"paragraph","text":"Once you have completed your first aid course, record the date in your profile Compliance section and upload a copy of your certificate to your Documents tab."},

      {"id":"8","order":8,"type":"heading","level":2,"text":"UKAG Coaching Qualifications"},
      {"id":"9","order":9,"type":"paragraph","text":"The UKAG awards pathway provides ASO coaches with a structured route to becoming qualified gymnastics and multi-sport coaches:"},
      {"id":"10","order":10,"type":"bullet_list","items":["UKAG Level 0 — Junior Coach (shadow/observation role)","UKAG Level 1 — Assistant Coach","UKAG Level 2 — Lead Coach (required before leading sessions independently)"]},
      {"id":"11","order":11,"type":"paragraph","text":"ASO funds UKAG Level 0, 1, and 2 training for eligible coaches. To qualify for funded training, you must complete your onboarding, work a minimum of one full term, remain on the active rota, and attend required shadow and CPD sessions."},
      {"id":"12","order":12,"type":"callout","variant":"tip","title":"Getting started with UKAG","text":"Create your UKAG profile using the button below. Once your profile is set up, Naima will enrol you on the relevant courses based on your current role and progression stage."},
      {"id":"13","order":13,"type":"cta_button","label":"Create your UKAG profile","route":"https://www.ukacademiesofgymnastics.com/"},
      {"id":"14","order":14,"type":"cta_button","label":"Update my First Aid compliance record","route":"/profile?tab=compliance"},
      {"id":"15","order":15,"type":"acknowledgement","prompt":"I understand the first aid and qualification requirements for my role and that ASO funds UKAG training for eligible coaches."}
    ]
  }$j$::jsonb
WHERE title = 'First Aid and UKAG Qualifications';
