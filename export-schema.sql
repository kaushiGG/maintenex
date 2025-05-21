-- Export the current schema
-- This can be run in the Supabase SQL Editor
-- It will create a full schema representation of your database

-- Switch to the public schema
SET search_path TO public;

-- Output the schema creation commands
SELECT 
  (SELECT string_agg(
    'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(nspname) || ';', 
    E'\n'
  ) FROM pg_namespace 
  WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast') 
    AND nspname NOT LIKE 'pg_%'
  ) AS schemas,
  
  (SELECT string_agg(
    pg_get_createfunction_command(p.oid), 
    E'\n\n'
  ) FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') 
    AND n.nspname NOT LIKE 'pg_%'
  ) AS functions,
  
  (SELECT string_agg(
    pg_get_viewdef(c.oid, true), 
    E';\n\n'
  ) || ';' FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'v'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND n.nspname NOT LIKE 'pg_%'
  ) AS views;

-- Export table definitions with comments
SELECT 
  'CREATE TABLE IF NOT EXISTS ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || ' (' ||
  string_agg(
    quote_ident(column_name) || ' ' || 
    data_type || 
    CASE WHEN character_maximum_length IS NOT NULL
         THEN '(' || character_maximum_length || ')'
         ELSE '' END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
    ', '
  ) ||
  CASE WHEN (SELECT count(*) FROM information_schema.table_constraints tc
             WHERE tc.table_schema = schemaname
               AND tc.table_name = tablename
               AND tc.constraint_type = 'PRIMARY KEY') > 0
        THEN ', PRIMARY KEY (' || 
             (SELECT string_agg(quote_ident(column_name), ', ')
              FROM information_schema.key_column_usage kcu
              JOIN information_schema.table_constraints tc
                ON kcu.constraint_name = tc.constraint_name
               AND kcu.table_schema = tc.table_schema
               AND kcu.table_name = tc.table_name
              WHERE tc.table_schema = schemaname
                AND tc.table_name = tablename
                AND tc.constraint_type = 'PRIMARY KEY') || ')'
        ELSE '' END ||
  ');'
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema') 
  AND table_schema NOT LIKE 'pg_%'
GROUP BY schemaname, tablename;

-- Export policies
SELECT 'CREATE POLICY ' || 
       quote_ident(policyname) || 
       ' ON ' || 
       quote_ident(schemaname) || '.' || quote_ident(tablename) || 
       ' FOR ' || operation || 
       CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END || 
       CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END || 
       ';'
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND schemaname NOT LIKE 'pg_%';

-- Export RLS settings
SELECT 'ALTER TABLE ' || 
       quote_ident(schemaname) || '.' || quote_ident(tablename) || 
       CASE WHEN rowsecurity THEN ' ENABLE ROW LEVEL SECURITY;' 
            ELSE ' DISABLE ROW LEVEL SECURITY;' END
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND schemaname NOT LIKE 'pg_%';

-- Export indexes
SELECT pg_get_indexdef(indexrelid) || ';'
FROM pg_index i
JOIN pg_class idx ON idx.oid = i.indexrelid
JOIN pg_class tbl ON tbl.oid = i.indrelid
JOIN pg_namespace n ON n.oid = tbl.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_%';

-- Export table privileges
SELECT 'GRANT ' || 
       string_agg(privilege_type, ', ') || 
       ' ON TABLE ' || 
       quote_ident(table_schema) || '.' || quote_ident(table_name) || 
       ' TO ' || grantee || ';'
FROM information_schema.table_privileges
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_schema NOT LIKE 'pg_%'
GROUP BY table_schema, table_name, grantee; 