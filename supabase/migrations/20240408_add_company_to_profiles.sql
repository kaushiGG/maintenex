-- Add company field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;

-- Update existing profiles to have empty company field if NULL
UPDATE profiles SET company = '' WHERE company IS NULL;

-- Verify the changes
SELECT id, first_name, last_name, email, company FROM profiles LIMIT 5; 