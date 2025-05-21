-- Debug script to check database structure
-- Run this in your Supabase SQL Editor to check the database structure

-- Check what tables exist
SELECT 
    table_schema || '.' || table_name AS table_full_name,
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_schema, table_name;

-- Create the _tables_info view if it doesn't exist
DO $$
BEGIN
    -- Drop the view if it exists
    DROP VIEW IF EXISTS public._tables_info;
    
    -- Create the view
    CREATE VIEW public._tables_info AS
    SELECT 
        t.table_schema AS schema_name,
        t.table_name,
        obj_description(pg_class.oid) AS table_description,
        COUNT(c.*) AS column_count
    FROM 
        information_schema.tables t
    JOIN 
        pg_class ON pg_class.relname = t.table_name
    JOIN 
        information_schema.columns c ON c.table_schema = t.table_schema AND c.table_name = t.table_name
    WHERE 
        t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND t.table_schema NOT LIKE 'pg_%'
        AND t.table_type = 'BASE TABLE'
    GROUP BY 
        t.table_schema, t.table_name, pg_class.oid
    ORDER BY 
        t.table_schema, t.table_name;
END
$$;

-- The code below checks if each table exists, and creates it if not
-- This enables you to run this script multiple times without errors

DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            is_approved BOOLEAN DEFAULT FALSE,
            approval_date TIMESTAMP WITH TIME ZONE,
            approved_by UUID,
            user_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
            FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own profile." ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        
        CREATE POLICY "Users can update their own profile." ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
            
        RAISE NOTICE 'Created profiles table';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
    
    -- Create business_sites table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_sites') THEN
        CREATE TABLE public.business_sites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            coordinates TEXT,
            compliance_status TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            notes TEXT,
            site_type TEXT,
            item_count INTEGER DEFAULT 0,
            owner_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.business_sites ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Sites are viewable by authenticated users" ON public.business_sites
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Sites can be inserted by authenticated users" ON public.business_sites
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Sites can be updated by authenticated users" ON public.business_sites
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Created business_sites table';
    ELSE
        RAISE NOTICE 'Business_sites table already exists';
    END IF;
    
    -- Create contractors table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contractors') THEN
        CREATE TABLE public.contractors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            service_type TEXT NOT NULL,
            contact_email TEXT,
            contact_phone TEXT,
            location TEXT,
            job_title TEXT,
            skills TEXT[],
            rating NUMERIC,
            credentials TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            auth_id UUID,
            owner_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Contractors are viewable by authenticated users" ON public.contractors
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Contractors can be inserted by authenticated users" ON public.contractors
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Contractors can be updated by authenticated users" ON public.contractors
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Created contractors table';
    ELSE
        RAISE NOTICE 'Contractors table already exists';
    END IF;
    
    -- Create site_contractors table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_contractors') THEN
        CREATE TABLE public.site_contractors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            site_id UUID NOT NULL REFERENCES public.business_sites,
            contractor_id UUID NOT NULL,
            status TEXT,
            assigned_by UUID,
            assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.site_contractors ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Site contractors are viewable by authenticated users" ON public.site_contractors
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Site contractors can be inserted by authenticated users" ON public.site_contractors
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Site contractors can be updated by authenticated users" ON public.site_contractors
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Created site_contractors table';
    ELSE
        RAISE NOTICE 'Site_contractors table already exists';
    END IF;
    
    -- Create site_floor_plans table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_floor_plans') THEN
        CREATE TABLE public.site_floor_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            site_id UUID NOT NULL REFERENCES public.business_sites,
            name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            uploaded_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.site_floor_plans ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Floor plans are viewable by authenticated users" ON public.site_floor_plans
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Floor plans can be inserted by authenticated users" ON public.site_floor_plans
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Floor plans can be updated by authenticated users" ON public.site_floor_plans
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        RAISE NOTICE 'Created site_floor_plans table';
    ELSE
        RAISE NOTICE 'Site_floor_plans table already exists';
    END IF;
    
    -- Create user trigger if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        -- Create stored procedure to handle user creation
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, first_name, last_name, user_type, is_approved)
            VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'user_type', 
                CASE 
                    WHEN new.raw_user_meta_data->>'user_type' = 'business' THEN TRUE
                    ELSE FALSE
                END);
            RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Create trigger for new user signup
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
            
        RAISE NOTICE 'Created user trigger';
    ELSE
        RAISE NOTICE 'User trigger already exists';
    END IF;
END $$; 