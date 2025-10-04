-- This function will be triggered after a new user signs up.
CREATE OR REPLACE FUNCTION public.create_customer_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new record into the public.customers table
  INSERT INTO public.customers (name, phone)
  VALUES (
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires the function
CREATE TRIGGER on_user_created_create_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_customer_for_new_user();

-- Backfill existing users who are not in the customers table yet
INSERT INTO public.customers (name, phone)
SELECT
    u.raw_user_meta_data->>'full_name' AS name,
    u.raw_user_meta_data->>'phone' AS phone
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.customers c WHERE c.phone = u.raw_user_meta_data->>'phone'
) AND u.raw_user_meta_data->>'phone' IS NOT NULL;
