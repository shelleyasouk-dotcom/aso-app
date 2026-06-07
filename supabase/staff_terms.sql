-- Add terms agreement tracking to staff profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz;
