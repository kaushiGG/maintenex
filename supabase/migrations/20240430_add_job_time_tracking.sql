-- Add the start_time, completion_time, and time_spent fields to the jobs table
ALTER TABLE public.jobs 
ADD COLUMN start_time TIMESTAMPTZ NULL,
ADD COLUMN completion_time TIMESTAMPTZ NULL,
ADD COLUMN time_spent INTEGER NULL; -- Time spent in minutes

COMMENT ON COLUMN public.jobs.start_time IS 'Timestamp when the job was started';
COMMENT ON COLUMN public.jobs.completion_time IS 'Timestamp when the job was completed';
COMMENT ON COLUMN public.jobs.time_spent IS 'Time spent on the job in minutes';

-- Create or replace the update_job_status function to handle time tracking
CREATE OR REPLACE FUNCTION public.update_job_status(job_id UUID, new_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_start_time TIMESTAMPTZ;
    time_diff INTEGER;
BEGIN
    -- Only allow valid status values: pending, accepted, in-progress, completed
    IF new_status IN ('pending', 'accepted', 'in-progress', 'completed') THEN
    
        -- If status is being set to in-progress, record the start time
        IF new_status = 'in-progress' THEN
            UPDATE public.jobs
            SET status = new_status,
                start_time = CURRENT_TIMESTAMP
            WHERE id = job_id;
            
        -- If status is being set to completed, calculate and record the time spent
        ELSIF new_status = 'completed' THEN
            -- Get the start time
            SELECT start_time INTO job_start_time
            FROM public.jobs
            WHERE id = job_id;
            
            -- If start_time exists, calculate the time spent
            IF job_start_time IS NOT NULL THEN
                -- Calculate time difference in minutes
                time_diff := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - job_start_time)) / 60;
                
                UPDATE public.jobs
                SET status = new_status,
                    completion_time = CURRENT_TIMESTAMP,
                    time_spent = time_diff
                WHERE id = job_id;
            ELSE
                -- If no start_time, just update status and completion_time
                UPDATE public.jobs
                SET status = new_status,
                    completion_time = CURRENT_TIMESTAMP
                WHERE id = job_id;
            END IF;
            
        -- For other status changes, just update the status
        ELSE
            UPDATE public.jobs
            SET status = new_status
            WHERE id = job_id;
        END IF;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$; 