-- Update contractor_insurance table
ALTER TABLE contractor_insurance
ADD COLUMN IF NOT EXISTS coverage TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ALTER COLUMN notes DROP NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own insurance" ON contractor_insurance;
DROP POLICY IF EXISTS "Users can insert their own insurance" ON contractor_insurance;
DROP POLICY IF EXISTS "Users can update their own insurance" ON contractor_insurance;
DROP POLICY IF EXISTS "Users can delete their own insurance" ON contractor_insurance;

CREATE POLICY "Users can view their own insurance"
  ON contractor_insurance FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own insurance"
  ON contractor_insurance FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own insurance"
  ON contractor_insurance FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own insurance"
  ON contractor_insurance FOR DELETE
  USING (auth.uid() = owner_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contractor_insurance_updated_at ON contractor_insurance;
CREATE TRIGGER update_contractor_insurance_updated_at
  BEFORE UPDATE ON contractor_insurance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 