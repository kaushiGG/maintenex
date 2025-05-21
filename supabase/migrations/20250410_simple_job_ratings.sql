-- Create a simplified job_ratings table with proper foreign keys
DROP TABLE IF EXISTS public.job_ratings;

CREATE TABLE IF NOT EXISTS public.job_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id),
    contractor_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_job_ratings_job_id ON public.job_ratings(job_id);
CREATE INDEX IF NOT EXISTS idx_job_ratings_contractor_id ON public.job_ratings(contractor_id);

-- Enable Row Level Security
ALTER TABLE public.job_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Contractors can view their own ratings"
ON public.job_ratings FOR SELECT
USING (
    auth.uid() IN (
        SELECT owner_id FROM public.contractors c
        WHERE c.id = contractor_id
    )
);

-- Create a simplified contractor_performance view 
DROP VIEW IF EXISTS public.contractor_performance;

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
    COALESCE(rs.avg_rating, 0) AS avg_rating,
    COALESCE(rs.total_ratings, 0) AS total_ratings
FROM 
    public.contractors c
JOIN 
    public.profiles p ON c.owner_id = p.id
LEFT JOIN 
    job_stats js ON c.id = js.contractor_id
LEFT JOIN 
    rating_stats rs ON c.id = rs.contractor_id;

-- Create a minimal function for monthly performance that doesn't depend on job_ratings
DROP FUNCTION IF EXISTS get_contractor_monthly_performance;

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