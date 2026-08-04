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

## v0.1.6
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
- Added LaTeX Math Editor UX enhancements:
  - Added a "Rumus Matematika (LaTeX)" button to the custom right-click context menu in `components/editor/editor-layout.tsx` to let users quickly convert highlighted text directly into inline math equations.
  - Implemented keyboard shortcuts (`Ctrl + Shift + M` and `Alt + M`) inside the editor container keydown listener in `components/editor/editorjs-editor.tsx` to insert inline equations without manual toolbar clicks.
  - Automatically triggered auto-saving (`onContentChange`) immediately upon inserting or updating inline equations to ensure math edits are saved in real-time.
  - Expanded the LaTeX Math Helper Panel database from 16 basic items to a comprehensive academic math library categorized into Tabs (Umum, Yunani, Operator, Kalkulus, Struktur, Semua), adding advanced trigonometry (sin, cos, tan, arcsin, etc.), set theory/logic (union, intersect, empty set, Kronecker tensor product), blackboard bold number sets (real, integer, complex, natural numbers), vector calculus (triple integrals, contour integrals, derivatives, curl, gradient, Laplacian), and math text styles.
  - Integrated an interactive real-time search box inside the LaTeX Math Helper Panel to instantly filter mathematical formulas and symbols.
- Modernized editor inline formatting & Word export:
  - Replaced browser's deprecated `document.execCommand` with modern selection range wrapping API in `components/editor/editorjs-editor.tsx` for bold, italic, underline, strike, sub/sup, code, highlight, and links.
  - Added a `CustomFormatsSanitizerTool` to the EditorJS configurations to whitelist custom formatting tags (`u`, `strike`, `s`, `code`, `mark`, `sup`, `sub`, `b`, `strong`, `i`, `em`, `a`) from parser sanitization.
  - Enabled auto-saving (`onContentChange`) immediately on format toggle.
  - Enhanced Microsoft Word export in `lib/editor/citation-export-word.ts` to support image block rendering with captions, math block formula formatting, and clean processing of inline math elements.
  - Updated bibliography formatting in `lib/editor/bibliography.ts` to output HTML instead of plain text, enabling native italic formatting for sources/journals, and corrected the manual fallback to use HTML tags.
  - Prevented redundant document saves to the database on initial page load and editor rendering using a `lastSavedContentRef` JSON comparison hook inside `scholar-editor.tsx`.
  - Implemented premium bibliography locking UI for the Free tier, showing a blurred bibliography effect overlaid with a beautifully styled "References are a paid feature" call-to-action banner, complete with a functional "See Pricing" trigger.
  - Extended the EditorJS whitelisted sanitizer tools (`div`, `span`, `button` tags and style/onclick attributes) and save content cleaner to ensure the dynamic billing banner isn't permanently written to the backend database.
- Improved Image Block Integration & Custom Modal:
  - Fixed a `TypeError` by configuring a client-side base64 FileReader uploader for the EditorJS ImageTool, allowing users to upload local images directly without relying on server-side upload endpoints.
  - Wrapped image URLs in a `{ file: { url } }` object to match the block data schema expected by `@editorjs/image`, resolving the issue where image blocks would render as empty file upload dropzones.
  - Created a custom popup modal (`isImageModalOpen`) in `components/editor/editor-layout.tsx` to replace the browser's native Javascript `prompt` dialog, featuring responsive styling, autoFocus, and Enter key confirmation.
  - Portaled the image modal using React's `createPortal` to render it directly under `document.body`, resolving absolute/fixed centering alignment bugs caused by parent CSS `transform` layouts.
  - Replaced non-standard `z-55` classes with `z-[9999]` for the image, pricing plan, and AI model modals, and portaled all three modals to `document.body` to resolve layering/z-index issues.
- Fixed Editor.js Initialization Race Condition:
  - Added a type safety guard to `renderContent` in `components/editor/editorjs-editor.tsx` that checks if `editorRef.current.render` is a function before calling it. If the editor is still in the process of initializing, the content is queued into `pendingContentRef` and rendered automatically in the `onReady` hook.
- Custom LaTeX Math Inline Equation Modal:
  - Updated `insertInlineEquation` and `insertInlineEquationLocal` in `components/editor/editorjs-editor.tsx` to support direct insertion of custom LaTeX formulas via an optional parameter.
  - Implemented a custom inline equation popup modal (`isMathModalOpen`) in `components/editor/editor-layout.tsx` portaled to `document.body` with `z-[9999]`, replacing window.prompt.
  - Pre-populated the input field of the math modal with the currently selected text in the document for enhanced math editor user experience.
  - Resolved caret selection loss inside `insertInlineEquationLocal` by falling back to `lastSelectionRangeRef` when the active selection is outside the editor, and restored the caret position immediately after the inserted equation span.
  - Corrected DOM insertion sequence by focusing the contenteditable block parent and explicitly restoring the active range in the browser selection object prior to mutating DOM nodes, resolving EditorJS warning mismatch (`redactor dom changed` unsubscribed handler error).
  - Dispatched a mock `input` DOM event on the block parent to ensure EditorJS recognizes the inline equation insert and serializes it successfully on auto-save.
  - Implemented `saveSelectionRange` API method and called it synchronously inside the math toolbar button's click handler to prevent selection loss before opening the custom modal. Added user alert warning if no target cursor range is focused in the document.
  - Whitelisted `'data-formula'` and `contenteditable` attributes inside `CustomFormatsSanitizerTool`'s span element sanitization schema in `components/editor/editorjs-editor.tsx` to prevent LaTeX formula strings from being stripped on save.
  - Added a DOM container guard to EditorJS initialization in `components/editor/editorjs-editor.tsx` to return early if `editorjs-holder` is not found, resolving race condition crashes in development (React Strict Mode double-effect unmount error).
  - Hid scrollbars inside the LaTeX Math Helper category tabs in `components/editor/editor-layout.tsx` across all web rendering engines (Webkit/Firefox/IE) and increased font sizes to standard `text-xs` (12px) to prevent button click overlapping issues.
  - Added vertical padding (`py-1.5`) and `overflow-y-hidden` to the LaTeX Math Helper tabs wrapper in `components/editor/editor-layout.tsx` to resolve vertical text clipping on the tab buttons.
  - Replaced non-standard `pl-7.5` with standard `pl-8` on the LaTeX Math Helper search input in `components/editor/editor-layout.tsx` to resolve search icon overlapping text issues.

## v0.1.7
- Implemented platform-wide dynamic bilingual (i18n) localization supporting English (default) and Indonesian:
  - Created a client-side React context provider (`LanguageProvider` in `language-context.tsx`) with localStorage session state persistence to avoid hydration mismatches.
  - Added a responsive language toggle button dropdown inside the main editor header adjacent to the user profile menu.
  - Localized the main workspace layouts, search placeholders, tone selector badges, and toast feedback messages.
  - Localized payment setup dialogs (`gateway-selector-modal.tsx`), checkout menus (`stripe-checkout-modal.tsx`, `midtrans-checkout-modal.tsx`), draft share access configuration modals (`share-document-modal.tsx`), and OpenAlex database search components (`insert-citation-modal.tsx`).
  - Localized LaTeX Math Helper panel tabs and dynamic description lists, wrapping category choices using a CSS `flex-wrap` layout to avoid horizontal overflow bars on narrow screens.
- Standardized academic document template structures inside `scholar-editor.tsx` to inject English metadata outlines (Chapter 1: Introduction, Chapter 2: Literature Review, etc.) dynamically based on client settings.
- Adapted server AI endpoints (`/synthesize`, `/improve`, `/abstract`) to accept a language parameter, delivering system instructions in English but constraining target outputs to write in the dynamically selected target language (English/Indonesian).
- Localized the MS Word exporter (`citation-export-word.ts`) to print either "REFERENCES" or "DAFTAR PUSTAKA" based on document locale settings.
- Verified and compiled type check parameters (`npx tsc --noEmit` and `npm run build`) successfully across all modules.

## v0.1.8
- Fixed missing images bug in Microsoft Word export by transitioning the export format from plain HTML to MHTML (multipart/related).
- Added `getBase64FromUrl` and `generateWordMhtml` helpers to dynamically fetch and encode inline base64, blob, relative, and external images on the client-side.
- Added `getImageDimensions` helper to extract dimensions of PNG, JPEG, and GIF images from base64 binary headers.
- Resolved vertical image stretching (distortion) in MS Word by dynamically calculating and injecting proportional HTML `height` attributes alongside the physical `width="576"` attribute, while keeping `style="max-width: 100%; height: auto;"` for web browser responsiveness.
- Kept the original `generateWordHtml` layout formatting intact while converting `exportToWordFile` to an asynchronous operation.
- Implemented premium auto-growing (`adjustAllCodeTextareaHeights`) and word-wrapping (`white-space: pre-wrap`) features for EditorJS code block textareas, preventing code truncation and horizontal scrollbar overflows.
- Added `case 'code'` support in `generateWordHtml` and `generateWordMhtml` templates to correctly format and render pre-formatted code block sections with HTML-escaping, gray backgrounds, and left borders in the exported MS Word document.
- Integrated high-fidelity CodeCogs LaTeX-to-PNG image generation for both block and inline math formulas, ensuring equations are embedded as local, high-quality images that render correctly in MS Word.
- Added asynchronous inline math parsing and local MHTML attachment support (`processTextHtmlMhtml`), resolving the issue where inline equations were blocked in Microsoft Word's Protected View.
- Resolved a critical infinite saving loop bug by removing height-adjusting DOM manipulations from the editor's `onChange` callback, preventing save state locks.
- Filtered out editor-inserted bibliography blocks (`Daftar Pustaka / References` header and its subsequent block) in the Word exporters (`generateWordHtml` and `generateWordMhtml`) to eliminate duplicate bibliography entries in the exported Word document.
- Verified and type-checked compiling parameters (`npx tsc --noEmit`) successfully.

## v0.1.9
- Redesigned the admin settings sidebar view in `minimal-sidebar.tsx` from card-based layouts to clean, grouped, and standard list-style menu items.
- Grouped admin settings into "AI & System" (Kelola Model AI) and "Billing & Monetization" (Kelola Paket Harga, Saluran Pembayaran) categories.
- Redesigned the main menu navigation items (Dashboard, Create New, My Documents, Library, Account & Billing, Help) in `minimal-sidebar.tsx` to match the settings list layout with descriptive subtitles and grouped structures.
- Redesigned the "My Documents" (Dokumen Saya) sidebar panel view in `minimal-sidebar.tsx` with high-fidelity search bars, rounded-card project folder structures, custom project type badges (thesis, independent, skripsi), and premium file tree list styling.
- Linked "My Documents" click action (in both expanded and collapsed sidebar states) to close the active document editor and switch the dashboard tab to the user documents page, keeping navigation fluid and unified.
- Flattened the project folder styling in the sidebar list by removing the outer card-based background and borders, matching the clean minimalist design of Notion.
- Removed the redundant "Create New" (Buat Baru) button from the main sidebar "Workspace" group (in both expanded and collapsed states), keeping document creation centralized inside the "My Documents" panel.
- Redesigned the "Create New Document" action inside the "My Documents" panel from a solid blue button container to a clean, transparent, and grouped list-style menu item matching other sidebar elements, separated visually by a clean bottom border line.
- Limited the displayed "Independent Documents" list in the sidebar to 15 items to prevent vertical clutter, adding a dynamic translation-supported counter label (e.g., "+ 3 draf lagi") when more documents exist.
- Developed a highly modular and reusable React component `DocumentSettingsModal` in `document-settings-modal.tsx` to enable editing an existing document's search parameters, impact factor limit, external/library sources, collection limits, and citation styles.
- Added a premium settings gear icon (⚙️) on the header next to the document title input in `editor-layout.tsx` to trigger the settings modal.
- Integrated the settings modal state and callback in `scholar-editor.tsx`, which dynamically saves the updated configuration to Supabase and updates the editor state in real-time.
- Verified TypeScript compilation successfully.


