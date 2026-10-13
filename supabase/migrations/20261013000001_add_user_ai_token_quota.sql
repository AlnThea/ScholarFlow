-- supabase/migrations/20261013000001_add_user_ai_token_quota.sql
-- Add AI Token Quota & Fair Usage Policy tracking columns to 'profiles' table

DO $$ 
BEGIN
    -- 1. Tambah kolom ai_tokens_used (Token terpakai bulan ini)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'ai_tokens_used'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN ai_tokens_used INTEGER DEFAULT 0;
    END IF;

    -- 2. Tambah kolom ai_monthly_quota (Batas kuota token bulanan, default 50.000 untuk Free)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'ai_monthly_quota'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN ai_monthly_quota INTEGER DEFAULT 50000;
    END IF;

    -- 3. Tambah kolom ai_quota_reset_at (Waktu reset siklus 30 hari)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'ai_quota_reset_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN ai_quota_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
    END IF;
END $$;

-- Update existing pro accounts to receive 1,000,000 monthly tokens
UPDATE public.profiles 
SET ai_monthly_quota = 1000000 
WHERE subscription_plan = 'pro' AND (ai_monthly_quota IS NULL OR ai_monthly_quota <= 50000);
