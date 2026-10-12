-- supabase/migrations/20261012000001_create_institutions_table.sql
-- Table: institutions (B2B Campus & University Partner Organizations)

CREATE TABLE IF NOT EXISTS public.institutions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    domains JSONB DEFAULT '[]'::jsonb,
    total_seats INTEGER NOT NULL DEFAULT 50,
    used_seats INTEGER NOT NULL DEFAULT 0,
    contract_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    contract_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year'),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for searching institutions by name or admin email
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_admin_email ON public.institutions(admin_email);

-- Optional relation column in profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'institution_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN institution_id TEXT REFERENCES public.institutions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do all operations
CREATE POLICY "Admins have full access to institutions"
    ON public.institutions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policy: Campus admin can view their own institution
CREATE POLICY "Campus admins can view their own institution"
    ON public.institutions
    FOR SELECT
    TO authenticated
    USING (
        admin_email = auth.email()
    );
