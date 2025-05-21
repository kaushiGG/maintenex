-- Drop job_ratings table and related views/functions
DROP TABLE IF EXISTS public.job_ratings;
DROP VIEW IF EXISTS public.contractor_performance;
DROP FUNCTION IF EXISTS get_contractor_monthly_performance;

-- Create a simplified contractor_performance view without job ratings
CREATE OR REPLACE VIEW public.contractor_performance AS
WITH job_stats AS (
    SELECT 
        j.contractor_id,
        COUNT(*) AS total_jobs,
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs
    FROM 
        public.jobs j
    WHERE 
        j.contractor_id IS NOT NULL
    GROUP BY 
        j.contractor_id
)
SELECT 
    c.id AS contractor_id,
    c.owner_id,
    p.first_name,
    p.last_name,
    COALESCE(js.total_jobs, 0) AS total_jobs,
    COALESCE(js.completed_jobs, 0) AS completed_jobs,
    CASE 
        WHEN COALESCE(js.total_jobs, 0) > 0 
        THEN ROUND((COALESCE(js.completed_jobs, 0)::float / js.total_jobs) * 100, 1)
        ELSE 0
    END AS completion_rate,
    0 AS avg_time_spent_minutes,
    0 AS avg_response_time_minutes,
    4.5 AS avg_rating,  -- Default rating
    0 AS total_ratings  -- No ratings yet
FROM 
    public.contractors c
JOIN 
    public.profiles p ON c.owner_id = p.id
LEFT JOIN 
    job_stats js ON c.id = js.contractor_id;

-- Create a simplified monthly performance function without job ratings
CREATE OR REPLACE FUNCTION get_contractor_monthly_performance(contractor_uuid UUID)
RETURNS TABLE (
    month TEXT,
    year INTEGER,
    rating NUMERIC,
    completion_rate NUMERIC,
    response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_jobs AS (
        SELECT 
            TO_CHAR(j.created_at, 'Mon') AS month,
            EXTRACT(YEAR FROM j.created_at) AS year,
            EXTRACT(MONTH FROM j.created_at) AS month_num,
            COUNT(*) AS total_jobs,
            COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs
        FROM 
            public.jobs j
        WHERE 
            j.contractor_id = contractor_uuid
            AND j.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY 
            TO_CHAR(j.created_at, 'Mon'),
            EXTRACT(YEAR FROM j.created_at),
            EXTRACT(MONTH FROM j.created_at)
    )
    SELECT 
        mj.month,
        mj.year::INTEGER,
        4.5::NUMERIC AS rating, -- Default rating
        CASE 
            WHEN mj.total_jobs > 0 
            THEN ROUND((mj.completed_jobs::NUMERIC / mj.total_jobs) * 100, 1)
            ELSE 95::NUMERIC -- Default completion rate
        END AS completion_rate,
        10::NUMERIC AS response_time -- Default response time (10 minutes)
    FROM 
        monthly_jobs mj
    ORDER BY 
        mj.year, mj.month_num;
END;
$$ LANGUAGE plpgsql; 