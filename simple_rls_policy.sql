-- WARNING: This is a very permissive policy for testing purposes only

-- Drop any existing policies on the contractor_licenses table
DROP POLICY IF EXISTS "Contractors can view their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can insert their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can update their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can delete their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Anyone can view licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Anyone can insert licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Anyone can update licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Anyone can delete licenses" ON public.contractor_licenses;

-- Make sure RLS is enabled
ALTER TABLE public.contractor_licenses ENABLE ROW LEVEL SECURITY;

-- Create a single policy that allows any authenticated user to INSERT
CREATE POLICY "Allow all inserts for authenticated users"
ON public.contractor_licenses
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create a policy for selecting
CREATE POLICY "Allow all selects for authenticated users" 
ON public.contractor_licenses
FOR SELECT
USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.contractor_licenses TO authenticated;

-- Verify the policy has been created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'contractor_licenses'; 