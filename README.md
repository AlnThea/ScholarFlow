# ScholarFlow

ScholarFlow is an AI-powered academic research workspace focused on writing, citation workflow, and bibliography management.

## Current Scope

- TipTap academic editor
- citation markers
- bibliography section support
- local draft persistence
- export to HTML and JSON
- AI sidebar placeholder for future backend integration

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

- AI actions are placeholders for now, wired to backend later.
- Citation output must stay grounded in verified sources.
- Future modules such as statistics, bibliometric analysis, SEM PLS, and journal publishing are intentionally out of scope for the current MVP.
