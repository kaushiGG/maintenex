-- Check the schema of the invitations table
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM 
  information_schema.columns
WHERE 
  table_name = 'invitations'
ORDER BY 
  ordinal_position; 