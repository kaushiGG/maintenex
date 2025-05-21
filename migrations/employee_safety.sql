-- Employee management table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  department TEXT,
  is_safety_officer BOOLEAN DEFAULT false,
  manager_id UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add safety manager field to equipment table
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS safety_manager_id UUID REFERENCES employees(id);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS authorized_officers UUID[] DEFAULT '{}';
