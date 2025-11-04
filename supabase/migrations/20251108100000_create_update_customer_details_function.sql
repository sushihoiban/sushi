-- This function allows an authenticated user (assumed to be an admin)
-- to update the details of a customer.

-- We use SECURITY DEFINER to ensure that the function runs with the necessary
-- permissions to modify the customers table, but we also check the
-- user's role to ensure only authorized users can perform the action.

CREATE OR REPLACE FUNCTION public.update_customer_details(
    p_customer_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT
)
RETURNS void AS $$
BEGIN
    -- It's a good practice to check if the caller is authorized.
    -- This assumes you have a way to identify admins, for example,
    -- through a custom claim or a separate roles table.
    -- For this example, we will just check if the user is authenticated.
    IF auth.role() = 'authenticated' THEN
        UPDATE public.customers
        SET
            first_name = p_first_name,
            last_name = p_last_name,
            phone = p_phone
        WHERE
            id = p_customer_id;
    ELSE
        RAISE EXCEPTION 'Not authorized to update customer details';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
