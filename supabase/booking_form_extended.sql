-- Extend parent_children with full booking form fields (emergency contacts, collection, consents)
ALTER TABLE parent_children
  ADD COLUMN IF NOT EXISTS parent_name             TEXT,
  ADD COLUMN IF NOT EXISTS parent_relationship     TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone            TEXT,
  ADD COLUMN IF NOT EXISTS address_line1           TEXT,
  ADD COLUMN IF NOT EXISTS address_city            TEXT,
  ADD COLUMN IF NOT EXISTS address_postcode        TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name          TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship  TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone         TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_name        TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_phone       TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_email       TEXT,
  ADD COLUMN IF NOT EXISTS collection_person       TEXT,
  ADD COLUMN IF NOT EXISTS walk_home_alone         BOOLEAN,
  ADD COLUMN IF NOT EXISTS photo_consent           BOOLEAN;

-- Extend parent_bookings with per-booking consent snapshot
ALTER TABLE parent_bookings
  ADD COLUMN IF NOT EXISTS medically_fit           BOOLEAN,
  ADD COLUMN IF NOT EXISTS first_aid_permission    BOOLEAN,
  ADD COLUMN IF NOT EXISTS fees_acknowledged       BOOLEAN,
  ADD COLUMN IF NOT EXISTS policy_agreed           BOOLEAN,
  ADD COLUMN IF NOT EXISTS signature_name          TEXT,
  ADD COLUMN IF NOT EXISTS signed_at               TIMESTAMPTZ;
