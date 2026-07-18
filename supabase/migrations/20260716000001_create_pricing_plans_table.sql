-- ============================================================
-- ScholarFlow — Create Pricing Plans Table
-- Created: 2026-07-16
-- Description: Table for pricing plans with RLS
-- ============================================================

create table if not exists public.pricing_plans (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  price_period text not null default 'bulan',
  description text,
  features text[] not null default '{}',
  is_popular boolean not null default false,
  promo_text text,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.pricing_plans enable row level security;

-- Drop existing policies if any
drop policy if exists "Anyone can view pricing plans" on public.pricing_plans;
drop policy if exists "Admins can manage pricing plans" on public.pricing_plans;

-- Read policy for everyone
create policy "Anyone can view pricing plans"
  on public.pricing_plans for select
  using (true);

-- Manage policy for admins
create policy "Admins can manage pricing plans"
  on public.pricing_plans for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed initial plans
insert into public.pricing_plans (id, name, price, price_period, description, features, is_popular, promo_text)
values
  ('free', 'Free Plan', 0, 'selamanya', 'Cocok untuk mahasiswa yang baru mulai menyusun draf karya tulis ilmiah.', array['Hingga 3 dokumen draf', '10x Asisten AI Tulis Ulang / hari', 'Pencarian rujukan dasar (OpenAlex)', 'Penyimpanan Library PDF hingga 50MB', 'Format daftar pustaka APA & IEEE dasar'], false, null),
  ('pro', 'Pro Writer', 149000, 'bulan', 'Untuk peneliti dan dosen yang mempublikasikan jurnal ilmiah secara reguler.', array['Dokumen draf tanpa batas', 'Asisten AI Tulis Ulang tanpa batas', 'Deteksi Plagiarisme & Style Akademik AI', 'Penyimpanan PDF & RIS hingga 2GB', 'Seluruh gaya sitasi (CSL) & multi-bahasa', 'Prioritas ekstraksi metadata PDF otomatis', 'Dukungan ekspor dokumen ke Word & PDF'], true, null),
  ('institution', 'Institutional', 0, 'tahunan', 'Solusi untuk Fakultas, Universitas, Lembaga Penelitian, atau Tim Riset.', array['Akun Pro untuk seluruh dosen & mahasiswa', 'Integrasi Perpustakaan Kampus & SSO', 'Penyimpanan tim kolaboratif bersama', 'Laporan plagiarisme institusional', 'Dasbor admin institusi & analitik riset', 'Dukungan VIP 24/7 & Pelatihan Khusus'], false, null)
on conflict (id) do update
set
  name = excluded.name,
  price = excluded.price,
  price_period = excluded.price_period,
  description = excluded.description,
  features = excluded.features,
  is_popular = excluded.is_popular,
  promo_text = excluded.promo_text;
