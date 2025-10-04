CREATE OR REPLACE FUNCTION get_available_tables(p_booking_date date, p_booking_time time, p_party_size integer)
RETURNS SETOF restaurant_tables AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.restaurant_tables
  WHERE 
    seats >= p_party_size AND 
    is_available = TRUE AND
    id NOT IN (
      SELECT table_id FROM public.bookings
      WHERE
        booking_date = p_booking_date AND
        -- Check for any overlap within the 90-minute booking window
        (booking_time, booking_time + interval '90 minutes') OVERLAPS (p_booking_time, p_booking_time + interval '90 minutes')
    )
  ORDER BY seats ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_booking_with_customer(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_table_id UUID,
    p_party_size INT,
    p_booking_date DATE,
    p_booking_time TIME
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_booking_id UUID;
BEGIN
    -- Find or create the customer based on phone number
    SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone;

    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, phone, status)
        VALUES (p_customer_name, p_customer_phone, 'regular')
        RETURNING id INTO v_customer_id;
    END IF;

    -- Create the booking
    INSERT INTO public.bookings (table_id, customer_id, party_size, booking_date, booking_time)
    VALUES (p_table_id, v_customer_id, p_party_size, p_booking_date, p_booking_time)
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;
