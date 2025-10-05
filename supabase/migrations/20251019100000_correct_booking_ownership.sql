-- This migration replaces the flawed booking function with a robust and secure version.

CREATE OR REPLACE FUNCTION public.create_booking_for_party(
    p_customer_name TEXT, p_customer_phone TEXT, p_table_ids UUID[],
    p_party_size INT, p_booking_date DATE, p_booking_time TIME
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_customer_id UUID;
    v_group_id UUID := gen_random_uuid();
    v_table_id UUID;
    v_remaining_guests INT := p_party_size;
    v_table_seats INT;
    v_guests_for_table INT;
    v_user_id UUID := auth.uid(); -- Get the ID of the user calling the function
BEGIN
    -- Step 1: Securely create or update the customer record.
    -- This is the key fix. It links an existing customer to the user account.
    INSERT INTO public.customers (name, phone, user_id)
    VALUES (p_customer_name, p_customer_phone, v_user_id)
    ON CONFLICT (phone) DO UPDATE
    SET user_id = EXCLUDED.user_id
    RETURNING id INTO v_customer_id;

    -- Step 2: Check for overlapping bookings for this customer.
    PERFORM id FROM public.bookings WHERE customer_id = v_customer_id AND booking_date = p_booking_date AND (booking_time, booking_time + interval '90 minutes') OVERLAPS (p_booking_time, p_booking_time + interval '90 minutes');
    IF FOUND THEN
        RAISE EXCEPTION 'This customer already has an overlapping booking at the specified time.';
    END IF;

    -- Step 3: Loop through tables and create bookings with distributed party sizes.
    FOREACH v_table_id IN ARRAY p_table_ids
    LOOP
        SELECT seats INTO v_table_seats FROM public.restaurant_tables WHERE id = v_table_id;
        v_guests_for_table := LEAST(v_remaining_guests, v_table_seats);
        INSERT INTO public.bookings (table_id, customer_id, party_size, booking_date, booking_time, group_id)
        VALUES (v_table_id, v_customer_id, v_guests_for_table, p_booking_date, p_booking_time, v_group_id);
        v_remaining_guests := v_remaining_guests - v_guests_for_table;
    END LOOP;

    RETURN v_group_id;
END;
$$;
