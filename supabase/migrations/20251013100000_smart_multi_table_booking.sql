-- Add a group_id to link bookings for large parties
ALTER TABLE public.bookings
ADD COLUMN group_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Drop the old simple booking function
DROP FUNCTION IF EXISTS create_booking_with_customer(text,text,uuid,integer,date,time);

-- Create a new, smarter function to handle single or multiple table bookings
CREATE OR REPLACE FUNCTION create_booking_for_party(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_table_ids UUID[],
    p_party_size INT,
    p_booking_date DATE,
    p_booking_time TIME
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_group_id UUID := gen_random_uuid();
    v_table_id UUID;
BEGIN
    -- Step 1: Find or create the customer
    SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone;
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, phone)
        VALUES (p_customer_name, p_customer_phone)
        RETURNING id INTO v_customer_id;
    END IF;

    -- Step 2: Check for existing overlapping bookings for this customer
    PERFORM id FROM public.bookings
    WHERE
        customer_id = v_customer_id AND
        booking_date = p_booking_date AND
        (booking_time, booking_time + interval '90 minutes') OVERLAPS (p_booking_time, p_booking_time + interval '90 minutes');
    
    IF FOUND THEN
        RAISE EXCEPTION 'This customer already has an overlapping booking at the specified time.';
    END IF;

    -- Step 3: Loop through the provided table IDs and create a booking for each
    FOREACH v_table_id IN ARRAY p_table_ids
    LOOP
        INSERT INTO public.bookings (table_id, customer_id, party_size, booking_date, booking_time, group_id)
        -- We record the total party size on the first booking and 0 for the others to avoid double counting guests
        VALUES (v_table_id, v_customer_id, CASE WHEN array_position(p_table_ids, v_table_id) = 1 THEN p_party_size ELSE 0 END, p_booking_date, p_booking_time, v_group_id);
    END LOOP;

    RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;
