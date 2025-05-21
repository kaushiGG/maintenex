-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Disable RLS temporarily to ensure we can modify the policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Create simplified policies that avoid recursion
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Business users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'business'
  )
);

CREATE POLICY "Business users can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'business'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'business'
  )
);

CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify current user's status (for debugging)
SELECT id, user_type, is_approved 
FROM public.profiles 
WHERE id = auth.uid(); 