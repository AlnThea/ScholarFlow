-- ============================================================
-- ScholarFlow — Create Suggestions Table for Track Changes
-- Migration: 20260808000001_create_suggestions_table.sql
-- ============================================================

create table if not exists public.document_suggestions (
  id            text primary key,
  document_id   uuid not null references public.documents(id) on delete cascade,
  user_id       uuid,
  author_name   text not null default 'Collaborator',
  selected_text text,
  suggested_text text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.document_suggestions enable row level security;

-- Policies for document_suggestions
create policy "Anyone can read suggestions on shared documents"
  on public.document_suggestions for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_suggestions.document_id
      and (
        d.user_id = auth.uid() or
        (d.settings->>'shareActive')::boolean = true
      )
    )
  );

create policy "Anyone can insert suggestions on shared/owned documents with edit access"
  on public.document_suggestions for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_suggestions.document_id
      and (
        d.user_id = auth.uid() or
        (
          (d.settings->>'shareActive')::boolean = true and
          d.settings->>'sharePermission' = 'edit'
        )
      )
    )
  );

create policy "Anyone can update suggestions on shared/owned documents with edit access"
  on public.document_suggestions for update
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_suggestions.document_id
      and (
        d.user_id = auth.uid() or
        (
          (d.settings->>'shareActive')::boolean = true and
          d.settings->>'sharePermission' = 'edit'
        )
      )
    )
  );

create policy "Owners can delete suggestions"
  on public.document_suggestions for delete
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_suggestions.document_id
      and d.user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_document_suggestions_document_id on public.document_suggestions(document_id);
create index if not exists idx_document_suggestions_status on public.document_suggestions(status);
