-- Add equipment column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN equipment TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.jobs.equipment IS 'Equipment information for the job';

-- Note: This is a separate migration from equipment_id which references the equipment table
-- equipment column stores a text description of the equipment when no reference is needed 