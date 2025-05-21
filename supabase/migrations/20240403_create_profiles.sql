-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    user_type TEXT CHECK (user_type IN ('business', 'contractor')),
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postcode TEXT,
    abn TEXT,
    website TEXT,
    vehicle TEXT,
    bio TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can view contractor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can approve profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email,
        first_name, 
        last_name, 
        user_type,
        phone,
        address,
        city,
        state,
        postcode,
        abn,
        website,
        vehicle,
        bio,
        is_approved
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        COALESCE(NEW.raw_user_meta_data->>'userType', 'contractor'),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
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

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert existing users into profiles if they don't exist
INSERT INTO public.profiles (id, email, first_name, last_name, user_type, is_approved)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'firstName', ''),
    COALESCE(raw_user_meta_data->>'lastName', ''),
    COALESCE(raw_user_meta_data->>'userType', 'contractor'),
    FALSE
FROM auth.users
ON CONFLICT (id) DO NOTHING; 