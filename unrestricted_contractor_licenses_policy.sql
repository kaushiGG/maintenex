-- WARNING: This policy is more permissive and should only be used for testing!
-- Be sure to revert to more restrictive policies in production

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Contractors can view their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can insert their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can update their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can delete their own licenses" ON public.contractor_licenses;

-- Create unrestricted policies for testing
-- SELECT: All users can view any license
CREATE POLICY "Anyone can view licenses" 
ON public.contractor_licenses 
FOR SELECT USING (true);

-- INSERT: All authenticated users can insert licenses
CREATE POLICY "Anyone can insert licenses" 
ON public.contractor_licenses 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: All authenticated users can update licenses
CREATE POLICY "Anyone can update licenses" 
ON public.contractor_licenses 
FOR UPDATE USING (auth.role() = 'authenticated');

-- DELETE: All authenticated users can delete licenses
CREATE POLICY "Anyone can delete licenses" 
ON public.contractor_licenses 
FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.contractor_licenses TO authenticated;

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'contractor_licenses'; 