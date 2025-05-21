#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Database Direct Cloning Script"
echo "-----------------------------"
echo

# Source and target database details
SOURCE_DB_HOST="db.qdbfcqwbmrhgnaoqwnkp.supabase.co"
TARGET_DB_HOST="db.opgqrdltnngkhjymgmmy.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"

# Create a temporary directory for database dumps
TEMP_DIR="./db_migration_temp"
mkdir -p $TEMP_DIR

echo "Step 1: Dumping schema from source database..."
echo "Please enter the source database password when prompted."
PGPASSWORD=$(read -s -p "Source Database Password: " password && echo "$password")
export PGPASSWORD

pg_dump -h "$SOURCE_DB_HOST" -U "$DB_USER" -d "$DB_NAME" -s > "$TEMP_DIR/schema.sql"

echo -e "\nSchema successfully dumped to $TEMP_DIR/schema.sql"

echo "Step 2: Applying schema to target database..."
echo "Please enter the target database password when prompted."
PGPASSWORD=$(read -s -p "Target Database Password: " password && echo "$password")
export PGPASSWORD

psql -h "$TARGET_DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$TEMP_DIR/schema.sql"

echo -e "\nSchema successfully applied to target database!"

echo "Step 3: Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Database schema successfully cloned!"
echo "Note: This script only clones the database schema (tables, functions, triggers, etc.)."
echo "Data migration should be handled separately if needed." 