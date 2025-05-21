-- Script to import data
-- Replace the JSON values with the exported data from your old database

-- Business Sites
INSERT INTO business_sites
SELECT * FROM json_populate_recordset(null::business_sites, 
'[PASTE_BUSINESS_SITES_JSON_HERE]'::json);

-- Contractors
INSERT INTO contractors
SELECT * FROM json_populate_recordset(null::contractors, 
'[PASTE_CONTRACTORS_JSON_HERE]'::json);

-- Site Contractors
INSERT INTO site_contractors
SELECT * FROM json_populate_recordset(null::site_contractors, 
'[PASTE_SITE_CONTRACTORS_JSON_HERE]'::json);

-- Profiles
INSERT INTO profiles
SELECT * FROM json_populate_recordset(null::profiles, 
'[PASTE_PROFILES_JSON_HERE]'::json);

-- Site Floor Plans
INSERT INTO site_floor_plans
SELECT * FROM json_populate_recordset(null::site_floor_plans, 
'[PASTE_SITE_FLOOR_PLANS_JSON_HERE]'::json); 