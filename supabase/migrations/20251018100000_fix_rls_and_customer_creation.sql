-- Step 1: Redefine all our key functions as SECURITY DEFINER.
-- This allows them to bypass the calling user's RLS policies in a controlled way,
-- fixing the error where users couldn't create their own customer record during booking.

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
BEGIN
    -- Find or create the customer, and crucially, link them to an auth user if one exists
    SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone;
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (name, phone, user_id) 
        VALUES (p_customer_name, p_customer_phone, (SELECT id FROM auth.users WHERE raw_user_meta_data->>'phone' = p_customer_phone))
        RETURNING id INTO v_customer_id;
    END IF;
    PERFORM id FROM public.bookings WHERE customer_id = v_customer_id AND booking_date = p_booking_date AND (booking_time, booking_time + interval '90 minutes') OVERLAPS (p_booking_time, p_booking_time + interval '90 minutes');
    IF FOUND THEN
        RAISE EXCEPTION 'This customer already has an overlapping booking at the specified time.';
    END IF;
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

CREATE OR REPLACE FUNCTION public.cancel_booking_group(p_group_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM public.bookings WHERE group_id = p_group_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_booking_group(
    p_group_id_to_cancel UUID, p_customer_name TEXT, p_customer_phone TEXT,
    p_new_table_ids UUID[], p_new_party_size INT, p_booking_date DATE, p_booking_time TIME
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_new_group_id UUID;
BEGIN
    PERFORM cancel_booking_group(p_group_id_to_cancel);
    SELECT create_booking_for_party(p_customer_name, p_customer_phone, p_new_table_ids, p_new_party_size, p_booking_date, p_booking_time) INTO v_new_group_id;
    RETURN v_new_group_id;
END;
$$;
