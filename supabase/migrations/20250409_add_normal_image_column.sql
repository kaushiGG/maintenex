-- Add normal_image column to thermal_imaging_reports table
ALTER TABLE public.thermal_imaging_reports 
ADD COLUMN IF NOT EXISTS normal_image TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.thermal_imaging_reports.normal_image IS 'URL or base64 string of the standard/reference image'; 