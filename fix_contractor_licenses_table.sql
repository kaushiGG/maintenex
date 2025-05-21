
-- Ensure the contractor_licenses table exists with proper structure
CREATE TABLE IF NOT EXISTS public.contractor_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL,
    license_type TEXT NOT NULL,
    license_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    provider TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_by UUID,
    attachments JSONB
);

-- Enable Row Level Security
ALTER TABLE public.contractor_licenses ENABLE ROW LEVEL SECURITY;

-- Add appropriate RLS policies
CREATE POLICY IF NOT EXISTS "Contractors can view their own licenses"
    ON public.contractor_licenses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contractors c
            WHERE c.id = contractor_licenses.contractor_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Contractors can insert their own licenses"
    ON public.contractor_licenses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contractors c
            WHERE c.id = contractor_licenses.contractor_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Contractors can update their own licenses"
    ON public.contractor_licenses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.contractors c
            WHERE c.id = contractor_licenses.contractor_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Contractors can delete their own licenses"
    ON public.contractor_licenses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.contractors c
            WHERE c.id = contractor_licenses.contractor_id
            AND c.owner_id = auth.uid()
        )
    );
