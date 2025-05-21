-- SQL script to update the equipment table constraints
-- This drops the old foreign key constraint to the employees table
-- and adds a new one that references the profiles table instead

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE equipment 
DROP CONSTRAINT IF EXISTS equipment_safety_manager_id_fkey;

-- Step 2: Add new foreign key constraint that points to profiles table
ALTER TABLE equipment
ADD CONSTRAINT equipment_safety_manager_id_fkey
FOREIGN KEY (safety_manager_id) 
REFERENCES profiles(id);

-- Step 3: If the authorized_officers column also has a constraint, update it
-- Note: Since this column is JSONB, it might not have a foreign key constraint
-- but if it does, this command will update it
ALTER TABLE equipment 
DROP CONSTRAINT IF EXISTS equipment_authorized_officers_fkey;

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Foreign key constraints updated successfully';
END $$; 