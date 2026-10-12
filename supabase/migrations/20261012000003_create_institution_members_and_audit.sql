-- supabase/migrations/20261012000003_create_institution_members_and_audit.sql
-- Tables: institution_members & institution_audit_logs (B2B Multi-Campus Member RBAC & Audit Trails)

-- 1. Table: institution_members
CREATE TABLE IF NOT EXISTS public.institution_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Student', -- 'Super Admin', 'Faculty Admin', 'Lecturer', 'Student'
    department VARCHAR(255) DEFAULT 'Akademik Umum',
    ai_quota_used INTEGER NOT NULL DEFAULT 0,
    ai_quota_limit INTEGER NOT NULL DEFAULT 100000,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Invited', 'Suspended'
    joined TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_inst_members_inst_id ON public.institution_members(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_members_email ON public.institution_members(email);
CREATE INDEX IF NOT EXISTS idx_inst_members_role ON public.institution_members(role);
CREATE INDEX IF NOT EXISTS idx_inst_members_dept ON public.institution_members(department);

-- 2. Table: institution_audit_logs
CREATE TABLE IF NOT EXISTS public.institution_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    actor_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'INVITE_USER', 'REVOKE_USER', 'UPDATE_ROLE', 'BULK_IMPORT', 'UPDATE_ORG'
    target TEXT NOT NULL,
    ip_address VARCHAR(100) DEFAULT 'Browser',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_inst_audit_inst_id ON public.institution_audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_audit_created ON public.institution_audit_logs(created_at DESC);

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for institution_members
DROP POLICY IF EXISTS "Admins full access to institution_members" ON public.institution_members;
CREATE POLICY "Admins full access to institution_members"
    ON public.institution_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Campus Admins manage their own members" ON public.institution_members;
CREATE POLICY "Campus Admins manage their own members"
    ON public.institution_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.institutions
            WHERE institutions.id = institution_members.institution_id
              AND (institutions.admin_email = auth.email() OR profiles.role IN ('admin', 'campus_admin'))
        )
    );

DROP POLICY IF EXISTS "Members can view their own profile in institution" ON public.institution_members;
CREATE POLICY "Members can view their own profile in institution"
    ON public.institution_members
    FOR SELECT
    TO authenticated
    USING (
        email = auth.email()
    );

-- 5. RLS Policies for institution_audit_logs
DROP POLICY IF EXISTS "Admins full access to institution_audit_logs" ON public.institution_audit_logs;
CREATE POLICY "Admins full access to institution_audit_logs"
    ON public.institution_audit_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Campus Admins view their own institution audit logs" ON public.institution_audit_logs;
CREATE POLICY "Campus Admins view their own institution audit logs"
    ON public.institution_audit_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.institutions
            WHERE institutions.id = institution_audit_logs.institution_id
              AND institutions.admin_email = auth.email()
        )
    );
