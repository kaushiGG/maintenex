-- Basic tables needed for the application
-- Run this in your new Supabase project SQL Editor

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  user_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create the business_sites table
CREATE TABLE IF NOT EXISTS public.business_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates TEXT,
  compliance_status TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  site_type TEXT,
  item_count INTEGER DEFAULT 0,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for sites
ALTER TABLE public.business_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sites are viewable by authenticated users" ON public.business_sites
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sites can be inserted by authenticated users" ON public.business_sites
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sites can be updated by authenticated users" ON public.business_sites
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create the contractors table
CREATE TABLE IF NOT EXISTS public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  job_title TEXT,
  skills TEXT[],
  rating NUMERIC,
  credentials TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  auth_id UUID,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for contractors
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors are viewable by authenticated users" ON public.contractors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Contractors can be inserted by authenticated users" ON public.contractors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Contractors can be updated by authenticated users" ON public.contractors
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create the site_contractors table (for assignments)
CREATE TABLE IF NOT EXISTS public.site_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.business_sites,
  contractor_id UUID NOT NULL,
  status TEXT,
  assigned_by UUID,
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for site_contractors
ALTER TABLE public.site_contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site contractors are viewable by authenticated users" ON public.site_contractors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Site contractors can be inserted by authenticated users" ON public.site_contractors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Site contractors can be updated by authenticated users" ON public.site_contractors
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create the site_floor_plans table
CREATE TABLE IF NOT EXISTS public.site_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.business_sites,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for site_floor_plans
ALTER TABLE public.site_floor_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Floor plans are viewable by authenticated users" ON public.site_floor_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Floor plans can be inserted by authenticated users" ON public.site_floor_plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Floor plans can be updated by authenticated users" ON public.site_floor_plans
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create stored procedure to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type, is_approved)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'user_type', 
    CASE 
      WHEN new.raw_user_meta_data->>'user_type' = 'business' THEN TRUE
      ELSE FALSE
    END);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 