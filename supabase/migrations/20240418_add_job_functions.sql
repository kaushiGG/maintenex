

-- Create function to accept a job
CREATE OR REPLACE FUNCTION public.accept_job(job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check the current job status first
  IF EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND status = 'pending') THEN
    -- Update to accepted status
    UPDATE public.jobs
    SET status = 'accepted'
    WHERE id = job_id;
    
    RETURN TRUE;
  ELSE
    -- Job is not in pending state
    RETURN FALSE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Create function to update a job status
CREATE OR REPLACE FUNCTION public.update_job_status(job_id UUID, new_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow valid status values: pending, accepted, in-progress, completed
  IF new_status IN ('pending', 'accepted', 'in-progress', 'completed') THEN
    UPDATE public.jobs
    SET status = new_status
    WHERE id = job_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

