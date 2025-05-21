-- Fix the contractor_performance view by replacing auth_id with user_id
DROP VIEW IF EXISTS public.contractor_performance;

CREATE OR REPLACE VIEW public.contractor_performance AS
WITH job_stats AS (
    SELECT 
        j.contractor_id,
        COUNT(*) AS total_jobs,
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs,
        AVG(j.time_spent) AS avg_time_spent,
        AVG(EXTRACT(EPOCH FROM (j.start_time - j.created_at))/60) AS avg_response_time_minutes
    FROM 
        public.jobs j
    WHERE 
        j.contractor_id IS NOT NULL
    GROUP BY 
        j.contractor_id
),
rating_stats AS (
    SELECT 
        jr.contractor_id,
        AVG(jr.rating) AS avg_rating,
        COUNT(*) AS total_ratings
    FROM 
        public.job_ratings jr
    GROUP BY 
        jr.contractor_id
)
SELECT 
    c.id AS contractor_id,
    c.user_id, -- Changed from auth_id to user_id
    p.first_name,
    p.last_name,
    COALESCE(js.total_jobs, 0) AS total_jobs,
    COALESCE(js.completed_jobs, 0) AS completed_jobs,
    CASE 
        WHEN COALESCE(js.total_jobs, 0) > 0 
        THEN ROUND((COALESCE(js.completed_jobs, 0)::float / js.total_jobs) * 100, 1)
        ELSE 0
    END AS completion_rate,
    COALESCE(js.avg_time_spent, 0) AS avg_time_spent_minutes,
    COALESCE(js.avg_response_time_minutes, 0) AS avg_response_time_minutes,
    COALESCE(rs.avg_rating, 0) AS avg_rating,
    COALESCE(rs.total_ratings, 0) AS total_ratings
FROM 
    public.contractors c
JOIN 
    public.profiles p ON c.user_id = p.id -- Changed from auth_id to user_id
LEFT JOIN 
    job_stats js ON c.id = js.contractor_id
LEFT JOIN 
    rating_stats rs ON c.id = rs.contractor_id;

-- Fix the policies to use user_id instead of auth_id
DROP POLICY IF EXISTS "Contractors can view their own ratings" ON public.job_ratings;

CREATE POLICY "Contractors can view their own ratings"
ON public.job_ratings FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.contractors c -- Changed from auth_id to user_id
        WHERE c.id = contractor_id
    )
); 