-- Holiday / Summer camps table
-- Run once in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS holiday_camps (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  camp_type           text        NOT NULL DEFAULT 'summer',   -- summer | easter | christmas | half_term
  venue_name          text        NOT NULL,
  city                text,
  region              text,
  emoji               text        DEFAULT '☀️',
  start_date          date        NOT NULL,
  end_date            date        NOT NULL,
  session_start_time  text        DEFAULT '9:15am',
  session_end_time    text        DEFAULT '12:15pm',
  price_pence         integer     NOT NULL DEFAULT 0,
  capacity            integer     NOT NULL DEFAULT 24,
  is_full             boolean     NOT NULL DEFAULT false,
  booking_url         text,
  is_published        boolean     NOT NULL DEFAULT false,
  age_range           text        DEFAULT '4-11',
  notes               text,
  display_order       integer     DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE holiday_camps ENABLE ROW LEVEL SECURITY;

-- Published camps are publicly readable
CREATE POLICY "Public read published holiday camps"
  ON holiday_camps FOR SELECT
  USING (is_published = true);

-- Authenticated staff can manage all camps
CREATE POLICY "Staff manage holiday camps"
  ON holiday_camps FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed the four existing Summer 2026 venues (unpublished — add Wix URLs then publish)
INSERT INTO holiday_camps
  (title, camp_type, venue_name, city, region, emoji,
   start_date, end_date, session_start_time, session_end_time,
   price_pence, capacity, is_published, display_order)
VALUES
  ('Summer Gymnastics Camp', 'summer', 'St Martins Primary School', 'Salisbury',    'Wiltshire', '🏰', '2026-07-28', '2026-07-30', '9:15am', '12:15pm', 7500, 24, false, 1),
  ('Summer Gymnastics Camp', 'summer', 'Sholing Junior School',     'Southampton',  'Hampshire', '🌊', '2026-07-28', '2026-07-30', '9:15am', '12:15pm', 7500, 24, false, 2),
  ('Summer Gymnastics Camp', 'summer', 'Overton Primary School',    'Basingstoke',  'Hampshire', '🌿', '2026-07-28', '2026-07-30', '9:15am', '12:15pm', 7500, 24, false, 3),
  ('Summer Gymnastics Camp', 'summer', 'Hamworthy Twin Sails',      'Poole',        'Dorset',    '⛵', '2026-07-28', '2026-07-30', '9:15am', '12:15pm', 7500, 24, false, 4);
