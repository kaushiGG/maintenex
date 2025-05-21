-- SQL to add the notes column to contractor_licenses table

-- First check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contractor_licenses' 
    AND column_name = 'notes'
  ) THEN
    -- Add the notes column
    ALTER TABLE public.contractor_licenses 
    ADD COLUMN notes TEXT;
    
    RAISE NOTICE 'Added notes column to contractor_licenses table';
  ELSE
    RAISE NOTICE 'notes column already exists in contractor_licenses table';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'contractor_licenses'
ORDER BY ordinal_position; 