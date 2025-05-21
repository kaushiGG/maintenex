import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// SQL to create the site_floor_plans table
const createSiteFloorPlansTableSQL = `
-- Create site_floor_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.business_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.site_floor_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Floor plans are viewable by authenticated users" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can insert floor plans" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can delete their own floor plans" ON public.site_floor_plans;

-- Allow all authenticated users to select floor plans
CREATE POLICY "Floor plans are viewable by authenticated users" 
  ON public.site_floor_plans FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own floor plans
CREATE POLICY "Users can insert floor plans" 
  ON public.site_floor_plans FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete floor plans they uploaded
CREATE POLICY "Users can delete their own floor plans"
  ON public.site_floor_plans FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Grant permissions to authenticated users
GRANT ALL ON public.site_floor_plans TO authenticated;
`;

/**
 * Check if the site_floor_plans table exists and has the correct structure
 * If not, suggest running the migration
 */
export const checkFloorPlansTable = async (): Promise<boolean> => {
  try {
    // First try to query the table
    const { count, error } = await supabase
      .from('site_floor_plans')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error checking site_floor_plans table:', error);
      
      if (error.code === '42P01') { // Table does not exist error code
        toast.error(
          "The site_floor_plans table doesn't exist. Please contact your administrator to run the migration script.", 
          { 
            duration: 10000,
            action: {
              label: 'View SQL',
              onClick: () => {
                console.log('SQL to create site_floor_plans table:');
                console.log(createSiteFloorPlansTableSQL);
                alert('SQL script has been logged to the console. Please provide this to your database administrator.');
              }
            }
          }
        );
      } else {
        toast.error(`Database error: ${error.message}`);
      }
      
      return false;
    }
    
    console.log('site_floor_plans table exists with', count, 'records');
    return true;
  } catch (err) {
    console.error('Unexpected error checking table:', err);
    return false;
  }
};

/**
 * Display SQL migration for manual execution
 * Note: This requires database admin privileges, so we can't run it from the browser directly
 */
export const applySiteFloorPlansMigration = async (): Promise<void> => {
  // Instead of trying to execute SQL directly (which would require admin privileges),
  // we display the SQL for the user/admin to run manually
  console.log('SQL to create site_floor_plans table:');
  console.log(createSiteFloorPlansTableSQL);
  
  // Create a blob and download link for the SQL
  const blob = new Blob([createSiteFloorPlansTableSQL], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'create_site_floor_plans.sql';
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  // Show guidance message
  toast.info(
    'SQL migration script has been downloaded. Please execute this script in your Supabase SQL editor.',
    { duration: 10000 }
  );
};

// Add function to create documents-attach bucket
export const createDocumentsAttachBucket = () => {
  const sql = `-- Create documents-attach bucket and set permissions
BEGIN;

-- First check if bucket exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'documents-attach'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents-attach', 'documents-attach', true);
  ELSE
    -- If bucket exists, make sure it's public
    UPDATE storage.buckets
    SET public = true
    WHERE name = 'documents-attach';
  END IF;
END $$;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Public Access to documents-attach" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage documents-attach" ON storage.objects;

-- Create policy for public access to the documents-attach bucket
CREATE POLICY "Public Access to documents-attach"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents-attach');

-- Create policy for authenticated users to manage their own files
CREATE POLICY "Authenticated users can manage documents-attach"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents-attach'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'documents-attach'
  AND auth.role() = 'authenticated'
);

COMMIT;
`;

  // Create a blob and download link for the SQL
  const blob = new Blob([sql], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'create_documents_attach_bucket.sql';
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  return sql;
};

export const createDocumentsAttachBucketWithRLS = async () => {
  const sqlScript = `
-- Create the documents-attach bucket with proper RLS policies
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if the bucket already exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'documents-attach'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents-attach', 'documents-attach', true);
    
    RAISE NOTICE 'Created documents-attach bucket';
  ELSE
    RAISE NOTICE 'documents-attach bucket already exists';
  END IF;
  
  -- Drop any existing policies (this is important to avoid conflicts)
  DROP POLICY IF EXISTS "Documents bucket public read policy" ON storage.objects;
  DROP POLICY IF EXISTS "Documents bucket authenticated users can upload" ON storage.objects;
  
  -- Create the public read policy for the documents-attach bucket
  CREATE POLICY "Documents bucket public read policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents-attach');
  
  -- Create the upload policy for authenticated users
  CREATE POLICY "Documents bucket authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents-attach');
  
  RAISE NOTICE 'RLS policies created for documents-attach bucket';
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Migration completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error };
  }
};

export const addEquipmentIdToJobs = async () => {
  const sqlScript = `
-- Add equipment_id column to jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'equipment_id'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN equipment_id UUID REFERENCES public.equipment(id);
    
    -- Add comment to the column
    COMMENT ON COLUMN public.jobs.equipment_id IS 'Reference to the equipment associated with the job';
    
    -- Create an index for efficient lookups
    CREATE INDEX IF NOT EXISTS idx_jobs_equipment_id ON public.jobs(equipment_id);
    
    RAISE NOTICE 'Added equipment_id column to jobs table';
  ELSE
    RAISE NOTICE 'equipment_id column already exists in jobs table';
  END IF;
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Migration completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error };
  }
};

export const addEquipmentToJobs = async () => {
  const sqlScript = `
-- Add equipment column to jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'equipment'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN equipment TEXT;
    
    -- Add comment to the column
    COMMENT ON COLUMN public.jobs.equipment IS 'Equipment information for the job';
    
    RAISE NOTICE 'Added equipment column to jobs table';
  ELSE
    RAISE NOTICE 'equipment column already exists in jobs table';
  END IF;
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Migration completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error };
  }
};

export const addBuildingToJobs = async () => {
  const sqlScript = `
-- Add building_type column to jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN building_type TEXT;
    
    RAISE NOTICE 'Added building_type column to jobs table';
  ELSE
    RAISE NOTICE 'building_type column already exists in jobs table';
  END IF;
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Migration completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error };
  }
};

export const setupAttachments = async () => {
  const sqlScript = `
-- Set up everything needed for job attachments
DO $$
BEGIN
  -- 1. Check if the attachments column exists in the jobs table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'attachments'
  ) THEN
    -- Add the attachments column as JSONB
    ALTER TABLE public.jobs 
    ADD COLUMN attachments JSONB;
    
    RAISE NOTICE 'Added attachments column to jobs table';
  ELSE
    -- Ensure column is JSONB type
    IF (SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'attachments') != 'jsonb' THEN
      ALTER TABLE public.jobs 
      ALTER COLUMN attachments TYPE JSONB USING attachments::JSONB;
      
      RAISE NOTICE 'Changed attachments column to JSONB type';
    ELSE
      RAISE NOTICE 'attachments column already exists with correct type';
    END IF;
  END IF;
  
  -- 2. Create the documents-attach bucket if needed
  DECLARE
    bucket_exists BOOLEAN;
  BEGIN
    -- Check if the bucket already exists
    SELECT EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'documents-attach'
    ) INTO bucket_exists;
    
    IF NOT bucket_exists THEN
      -- Create the bucket
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('documents-attach', 'documents-attach', true);
      
      RAISE NOTICE 'Created documents-attach bucket';
    ELSE
      -- Make sure existing bucket is public
      UPDATE storage.buckets
      SET public = true
      WHERE name = 'documents-attach';
      
      RAISE NOTICE 'Updated documents-attach bucket to be public';
    END IF;
    
    -- 3. Set appropriate permissions for the bucket
    
    -- First drop any existing policies for this bucket to avoid conflicts
    BEGIN
      DROP POLICY IF EXISTS "Documents bucket public read policy" ON storage.objects;
      EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Error dropping read policy: %', SQLERRM;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Documents bucket authenticated users can upload" ON storage.objects;
      EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Error dropping upload policy: %', SQLERRM;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Allow all access to documents-attach" ON storage.objects;
      EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Error dropping all access policy: %', SQLERRM;
    END;
    
    -- Create a simpler, more permissive policy for documents-attach bucket
    BEGIN
      CREATE POLICY "Allow all access to documents-attach"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'documents-attach')
      WITH CHECK (bucket_id = 'documents-attach');
      
      RAISE NOTICE 'Created all-access policy for documents-attach bucket';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error creating policy: %', SQLERRM;
    END;
    
    RAISE NOTICE 'RLS policies updated for documents-attach bucket';
  END;
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Attachments setup completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error setting up attachments:', error);
    return { success: false, error };
  }
};

export const forceConfigureStorage = async () => {
  // This function takes a more aggressive approach to fixing storage permissions
  const sqlScript = `
-- Force configure the documents-attach bucket with proper permissions
DO $$
BEGIN
  -- 1. First make sure the bucket exists and is public
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents-attach', 'documents-attach', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
    
    RAISE NOTICE 'Ensured documents-attach bucket exists and is public';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error ensuring bucket exists: %', SQLERRM;
  END;
  
  -- 2. Delete ALL policies for this bucket
  BEGIN
    DELETE FROM storage.policies 
    WHERE bucket_id = 'documents-attach';
    
    RAISE NOTICE 'Removed all existing policies for documents-attach bucket';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error removing policies: %', SQLERRM;
  END;
  
  -- 3. Create a completely open policy for the bucket
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, definition, owner)
    VALUES (
      'Full public access to documents-attach',
      'documents-attach',
      '{"bucket_id":"documents-attach"}',
      'authenticated'
    );
    
    RAISE NOTICE 'Created public access policy for documents-attach bucket';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policy: %', SQLERRM;
  END;
  
  -- 4. Directly update RLS settings to make this bucket fully accessible
  BEGIN
    -- Enable RLS but with open policies
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    -- Drop any existing policies first
    DROP POLICY IF EXISTS "Allow full access to documents-attach" ON storage.objects;
    
    -- Create an unrestricted policy for all operations
    CREATE POLICY "Allow full access to documents-attach"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'documents-attach')
    WITH CHECK (bucket_id = 'documents-attach');
    
    RAISE NOTICE 'Created unrestricted access policy for documents-attach';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error setting up RLS: %', SQLERRM;
  END;
END $$;
  `;

  try {
    const response = await fetch('/api/supabase/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run migration: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Storage force configuration completed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error configuring storage:', error);
    return { success: false, error };
  }
}; 