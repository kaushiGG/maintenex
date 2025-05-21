
ALTER TABLE jobs 
ALTER COLUMN assigned_to TYPE text USING assigned_to::text;
