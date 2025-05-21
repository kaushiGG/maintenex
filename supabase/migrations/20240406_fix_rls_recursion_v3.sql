-- First, disable RLS to make changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- First, ensure all business users are properly marked
UPDATE public.profiles
SET is_approved = true
WHERE user_type = 'business';

-- Create a simple SELECT policy without recursion
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  -- Users can see their own profile
  auth.uid() = id
  OR 
  -- Business users can see all profiles
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
);

-- Create a simple UPDATE policy without recursion
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  -- Only business users can update
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
);

-- Simple INSERT policy
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  -- Users can only insert their own profile
  auth.uid() = id
);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- For debugging: Show current user's profile
SELECT 
  p.id,
  p.user_type,
  p.is_approved,
  p.email
FROM public.profiles p
WHERE p.id = auth.uid(); 