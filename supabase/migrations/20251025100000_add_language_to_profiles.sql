-- Add a 'language' column to the profiles table to store user preference.
ALTER TABLE public.profiles
ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
