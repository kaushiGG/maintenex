import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges from environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { operation, bucketName } = req.body;
    
    if (operation === 'add_safety_columns') {
      // SQL query to add safety check columns
      const sql = `
        -- Add safety check columns to equipment table
        ALTER TABLE public.equipment
        ADD COLUMN IF NOT EXISTS safety_frequency text,
        ADD COLUMN IF NOT EXISTS safety_instructions text,
        ADD COLUMN IF NOT EXISTS safety_officer text,
        ADD COLUMN IF NOT EXISTS training_video_url text,
        ADD COLUMN IF NOT EXISTS training_video_name text;
        
        -- Create equipment-videos bucket if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = 'equipment-videos'
          ) THEN
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('equipment-videos', 'equipment-videos', false);
            
            -- Set up RLS policies for the bucket
            INSERT INTO storage.policies (name, bucket_id, permission, definition)
            VALUES 
              ('All users can read', 'equipment-videos', 'SELECT', 'true'),
              ('Authenticated users can upload', 'equipment-videos', 'INSERT', 'auth.role() = \'authenticated\''),
              ('Users can update own objects', 'equipment-videos', 'UPDATE', 'auth.uid() = owner'),
              ('Users can delete own objects', 'equipment-videos', 'DELETE', 'auth.uid() = owner');
          END IF;
        END
        $$;
      `;
      
      // Execute the SQL query
      const { error } = await supabaseAdmin.rpc('pg_execute', { query: sql });
      
      if (error) {
        console.error('Database migration error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ success: true, message: 'Safety check columns added successfully' });
    }
    
    if (operation === 'ensure_bucket') {
      if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
      }
      
      // Use simplified SQL to create bucket
      const sql = `
        -- Create bucket if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM storage.buckets WHERE name = '${bucketName}'
          ) THEN
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('${bucketName}', '${bucketName}', false);
            
            -- Set up simplified RLS policies for the bucket
            INSERT INTO storage.policies (name, bucket_id, permission, definition)
            VALUES 
              ('All users can read', '${bucketName}', 'SELECT', 'true'),
              ('All users can insert', '${bucketName}', 'INSERT', 'true');
          END IF;
        END
        $$;
      `;
      
      // Execute the SQL query
      const { error } = await supabaseAdmin.rpc('pg_execute', { query: sql });
      
      if (error) {
        console.error('Bucket creation error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ success: true, message: `Bucket '${bucketName}' ensured` });
    }
    
    return res.status(400).json({ error: 'Invalid operation' });
  } catch (error) {
    console.error('Unexpected error in safety migration API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 