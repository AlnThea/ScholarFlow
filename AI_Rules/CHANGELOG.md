# ScholarFlow Changelog

## v0.0.1
- Selected product name: ScholarFlow
- Defined MVP scope
- Selected stack:
    - Next.js
    - TypeScript
    - TailwindCSS
    - TipTap
    - FastAPI
    - Supabase PostgreSQL
    - Gemini API
- Defined initial roadmap
- Defined mini AI rules

## v0.0.2 - In Progress
## v0.0.2
- Built production-ready TipTap editor page
- Added reusable editor toolbar and sidebar
- Added local draft persistence
- Added export to HTML and JSON
- Added custom citation marker support
- Added bibliography section insertion

## v0.0.3 - In Progress
- Adding AI sidebar placeholder
- Preparing FastAPI backend
- Preparing Gemini improve-writing workflow
- Adding README documentation

## v0.0.4 - In Progress
- Added FastAPI backend skeleton
- Added improve-writing endpoint scaffold
- Added backend service and schema structure

## v0.0.5 - In Progress
- Connected AI sidebar to improve-writing endpoint
- Added backend request helper on the frontend
- Added rewrite result preview and apply action
- Added selected text replacement workflow

## v0.0.6 - In Progress
- Added citation search backend endpoint
- Added citation candidate preview in the AI sidebar
- Added citation candidate insertion into the editor
- Added bibliography sidebar and reference formatting
- Added persisted citation library

## v0.0.7 - In Progress
- Added citation ranking score
- Added ranking-based ordering of citation candidates
- Added ranking hints to citation cards

## v0.0.8 - In Progress
- Added bibliography export support
- Added TXT and JSON export actions in the bibliography sidebar
- Added bibliography text serialization helper

## v0.0.9 - In Progress
- Added backend deployment notes
- Added production run guidance for the FastAPI service
- Added environment and reverse proxy deployment guidance

## v0.1.0 - In Progress
- Added citation export support
- Added TXT and JSON export actions in the citation lookup panel
- Added citation candidate text serialization helper

## v0.1.1 - In Progress
- Added citation history support
- Added persisted citation search history
- Added repeat citation search actions from history items
- Refined AI sidebar layout to surface citation history higher in the panel

## v0.1.2 - In Progress
- Refined the editor workspace shell layout
- Made the header sticky and the main editor area viewport-based
- Kept the side panels anchored while the editor scrolls internally

## v0.1.3 - In Progress
- Reworked the workspace into a library sidebar and document canvas layout
- Moved AI tools into the library rail
- Added source and collection tabs in the left panel

## v0.1.4
- Refined Math Block Tool behavior to toggle LaTeX input visibility on focus/blur
- Fixed editor auto-save infinite loop bug caused by DOM mutations by sanitizing saved content strictly in-memory
- Added custom inline tags (`span` for math, `cite` for citation) to EditorJS whitelist sanitizer to prevent parsing loss
- Connected Font Size picker state to cursor position to dynamically sync checkmarks on selection
- Redesigned Right Sidebar (Research Assistant) into a fixed full-height modal slide-over panel with close button and automatic desktop spacer
- Redesigned LaTeX Math Helper into a floating side widget with dynamic screen positioning (adjusts to right sidebar state)
- Added responsive grid layout for LaTeX Math Helper (2 columns for short formulas, 1 column for long formulas)
- Implemented smart-click action on LaTeX Math Helper (inserts directly if a formula input textarea is focused, otherwise copies to clipboard with toast notification)
- Added real-time KaTeX visual previews next to formula labels in the Math Helper widget

