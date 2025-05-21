-- Drop existing policies
DROP POLICY IF EXISTS "Contractors can view only approved contractor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

-- Create policy for users to view their own profile (this covers contractors)
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Create policy for business users to view all profiles
CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
            AND business_profile.is_approved = true
        )
    );

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 