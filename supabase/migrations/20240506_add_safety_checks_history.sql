-- Add safety_checks history table to track safety checks performed by employees
CREATE TABLE IF NOT EXISTS public.safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES auth.users(id),
    performed_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    check_data JSONB, -- Stores the detailed safety check data including all check items
    status TEXT, -- 'passed' or 'issues-found'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add safety status columns to equipment table if they don't exist
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS last_safety_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS safety_status TEXT,
ADD COLUMN IF NOT EXISTS safety_notes TEXT;

-- Add RLS policies for the safety_checks table
ALTER TABLE public.safety_checks ENABLE ROW LEVEL SECURITY;

-- Policy for business users (can view and modify all safety checks)
CREATE POLICY business_safety_checks_access
ON public.safety_checks
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'business'
    )
);

-- Policy for employees to view all and insert their own safety checks
CREATE POLICY employee_safety_checks_read
ON public.safety_checks
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'employee'
    )
);

CREATE POLICY employee_safety_checks_insert
ON public.safety_checks
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'employee'
    )
    AND
    performed_by = auth.uid()
);

-- Add function to get latest safety checks for equipment
CREATE OR REPLACE FUNCTION get_latest_safety_checks(equipment_ids UUID[])
RETURNS TABLE (
    equipment_id UUID,
    last_check_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    performed_by_name TEXT,
    performed_by_id UUID
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_checks AS (
        SELECT 
            sc.equipment_id,
            sc.performed_date,
            sc.status,
            sc.performed_by,
            ROW_NUMBER() OVER (PARTITION BY sc.equipment_id ORDER BY sc.performed_date DESC) as rn
        FROM 
            safety_checks sc
        WHERE 
            sc.equipment_id = ANY(equipment_ids)
    )
    SELECT 
        lc.equipment_id,
        lc.performed_date,
        lc.status,
        COALESCE(p.first_name || ' ' || p.last_name, 'Unknown User') as performed_by_name,
        lc.performed_by
    FROM 
        latest_checks lc
    LEFT JOIN 
        profiles p ON lc.performed_by = p.id
    WHERE 
        lc.rn = 1;
END;
$$ LANGUAGE plpgsql; 