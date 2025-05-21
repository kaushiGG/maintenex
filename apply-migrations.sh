#!/bin/bash

# Script to apply the invitation status update migration

# Credentials - these should be provided by the user
SUPABASE_URL=${1:-""}
SUPABASE_KEY=${2:-""}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Usage: ./apply-migrations.sh <SUPABASE_URL> <SUPABASE_SERVICE_ROLE_KEY>"
  echo "Example: ./apply-migrations.sh db.abcdefghijklm.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

# Database connection parameters
DB_HOST=$(echo $SUPABASE_URL | sed 's/https:\/\///g')
DB_USER="postgres"
DB_NAME="postgres"

echo "Applying migration: 20240508_update_invitations_on_approval.sql"

# Apply the migration using PSQL
PGPASSWORD=$SUPABASE_KEY psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f supabase/migrations/20240508_update_invitations_on_approval.sql

if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
  echo "The system will now automatically update employee invitation status to 'approved' when the corresponding profile is approved."
else
  echo "Error applying migration. Please check your credentials and try again."
  echo "Alternatively, you can apply the migration manually. See apply-migrations-via-dashboard.md for instructions."
fi 