-- Add "pending/awaiting" status columns for each certificate type.
-- NULL = not set, true = actively awaiting certificate, false = not awaiting.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dbs_pending          boolean DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS safeguarding_pending boolean DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_aid_pending    boolean DEFAULT NULL;
