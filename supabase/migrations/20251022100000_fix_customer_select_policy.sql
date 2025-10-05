-- This migration fixes the booking visibility issue by adding a missing,
-- necessary SELECT policy on the customers table.

-- This policy allows a user to see their OWN customer record,
-- which is required for the RLS policy on the 'bookings' table to work correctly.
CREATE POLICY "Users can view their own customer record"
ON public.customers
FOR SELECT
USING (
  (get_my_role() = 'admin') OR
  (user_id = auth.uid()) OR
  (phone IN (SELECT p.phone FROM public.profiles p WHERE p.id = auth.uid()))
);
