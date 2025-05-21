-- Create site_floor_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.business_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.site_floor_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Floor plans are viewable by authenticated users" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can insert floor plans" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can delete their own floor plans" ON public.site_floor_plans;

-- Allow all authenticated users to select floor plans
CREATE POLICY "Floor plans are viewable by authenticated users" 
  ON public.site_floor_plans FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own floor plans
CREATE POLICY "Users can insert floor plans" 
  ON public.site_floor_plans FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete floor plans they uploaded
CREATE POLICY "Users can delete their own floor plans"
  ON public.site_floor_plans FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Grant permissions to authenticated users
GRANT ALL ON public.site_floor_plans TO authenticated;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'site_floor_plans'
ORDER BY 
  ordinal_position; 