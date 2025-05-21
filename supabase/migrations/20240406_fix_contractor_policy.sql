-- Drop the incorrect policy
DROP POLICY IF EXISTS "Anyone can view approved contractor profiles" ON public.profiles;

-- Create a more restrictive policy for viewing approved contractors
CREATE POLICY "Contractors can view only approved contractor profiles"
    ON public.profiles FOR SELECT
    USING (
        -- Allow viewing if the target profile is an approved contractor
        (user_type = 'contractor' AND is_approved = true) OR
        -- Or if it's the user's own profile
        (auth.uid() = id)
    );

-- Update business users view policy to be more explicit
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        -- Only business users can view all profiles
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
            AND business_profile.is_approved = true
        )
    ); 