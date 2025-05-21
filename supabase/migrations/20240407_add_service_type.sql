-- Add service_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Update existing contractor profiles to have a default service type if needed
UPDATE public.profiles
SET service_type = 'General Maintenance'
WHERE user_type = 'contractor'
AND service_type IS NULL;

-- Verify the updates
SELECT id, email, user_type, service_type
FROM public.profiles
WHERE user_type = 'contractor'
ORDER BY created_at DESC; 