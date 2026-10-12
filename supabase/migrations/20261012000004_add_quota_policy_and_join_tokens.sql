-- supabase/migrations/20261012000004_add_quota_policy_and_join_tokens.sql
-- Add Department Seat Quotas and Join Link Token to 'institutions' table
-- Add Graduation Expiration Date to 'institution_members' table

-- 1. Tambah kolom join_token dan department_quotas pada tabel institutions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institutions' AND column_name = 'join_token'
    ) THEN
        ALTER TABLE public.institutions ADD COLUMN join_token VARCHAR(64) UNIQUE DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 16);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institutions' AND column_name = 'department_quotas'
    ) THEN
        ALTER TABLE public.institutions ADD COLUMN department_quotas JSONB DEFAULT '{"Fakultas Ilmu Komputer": 50, "Teknik Elektro": 40, "Fakultas Kedokteran": 30, "Ekonomi & Bisnis": 20, "Matematika & Sains": 10}'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institutions' AND column_name = 'ai_policy'
    ) THEN
        ALTER TABLE public.institutions ADD COLUMN ai_policy JSONB DEFAULT '{"student_monthly_token": 100000, "lecturer_monthly_token": 500000, "admin_monthly_token": 1000000}'::jsonb;
    END IF;
END $$;

-- 2. Tambah kolom graduation_date (Auto-Expire Kelulusan Mahasiswa) pada institution_members
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'institution_members' AND column_name = 'graduation_date'
    ) THEN
        ALTER TABLE public.institution_members ADD COLUMN graduation_date TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_institutions_join_token ON public.institutions(join_token);
