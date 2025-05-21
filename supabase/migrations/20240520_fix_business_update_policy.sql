-- First let's check if we're missing a business user update policy
SELECT *
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND cmd = 'UPDATE';

-- Drop any existing policies that might interfere
DROP POLICY IF EXISTS "Business users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can approve profiles" ON public.profiles;

-- Create a policy specifically for business users to update any profile
CREATE POLICY "Business users can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Check if the authenticated user is a business user
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'business'
  )
)
WITH CHECK (
  -- Same check in the WITH CHECK clause
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'business'
  )
);

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- Verify the current policies
SELECT *
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'; 