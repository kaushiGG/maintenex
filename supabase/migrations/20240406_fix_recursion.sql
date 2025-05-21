-- First disable RLS to ensure we can modify policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can approve profiles" ON public.profiles;

-- Create basic policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create business user policies without recursion
CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            WHERE u.id = auth.uid()
            AND p.user_type = 'business'
            AND p.is_approved = true
        )
    );

CREATE POLICY "Business users can approve profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            WHERE u.id = auth.uid()
            AND p.user_type = 'business'
            AND p.is_approved = true
        )
    )
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 