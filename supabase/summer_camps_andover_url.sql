-- Add booking URL for Andover (Pilgrim's Cross) summer camps
UPDATE public.holiday_camps
SET booking_url = 'https://www.activeschool.shop/bookings?category=174e15b5-62ba-4b65-a3c6-b93e37a24bbd'
WHERE city = 'Andover' AND camp_type = 'summer';
