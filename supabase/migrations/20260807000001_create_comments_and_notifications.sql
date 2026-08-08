-- ============================================================
-- ScholarFlow — Create Comments & Notifications Tables
-- Created: 2026-08-07
-- Description: Supports co-editor comments & owner notification bell
-- ============================================================

-- 1. Create document_comments table
create table if not exists public.document_comments (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.documents(id) on delete cascade,
  block_id      text, -- References Editor.js block id
  selected_text text, -- Text context selected when commenting
  comment_text  text not null,
  author_name   text not null default 'Guest Co-Editor',
  resolved      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.document_comments enable row level security;

-- Policies for document_comments
create policy "Anyone can read comments on shared documents"
  on public.document_comments for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_comments.document_id
      and (
        d.user_id = auth.uid() or
        (d.settings->>'shareActive')::boolean = true
      )
    )
  );

create policy "Anyone can insert comments on shared/owned documents with edit access"
  on public.document_comments for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_comments.document_id
      and (
        d.user_id = auth.uid() or
        (
          (d.settings->>'shareActive')::boolean = true and
          d.settings->>'sharePermission' = 'edit'
        )
      )
    )
  );

create policy "Owners can update/resolve comments"
  on public.document_comments for update
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_comments.document_id
      and d.user_id = auth.uid()
    )
  );

create policy "Owners can delete comments"
  on public.document_comments for delete
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_comments.document_id
      and d.user_id = auth.uid()
    )
  );


-- 2. Create document_notifications table
create table if not exists public.document_notifications (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.documents(id) on delete cascade,
  recipient_id  uuid not null references auth.users(id) on delete cascade,
  sender_name   text not null default 'Guest Co-Editor',
  message       text not null,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.document_notifications enable row level security;

-- Policies for document_notifications
create policy "Users can view own notifications"
  on public.document_notifications for select
  using (auth.uid() = recipient_id);

create policy "Anyone can trigger notifications on shared/owned documents"
  on public.document_notifications for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_notifications.document_id
      and (
        d.user_id = auth.uid() or
        (
          (d.settings->>'shareActive')::boolean = true and
          d.settings->>'sharePermission' = 'edit'
        )
      )
    )
  );

create policy "Users can update own notifications"
  on public.document_notifications for update
  using (auth.uid() = recipient_id);

create policy "Users can delete own notifications"
  on public.document_notifications for delete
  using (auth.uid() = recipient_id);

-- Create search indexes for quick loading
create index if not exists idx_document_comments_document_id on public.document_comments(document_id);
create index if not exists idx_document_notifications_recipient_id on public.document_notifications(recipient_id);
