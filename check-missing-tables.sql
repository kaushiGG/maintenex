-- TABLE COMPARISON SCRIPT
-- This script will help you identify tables that exist in the old database but not in the new one

-- Step 1: Run this in your source database (qdbfcqwbmrhgnaoqwnkp)
-- Export the result as CSV
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) AS column_count,
       'SOURCE' as database
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Step 2: Run this in your target database (opgqrdltnngkhjymgmmy)
-- Export the result as CSV
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) AS column_count,
       'TARGET' as database
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Step 3: Run this in your target database to create missing tables
-- First, get a list of all tables and their create statements from source database
-- Then run the CREATE TABLE statements for missing tables in the target database

-- Create statement for auth.users (requires admin privileges)
SELECT 'CREATE TABLE IF NOT EXISTS auth.users (' ||
  string_agg(
    column_name || ' ' || 
    data_type || 
    CASE WHEN character_maximum_length IS NOT NULL
         THEN '(' || character_maximum_length || ')'
         ELSE '' END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
    ', '
  ) ||
  ');'
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
GROUP BY table_schema, table_name; 