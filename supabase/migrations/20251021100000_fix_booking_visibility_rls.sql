-- This migration replaces the flawed RLS policy on the bookings table
-- with a robust policy that correctly identifies a user's bookings by matching phone numbers.

-- Step 1: Drop the old, incorrect policy.
DROP POLICY IF EXISTS "Users can view and manage their own bookings" ON public.bookings;

-- Step 2: Create the new, correct policy.
-- A user can see a booking if they are an admin OR if the customer's phone number
-- on the booking matches the phone number in their user profile.
CREATE POLICY "Users can view and manage their own bookings"
ON public.bookings
FOR ALL
USING (
  (get_my_role() = 'admin') OR
  (
    customer_id IN (
      SELECT c.id FROM public.customers c JOIN public.profiles p ON c.phone = p.phone WHERE p.id = auth.uid()
    )
  )
)
WITH CHECK (
  (get_my_role() = 'admin') OR
  (
    customer_id IN (
      SELECT c.id FROM public.customers c JOIN public.profiles p ON c.phone = p.phone WHERE p.id = auth.uid()
    )
  )
);
