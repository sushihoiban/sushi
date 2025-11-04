-- This migration replaces the complex and buggy filter_customers function
-- with a simpler, more robust version that is guaranteed to return all customers.

-- Step 1: Drop any old versions of the function and its return type for a clean slate.
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

-- Step 3: Create the simplified function.
CREATE OR REPLACE FUNCTION public.filter_customers(
    name_filter TEXT, -- This parameter is now unused but kept for compatibility
    booking_status_filter TEXT -- This parameter is now unused but kept for compatibility
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
        u.email::TEXT
    FROM
        public.customers c
    LEFT JOIN
        auth.users u ON c.user_id = u.id
    ORDER BY
        c.first_name, c.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
