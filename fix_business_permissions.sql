-- Temporarily disable RLS to apply changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can approve profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can approve profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Make sure all business users are properly marked as approved
UPDATE public.profiles
SET is_approved = true
WHERE user_type = 'business';

-- Create a simple, direct policy for business users to update ANY profile
CREATE POLICY "Business users can update any profile"
ON public.profiles
FOR UPDATE
USING (
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
)
WITH CHECK (
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
);

-- Create a policy for users to update their own profiles
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.profiles TO authenticated;

-- Show current policies for verification
SELECT *
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'; 