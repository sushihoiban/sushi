CREATE OR REPLACE FUNCTION check_customer_exists(p_phone_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.customers WHERE phone = p_phone_number
    ) INTO exists;
    RETURN exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
