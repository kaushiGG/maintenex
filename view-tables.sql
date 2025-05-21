-- View all tables in the database with their row counts

SELECT
    schemaname || '.' || tablename AS table_full_name,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = schemaname AND table_name = tablename) AS column_count,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = pg_policies.schemaname 
            AND tablename = pg_policies.tablename
        ) THEN 'Yes'
        ELSE 'No'
    END AS has_rls_policies,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = pg_indexes.schemaname
            AND tablename = pg_indexes.tablename
        ) THEN 'Yes'
        ELSE 'No'
    END AS has_indexes,
    -- Approximate row count using pg_class statistics
    (SELECT reltuples::bigint 
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = schemaname
     AND c.relname = tablename) AS approx_row_count
FROM 
    pg_tables
WHERE 
    schemaname NOT IN ('pg_catalog', 'information_schema')
    AND schemaname NOT LIKE 'pg_%'
ORDER BY 
    schemaname, tablename; 