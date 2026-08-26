-- ============================================================
-- ScholarFlow — Create User Saved Citations Junction Table
-- Description: Transforms the global citation_library into personal shelves
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

create table if not exists public.user_saved_citations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  reference_id text not null references public.citation_library(reference_id) on delete cascade,
  created_at   timestamptz not null default now(),
  
  -- Anti-Duplication: Satu user tidak bisa nyimpen jurnal yang sama dua kali
  unique(user_id, reference_id)
);

-- RLS (Keamanan Tingkat Baris)
alter table public.user_saved_citations enable row level security;

-- User hanya bisa melihat buku di raknya sendiri
create policy "Users can read own saved citations"
  on public.user_saved_citations for select
  to authenticated
  using (auth.uid() = user_id);

-- User hanya bisa menambah ke raknya sendiri
create policy "Users can insert own saved citations"
  on public.user_saved_citations for insert
  to authenticated
  with check (auth.uid() = user_id);

-- User hanya bisa menghapus dari raknya sendiri
create policy "Users can delete own saved citations"
  on public.user_saved_citations for delete
  to authenticated
  using (auth.uid() = user_id);
