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

## v0.1.5
- Added helper module `lib/editor/ai-history.ts` to manage state changes and duplicate filtering for AI response history
- Implemented `aiHistory` local state in `scholar-editor.tsx` with automated `localStorage` persistence under the key `scholarflow.editor.ai-history.v1`
- Integrated automatic history logging in AI callbacks for Writing Assistant actions (Improve Writing, Paraphrase, Summarize, Abstract) and Plagiarism checker paraphrase triggers
- Passed AI History state, delete callback, and clear callbacks to `EditorLayout` and down to `EditorSidebar`
- Implemented large modal popup for AI Response History (Riwayat Perbaikan AI) triggered via a "Riwayat" button on the top-right of the Writing Tools sidebar section
  - Displays color-coded tone badges, original text vs improved text side-by-side, date, and delete, copy, and apply actions
- Redesigned the text selection bubble menu (right-click trigger) into a premium vertical list of actions:
  - Structured into two header-separated sections: **Pengaturan AI** and **Aksi Asisten**
  - Integrated horizontal select options with labels **Model** and **Gaya** inside the configuration header
  - Rendered actions vertically as items with descriptive subtitles and colored icons: **Poles dengan AI** (Meningkatkan gaya bahasa & akademis), **Parafrase Kalimat** (Tulis ulang kalimat terpilih), and **Cari Kutipan / Sitasi** (Temukan sitasi jurnal ilmiah)
  - Configured action items to trigger processes and automatically open the right sidebar (Research Assistant) upon click
  - Removed the inline AI result preview block from the bubble menu
- Added smart state comparison to the AI Improve Result **Apply** button:
  - Disables the button once clicked
  - Automatically reactivates the button if the user performs an undo (Ctrl+Z) in the canvas reverting it back to the original content state

## v0.1.6 - In Progress
- Fixed infinite auto-save and bibliography rendering/flickering loop:
  - Wrapped `upsertBibliography` modifications in `components/editor/editorjs-editor.tsx` inside an `isRenderingRef` lock to prevent programmatic bibliography updates from triggering `onChange` / `onContentChange`.
  - Refined `useMemo` dependency array for `bibliographyEntries` in `components/editor/scholar-editor.tsx` to target specific configuration properties (`citationStyle` and `citationLocale`) rather than the entire `currentDocument` object, preventing unnecessary array recreation and formatting overhead on every keystroke.
- Refactored the Research Assistant right sidebar (`components/editor/editor-sidebar.tsx`) to remove the unused "Sources" sub-tab and "Filters" placeholder button, directly displaying document "Collections" in the Library tab.
- Updated `AI_RULES_MINI.md` to add a new "safe code deletion" requirement, permitting the removal of unused/deprecated code/features upon user request, provided that all dependent code is fully repaired to ensure normal system behavior.
- Fixed a citation deletion bug in `components/editor/editorjs-editor.tsx` where deleting citation text in the editor left behind empty `<cite>` tags, keeping the citation active in the sidebar and bibliography. Empty `<cite>` tags are now ignored during live stats calculations and automatically purged from saved document JSON content.
- Refactored the keyword extraction algorithm in the citation search API (`app/api/citations/search/route.ts`) to prevent important terms (such as "sistem", "informasi", "manajemen", "sim", "VR", etc.) from being discarded. Instead of sorting keywords by length, the API now extracts the first 8 clean keywords in their original order and allows 2-letter academic abbreviations (like "VR", "AI", "UI") to be searched.
- Improved citation search accuracy on long definition sentences:
  - Updated `refineQuery` in `app/api/citations/search/route.ts` to split queries using both space and punctuation (regex `/[\s,.;:!?()]+/`), ensuring concatenated words like "mengumpulkan,mengolah" are split correctly.
  - Expanded the stop words list with common Indonesian definition and filler terms (e.g. "merupakan", "sekumpulan", "komponen", "saling", "proses") to prevent them from crowding out high-value keywords.
  - Increased clean keyword slice limit from 8 to 12 to capture terms at the end of long sentences.
  - Increased external API fetch limits from 20 to 40 candidates, sorting them using uncapped raw scores (`scoreCandidateRaw`) to ensure that relevant papers ranked lower by API defaults are not cut off.
  - Added an overlap-ratio tie-breaker to prioritize concise, precise titles when raw scores are identical.
  - Implemented a perfect match filter: if any candidate paper scores a perfect 100% Match, we filter out all other lower-scoring papers to keep results clean and noise-free, applying this logic to both cache hits and fresh API searches.
- Implemented premium In-Text Inline Citation Autocomplete Widget:
  - Designed an inline search span (`span[data-citation-search="true"]`) that gets injected at the cursor when clicking the Citation button. The span is styled with a lavender background and border, allowing the user to type their search query directly inside the document.
  - Linked keyup and selection change events in `components/editor/editorjs-editor.tsx` to detect when the cursor is inside the search span, triggering the floating bubble menu directly below the span with live search results.
  - Allowed inserting the chosen citation to replace the temporary search span in the DOM, restoring the caret position right after the citation.
  - Fixed a double-insertion bug by introducing a `skipEditorInsert` flag on `onInsertCitationCandidate` callback, only calling the editor-level insertion if the search span does not exist in the DOM.
  - Handled Escape, Enter, and blur events to cancel search and convert the search span back to a regular text node, ensuring the user's typed text is never lost and database saves are kept clean.
- Fixed an Editor.js crash (`TypeError: this.currentBlock is undefined` in `updateCurrentInput`):
  - Added a check in `upsertBibliography` in `components/editor/editorjs-editor.tsx` to automatically move the caret focus to the block preceding the bibliography if the caret is currently inside the bibliography block that is being deleted. This prevents the browser selection from getting stuck on a detached DOM node.
- Fixed citation positioning when inserting from highlighted text search results:
  - Introduced `lastHighlightedRangeRef` inside `components/editor/editorjs-editor.tsx` to preserve the exact selection range highlighted by the user. When the user clicks 'Cite' inside the bubble menu, the range is collapsed to its end and the citation is inserted precisely after the period of the selected text, preventing the browser from collapsing selection and inserting it at the end of the block.
  - Collapsed the selection range to its end BEFORE adding it back to the browser selection inside `insertCitation` and `insertCitationSearch`. This prevents a browser compatibility issue where inserting a node into an active highlighted selection deletes/replaces the highlighted text itself.
- Changed custom bubble selection menu to trigger only on right-click (context menu):
  - Modified `handleSelectionChange` to not automatically show the bubble menu when text is selected/highlighted, allowing free selection without blocking the view.
  - Added an `onContextMenu` right-click event listener to the main editor container in `components/editor/editor-layout.tsx` to display the custom bubble menu at the selection rect only if an active highlighted text selection inside the editor is right-clicked.
  - Removed the autofocus `<input>` search field from the bubble menu and reverted to a static header text block. This prevents browser focus-theft, ensuring text selections remain highlighted and insertion ranges do not get collapsed/lost.

