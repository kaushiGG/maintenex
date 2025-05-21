-- Add expires_at column to invitations table
ALTER TABLE IF EXISTS public.invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set default expiration date to 7 days from invitation date for new invitations
ALTER TABLE IF EXISTS public.invitations 
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '7 days');

-- Update existing invitations to have an expiration date 7 days from their invited_at date
UPDATE public.invitations
SET expires_at = invited_at + INTERVAL '7 days'
WHERE expires_at IS NULL; 