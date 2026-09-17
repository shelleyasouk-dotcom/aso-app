-- =============================================================================
-- Updates to Stage 5 (Proof of Identity / Right to Work)
-- and Stage 6 (Safeguarding Training):
--
--   Stage 5: Replace the two upload tasks with a single declaration tick.
--            Coaches provide ID/right-to-work during their DBS application
--            through Care Check, so separate uploads here are redundant.
--
--   Stage 6: Replace duplicate/incorrect CTA buttons with:
--            - One button → UKAG profile page (coach creates their account
--              and gets enrolled in courses)
--            - Callout note → they will receive the High Speed Training link
--              from Naima (not a button — they don't book it themselves)
-- =============================================================================


-- ─── Stage 5: Convert to a single declaration task ───────────────────────────

-- Replace the content task with a declaration
UPDATE onboarding_tasks
SET
  type             = 'declaration',
  title            = 'Right to Work and Proof of Identity',
  version          = 2,
  content_json     = NULL,
  declaration_text = 'I confirm that I have the right to work in the United Kingdom and hold valid proof of my identity. I understand that ASO is required by law to verify this before I can work independently with children. I have provided, or will provide, the required documentation to Naima as part of my DBS application and onboarding process, and I understand that I cannot begin working until this has been confirmed by Naima.',
  requires_typed_name = false
WHERE title IN ('Identity and Right to Work', 'Right to Work and Proof of Identity')
  AND stage_id = (SELECT id FROM onboarding_stages WHERE title = 'Proof of Identity and Right to Work' LIMIT 1);

-- Disable the two upload tasks — documents are handled via the DBS process
UPDATE onboarding_tasks
SET    is_active = false
WHERE  title IN ('Photo ID Upload', 'Right to Work Document')
  AND  stage_id = (SELECT id FROM onboarding_stages WHERE title = 'Proof of Identity and Right to Work' LIMIT 1);


-- ─── Stage 6: Fix safeguarding CTA buttons ───────────────────────────────────
-- Full content replacement to ensure correct state regardless of prior updates.
-- Removes duplicate booking buttons; replaces with UKAG profile link + note
-- about the High Speed Training link being sent separately by Naima.

UPDATE onboarding_tasks
SET
  version      = 3,
  content_json = $j${
    "version": 3,
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
      {"id":"17","order":17,"type":"heading","level":2,"text":"Your Safeguarding Certificate"},
      {"id":"18","order":18,"type":"paragraph","text":"All ASO coaches must hold a current Safeguarding in Sport certificate (minimum Level 1, renewed annually). There are two ways to complete this:"},
      {"id":"19","order":19,"type":"bullet_list","items":["UKAG Safeguarding Course — complete via your UKAG profile (see button below)","High Speed Training — Naima will send you a direct link to the Safeguarding in Sport online course once your onboarding is underway"]},
      {"id":"20","order":20,"type":"callout","variant":"info","title":"High Speed Training link","text":"You do not need to book the High Speed Training course yourself. Naima will send you a personalised link once your onboarding is underway. Keep an eye on your email."},
      {"id":"21","order":21,"type":"cta_button","text":"Create your UKAG profile","route":"https://www.ukacademiesofgymnastics.com/"},
      {"id":"23","order":23,"type":"callout","variant":"info","title":"Record your certificate date","text":"Once you have completed your safeguarding course, go to your Profile → Compliance section and enter the date of issue. Then upload a copy of your certificate in your Documents tab. Naima may ask to verify this before your onboarding is signed off."},
      {"id":"24","order":24,"type":"cta_button","text":"Update my Compliance record","route":"/profile?tab=compliance"},
      {"id":"25","order":25,"type":"cta_button","text":"Upload my safeguarding certificate","route":"/profile?tab=documents"},
      {"id":"22","order":26,"type":"acknowledgement","prompt":"I have read and understood my safeguarding responsibilities at ASO. I know the correct escalation chain and what to do if a child makes a disclosure."}
    ]
  }$j$::jsonb
WHERE title = 'Safeguarding — Your Responsibilities';
