-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  is_safety_officer BOOLEAN DEFAULT false,
  invitation_type TEXT NOT NULL DEFAULT 'employee',
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  token UUID NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email and token
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations(email);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations(token);

-- Add RLS policies for invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- First drop existing policies if they exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invitations' AND policyname = 'Business users can create invitations'
    ) THEN
        DROP POLICY "Business users can create invitations" ON public.invitations;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invitations' AND policyname = 'Business users can view their invitations'
    ) THEN
        DROP POLICY "Business users can view their invitations" ON public.invitations;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invitations' AND policyname = 'Business users can update their invitations'
    ) THEN
        DROP POLICY "Business users can update their invitations" ON public.invitations;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invitations' AND policyname = 'Employees can verify their invitation token'
    ) THEN
        DROP POLICY "Employees can verify their invitation token" ON public.invitations;
    END IF;
END
$$;

-- Create policy to allow business users to create invitations
CREATE POLICY "Business users can create invitations" ON public.invitations 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'business'
    )
  );

-- Create policy to allow business users to view invitations they created
CREATE POLICY "Business users can view their invitations" ON public.invitations 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'business'
    )
  );

-- Create policy to allow business users to update their invitations
CREATE POLICY "Business users can update their invitations" ON public.invitations 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'business'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'business'
    )
  );

-- Create policy for employees to retrieve invitation by token
CREATE POLICY "Employees can verify their invitation token" ON public.invitations 
  FOR SELECT TO anon 
  USING (
    true
  );

-- Create function to update timestamp on update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS invitations_updated_at ON public.invitations;
CREATE TRIGGER invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 