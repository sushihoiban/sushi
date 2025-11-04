-- This migration ensures the 'add_customer' function exists, resolving inconsistencies
-- caused by a corrupt migration history.

-- Step 1: Drop the function if it exists, to allow for a clean re-creation.
DROP FUNCTION IF EXISTS public.add_customer(TEXT, TEXT, TEXT, customer_status);

-- Step 2: Re-create the function with the correct and final logic.
CREATE OR REPLACE FUNCTION public.add_customer(
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_status customer_status DEFAULT 'regular'
)
RETURNS void AS $$
BEGIN
    IF auth.role() = 'authenticated' THEN
        INSERT INTO public.customers (first_name, last_name, phone, status)
        VALUES (p_first_name, p_last_name, p_phone, p_status);
    ELSE
        RAISE EXCEPTION 'Not authorized to add a new customer';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
