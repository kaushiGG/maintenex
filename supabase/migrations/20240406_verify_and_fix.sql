-- First, let's verify the profiles table structure
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
);

-- Check the columns in profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can approve profiles" ON public.profiles;

-- Create a single simple policy for business users first
CREATE POLICY "enable_all_access_to_business_users"
ON public.profiles
FOR ALL
TO authenticated
USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
);

-- Create a policy for users to see their own profile
CREATE POLICY "enable_users_to_see_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- Verify current policies
SELECT *
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles';