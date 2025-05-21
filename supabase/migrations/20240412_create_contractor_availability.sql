-- Create the contractor_availability table
CREATE TABLE IF NOT EXISTS contractor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    monday BOOLEAN DEFAULT true,
    tuesday BOOLEAN DEFAULT true,
    wednesday BOOLEAN DEFAULT true,
    thursday BOOLEAN DEFAULT true,
    friday BOOLEAN DEFAULT true,
    saturday BOOLEAN DEFAULT false,
    sunday BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on owner_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_contractor_availability_owner_id ON contractor_availability(owner_id);

-- Set up Row Level Security (RLS)
ALTER TABLE contractor_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own availability"
    ON contractor_availability FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own availability"
    ON contractor_availability FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own availability"
    ON contractor_availability FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractor_availability_updated_at
    BEFORE UPDATE ON contractor_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 