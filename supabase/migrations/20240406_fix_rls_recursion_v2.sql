-- First, disable RLS to make changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create a single, simple policy for SELECT
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  -- Allow users to see their own profile
  auth.uid() = id
  OR
  -- Allow business users to see all profiles
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.users.id
      AND p.user_type = 'business'
    )
  )
);

-- Create a simple policy for UPDATE
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  -- Only business users can update profiles
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.users.id
      AND p.user_type = 'business'
    )
  )
);

-- Create a simple policy for INSERT
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  -- Users can only insert their own profile
  auth.uid() = id
);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- Verify the current user's profile
SELECT 
  id,
  user_type,
  is_approved
FROM public.profiles 
WHERE id = auth.uid(); 