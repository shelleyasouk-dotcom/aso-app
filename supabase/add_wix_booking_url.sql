-- Add Wix booking URL to schools table
-- Run in Supabase SQL Editor
alter table schools add column if not exists wix_booking_url text;
