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
    // Check if the request body contains a SQL query
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }
    
    // Execute the SQL query using the pg_execute function
    const { data, error } = await supabaseAdmin.rpc('pg_execute', { query: sql });
    
    if (error) {
      console.error('Error executing SQL query:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in run-sql API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 