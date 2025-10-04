-- Add is_available to restaurant_tables
ALTER TABLE public.restaurant_tables
ADD COLUMN is_available BOOLEAN NOT NULL DEFAULT true;

-- Create customer status enum and customers table
CREATE TYPE public.customer_status AS ENUM ('regular', 'vip');

CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  status public.customer_status NOT NULL DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alter bookings to link to customers
ALTER TABLE public.bookings
DROP COLUMN customer_name,
DROP COLUMN customer_phone;

ALTER TABLE public.bookings
ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers table (assuming only authenticated users are admins)
CREATE POLICY "Admins can view customers"
ON public.customers
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert customers"
ON public.customers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
