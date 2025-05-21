-- Ensure the profiles table exists with correct structure
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

-- Enable RLS for profiles if it exists
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (dropping existing ones first to avoid errors)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Check if any auth.users entries are missing corresponding profiles
INSERT INTO public.profiles (
  id, 
  email,
  first_name, 
  last_name, 
  user_type,
  is_approved
)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'firstName', ''),
  COALESCE(raw_user_meta_data->>'lastName', ''),
  COALESCE(raw_user_meta_data->>'userType', 'contractor'),
  CASE 
    WHEN COALESCE(raw_user_meta_data->>'userType', 'contractor') = 'business' THEN TRUE 
    ELSE FALSE 
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING; 