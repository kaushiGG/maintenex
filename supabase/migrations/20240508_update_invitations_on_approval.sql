-- Create a function to update invitation status when a profile is approved
CREATE OR REPLACE FUNCTION update_invitation_on_profile_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if new is_approved value is true (profile just got approved)
    IF NEW.is_approved = TRUE AND (OLD.is_approved = FALSE OR OLD.is_approved IS NULL) THEN
        -- Update matching invitations for employee users to 'approved' status
        IF NEW.user_type = 'employee' THEN
            UPDATE public.invitations
            SET 
                status = 'approved',
                updated_at = NOW()
            WHERE 
                email = NEW.email 
                AND status = 'pending'
                AND invitation_type = 'employee';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires when profiles are updated
DROP TRIGGER IF EXISTS profile_approval_update_invitation ON public.profiles;
CREATE TRIGGER profile_approval_update_invitation
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.is_approved IS DISTINCT FROM OLD.is_approved)
EXECUTE FUNCTION update_invitation_on_profile_approval();

-- Add a comment explaining the function and trigger
COMMENT ON FUNCTION update_invitation_on_profile_approval() IS 
'Automatically updates invitation status to approved when an employee profile is approved';

COMMENT ON TRIGGER profile_approval_update_invitation ON public.profiles IS 
'Triggers when a profile is approved to update related invitations'; 