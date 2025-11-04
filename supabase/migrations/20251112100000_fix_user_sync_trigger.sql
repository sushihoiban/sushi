-- This migration fixes a critical bug where new user sign-ups would fail
-- because the sync trigger was trying to insert into a 'name' column
-- that no longer exists on the 'customers' table.

-- Step 1: Define the corrected function that splits the full name.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Split the full_name from the user's metadata into first and last name.
    v_first_name := split_part(trim(new.raw_user_meta_data->>'full_name'), ' ', 1);
    v_last_name := trim(substring(trim(new.raw_user_meta_data->>'full_name') from length(v_first_name) + 2));
    IF v_last_name = '' THEN
        v_last_name := NULL;
    END IF;

    -- Insert a new record into the public.customers table.
    INSERT INTO public.customers (user_id, first_name, last_name, phone)
    VALUES (new.id, v_first_name, v_last_name, new.phone);
    
    RETURN new;
END;
$$;

-- Step 2: Drop the old trigger if it exists to ensure a clean state.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Re-create the trigger to call the corrected function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
