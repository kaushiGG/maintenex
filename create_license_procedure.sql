-- Create a stored procedure to insert a new license that bypasses RLS
CREATE OR REPLACE FUNCTION public.insert_contractor_license(
  p_contractor_id UUID,
  p_license_type TEXT,
  p_license_number TEXT,
  p_issuing_authority TEXT,
  p_issue_date DATE,
  p_expiry_date DATE,
  p_status TEXT DEFAULT 'active',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator, bypassing RLS
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- First check if the contractor exists
  IF NOT EXISTS (SELECT 1 FROM contractors WHERE id = p_contractor_id) THEN
    RAISE EXCEPTION 'Contractor with ID % does not exist', p_contractor_id;
  END IF;

  -- Insert the license
  INSERT INTO public.contractor_licenses(
    contractor_id,
    license_type,
    license_number,
    issuing_authority,
    issue_date,
    expiry_date,
    status,
    notes
  ) VALUES (
    p_contractor_id,
    p_license_type,
    p_license_number,
    p_issuing_authority,
    p_issue_date,
    p_expiry_date,
    p_status,
    p_notes
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_contractor_license TO authenticated;

-- Example of how to use the function (commented out)
-- SELECT insert_contractor_license(
--   'edfec1d9-a2a8-419e-b135-6050c9f8a381',  -- contractor_id
--   'Electrical License',                    -- license_type
--   'EL123456',                             -- license_number
--   'State Electrical Board',               -- issuing_authority
--   '2023-01-01',                           -- issue_date
--   '2025-01-01',                           -- expiry_date
--   'active',                               -- status
--   'Sample notes'                          -- notes
-- ); 