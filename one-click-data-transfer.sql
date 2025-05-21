-- IMPORTANT NOTE:
-- This script contains two parts:
-- 1. EXPORT section - Run this in your source database (qdbfcqwbmrhgnaoqwnkp)
-- 2. IMPORT section - Copy the output from part 1 and replace placeholders in this section
--    then run it in your target database (opgqrdltnngkhjymgmmy)

------------------------------------------------
-- PART 1: EXPORT SECTION - Run in source DB --
------------------------------------------------

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