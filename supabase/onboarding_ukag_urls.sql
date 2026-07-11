-- =============================================================================
-- ASO Onboarding — Update UKAG course URLs
-- Run after: onboarding_content_updates_v2.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 1: Role-Specific Training — correct UKAG coaching and safety URLs
-- Blocks at index 18 and 19 are the two UKAG CTA buttons.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET content_json = jsonb_set(
  jsonb_set(
    content_json,
    '{blocks, 18, label}',
    '"UKAG Coaching Courses (Levels 0, 1 and 2)"'::jsonb
  ),
  '{blocks, 18, route}',
  '"https://www.ukacademiesofgymnastics.com/academies/coach"'::jsonb
)
WHERE title = 'Lead Coach Requirements and Lone Working';

UPDATE onboarding_tasks
SET content_json = jsonb_set(
  jsonb_set(
    content_json,
    '{blocks, 19, label}',
    '"UKAG Safeguarding, First Aid and Safety Courses"'::jsonb
  ),
  '{blocks, 19, route}',
  '"https://www.ukacademiesofgymnastics.com/academies/safety"'::jsonb
)
WHERE title = 'Lead Coach Requirements and Lone Working';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 2: First Aid and UKAG Qualifications — add safety/first aid course link
-- Inserts UKAG safety button before the final acknowledgement block.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET content_json = jsonb_insert(
  content_json,
  ARRAY['blocks', (jsonb_array_length(content_json->'blocks') - 1)::text],
  '{
    "id": "fa-cta-safety",
    "order": 15,
    "type": "cta_button",
    "label": "UKAG Safeguarding, First Aid and Safety Courses",
    "route": "https://www.ukacademiesofgymnastics.com/academies/safety"
  }'::jsonb,
  false
)
WHERE title = 'First Aid and UKAG Qualifications';


-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE 3: Safeguarding — add UKAG safety courses link alongside HST button
-- Inserts UKAG safety button after the HST button (second from last position).
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE onboarding_tasks
SET content_json = jsonb_insert(
  content_json,
  ARRAY['blocks', (jsonb_array_length(content_json->'blocks') - 1)::text],
  '{
    "id": "sg-cta-ukag",
    "order": 18,
    "type": "cta_button",
    "label": "UKAG Safeguarding and Safety Courses",
    "route": "https://www.ukacademiesofgymnastics.com/academies/safety"
  }'::jsonb,
  false
)
WHERE title = 'Safeguarding — Your Responsibilities';
