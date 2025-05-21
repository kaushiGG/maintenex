-- First, let's make sure we have all the necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS service_types TEXT[],
ADD COLUMN IF NOT EXISTS sites_access TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing profiles with data from auth.users
UPDATE public.profiles p
SET 
    email = u.email,
    first_name = COALESCE(u.raw_user_meta_data->>'firstName', ''),
    last_name = COALESCE(u.raw_user_meta_data->>'lastName', ''),
    user_type = COALESCE(u.raw_user_meta_data->>'userType', 'contractor'),
    is_approved = CASE 
        WHEN COALESCE(u.raw_user_meta_data->>'userType', 'contractor') = 'business' THEN TRUE 
        ELSE FALSE 
    END,
    updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id;

-- Insert any missing profiles from auth.users
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    user_type,
    is_approved,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'firstName', ''),
    COALESCE(u.raw_user_meta_data->>'lastName', ''),
    COALESCE(u.raw_user_meta_data->>'userType', 'contractor'),
    CASE 
        WHEN COALESCE(u.raw_user_meta_data->>'userType', 'contractor') = 'business' THEN TRUE 
        ELSE FALSE 
    END,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can view contractor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can approve profiles" ON public.profiles;
DROP POLICY IF EXISTS "Business users can view all profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

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

CREATE POLICY "Approved users can view contractor profiles"
    ON public.profiles FOR SELECT
    USING (
        (user_type = 'contractor' AND is_approved = TRUE) OR
        auth.uid() = id
    );

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