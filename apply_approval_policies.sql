-- Add approval columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Update existing contractor profiles to be not approved by default
UPDATE public.profiles 
SET is_approved = FALSE 
WHERE user_type = 'contractor' AND is_approved IS NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can approve profiles" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can view contractor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

-- Create policy for admins to approve profiles
CREATE POLICY "Admins can approve profiles"
    ON public.profiles FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles 
            WHERE user_type = 'business' AND is_approved = TRUE
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles 
            WHERE user_type = 'business' AND is_approved = TRUE
        )
    );

-- Create policy for viewing approved contractor profiles
CREATE POLICY "Approved users can view contractor profiles"
    ON public.profiles FOR SELECT
    USING (
        (user_type = 'contractor' AND is_approved = TRUE) OR
        auth.uid() = id
    );

-- Create policy for business users to view all profiles
CREATE POLICY "Business users can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles 
            WHERE user_type = 'business'
        )
    );

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 