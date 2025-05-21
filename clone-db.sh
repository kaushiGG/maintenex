#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Database Cloning Script"
echo "----------------------"
echo

# Source database details
SOURCE_DB_URL="qdbfcqwbmrhgnaoqwnkp"
TARGET_DB_URL="opgqrdltnngkhjymgmmy"

# Create a temporary directory for database dumps
TEMP_DIR="./db_migration_temp"
mkdir -p $TEMP_DIR

echo "Step 1: Installing necessary tools..."
# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo "pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

echo "Step 2: Getting database connection information..."
# We'll use the Supabase CLI to get connection info
SOURCE_DB_INFO=$(supabase db connect --project-ref $SOURCE_DB_URL)
TARGET_DB_INFO=$(supabase db connect --project-ref $TARGET_DB_URL)

# Parse connection strings
SOURCE_CONNECTION=$(echo "$SOURCE_DB_INFO" | grep "postgresql://" | head -n 1)
TARGET_CONNECTION=$(echo "$TARGET_DB_INFO" | grep "postgresql://" | head -n 1)

if [ -z "$SOURCE_CONNECTION" ] || [ -z "$TARGET_CONNECTION" ]; then
    echo "Failed to get database connection strings. Please make sure you're logged in to Supabase CLI."
    exit 1
fi

echo "Step 3: Dumping schema from source database..."
pg_dump -s -d "$SOURCE_CONNECTION" -f "$TEMP_DIR/schema.sql"

echo "Step 4: Creating essential tables in the target database..."
psql -d "$TARGET_CONNECTION" -c "SELECT 1;" > /dev/null 2>&1 || {
    echo "Failed to connect to target database."
    exit 1
}

echo "Step 5: Applying schema to target database..."
psql -d "$TARGET_CONNECTION" -f "$TEMP_DIR/schema.sql"

echo "Step 6: Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Database schema successfully cloned!"
echo "Note: This script only clones the database schema (tables, functions, triggers, etc.)."
echo "Data migration should be handled separately if needed." 