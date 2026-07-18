-- ============================================================
-- ScholarFlow — Create Documents Table
-- Created: 2026-07-15
-- Description: Table to store user documents in cloud Supabase
-- ============================================================

create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default 'Untitled Document',
  content    jsonb, -- Editor.js JSON data structure
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.documents enable row level security;

-- RLS Policies
create policy "Users can read own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);
