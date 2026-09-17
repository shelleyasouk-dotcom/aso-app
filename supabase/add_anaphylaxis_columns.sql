-- Add anaphylaxis tracking columns to profiles
-- New mandatory requirement for all coaches from September 2026 (Handbook v2.0, Section 7.5)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anaphylaxis_expiry date DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anaphylaxis_pending boolean DEFAULT NULL;
