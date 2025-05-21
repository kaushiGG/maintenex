-- Create a lightweight invitations table
CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "role" VARCHAR,
    "department" VARCHAR,
    "is_safety_officer" BOOLEAN NOT NULL DEFAULT false,
    "token" UUID NOT NULL,
    "invitation_type" VARCHAR NOT NULL DEFAULT 'employee', -- For future expansion (contractor, client, etc.)
    "status" VARCHAR NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "inviter_id" UUID NOT NULL,  -- This stores the user's auth.id who created the invitation
    "invited_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_token" UNIQUE ("token")
);

-- Create RLS policies for invitations table
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own invitations
CREATE POLICY "Users can manage their own invitations"
    ON "public"."invitations"
    FOR ALL
    TO authenticated
    USING ("inviter_id" = auth.uid()) -- Compare directly to the user's auth ID
    WITH CHECK ("inviter_id" = auth.uid());

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS "invitations_token_idx" ON "public"."invitations" ("token");

-- Create function to handle registration via invitation
CREATE OR REPLACE FUNCTION public.register_from_invitation(
    invitation_token UUID,
    new_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    inviter_id UUID;
BEGIN
    -- Get the invitation record
    SELECT * INTO invitation_record
    FROM public.invitations
    WHERE token = invitation_token
      AND status = 'pending'
      AND expires_at > now();
      
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get inviter_id from the invitation
    inviter_id := invitation_record.inviter_id;
    
    -- Insert into profiles table (assuming it exists)
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        user_type,
        business_id,
        is_safety_officer
    ) VALUES (
        new_user_id,
        invitation_record.first_name,
        invitation_record.last_name,
        invitation_record.email,
        invitation_record.invitation_type, -- 'employee', 'contractor', etc.
        inviter_id, -- set business_id to the inviter's ID
        invitation_record.is_safety_officer
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        user_type = EXCLUDED.user_type,
        business_id = EXCLUDED.business_id,
        is_safety_officer = EXCLUDED.is_safety_officer;
    
    -- If roles table exists, add the appropriate role
    BEGIN
        -- Try to insert into auth.users_roles if it exists
        INSERT INTO auth.users_roles (user_id, role)
        VALUES (new_user_id, invitation_record.invitation_type)
        ON CONFLICT DO NOTHING;
    EXCEPTION
        WHEN undefined_table THEN
            -- Ignore if table doesn't exist
            NULL;
    END;
    
    -- Update invitation status to accepted
    UPDATE public.invitations
    SET status = 'accepted'
    WHERE token = invitation_token;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$; 