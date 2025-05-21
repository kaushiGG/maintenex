-- Drop existing business view policy
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

-- Create updated policy for business users to view all profiles
CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles business_profile
            WHERE business_profile.id = auth.uid()
            AND business_profile.user_type = 'business'
            AND business_profile.is_approved = true
        )
    );

-- Ensure RLS is still enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 