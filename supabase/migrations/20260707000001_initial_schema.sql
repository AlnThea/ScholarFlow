-- ============================================================
-- ScholarFlow — Initial Database Migration
-- Created: 2026-07-07
-- Description: Profiles (with role), Citation Cache, Citation Library
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- CATATAN: Jika sudah pernah jalankan file ini, jalankan juga:
--   migrations/20260707000002_fix_profiles_rls.sql
-- ============================================================


-- ===========================
-- 1. PROFILES TABLE + TRIGGER
-- ===========================
-- Stores user profile data and role (user/admin).
-- Auto-created via trigger when a new user registers.

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Function: auto-create profile record on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user'   -- semua user baru default role = 'user'
  );
  return new;
end;
$$;

-- Trigger: fires after every new row in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: Row Level Security for profiles
alter table public.profiles enable row level security;

-- User hanya bisa baca profil sendiri
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- User bisa update profil sendiri
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CATATAN: Jangan buat policy "Admin can read all profiles" dengan subquery ke
-- tabel profiles itu sendiri — akan menyebabkan infinite recursion (circular RLS).
-- Lihat file 20260707000002_fix_profiles_rls.sql untuk penjelasan.


-- ===========================
-- 2. CITATION CACHE (shared)
-- ===========================
-- Caches results from OpenAlex and Crossref API calls.
-- Shared across all users. Expires after 7 days.

create table if not exists public.citation_cache (
  id          uuid primary key default gen_random_uuid(),
  query_hash  text not null unique,       -- MD5 hash of normalized query
  query_text  text not null,             -- original query text
  results     jsonb not null,            -- CitationCandidate[] as JSON
  sources     text[] not null default '{}',
  hit_count   integer not null default 1, -- number of times this cache was used
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_citation_cache_query_hash
  on public.citation_cache(query_hash);

create index if not exists idx_citation_cache_expires_at
  on public.citation_cache(expires_at);

-- RLS for citation_cache
alter table public.citation_cache enable row level security;

-- Semua user yang login bisa baca cache
create policy "Authenticated users can read citation cache"
  on public.citation_cache for select
  to authenticated
  using (true);

-- Note: insert/update dilakukan via backend service role key (bypass RLS)


-- ===========================
-- 3. CITATION LIBRARY (global)
-- ===========================
-- Global curated citation collection.
-- Semua user yang login bisa baca.
-- Insert otomatis saat user menggunakan citation di editor.

create table if not exists public.citation_library (
  id            uuid primary key default gen_random_uuid(),
  reference_id  text not null unique,      -- unique ID from OpenAlex/Crossref
  citation_data jsonb not null,            -- full CitationCandidate object
  added_by      uuid references auth.users(id) on delete set null,
  added_at      timestamptz not null default now()
);

create index if not exists idx_citation_library_reference_id
  on public.citation_library(reference_id);

-- RLS for citation_library
alter table public.citation_library enable row level security;

-- Semua user yang login bisa baca library
create policy "Authenticated users can read citation library"
  on public.citation_library for select
  to authenticated
  using (true);

-- Semua user yang login bisa menambah citation ke library
create policy "Authenticated users can insert citation library"
  on public.citation_library for insert
  to authenticated
  with check (true);

-- Hanya admin yang bisa hapus citation dari library
create policy "Admin can delete citation library"
  on public.citation_library for delete
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));
