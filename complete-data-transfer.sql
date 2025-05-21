-- COMPREHENSIVE DATA MIGRATION SCRIPT
-- This script will identify and export ALL tables from your source database

------------------------------------------------
-- PART 1: EXPORT SECTION - Run in source DB --
------------------------------------------------

-- First, let's get a list of all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Now export data from each table (run these separately)

-- Business Sites
SELECT 'BUSINESS_SITES_DATA:', json_agg(t)::text FROM (
  SELECT * FROM business_sites
) t;

-- Contractors
SELECT 'CONTRACTORS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM contractors
) t;

-- Site Contractors
SELECT 'SITE_CONTRACTORS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM site_contractors
) t;

-- Profiles
SELECT 'PROFILES_DATA:', json_agg(t)::text FROM (
  SELECT * FROM profiles
) t;

-- Site Floor Plans
SELECT 'SITE_FLOOR_PLANS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM site_floor_plans
) t;

-- Jobs
SELECT 'JOBS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM jobs
) t;

-- Equipment
SELECT 'EQUIPMENT_DATA:', json_agg(t)::text FROM (
  SELECT * FROM equipment
) t;

-- Invoices
SELECT 'INVOICES_DATA:', json_agg(t)::text FROM (
  SELECT * FROM invoices
) t;

-- Service Areas
SELECT 'SERVICE_AREAS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM service_areas
) t;

-- Site Requirements
SELECT 'SITE_REQUIREMENTS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM site_requirements
) t;

-- Users (if accessible)
SELECT 'USERS_DATA:', json_agg(t)::text FROM (
  SELECT * FROM auth.users
) t;

-- Add additional tables as needed
-- Format:
-- SELECT 'TABLE_NAME_DATA:', json_agg(t)::text FROM (SELECT * FROM table_name) t;

------------------------------------------------
-- PART 2: IMPORT SECTION - Run in target DB --
------------------------------------------------
-- After running Part 1, replace each [PASTE_X_DATA_HERE] placeholder with 
-- the corresponding JSON data from the export

-- Business Sites
DO $$
BEGIN
  INSERT INTO business_sites
  SELECT * FROM json_populate_recordset(null::business_sites, 
  '[PASTE_BUSINESS_SITES_DATA_HERE]'::json);
  RAISE NOTICE 'Imported business_sites data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing business_sites: %', SQLERRM;
END $$;

-- Contractors
DO $$
BEGIN
  INSERT INTO contractors
  SELECT * FROM json_populate_recordset(null::contractors, 
  '[PASTE_CONTRACTORS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported contractors data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing contractors: %', SQLERRM;
END $$;

-- Site Contractors
DO $$
BEGIN
  INSERT INTO site_contractors
  SELECT * FROM json_populate_recordset(null::site_contractors, 
  '[PASTE_SITE_CONTRACTORS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported site_contractors data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing site_contractors: %', SQLERRM;
END $$;

-- Profiles
DO $$
BEGIN
  INSERT INTO profiles
  SELECT * FROM json_populate_recordset(null::profiles, 
  '[PASTE_PROFILES_DATA_HERE]'::json);
  RAISE NOTICE 'Imported profiles data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing profiles: %', SQLERRM;
END $$;

-- Site Floor Plans
DO $$
BEGIN
  INSERT INTO site_floor_plans
  SELECT * FROM json_populate_recordset(null::site_floor_plans, 
  '[PASTE_SITE_FLOOR_PLANS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported site_floor_plans data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing site_floor_plans: %', SQLERRM;
END $$;

-- Jobs
DO $$
BEGIN
  INSERT INTO jobs
  SELECT * FROM json_populate_recordset(null::jobs, 
  '[PASTE_JOBS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported jobs data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing jobs: %', SQLERRM;
END $$;

-- Equipment
DO $$
BEGIN
  INSERT INTO equipment
  SELECT * FROM json_populate_recordset(null::equipment, 
  '[PASTE_EQUIPMENT_DATA_HERE]'::json);
  RAISE NOTICE 'Imported equipment data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing equipment: %', SQLERRM;
END $$;

-- Invoices
DO $$
BEGIN
  INSERT INTO invoices
  SELECT * FROM json_populate_recordset(null::invoices, 
  '[PASTE_INVOICES_DATA_HERE]'::json);
  RAISE NOTICE 'Imported invoices data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing invoices: %', SQLERRM;
END $$;

-- Service Areas
DO $$
BEGIN
  INSERT INTO service_areas
  SELECT * FROM json_populate_recordset(null::service_areas, 
  '[PASTE_SERVICE_AREAS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported service_areas data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing service_areas: %', SQLERRM;
END $$;

-- Site Requirements
DO $$
BEGIN
  INSERT INTO site_requirements
  SELECT * FROM json_populate_recordset(null::site_requirements, 
  '[PASTE_SITE_REQUIREMENTS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported site_requirements data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing site_requirements: %', SQLERRM;
END $$;

-- Users (this may fail due to permissions, you might need to handle auth.users separately)
DO $$
BEGIN
  INSERT INTO auth.users
  SELECT * FROM json_populate_recordset(null::auth.users, 
  '[PASTE_USERS_DATA_HERE]'::json);
  RAISE NOTICE 'Imported users data';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error importing users: %', SQLERRM;
END $$;

-- Add import blocks for additional tables as needed 