-- Create a table for global application settings
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read settings, Admins can manage them.
CREATE POLICY "Public can view settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- Insert the initial restaurant phone number
INSERT INTO public.app_settings (key, value)
VALUES ('restaurant_phone_number', '84942659839');
