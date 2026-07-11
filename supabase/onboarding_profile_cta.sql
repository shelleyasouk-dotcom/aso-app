-- Add "Complete your profile" CTA button to the Personal Information task (Stage 2)
UPDATE onboarding_tasks
SET content_json = jsonb_set(
  content_json,
  '{blocks}',
  content_json->'blocks' || jsonb_build_array(jsonb_build_object(
    'id', 'cta-personal-profile',
    'order', 99,
    'type', 'cta_button',
    'label', 'Complete your profile details',
    'route', '/profile'
  ))
)
WHERE title = 'Your Personal Information'
  AND content_json IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(content_json->'blocks') AS b
    WHERE b->>'type' = 'cta_button'
  );

-- Add "Add emergency contacts" CTA button to the Emergency Contacts task (Stage 3)
UPDATE onboarding_tasks
SET content_json = jsonb_set(
  content_json,
  '{blocks}',
  content_json->'blocks' || jsonb_build_array(jsonb_build_object(
    'id', 'cta-emergency-contacts',
    'order', 99,
    'type', 'cta_button',
    'label', 'Add your emergency contacts',
    'route', '/profile'
  ))
)
WHERE title = 'Emergency Contacts and Medical Information'
  AND content_json IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(content_json->'blocks') AS b
    WHERE b->>'type' = 'cta_button'
  );
