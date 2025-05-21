-- Add safety check columns to equipment table
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS safety_frequency text,
ADD COLUMN IF NOT EXISTS safety_instructions text,
ADD COLUMN IF NOT EXISTS safety_officer text,
ADD COLUMN IF NOT EXISTS training_video_url text,
ADD COLUMN IF NOT EXISTS training_video_name text;

-- Add comments for better documentation
COMMENT ON COLUMN public.equipment.safety_frequency IS 'Frequency of required safety checks (daily, weekly, monthly, etc.)';
COMMENT ON COLUMN public.equipment.safety_instructions IS 'Instructions for performing safety checks on this equipment';
COMMENT ON COLUMN public.equipment.safety_officer IS 'Name of the authorized safety officer for this equipment';
COMMENT ON COLUMN public.equipment.training_video_url IS 'URL to the training video for safety checks';
COMMENT ON COLUMN public.equipment.training_video_name IS 'Original filename of the training video';

-- Create storage bucket for equipment training videos if it doesn't exist
DO $$
BEGIN
    EXECUTE format('CREATE BUCKET IF NOT EXISTS %I', 'equipment-videos');
END
$$;

-- Add RLS policy for equipment-videos bucket
CREATE POLICY "Allow all users to read equipment-videos" ON storage.objects
FOR SELECT
USING (bucket_id = 'equipment-videos');

CREATE POLICY "Allow authenticated users to upload equipment-videos" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-videos');

CREATE POLICY "Allow users to delete their own equipment-videos" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-videos'); 