-- Add equipment_id column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN equipment_id UUID REFERENCES public.equipment(id);

-- Add comment to the column
COMMENT ON COLUMN public.jobs.equipment_id IS 'Reference to the equipment associated with the job';

-- Create an index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_jobs_equipment_id ON public.jobs(equipment_id); 