-- Check current user ID 
SELECT auth.uid() as current_user_id;

-- Check if there are any contractors owned by the current user
SELECT id, owner_id, company_name, status 
FROM contractors 
WHERE owner_id = auth.uid();

-- Check existing license records
SELECT id, contractor_id, license_type
FROM contractor_licenses
LIMIT 10;

-- Test the RLS policy logic directly
SELECT contractor_id IN (
  SELECT id FROM contractors WHERE owner_id = auth.uid()
) as has_permission
FROM (SELECT 'your-contractor-id-here'::uuid as contractor_id) as test;

-- Debug RLS policies on the contractor_licenses table
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