-- This migration provides the definitive, correct version of the filter_customers function.
-- It replaces all previous attempts and cleans up the schema.

-- Step 1: Drop any old versions of the function and its return type.
DROP FUNCTION IF EXISTS public.filter_customers(TEXT, TEXT);
DROP TYPE IF EXISTS public.customer_details;

-- Step 2: Define the correct return type.
CREATE TYPE public.customer_details AS (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    status customer_status,
    user_id UUID,
    email TEXT
);

-- Step 3: Create the function with the correct logic, permissions, and type casting.
CREATE OR REPLACE FUNCTION public.filter_customers(
    name_filter TEXT,
    booking_status_filter TEXT
)
RETURNS SETOF public.customer_details AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.phone,
        c.status,
        c.user_id,
        u.email::TEXT -- The crucial type cast
    FROM
        public.customers c
    LEFT JOIN
        auth.users u ON c.user_id = u.id
    WHERE
        (name_filter IS NULL OR (c.first_name || ' ' || c.last_name) ILIKE '%' || name_filter || '%')
    AND
        (
            booking_status_filter = 'all' OR
            (booking_status_filter = 'active' AND EXISTS (
                SELECT 1 FROM public.bookings b WHERE b.customer_id = c.id AND b.booking_date >= current_date
            )) OR
            (booking_status_filter = 'none' AND NOT EXISTS (
                SELECT 1 FROM public.bookings b WHERE b.customer_id = c.id AND b.booking_date >= current_date
            ))
        )
    ORDER BY
        c.first_name, c.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
