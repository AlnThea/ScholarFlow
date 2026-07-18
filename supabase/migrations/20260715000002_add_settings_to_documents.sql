-- ============================================================
-- ScholarFlow — Add Settings to Documents
-- Created: 2026-07-15
-- Description: Add settings JSONB column to documents table
-- ============================================================

alter table public.documents
add column if not exists settings jsonb not null default '{
  "publishYear": "all",
  "publishYearStart": null,
  "publishYearEnd": null,
  "impactFactor": "all",
  "considerExternal": false,
  "considerLibrary": false,
  "limitCollection": "all",
  "citationStyle": "apa",
  "citationLocale": "en-US",
  "showPageNumber": false
}';
