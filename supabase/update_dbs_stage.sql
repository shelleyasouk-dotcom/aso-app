-- =============================================================================
-- Update Stage 7 (DBS Information and Upload):
--
--   "DBS Requirements" task:
--     - Adds "attending while awaiting" supervision callout
--     - Adds three-step progress description (Applied → Awaiting → Received)
--     - Adds profile_fields_form block so coaches can enter cert number + date
--       directly from this task (auto-saves to their profile)
--     - Adds CTA button to upload certificate to profile documents
--     - Updates acknowledgement to reflect the two-stage process
--
--   "DBS Certificate Upload" task:
--     - Set is_mandatory = false so coaches can complete onboarding
--       while still awaiting their certificate
-- =============================================================================

UPDATE onboarding_tasks
SET
  version      = 3,
  content_json = $j${
    "version": 3,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"DBS Requirements"},
      {"id":"2","order":2,"type":"paragraph","text":"All staff at ASO must hold an Enhanced Disclosure and Barring Service (DBS) certificate, including the children's barred list check, before working independently with children. This is a legal safeguarding requirement and there are no exceptions."},
      {"id":"3","order":3,"type":"callout","variant":"important","title":"Enhanced DBS — no exceptions","text":"You must have an Enhanced DBS including the children's barred list check. A basic or standard check is not sufficient. You cannot work independently with children until Naima has confirmed your DBS is in order."},

      {"id":"4","order":4,"type":"heading","level":2,"text":"How to Get Your DBS — Care Check"},
      {"id":"5","order":5,"type":"paragraph","text":"ASO processes DBS checks through Care Check, a government-approved umbrella body. Naima will send you a secure link to complete your application online. You will need to provide identification documents as part of the process — your Area Lead will advise you on what to bring."},
      {"id":"6","order":6,"type":"cta_button","label":"Apply via Care Check","route":"https://www.carechecks.co.uk/"},

      {"id":"7","order":7,"type":"heading","level":2,"text":"Your DBS Journey — Three Steps"},
      {"id":"8","order":8,"type":"numbered_list","items":["Submit your Care Check application as soon as you receive Naima's link — tick the acknowledgement at the bottom of this task once done.","Wait for your certificate — DBS checks typically take 1 to 6 weeks. You may attend sessions in a supervised capacity while you wait (see below).","When your certificate arrives, enter your certificate number and date of issue using the form below — this saves directly to your profile."]},

      {"id":"9","order":9,"type":"callout","variant":"warning","title":"Attending sessions while awaiting your DBS","text":"Before your certificate is confirmed, you may attend sessions only if: (1) a staff member with an Enhanced DBS is present at all times, and (2) you are never left alone with children under any circumstances. Your Area Lead must be aware you are attending on this basis."},

      {"id":"10","order":10,"type":"heading","level":2,"text":"DBS Certificate Renewal"},
      {"id":"11","order":11,"type":"bullet_list","items":["DBS certificates are renewed every three years","Alternatively, you may maintain your certificate via the DBS Update Service, which allows continuous online checking","If you use the Update Service, please inform Naima so your record can be verified online rather than by posting a certificate"]},

      {"id":"12","order":12,"type":"heading","level":2,"text":"DBS From a Previous Organisation"},
      {"id":"13","order":13,"type":"paragraph","text":"If you hold a valid Enhanced DBS certificate from a previous employer or organisation, it may be accepted. You must confirm this with Naima before starting. Certificates that were not issued on the Update Service and are more than three years old will not be accepted."},

      {"id":"14","order":14,"type":"heading","level":2,"text":"When You Receive Your Certificate"},
      {"id":"15","order":15,"type":"paragraph","text":"Your DBS certificate will arrive by post. Once it arrives, enter the details below — they will be saved directly to your compliance record. Then upload a copy using the button below."},
      {"id":"16","order":16,"type":"profile_fields_form","title":"Enter your DBS certificate details","subtitle":"Fill these in once your certificate arrives — they save directly to your profile compliance record.","fields":[{"key":"dbs_number","label":"Certificate Number","inputType":"text","placeholder":"e.g. 001234567890"},{"key":"dbs_expiry","label":"Date of Issue","inputType":"date"}]},
      {"id":"17","order":17,"type":"cta_button","label":"Upload my DBS certificate","route":"/profile?tab=documents"},

      {"id":"18","order":18,"type":"acknowledgement","prompt":"I have submitted my Care Check DBS application through Naima's link. I understand I may attend sessions under supervision before my certificate is confirmed, and that I cannot work independently with children until Naima has confirmed my DBS is in order."}
    ]
  }$j$::jsonb
WHERE title = 'DBS Requirements'
  AND stage_id = (SELECT id FROM onboarding_stages WHERE title = 'DBS Information and Upload' LIMIT 1);

-- Make the upload task optional — coaches can complete onboarding while awaiting their certificate
UPDATE onboarding_tasks
SET    is_mandatory = false
WHERE  title = 'DBS Certificate Upload'
  AND  stage_id = (SELECT id FROM onboarding_stages WHERE title = 'DBS Information and Upload' LIMIT 1);
