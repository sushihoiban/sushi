-- Grant delete permissions on bookings to authenticated users

CREATE POLICY "Allow admins to delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (true);
