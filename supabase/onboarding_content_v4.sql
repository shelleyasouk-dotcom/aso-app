-- =============================================================================
-- Onboarding content v4:
--
--   1. Staff Handbook — updated to reflect Handbook v2.0 (September 2026):
--        - Medical section with new mandatory Anaphylaxis training (Section 7.5)
--        - Session procedures and safeguarding contacts
--        - Safeguarding DSL contact details
--   2. Update Anaphylaxis training requirement in the Identity & Safeguarding stage
-- =============================================================================


-- ─── 1. Staff Handbook — v4 update ──────────────────────────────────────────

UPDATE onboarding_tasks
SET
  version      = 4,
  content_json = $j${
    "version": 4,
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

      {"id":"14","order":14,"type":"heading","level":2,"text":"Session Procedures"},
      {"id":"15","order":15,"type":"paragraph","text":"Every session must follow the same structure to keep children safe and ensure quality delivery:"},
      {"id":"16","order":16,"type":"bullet_list","items":["Arrive at least 5 minutes before the session starts","Collect the register from your Lead Coach or set it up in the app","Take attendance at the start of every session — no exceptions","Do not begin physical activity until all children are accounted for","Children must only be dismissed to an authorised adult — follow the school's dismissal protocol","Complete the session register before you leave the site"]},

      {"id":"17","order":17,"type":"heading","level":2,"text":"Medical and Emergency Procedures"},
      {"id":"18","order":18,"type":"paragraph","text":"Before leading any session, you must know the location of the school's first aid kit and who the designated first aider on site is. If a child is injured or unwell:"},
      {"id":"19","order":19,"type":"numbered_list","items":["Stop the activity and ensure the child is safe","Call for the school's first aider immediately","Do not move a child who may have a spinal injury","Inform your Lead Coach or Area Lead as soon as possible","Complete an incident report in the app on the same day"]},

      {"id":"20","order":20,"type":"heading","level":3,"text":"Allergy Awareness and Anaphylaxis — Mandatory from September 2026"},
      {"id":"21","order":21,"type":"callout","variant":"warning","title":"NEW — Mandatory for all coaches","text":"From September 2026, all ASO coaches must complete Allergy Awareness and Anaphylaxis training. This is a safeguarding requirement and applies to every coach regardless of role. You must record your completion date in your compliance profile."},
      {"id":"22","order":22,"type":"paragraph","text":"Before attending sessions you must:"},
      {"id":"23","order":23,"type":"bullet_list","items":["Know which children in your session have known allergies — check the register notes","Never give food or drink to a child unless it has been provided by their parent/guardian","If a child shows signs of an allergic reaction: call for help immediately, use their EpiPen if prescribed and you are trained, call 999, contact parents","Complete your Allergy Awareness and Anaphylaxis training and record the completion date in your profile"]},
      {"id":"24","order":24,"type":"cta_button","label":"Update my Anaphylaxis compliance record","route":"/profile?tab=compliance"},

      {"id":"25","order":25,"type":"heading","level":2,"text":"Absence and Cover"},
      {"id":"26","order":26,"type":"paragraph","text":"If you are unable to attend a session, you must contact your Lead Coach by phone call or voice note — not text — before 9:00am on the day of the session."},
      {"id":"27","order":27,"type":"bullet_list","items":["One unplanned absence per term is understandable — life happens","Two or more unplanned absences in a term will trigger a review with your Area Lead","Three or more may result in removal from the rota","Planned absences must be given with a minimum of 7 days notice in writing to your Lead Coach and Area Lead"]},

      {"id":"28","order":28,"type":"heading","level":2,"text":"Safeguarding"},
      {"id":"29","order":29,"type":"paragraph","text":"Every ASO coach has a responsibility to safeguard the children in their care. If you have a concern about a child's welfare, you must report it immediately — do not investigate it yourself."},
      {"id":"30","order":30,"type":"callout","variant":"info","title":"Safeguarding contacts","text":"Designated Safeguarding Lead: safeguarding@activeschool.org.uk\nShelley Wood (Operations Director): 07814 899151\n\nIf you believe a child is in immediate danger, call 999 first. Then contact the DSL."},

      {"id":"31","order":31,"type":"heading","level":2,"text":"Pay"},
      {"id":"32","order":32,"type":"paragraph","text":"Coaches are paid on the 15th of every month for the previous full calendar month's work. For example, you will be paid on 15th October for all sessions completed between 1st and 30th September."},
      {"id":"33","order":33,"type":"bullet_list","items":["Your sessions are recorded through the app — no separate timesheet is required","Pay is calculated from the sessions logged in your name for the previous month","Pay queries: email accounts@activeschool.org.uk — include your name and the month in question","Do not raise pay queries via WhatsApp"]},
      {"id":"34","order":34,"type":"callout","variant":"info","title":"Payment date","text":"Payment date is the 15th of each month. If the 15th falls on a weekend or bank holiday, payment will be made on the nearest working day. Contact accounts@activeschool.org.uk for any queries."},

      {"id":"35","order":35,"type":"heading","level":2,"text":"Your Development"},
      {"id":"36","order":36,"type":"paragraph","text":"ASO is built on developing young coaches. Termly reviews are conducted by your Area Lead — these are not disciplinary, they are designed to support your growth and identify your next steps. If you want to progress through the UKAG pathway, tell your Area Lead."},

      {"id":"37","order":37,"type":"cta_button","label":"Read the full Staff Handbook","route":"/handbook"},
      {"id":"38","order":38,"type":"acknowledgement","prompt":"I have thoroughly read the ASO Staff Handbook. I agree to work in line with all conduct standards, absence policies, medical protocols, and expectations set out in it."}
    ]
  }$j$::jsonb
WHERE title = 'The ASO Staff Handbook';
