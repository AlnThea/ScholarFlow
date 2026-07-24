# ScholarFlow Mini Rules

## Project
ScholarFlow is an AI-powered academic research workspace.

Current MVP focus:
- AI academic editor
- citation automation
- bibliography generation
- academic writing assistant

Future modules:
- statistics
- bibliometric analysis
- SEM PLS
- journal publishing

Do NOT build future modules yet.

Current focus:
editor + AI writing + citation workflow.

---

# Project Maintenance Rules

After completing significant changes:
- update CHANGELOG.md
- update TASKS.md
- update project progress if needed

CHANGELOG.md should contain:
- new features
- refactors
- architecture changes
- API changes
- UI changes

TASKS.md should:
- mark completed tasks
- add next tasks
- keep current sprint updated

Always keep project documentation synchronized with implementation.

# Stack

Frontend:
- Next.js
- TypeScript
- TailwindCSS
- TipTap

Backend:
- FastAPI
- Python

Database:
- Supabase PostgreSQL

Storage:
- Cloudflare R2

AI:
- Gemini API

Deployment:
- Frontend → Vercel
- Backend → Oracle VPS

---

# Coding Rules

Generate production-ready code.

Requirements:
- clean architecture
- reusable components
- scalable structure
- proper typing
- proper error handling
- responsive UI
- maintainable code
- safe code deletion: deleting unused/deprecated code or features is allowed when requested by the user, but all connected/dependent code must be cleaned up and repaired to ensure normal system behavior.

Avoid:
- spaghetti code
- hardcoded secrets
- duplicated logic
- messy folder structure

---

# Frontend Rules

Use:
- TypeScript strict mode
- modular components
- reusable UI
- clean modern design

UI style:
- modern
- minimal
- academic
- inspired by Notion and Jenni AI

Do NOT imitate old Microsoft Word UI.

---

# Backend Rules

Use:
- FastAPI routers
- Pydantic schemas
- service-based architecture
- environment variables

Rules:
- validate all requests
- separate business logic from routes
- never expose API keys
- return consistent API responses

---

# Editor Rules

Use TipTap.

Editor must support:
- headings
- bold
- italic
- lists
- tables
- images
- citation markers
- bibliography section

Do NOT build custom editor engine from scratch.

---

# AI Rules

Initial AI features:
- Improve Academic Writing
- Paraphrase
- Summarize
- Generate Abstract
- Find Citation

AI output must:
- use academic tone
- avoid hallucinations
- avoid fake references
- avoid fake DOI

AI only runs on explicit user action.

---

# Citation Workflow

1. User selects paragraph
2. Backend searches OpenAlex/Crossref
3. Gemini ranks relevant papers
4. Citation candidates returned
5. Citation inserted into editor
6. Bibliography updated automatically

Never generate fake citations.

---

# Current Project Status

DONE:
- project direction defined
- product name selected: ScholarFlow
- MVP scope defined
- stack selected
- Gemini selected
- Supabase selected
- Oracle VPS selected

IN PROGRESS:
- Next.js setup
- TipTap integration
- editor UI

NEXT:
1. editor toolbar
2. AI sidebar
3. FastAPI backend
4. Gemini integration
5. improve-writing endpoint
6. citation search
7. bibliography system

---

# Important Principle

Prioritize:
1. editor quality
2. AI writing workflow
3. citation workflow
4. clean UX

Build order:
1. Editor
2. AI writing
3. Citation system
4. Bibliography
5. Export
6. Authentication
7. Future modules