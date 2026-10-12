-- supabase/migrations/20261012000002_enable_rls_ai_providers.sql
-- Mengaktifkan Row Level Security (RLS) dan proteksi API Key pada tabel ai_providers

-- 1. Aktifkan Row Level Security (RLS)
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada (idempotent / aman di-run berkali-kali)
DROP POLICY IF EXISTS "Admins have full access to ai_providers" ON public.ai_providers;

-- 3. Buat kebijakan keamanan: HANYA Super Admin yang diizinkan melihat (SELECT) dan mengelola (INSERT/UPDATE/DELETE) tabel ai_providers
CREATE POLICY "Admins have full access to ai_providers"
ON public.ai_providers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
