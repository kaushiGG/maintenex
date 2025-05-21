-- First, enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can view contractor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can approve profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

-- Create basic policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create business user policies
CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
        )
    );

CREATE POLICY "Business users can approve profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
        )
    );

-- Create policy for viewing approved contractors
CREATE POLICY "Anyone can view approved contractor profiles"
    ON public.profiles FOR SELECT
    USING (
        (user_type = 'contractor' AND is_approved = true) OR
        (user_type = 'business' AND is_approved = true)
    ); 