-- Create a function to help debug contractor relationships
CREATE OR REPLACE FUNCTION public.get_debug_contractor_info(user_id_param UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Get the current auth user ID for comparison
  result = jsonb_build_object(
    'current_auth_uid', (SELECT auth.uid()),
    'passed_user_id', user_id_param,
    'user_matches_auth', (user_id_param = auth.uid())
  );
  
  -- Get contractor info
  result = result || jsonb_build_object(
    'contractors', (
      SELECT jsonb_agg(row_to_json(c))
      FROM contractors c
      WHERE c.owner_id = user_id_param
    )
  );
  
  -- Get profile info
  result = result || jsonb_build_object(
    'profile', (
      SELECT row_to_json(p)
      FROM profiles p
      WHERE p.id = user_id_param
    )
  );
  
  -- Check RLS policies
  result = result || jsonb_build_object(
    'rls_policies', (
      SELECT jsonb_agg(row_to_json(pol))
      FROM pg_policies pol
      WHERE pol.tablename = 'contractor_licenses'
    )
  );
  
  -- Get direct access check
  result = result || jsonb_build_object(
    'can_select', (
      SELECT count(*) > 0
      FROM pg_policies pol
      WHERE pol.tablename = 'contractor_licenses'
      AND pol.cmd = 'SELECT'
      AND auth.uid() = user_id_param
    ),
    'can_insert', (
      SELECT count(*) > 0 
      FROM pg_policies pol
      WHERE pol.tablename = 'contractor_licenses'
      AND pol.cmd = 'INSERT'
      AND auth.uid() = user_id_param
    )
  );
  
  RETURN result;
END;
$$;

-- Test the function
SELECT get_debug_contractor_info(auth.uid()); 