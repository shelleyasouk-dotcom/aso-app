-- Summer 2026 GymCamps — full dataset (replaces earlier seed data)
-- 6 venues × 3 weeks = 18 rows
-- Booking URLs: Andover + Bristol still TBC

DELETE FROM public.holiday_camps WHERE camp_type = 'summer';

INSERT INTO public.holiday_camps
  (title, camp_type, venue_name, city, region, emoji,
   start_date, end_date, session_start_time, session_end_time,
   price_pence, capacity, is_full, is_published, age_range, booking_url, display_order)
VALUES
  -- ── Andover ──────────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Andover (Week 1)', 'summer', 'Pilgrim''s Cross', 'Andover', 'Hampshire', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11', null, 10),
  ('ASO Summer GymCamp — Andover (Week 2)', 'summer', 'Pilgrim''s Cross', 'Andover', 'Hampshire', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11', null, 11),
  ('ASO Summer GymCamp — Andover (Week 3)', 'summer', 'Pilgrim''s Cross', 'Andover', 'Hampshire', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11', null, 12),

  -- ── Salisbury ────────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Salisbury (Week 1)', 'summer', 'St Martin''s CE Primary School', 'Salisbury', 'Wiltshire', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=f02d4ebb-e2fe-47ee-8018-e4e2583ff2c2', 20),
  ('ASO Summer GymCamp — Salisbury (Week 2)', 'summer', 'St Martin''s CE Primary School', 'Salisbury', 'Wiltshire', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=f02d4ebb-e2fe-47ee-8018-e4e2583ff2c2', 21),
  ('ASO Summer GymCamp — Salisbury (Week 3)', 'summer', 'St Martin''s CE Primary School', 'Salisbury', 'Wiltshire', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=f02d4ebb-e2fe-47ee-8018-e4e2583ff2c2', 22),

  -- ── Basingstoke ──────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Basingstoke (Week 1)', 'summer', 'Overton CE Primary School', 'Basingstoke', 'Hampshire', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=2d4a9c2e-2294-4f85-b33a-f4c75472e676', 30),
  ('ASO Summer GymCamp — Basingstoke (Week 2)', 'summer', 'Overton CE Primary School', 'Basingstoke', 'Hampshire', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=2d4a9c2e-2294-4f85-b33a-f4c75472e676', 31),
  ('ASO Summer GymCamp — Basingstoke (Week 3)', 'summer', 'Overton CE Primary School', 'Basingstoke', 'Hampshire', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=2d4a9c2e-2294-4f85-b33a-f4c75472e676', 32),

  -- ── Southampton ──────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Southampton (Week 1)', 'summer', 'Sholing Junior School', 'Southampton', 'Hampshire', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=08534891-6428-4988-bf33-2b6f520ab5e8', 40),
  ('ASO Summer GymCamp — Southampton (Week 2)', 'summer', 'Sholing Junior School', 'Southampton', 'Hampshire', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=08534891-6428-4988-bf33-2b6f520ab5e8', 41),
  ('ASO Summer GymCamp — Southampton (Week 3)', 'summer', 'Sholing Junior School', 'Southampton', 'Hampshire', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=08534891-6428-4988-bf33-2b6f520ab5e8', 42),

  -- ── Poole ────────────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Poole (Week 1)', 'summer', 'Twin Sails Infant School', 'Poole', 'Dorset', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=435117ea-d463-42c1-b4e1-9d8ab2d5e24e', 50),
  ('ASO Summer GymCamp — Poole (Week 2)', 'summer', 'Twin Sails Infant School', 'Poole', 'Dorset', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=435117ea-d463-42c1-b4e1-9d8ab2d5e24e', 51),
  ('ASO Summer GymCamp — Poole (Week 3)', 'summer', 'Twin Sails Infant School', 'Poole', 'Dorset', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11',
   'https://www.activeschool.shop/bookings?category=435117ea-d463-42c1-b4e1-9d8ab2d5e24e', 52),

  -- ── Bristol ──────────────────────────────────────────────────────────────────
  ('ASO Summer GymCamp — Bristol (Week 1)', 'summer', 'Hotwells Primary School', 'Bristol', 'Bristol', '⭐',
   '2026-07-28','2026-07-30','09:15','12:15', 7500, 24, false, true, '4–11', null, 60),
  ('ASO Summer GymCamp — Bristol (Week 2)', 'summer', 'Hotwells Primary School', 'Bristol', 'Bristol', '⭐',
   '2026-08-04','2026-08-06','09:15','12:15', 7500, 24, false, true, '4–11', null, 61),
  ('ASO Summer GymCamp — Bristol (Week 3)', 'summer', 'Hotwells Primary School', 'Bristol', 'Bristol', '⭐',
   '2026-08-18','2026-08-20','09:15','12:15', 7500, 24, false, true, '4–11', null, 62);
