// Database Clone Script
// This script provides instructions for cloning schemas from one Supabase database to another

console.log(`
==============================================
  SUPABASE DATABASE CLONING INSTRUCTIONS
==============================================

Follow these steps to clone your database schema:

1. Log in to the Supabase dashboard (https://app.supabase.com)

2. Go to your source project (qdbfcqwbmrhgnaoqwnkp - MaintenX)

3. Navigate to the SQL Editor section

4. Create a new query with the following SQL to export your schema:
   \$ cat > schema.sql

5. Run the query and download the SQL file that contains your schema

6. Go to your target project (opgqrdltnngkhjymgmmy - Maintenex)

7. Navigate to the SQL Editor section

8. Create a new query and upload/paste the schema SQL file you downloaded

9. Run the SQL file to create all tables, functions, and policies

Alternative Method (Using Supabase CLI):
----------------------------------------

If you have access to the database password, you can use these commands:

# Connect to source database and dump schema
pg_dump -h db.qdbfcqwbmrhgnaoqwnkp.supabase.co -U postgres -d postgres -s > schema.sql

# Connect to target database and restore schema
psql -h db.opgqrdltnngkhjymgmmy.supabase.co -U postgres -d postgres -f schema.sql

You'll be prompted for the database password for each command.

Note: These instructions only clone the database structure (tables, functions, triggers, etc.).
Data migration should be handled separately if needed.
`); 