-- =============================================================================
-- Merge Stage 2 (Personal Profile Review) and Stage 3 (Emergency Contact and
-- Medical Information) into a single "Complete Your Profile" stage.
--
-- Changes:
--   1. Update Stage 2 title → "Complete Your Profile"
--   2. Replace Stage 2 task content with merged content (personal info +
--      emergency contacts + medical) plus a CTA button to /profile?tab=details
--   3. Disable Stage 3 (is_active = false) so it no longer shows to coaches
--
-- Run after: onboarding_seed_content.sql
-- Safe to re-run (uses UPDATE, not INSERT).
-- =============================================================================

-- ─── 1. Rename Stage 2 ───────────────────────────────────────────────────────

UPDATE onboarding_stages
SET    title = 'Complete Your Profile',
       description = 'Add your personal details, emergency contacts, and medical information'
WHERE  title = 'Personal Profile Review';

-- ─── 2. Replace Stage 2 task content ─────────────────────────────────────────

UPDATE onboarding_tasks
SET
  title        = 'Complete Your Profile',
  version      = 2,
  content_json = $j${
    "version": 2,
    "blocks": [
      {"id":"1","order":1,"type":"heading","level":1,"text":"Complete Your Profile"},
      {"id":"2","order":2,"type":"paragraph","text":"ASO holds personal information for every member of staff. It is important that this is accurate and up to date — including your contact details, emergency contacts, and any relevant medical information."},

      {"id":"3","order":3,"type":"heading","level":2,"text":"Personal Information"},
      {"id":"4","order":4,"type":"bullet_list","items":["Your full legal name (as it appears on official documents)","Your current home address","Your primary mobile number","Your personal email address"]},
      {"id":"5","order":5,"type":"callout","variant":"info","title":"GDPR","text":"All personal data is held securely in line with GDPR. It is only used for operational purposes and is never shared externally without your consent."},

      {"id":"6","order":6,"type":"heading","level":2,"text":"Emergency Contacts"},
      {"id":"7","order":7,"type":"paragraph","text":"ASO must hold emergency contact details for every member of staff. In the event of an incident at a session, we need to be able to reach someone who can support you immediately."},
      {"id":"8","order":8,"type":"bullet_list","items":["Name and relationship of your primary emergency contact","Primary mobile number for your emergency contact","A secondary contact where possible"]},

      {"id":"9","order":9,"type":"heading","level":2,"text":"Medical Information"},
      {"id":"10","order":10,"type":"paragraph","text":"If you have any medical conditions, allergies, or health needs that could affect your ability to work safely, you must disclose these to ASO. This information is held confidentially and is only used to ensure your safety."},
      {"id":"11","order":11,"type":"bullet_list","items":["Conditions that may affect your physical ability during sessions","Allergies — including any epi-pen requirements","Any condition that may affect your response in an emergency"]},
      {"id":"12","order":12,"type":"callout","variant":"warning","title":"Update us if things change","text":"If your emergency contact details or medical information changes at any point during your employment, you must inform your Area Lead straight away. Keeping this current is your responsibility."},

      {"id":"13","order":13,"type":"cta_button","text":"Open My Details →","route":"/profile?tab=details"},

      {"id":"14","order":14,"type":"acknowledgement","prompt":"I have completed my personal profile including my contact details, emergency contacts, and any relevant medical information. I understand I must keep this up to date throughout my employment."}
    ]
  }$j$::jsonb
WHERE  title IN ('Your Personal Information', 'Complete Your Profile')
  AND  stage_id = (SELECT id FROM onboarding_stages WHERE title = 'Complete Your Profile' LIMIT 1);

-- ─── 3. Disable Stage 3 ──────────────────────────────────────────────────────

UPDATE onboarding_stages
SET    is_active = false
WHERE  title = 'Emergency Contact and Medical Information';
