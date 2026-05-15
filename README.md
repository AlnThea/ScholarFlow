# ScholarFlow

ScholarFlow is an AI-powered academic research workspace focused on writing, citation workflow, and bibliography management.

## Current Scope

- TipTap academic editor
- citation markers
- citation search workflow
- bibliography section support
- bibliography system with verified references
- citation ranking score on search results
- bibliography export to TXT and JSON
- citation export to TXT and JSON
- citation search history in the AI panel
- local draft persistence
- export to HTML and JSON
- AI sidebar wired to improve-writing backend endpoint

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- TipTap
- FastAPI backend skeleton
- Supabase PostgreSQL planned for database
- Gemini API planned for AI features

## Project Structure

- `app/` app router pages and global styles
- `components/editor/` editor UI modules
- `lib/editor/` editor extensions and sample content
- `backend/` FastAPI backend skeleton
- `AI_Rules/` project rules, tasks, and changelog
- `backend/README.md` backend run and deployment notes

## Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Notes

- Improve Academic Writing is wired to the backend.
- Citation search is wired to OpenAlex and Crossref.
- Bibliography entries are derived from verified citation candidates.
- Bibliography can be exported as TXT or JSON from the sidebar.
- Citation search results can be exported as TXT or JSON from the AI panel.
- Citation search history is persisted locally in the AI panel.
- Citation search results are ranked with a backend score.
- Backend deployment notes live in `backend/README.md`.
- Other AI actions are still placeholders.
- Citation output must stay grounded in verified sources.
- Future modules such as statistics, bibliometric analysis, SEM PLS, and journal publishing are intentionally out of scope for the current MVP.
