-- First, ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the safety_checks table to store safety check history
CREATE TABLE IF NOT EXISTS public.safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES auth.users(id),
    performed_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    check_data JSONB NOT NULL, -- Stores check items, notes, and other details
    status TEXT NOT NULL, -- 'passed' or 'issues-found'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for common query patterns
CREATE INDEX IF NOT EXISTS idx_safety_checks_equipment_id ON public.safety_checks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_safety_checks_performed_by ON public.safety_checks(performed_by);
CREATE INDEX IF NOT EXISTS idx_safety_checks_status ON public.safety_checks(status);
CREATE INDEX IF NOT EXISTS idx_safety_checks_performed_date ON public.safety_checks(performed_date);

-- Add last_safety_check column to equipment table if not exists
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS last_safety_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS safety_status TEXT,
ADD COLUMN IF NOT EXISTS safety_notes TEXT;

-- Enable Row Level Security
ALTER TABLE public.safety_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for different user types
-- Allow authenticated users to view safety checks
CREATE POLICY "Users can view safety checks" 
ON public.safety_checks FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to insert their own safety checks
CREATE POLICY "Users can insert their own safety checks" 
ON public.safety_checks FOR INSERT 
TO authenticated 
WITH CHECK (performed_by = auth.uid());

-- Only allow the user who performed the check or admins to update
CREATE POLICY "Users can update their own safety checks" 
ON public.safety_checks FOR UPDATE 
TO authenticated 
USING (
    performed_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND 
        (profiles.user_type = 'business' OR profiles.user_type = 'admin')
    )
);

-- Comments for documentation
COMMENT ON TABLE public.safety_checks IS 'Stores safety check history for equipment';
COMMENT ON COLUMN public.safety_checks.check_data IS 'JSON data containing check items, notes, and other details';
COMMENT ON COLUMN public.safety_checks.status IS 'Status of the safety check: passed or issues-found'; 