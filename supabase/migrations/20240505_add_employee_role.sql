-- Update the user creation trigger to handle employee users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, user_type, is_approved)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'user_type', 
        CASE 
            WHEN new.raw_user_meta_data->>'user_type' = 'business' THEN TRUE
            WHEN new.raw_user_meta_data->>'user_type' = 'employee' THEN FALSE
            ELSE FALSE -- contractors default to false
        END);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new table to store employee-specific information
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    department TEXT,
    position TEXT,
    manager_id UUID REFERENCES auth.users(id),
    hire_date TIMESTAMP WITH TIME ZONE,
    employee_id TEXT,
    access_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy for business users (can view and modify all employees)
CREATE POLICY business_employee_access
ON public.employees
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'business'
    )
);

-- Policy for employee to view their own record
CREATE POLICY employee_self_access
ON public.employees
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
);

-- Make sure business admins can approve employee accounts
CREATE OR REPLACE FUNCTION approve_employee(employee_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_user_type TEXT;
BEGIN
    -- Check if the current user is a business user
    SELECT user_type INTO admin_user_type
    FROM profiles
    WHERE id = auth.uid();
    
    IF admin_user_type = 'business' THEN
        -- Update the employee's profile to approved
        UPDATE profiles
        SET is_approved = TRUE
        WHERE id = employee_profile_id
        AND user_type = 'employee';
        
        RETURN FOUND;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 