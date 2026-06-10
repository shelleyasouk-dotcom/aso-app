-- Summer 2026 holiday camp venues
-- booking_url: fill in each Wix booking page URL once created
INSERT INTO public.holiday_camps
  (title, camp_type, venue_name, city, region, emoji, start_date, end_date,
   session_start_time, session_end_time, price_pence, capacity,
   is_full, is_published, age_range, booking_url, display_order)
VALUES
  ('ASO Summer Camp — Andover',     'summer', 'Pilgrim''s Cross',               'Andover',     'Hampshire',  '⭐', '2026-08-03', '2026-08-07', '09:00', '15:00', 0, 24, false, true, '4–11', null, 1),
  ('ASO Summer Camp — Salisbury',   'summer', 'Saint Martin''s Primary School', 'Salisbury',   'Wiltshire',  '⭐', '2026-08-03', '2026-08-07', '09:00', '15:00', 0, 24, false, true, '4–11', null, 2),
  ('ASO Summer Camp — Basingstoke', 'summer', 'Overton Primary School',         'Basingstoke', 'Hampshire',  '⭐', '2026-08-10', '2026-08-14', '09:00', '15:00', 0, 24, false, true, '4–11', null, 3),
  ('ASO Summer Camp — Poole',       'summer', 'Hamworthy Schools',              'Poole',      'Dorset',     '⭐', '2026-08-10', '2026-08-14', '09:00', '15:00', 0, 24, false, true, '4–11', null, 4),
  ('ASO Summer Camp — Bristol',     'summer', 'Bristol Venue TBC',              'Bristol',     'Bristol',    '⭐', '2026-08-17', '2026-08-21', '09:00', '15:00', 0, 24, false, true, '4–11', null, 5),
  ('ASO Summer Camp — Southampton', 'summer', 'Sholing Junior School',          'Southampton', 'Hampshire',  '⭐', '2026-08-17', '2026-08-21', '09:00', '15:00', 0, 24, false, true, '4–11', null, 6);
