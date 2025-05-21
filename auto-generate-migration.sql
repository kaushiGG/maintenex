-- AUTO-GENERATE MIGRATION SCRIPT
-- This script will automatically generate export and import SQL statements for ALL tables

-- Step 1: Run this in your source database to generate export commands for all tables
SELECT 
  'SELECT ''EXPORT_' || table_name || '_DATA:'', json_agg(t)::text FROM (SELECT * FROM ' || table_name || ') t;' AS export_command
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
  table_name;

-- Step 2: Run this in your target database to generate import commands for all tables
-- After you've created the tables structure
SELECT 
  'DO $$ BEGIN ' ||
  'INSERT INTO ' || table_name || ' ' ||
  'SELECT * FROM json_populate_recordset(null::' || table_name || ', ' ||
  '''[PASTE_' || UPPER(table_name) || '_DATA_HERE]''::json); ' ||
  'RAISE NOTICE ''Imported ' || table_name || ' data''; ' ||
  'EXCEPTION WHEN OTHERS THEN ' ||
  'RAISE NOTICE ''Error importing ' || table_name || ': %'', SQLERRM; ' ||
  'END $$;' AS import_command
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
  table_name;

-- Special case for auth.users (if needed)
-- Note: This likely requires admin privileges and special handling
SELECT 
  'DO $$ BEGIN ' ||
  'INSERT INTO auth.users ' ||
  'SELECT * FROM json_populate_recordset(null::auth.users, ' ||
  '''[PASTE_USERS_DATA_HERE]''::json); ' ||
  'RAISE NOTICE ''Imported auth.users data''; ' ||
  'EXCEPTION WHEN OTHERS THEN ' ||
  'RAISE NOTICE ''Error importing auth.users: %'', SQLERRM; ' ||
  'END $$;' AS import_command_users; 