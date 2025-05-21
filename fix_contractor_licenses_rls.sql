-- Check if RLS is enabled on the contractor_licenses table
SELECT relname, relrowsecurity 
FROM pg_class
WHERE relname = 'contractor_licenses';

-- Enable RLS for the table if not already enabled
ALTER TABLE public.contractor_licenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Contractors can view their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can insert their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can update their own licenses" ON public.contractor_licenses;
DROP POLICY IF EXISTS "Contractors can delete their own licenses" ON public.contractor_licenses;

-- Create new policies for each operation
-- SELECT: contractors can view licenses for contractors they own
CREATE POLICY "Contractors can view their own licenses" 
ON public.contractor_licenses 
FOR SELECT 
USING (
  contractor_id IN (
    SELECT id FROM contractors WHERE owner_id = auth.uid()
  )
);

-- INSERT: contractors can insert licenses for contractors they own
CREATE POLICY "Contractors can insert their own licenses" 
ON public.contractor_licenses 
FOR INSERT 
WITH CHECK (
  contractor_id IN (
    SELECT id FROM contractors WHERE owner_id = auth.uid()
  )
);

-- UPDATE: contractors can update licenses for contractors they own
CREATE POLICY "Contractors can update their own licenses" 
ON public.contractor_licenses 
FOR UPDATE 
USING (
  contractor_id IN (
    SELECT id FROM contractors WHERE owner_id = auth.uid()
  )
);

-- DELETE: contractors can delete licenses for contractors they own
CREATE POLICY "Contractors can delete their own licenses" 
ON public.contractor_licenses 
FOR DELETE 
USING (
  contractor_id IN (
    SELECT id FROM contractors WHERE owner_id = auth.uid()
  )
);

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