-- This is a one-time script to backfill missing first and last names
-- in the `customers` table by pulling data from the `auth.users` table.

-- It is safe to run multiple times, as it will only affect customers
-- where the first_name is currently NULL.

DO $$
DECLARE
    -- A variable to hold each record as we loop through them
    r RECORD;
    -- Variables to hold the split first and last names
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- This loop selects all customers who are missing a first name
    -- and have a linked user account, which should have the full name.
    FOR r IN (
        SELECT
            c.id AS customer_id,
            u.raw_user_meta_data->>'full_name' AS full_name
        FROM
            public.customers c
        JOIN
            auth.users u ON c.user_id = u.id
        WHERE
            c.first_name IS NULL
    )
    LOOP
        -- Split the full_name into first and last parts.
        -- This logic is the same as in our 'create_booking_with_customer' function.
        v_first_name := split_part(trim(r.full_name), ' ', 1);
        v_last_name := trim(substring(trim(r.full_name) from length(v_first_name) + 2));
        IF v_last_name = '' THEN
            v_last_name := NULL;
        END IF;

        -- Update the customers table with the newly split names.
        UPDATE public.customers
        SET
            first_name = v_first_name,
            last_name = v_last_name
        WHERE
            id = r.customer_id;

    END LOOP;
END $$;
