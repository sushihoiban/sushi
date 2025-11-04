CREATE OR REPLACE FUNCTION create_booking_with_customer(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_table_ids UUID[],
    p_party_size INT,
    p_booking_date DATE,
    p_booking_time TIME,
    p_user_id UUID DEFAULT NULL,
    p_create_customer BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (created_booking_id UUID) AS $$
DECLARE
    v_customer_id UUID;
    v_group_id UUID := gen_random_uuid();
    v_table_id UUID;
BEGIN
    -- Step 1: Find or create the customer
    IF p_user_id IS NOT NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE user_id = p_user_id LIMIT 1;
    END IF;

    IF v_customer_id IS NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone LIMIT 1;
    END IF;

    IF v_customer_id IS NULL AND p_create_customer THEN
        INSERT INTO public.customers (name, phone, user_id)
        VALUES (p_customer_name, p_customer_phone, p_user_id)
        RETURNING id INTO v_customer_id;
    ELSIF p_user_id IS NOT NULL AND v_customer_id IS NOT NULL THEN
        UPDATE public.customers SET user_id = p_user_id WHERE id = v_customer_id;
    END IF;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer not found and creation is not allowed.';
    END IF;

    -- Step 2: Create the bookings for each table
    FOREACH v_table_id IN ARRAY p_table_ids
    LOOP
        INSERT INTO public.bookings (table_id, customer_id, party_size, booking_date, booking_time, status, group_id)
        VALUES (v_table_id, v_customer_id, p_party_size, p_booking_date, p_booking_time, 'confirmed', v_group_id);
    END LOOP;

    SELECT b.id INTO created_booking_id FROM public.bookings b WHERE b.group_id = v_group_id LIMIT 1;
    RETURN NEXT;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
