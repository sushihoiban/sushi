-- This migration updates the 'create_booking_with_customer' function to correctly handle
-- splitting a full name into first and last name for the 'customers' table.

-- We can safely use CREATE OR REPLACE because the function signature (the input types) is not changing.
CREATE OR REPLACE FUNCTION public.create_booking_with_customer(
    p_customer_name text,
    p_customer_phone text,
    p_table_ids uuid[],
    p_party_size integer,
    p_booking_date date,
    p_booking_time time,
    p_user_id uuid DEFAULT NULL,
    p_create_customer boolean DEFAULT true)
RETURNS TABLE(created_booking_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_customer_id UUID;
    v_group_id UUID := gen_random_uuid();
    v_table_id UUID;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Step 1: Split the p_customer_name into first and last name.
    -- This logic handles single names, multiple names, and trims whitespace.
    v_first_name := split_part(trim(p_customer_name), ' ', 1);
    v_last_name := trim(substring(trim(p_customer_name) from length(v_first_name) + 2));
    IF v_last_name = '' THEN
        v_last_name := NULL;
    END IF;

    -- Step 2: Find or create the customer.
    IF p_user_id IS NOT NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE user_id = p_user_id LIMIT 1;
    END IF;

    IF v_customer_id IS NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE phone = p_customer_phone LIMIT 1;
    END IF;

    IF v_customer_id IS NULL AND p_create_customer THEN
        INSERT INTO public.customers (first_name, last_name, phone, user_id)
        VALUES (v_first_name, v_last_name, p_customer_phone, p_user_id)
        RETURNING id INTO v_customer_id;
    ELSIF p_user_id IS NOT NULL AND v_customer_id IS NOT NULL THEN
        UPDATE public.customers SET user_id = p_user_id WHERE id = v_customer_id;
    END IF;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer not found and creation is not allowed.';
    END IF;

    -- Step 3: Create the bookings for each table.
    FOREACH v_table_id IN ARRAY p_table_ids
    LOOP
        INSERT INTO public.bookings (table_id, customer_id, party_size, booking_date, booking_time, status, group_id)
        VALUES (v_table_id, v_customer_id, p_party_size, p_booking_date, p_booking_time, 'confirmed', v_group_id);
    END LOOP;

    SELECT b.id INTO created_booking_id FROM public.bookings b WHERE b.group_id = v_group_id LIMIT 1;
    RETURN NEXT;

END;
$function$;
