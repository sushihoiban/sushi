-- This function securely adds a new customer.
-- It is designed to be called by an authenticated admin.

-- We can safely use CREATE OR REPLACE as this is new or overwriting a non-critical function.
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
