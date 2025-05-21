# Database Migrations

This directory contains SQL migrations for the Pretance application database.

## Running Migrations

To apply these migrations to your Supabase database:

1. Log in to your Supabase dashboard at [app.supabase.com](https://app.supabase.com)
2. Navigate to your project
3. Go to the SQL Editor section
4. Create a new query
5. Copy the contents of the migration file(s) you want to run
6. Execute the query

## Recent Migrations

### 20250410_create_job_ratings.sql
Creates the job_ratings table for storing client feedback and contractor performance metrics. Also creates a contractor_performance view and functions to calculate performance metrics.

### 20250409_add_normal_image_column.sql
Adds a normal_image column to the thermal_imaging_reports table for storing reference images.

### 20250409052843_create_thermal_imaging_table.sql
Creates the thermal_imaging_reports table for storing thermal imaging analysis data.

### 20240430_add_job_time_tracking.sql
Adds time tracking fields to the jobs table and creates a function to update job status and track time. 