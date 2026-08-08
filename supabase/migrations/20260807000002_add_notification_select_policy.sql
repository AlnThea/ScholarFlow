-- ============================================================
-- ScholarFlow — Migration: Add Notification Select Policy
-- Created: 2026-08-07
-- Description: Permits selecting notifications for shared documents
-- ============================================================

create policy "Anyone can read notifications on shared documents"
  on public.document_notifications for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_notifications.document_id
      and (
        d.user_id = auth.uid() or
        (d.settings->>'shareActive')::boolean = true
      )
    )
  );
