-- Track staff acknowledgement of the June 2026 photography policy update (Section 13.3)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photography_policy_ack_at timestamptz;
