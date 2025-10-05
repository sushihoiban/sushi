-- Step 1: Add a user_id column to the customers table to link it to an auth user.
ALTER TABLE public.customers
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Update the trigger function to populate the new user_id.
-- Use CREATE OR REPLACE to avoid dropping the function that the trigger depends on.
CREATE OR REPLACE FUNCTION public.create_customer_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (name, phone, user_id)
  VALUES (
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.id
  )
  ON CONFLICT (phone) DO UPDATE SET user_id = NEW.id; -- If customer exists, link them
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Backfill user_id for existing customers by matching phone numbers.
UPDATE public.customers c
SET user_id = u.id
FROM auth.users u
WHERE c.phone = u.raw_user_meta_data->>'phone' AND c.user_id IS NULL;

-- Step 4: Drop the old, insecure delete policy.
DROP POLICY IF EXISTS "Allow admins to delete bookings" ON public.bookings;

-- Step 5: Create a new, secure policy for users to manage ONLY their own bookings.
CREATE POLICY "Users can view and manage their own bookings"
ON public.bookings
FOR ALL
USING (
  (get_my_role() = 'admin') OR
  (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
)
WITH CHECK (
  (get_my_role() = 'admin') OR
  (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
