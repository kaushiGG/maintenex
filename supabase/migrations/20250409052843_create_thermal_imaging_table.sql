-- Create thermal_imaging_reports table
CREATE TABLE IF NOT EXISTS public.thermal_imaging_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id),
    site_id UUID REFERENCES public.business_sites(id),
    image_type VARCHAR(50) NOT NULL,
    uploaded_image TEXT,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    analysis_results JSONB,
    max_temperature NUMERIC,
    min_temperature NUMERIC,
    ambient_temperature NUMERIC,
    equipment VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50),
    hotspots JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Create index on job_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_thermal_imaging_reports_job_id ON public.thermal_imaging_reports(job_id);

-- Create index on site_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_thermal_imaging_reports_site_id ON public.thermal_imaging_reports(site_id);

-- Add RLS policies
ALTER TABLE public.thermal_imaging_reports ENABLE ROW LEVEL SECURITY;

-- Contractors can view and insert their own thermal imaging reports
CREATE POLICY "Contractors can view their own thermal imaging reports"
ON public.thermal_imaging_reports
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_id FROM public.contractors c
        JOIN public.jobs j ON j.contractor_id = c.id
        WHERE j.id = job_id
    )
);

CREATE POLICY "Contractors can insert their own thermal imaging reports"
ON public.thermal_imaging_reports
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT auth_id FROM public.contractors c
        JOIN public.jobs j ON j.contractor_id = c.id
        WHERE j.id = job_id
    )
);

-- Business users can view all thermal imaging reports
CREATE POLICY "Business users can view all thermal imaging reports"
ON public.thermal_imaging_reports
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_id FROM public.profiles
        WHERE role = 'business'
    )
);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_thermal_imaging_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thermal_imaging_reports_updated_at
BEFORE UPDATE ON public.thermal_imaging_reports
FOR EACH ROW
EXECUTE FUNCTION update_thermal_imaging_reports_updated_at(); 