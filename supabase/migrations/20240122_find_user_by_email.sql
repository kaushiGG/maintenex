
CREATE OR REPLACE FUNCTION public.find_user_by_email(email_to_check text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Search in auth.users for the email
  SELECT id INTO user_id FROM auth.users
  WHERE email = email_to_check;
  
  RETURN user_id;
END;
$$;
