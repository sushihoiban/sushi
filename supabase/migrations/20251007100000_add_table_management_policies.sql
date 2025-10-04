-- Grant insert, update, delete permissions on restaurant_tables to authenticated users

CREATE POLICY "Allow admins to insert tables"
ON public.restaurant_tables
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow admins to update tables"
ON public.restaurant_tables
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow admins to delete tables"
ON public.restaurant_tables
FOR DELETE
TO authenticated
USING (true);
