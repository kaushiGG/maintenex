-- Fix the handle_new_user function to correctly access metadata fields
-- The problem is that we're using 'first_name' instead of 'firstName' in the trigger function

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Debug the input
  RAISE NOTICE 'Creating profile for user: % with meta: %', NEW.id, NEW.raw_user_meta_data;
  
  INSERT INTO public.profiles (
    id, 
    email,
    first_name, 
    last_name, 
    user_type,
    is_approved
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'userType', 'contractor'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'userType', 'contractor') = 'business' THEN TRUE 
      ELSE FALSE 
    END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger again
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Check if any users are missing profiles
-- and create them retroactively
INSERT INTO public.profiles (
  id, 
  email,
  first_name, 
  last_name, 
  user_type,
  is_approved
)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'firstName', ''),
  COALESCE(raw_user_meta_data->>'lastName', ''),
  COALESCE(raw_user_meta_data->>'userType', 'contractor'),
  CASE 
    WHEN COALESCE(raw_user_meta_data->>'userType', 'contractor') = 'business' THEN TRUE 
    ELSE FALSE 
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING; 