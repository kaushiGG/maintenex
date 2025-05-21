-- Create contractor_licenses table
CREATE TABLE IF NOT EXISTS contractor_licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE contractor_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses"
  ON contractor_licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own licenses"
  ON contractor_licenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own licenses"
  ON contractor_licenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own licenses"
  ON contractor_licenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contractor_licenses_updated_at
  BEFORE UPDATE ON contractor_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 