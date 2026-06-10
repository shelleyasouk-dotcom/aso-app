-- Update booking URLs for Summer 2026 camps (Andover + Bristol still TBC)
UPDATE public.holiday_camps SET booking_url = 'https://www.activeschool.shop/bookings?category=f02d4ebb-e2fe-47ee-8018-e4e2583ff2c2'
  WHERE city = 'Salisbury' AND camp_type = 'summer';

UPDATE public.holiday_camps SET booking_url = 'https://www.activeschool.shop/bookings?category=2d4a9c2e-2294-4f85-b33a-f4c75472e676'
  WHERE city = 'Basingstoke' AND camp_type = 'summer';

UPDATE public.holiday_camps SET booking_url = 'https://www.activeschool.shop/bookings?category=435117ea-d463-42c1-b4e1-9d8ab2d5e24e'
  WHERE city = 'Poole' AND camp_type = 'summer';

UPDATE public.holiday_camps SET booking_url = 'https://www.activeschool.shop/bookings?category=08534891-6428-4988-bf33-2b6f520ab5e8'
  WHERE city = 'Southampton' AND camp_type = 'summer';
