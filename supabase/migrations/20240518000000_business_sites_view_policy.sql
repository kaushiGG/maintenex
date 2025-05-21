-- Add a policy allowing business owners to view all business sites
CREATE POLICY "Business owners can view all business sites" 
ON public.business_sites 
FOR SELECT 
USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'business'
);

-- Rename the existing policy for clarity
ALTER POLICY "Users can view their own sites" 
ON public.business_sites 
RENAME TO "Regular users can view their own sites";

-- Note: The original RLS policies will still apply:
-- Regular users can view their own sites
-- Users can insert their own sites
-- Users can update their own sites
-- Users can delete their own sites 