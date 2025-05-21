import { supabase } from '@/lib/supabase';

/**
 * Utility to test the Supabase database connection
 * @returns {Promise<{success: boolean, message: string, tables?: string[]}>}
 */
export async function testDatabaseConnection() {
  try {
    // Try to fetch schema information
    const { data, error } = await supabase
      .from('_tables_info')
      .select('table_name')
      .limit(10);
    
    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
    
    // Test a query to a specific table to ensure it exists
    const { error: siteError } = await supabase
      .from('business_sites')
      .select('count')
      .limit(1);
      
    if (siteError) {
      return {
        success: false,
        message: `Connected to database but 'business_sites' table check failed: ${siteError.message}`
      };
    }
    
    // List all available tables for debugging
    const tables = data?.map(t => t.table_name) || [];
    
    return {
      success: true,
      message: 'Successfully connected to the database and verified schema',
      tables
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error testing connection: ${err.message}`
    };
  }
}

/**
 * Logs current database connection info
 */
export function logDatabaseInfo() {
  console.log('Current Supabase configuration:');
  console.log('- URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('- Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
} 