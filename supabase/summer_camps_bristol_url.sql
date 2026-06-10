-- Add booking URL for Bristol (Hotwells Primary School) summer camps
UPDATE public.holiday_camps
SET booking_url = 'https://www.activeschool.shop/bookings?category=a4540386-33d7-429d-8da6-16ff815fb985'
WHERE city = 'Bristol' AND camp_type = 'summer';
