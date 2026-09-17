-- Add requires_first_aid flag to profiles.
-- NULL = not yet set, true = required (coach is 18+), false = not required.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requires_first_aid boolean DEFAULT NULL;
