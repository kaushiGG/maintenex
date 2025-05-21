-- First, let's check and fix any business users
UPDATE public.profiles
SET is_approved = true
WHERE user_type = 'business';

-- Then verify our RLS policies are correct
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can approve profiles" ON public.profiles;

-- Create simplified policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Business users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND user_type = 'business'
    )
);

CREATE POLICY "Business users can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND user_type = 'business'
    )
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- Now let's check the current state of profiles
SELECT id, user_type, is_approved, email 
FROM public.profiles 
ORDER BY created_at DESC; 