-- Query the structure of the contractor_licenses table
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable, 
    character_maximum_length
FROM 
    information_schema.columns 
WHERE 
    table_name = 'contractor_licenses'
ORDER BY 
    ordinal_position;

-- Check if provider column exists and its constraints
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    consrc AS constraint_definition,
    conrelid::regclass AS table_name
FROM
    pg_constraint
WHERE
    conrelid = 'contractor_licenses'::regclass
AND
    contype = 'c'; -- 'c' for check constraints

-- Show which constraints apply to the provider column
SELECT
    pg_get_constraintdef(con.oid) AS constraint_definition,
    con.conname AS constraint_name,
    col.attname AS column_name
FROM
    pg_constraint con
JOIN
    pg_attribute col ON col.attrelid = con.conrelid AND col.attnum = ANY(con.conkey)
WHERE
    con.conrelid = 'contractor_licenses'::regclass
AND
    col.attname = 'provider'; 