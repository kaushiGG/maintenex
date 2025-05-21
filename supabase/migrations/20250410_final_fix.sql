-- Final fix: remove all references to time_spent column
DROP VIEW IF EXISTS public.contractor_performance;

CREATE OR REPLACE VIEW public.contractor_performance AS
WITH job_stats AS (
    SELECT 
        j.contractor_id,
        COUNT(*) AS total_jobs,
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs,
        -- Calculate time spent directly from start_time and completion_time
        AVG(
            CASE 
                WHEN j.completion_time IS NOT NULL AND j.start_time IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (j.completion_time - j.start_time))/60
                ELSE 0
            END
        ) AS avg_time_spent,
        -- Calculate response time directly
        AVG(
            CASE 
                WHEN j.start_time IS NOT NULL AND j.created_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (j.start_time - j.created_at))/60
                ELSE 0
            END
        ) AS avg_response_time_minutes
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
    c.user_id,
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
    public.profiles p ON c.user_id = p.id
LEFT JOIN 
    job_stats js ON c.id = js.contractor_id
LEFT JOIN 
    rating_stats rs ON c.id = rs.contractor_id;

-- Fix the monthly performance function to avoid using time_spent
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
            COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs,
            -- Calculate response time directly
            AVG(
                CASE 
                    WHEN j.start_time IS NOT NULL AND j.created_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (j.start_time - j.created_at))/60
                    ELSE 0
                END
            ) AS response_time
        FROM 
            public.jobs j
        WHERE 
            j.contractor_id = contractor_uuid
            AND j.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY 
            TO_CHAR(j.created_at, 'Mon'),
            EXTRACT(YEAR FROM j.created_at),
            EXTRACT(MONTH FROM j.created_at)
    ),
    monthly_ratings AS (
        SELECT 
            TO_CHAR(jr.created_at, 'Mon') AS month,
            EXTRACT(YEAR FROM jr.created_at) AS year,
            EXTRACT(MONTH FROM jr.created_at) AS month_num,
            AVG(jr.rating) AS avg_rating
        FROM 
            public.job_ratings jr
        WHERE 
            jr.contractor_id = contractor_uuid
            AND jr.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY 
            TO_CHAR(jr.created_at, 'Mon'),
            EXTRACT(YEAR FROM jr.created_at),
            EXTRACT(MONTH FROM jr.created_at)
    )
    SELECT 
        mj.month,
        mj.year::INTEGER,
        COALESCE(mr.avg_rating, 0)::NUMERIC AS rating,
        CASE 
            WHEN mj.total_jobs > 0 
            THEN ROUND((mj.completed_jobs::NUMERIC / mj.total_jobs) * 100, 1)
            ELSE 0
        END AS completion_rate,
        COALESCE(mj.response_time, 0)::NUMERIC AS response_time
    FROM 
        monthly_jobs mj
    LEFT JOIN 
        monthly_ratings mr ON mj.month = mr.month AND mj.year = mr.year
    ORDER BY 
        mj.year, mj.month_num;
END;
$$ LANGUAGE plpgsql; 