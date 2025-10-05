-- This is a one-time script to retroactively link existing customers to their auth user.
-- It finds customers who are missing a user_id and updates them by matching their
-- phone number to the phone number stored in the auth.users table.

UPDATE public.customers c
SET user_id = u.id
FROM auth.users u
WHERE c.phone = u.raw_user_meta_data->>'phone' AND c.user_id IS NULL;
