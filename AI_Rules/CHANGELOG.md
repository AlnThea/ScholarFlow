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
- Relocated the Change Language and Dark/Light Mode toggle buttons from the top toolbar (`editor-layout.tsx`) to the bottom footer of the sidebar (`minimal-sidebar.tsx`) to make the header cleaner.
- Designed the settings/language/theme controls in the expanded sidebar to align side-by-side: three buttons for admin role (Settings, Lang, Theme) and two buttons for standard users (Lang, Theme), collapsing into a vertical stack in the collapsed sidebar state.
- Verified TypeScript compilation successfully.

## v0.2.0
- Replaced the browser native `prompt()` editing modal for inline equations (triggered when clicking on `.sf-inline-math` elements in the editor canvas) with the custom, premium React modal portal (`isMathModalOpen`).
- Implemented an `onEditInlineEquation` callback prop in `EditorJsEditor` and connected it to parent states in `editor-layout.tsx` to handle editing context, allowing users to edit LaTeX formulas and save changes dynamically.
- Configured dynamic modal header titles ("Edit Rumus Matematika (LaTeX)" vs "Sisipkan Rumus Matematika (LaTeX)") and submit button text ("Simpan Perubahan" vs "Sisipkan Rumus") depending on whether an editing session is active.
- Replaced the browser native `prompt('Enter link URL')` (triggered when applying formatting link to selected text) with a custom React portal modal (`isLinkModalOpen`).
- Added an `onInsertLinkRequest` callback prop in `EditorJsEditor` and connected it to parent states in `editor-layout.tsx` to manage link insertion workflows, ensuring editor range selection and focus are correctly restored.
- Enabled editing and unlinking of existing hyperlink elements using the same custom React link modal portal. If an existing link is selected, the modal is populated with its current URL, and a "Hapus Tautan" (Remove Link) button is shown in the modal's footer to allow unlinking the highlighted text directly.
- Integrated selection formatting checks in `handleSelectionChange` to detect if the current cursor selection wraps or is inside a hyperlink, enabling the top toolbar and floating bubble toolbar link buttons to automatically highlight as active.
- Upgraded the selection-link matching logic to check selection's `anchorNode` parent, `focusNode` parent, and selection range fragment content, ensuring robust visual active highlights when highlighting partial or complete hyperlink text.
- Upgraded the `existingLink` detection logic inside the editor's `toggleInlineFormat('link')` method using the same robust three-layer selection checks, ensuring the link modal is correctly opened in "Edit Link URL" mode with pre-filled URLs when clicking the Link toolbar button.
- Fixed an issue where the Link Modal confirmation button and remove button were invisible by correcting invalid Tailwind color classes (`bg-indigo-650` and `text-red-650` to standard `bg-indigo-600` and `text-red-600`).
- Developed a customizable text highlighting engine supporting multiple colors (Yellow, Green, Blue, Pink, Purple) and unlinking/clearing highlight formatting directly.
- Refactored `toggleInlineFormat('highlight')` in `components/editor/editorjs-editor.tsx` to detect existing `<mark>` element wraps using the robust three-layer check, updating the highlight color class name on the element itself rather than nesting tags or shrinking fonts.
- Implemented active formatting state tracking for `<mark>` tags in `handleSelectionChange`, causing both the top toolbar and bubble selection menu highlight buttons to light up as active.
- Added a floating portal-based highlight color palette picker in `components/editor/editor-layout.tsx` that appears below the clicked button when triggering highlight, displaying color selection pills and a trash can button to clear highlighting.
- Fixed highlight color picker popover styling by replacing invalid Tailwind size/shape classes (`w-5.5 h-5.5 rounded-full`) with properly sized, square-tiled boxes (`w-6 h-6 rounded`) to restore visibility and align with the user's design preference.
- Mapped text highlights in the MS Word export templates (`processTextHtml` and `processTextHtmlMhtml` in `lib/editor/citation-export-word.ts`) to inline CSS styled `<span>` tags (`style="background-color: ..."`), converting highlight classes (yellow, green, blue, pink, purple) to standard hex color codes. This replaces the `<mark>` tag which is ignored by Microsoft Word's HTML importer, ensuring highlighting is correctly displayed inside Microsoft Word.
- Added a loading indicator state (`isExporting`) to the Microsoft Word export action inside `components/editor/editor-layout.tsx`. During the export process, the button is disabled to prevent double clicks, the text dynamically updates to "Exporting..." / "Mengekspor...", and the Word icon is replaced with a spinning loading indicator (`IconLoader`).
- Implemented high-fidelity client-side PDF export (`exportToPdfFile` in `lib/editor/citation-export-word.ts`) that generates vector-quality PDF documents preserving A4 typography, Times New Roman, text alignments, math equations, and highlight colors. The export utilizes a dynamic print iframe to trigger the browser's native PDF generation.
- Added an "Export PDF" button to `components/editor/editor-layout.tsx` alongside the Word export button with loading states, plan limit restrictions, and a custom inline `IconFilePdf` SVG element for compile-safety.
- Conditioned bibliography/reference list inclusion during Word and PDF exports based on the user's pricing plan: Pro Writer users get the full academic references appended to the export, while Free plan users (including admin roles when testing on a Free subscription) can export documents directly and seamlessly without warning popups, but their exported documents will automatically exclude the references list.
- Upgraded the bibliography block cleanup logic in `generateWordHtml` and `generateWordMhtml` (`lib/editor/citation-export-word.ts`) to be extremely robust: it strips HTML tags and normalizes to lowercase before checking header keywords (case-insensitive checking), and strictly breaks early to discard the header and all subsequent blocks from the exported file if `isPro` is false, ensuring complete reference omission.
- Verified TypeScript compilation successfully.

## v0.2.1
- Consolidated the separate "Export Word" and "Export PDF" buttons in the editor header layout into a single, clean "Export" dropdown button.
- Designed the dropdown to toggle via `showExportDropdown` state, featuring an backdrop click-away handler to auto-close the menu.
- Displayed Microsoft Word (.docx) and PDF Document (.pdf) options inside the dropdown with clean icons, retaining all loading states, plan limit checks, and export functions.
- Relocated bibliography export formats (TXT, JSON, BibTeX, RIS) from the Research Assistant Library sidebar into the Header "Export" dropdown menu, dividing them cleanly under "Document" and "Bibliography" sections.
- Removed the old "Bibliography export" card from `editor-sidebar.tsx` to declutter the right panel.
- Replaced browser's native `alert()` warnings for Free tier bibliography export limits with a custom React portal modal `isExportUpgradeModalOpen`, complete with a plan pricing redirection flow.
- Created a database SQL migration `20260805000001_add_sharing_policies.sql` to implement public read/write RLS policies for shared manuscripts and public read access on `profiles` (for owner subscription checks).
- Created a secure Next.js server-side API route handler at `app/api/shared-document/route.ts` that uses the Supabase Service Role client to bypass client-side RLS limits for guest reads and updates.
- Redirected client-side `fetchSharedDocument` and `updateSharedDocument` in `lib/api/documents.ts` to call the `/api/shared-document` server API, resolving RLS access denied exceptions when Account B or anonymous users load documents owned by Account A.
- Integrated the settings updates directly with the toggle and dropdown options inside `components/editor/share-document-modal.tsx`.
- Created a new dynamic route page `/shared/[id]` featuring read-only viewer mode, co-editor collaborative mode (with debounced cloud saving), and dynamic formatting of the reference library bibliography list.
- Resolved an infinite update loop on the shared page by:
  1. Implementing a stringified content comparison check using a `lastSavedContentRef` reference in the `handleContentChange` callback.
  2. Implementing an array content comparison logic in `onStatsChange` (`prev.every(...)`) to prevent unnecessary React state updates from new array reference instantiations.
  3. Isolating the bibliography `useEffect` dependency array to depend on primitive configuration settings (`styleSetting`, `localeSetting`, `ownerPlanSetting`) rather than the entire document object.
- Configured the editor-integrated bibliography on the shared page to check the document owner's subscription tier: if the owner is on a Free plan, the bibliography is rendered locked under a premium fade-out mask; if they are on Pro, the references are fully readable.
- Implemented a premium visual lock using a height-limited container (`max-height: 55px`, `overflow: hidden`) enclosing a blurred inner text wrapper (`filter: blur(3px); opacity: 0.35`) and an absolute white linear-gradient overlay in `components/editor/editorjs-editor.tsx`. This shows a teaser of only the first line of the first citation (which is fully blurred and unreadable), with subsequent lines and citations fading smoothly into a solid white paper background, while keeping the full list visible to Pro users.
- Added pre-sanitization of initial document content in `app/shared/[id]/page.tsx` on mount to filter out legacy inline CSS blur filters and replace them with the combined blurred + fade-out container layout, preventing any initial flash of unblurred text on legacy shared files.
- Upgraded `upsertBibliography` in `components/editor/editorjs-editor.tsx` to run asynchronously: if the editor is in readOnly mode, it temporarily toggles read-only off to enable block API insertions and deletes, and then locks it back to true, allowing guest readers in read-only mode to load blurred, masked preview blocks correctly.
- Implemented a secure text-scrambler `scrambleHtmlText` helper inside `components/editor/editorjs-editor.tsx`. Under Free plans, the actual text values of the references are replaced with scrambled characters (e.g. `Xxxxx, X. (0000)`) in the DOM. This patches a vulnerability where users could bypass the CSS blur by highlighting, copying, and pasting the text.
- Removed the redundant static bibliography list at the bottom of the shared page, ensuring the canvas matches the exact visual style of the main editor.
- Added dynamic readOnly toggling support and shortcut restrictions to `components/editor/editorjs-editor.tsx`.
- Verified TypeScript compilation and production build successfully.

## v0.2.2
- Fixed Shared Collaborator Page ReferenceError:
  - Resolved `ReferenceError: Cannot access 'language' before initialization` in `app/shared/[id]/page.tsx` by moving the `language` variable declaration to the top of the `SharedDocumentPage` component function body, before any hooks or useMemo blocks reference it.
  - Resolved `IconTable is not defined` compile error on the shared page by importing `IconTable` from `@tabler/icons-react` at the top of the file.
- Enabled Complete Collaborative Toolbar and Portal Parity:
  - Aligned inline math confirmation handler `handleInsertMathConfirm` on the shared collaborator page to support inserting new inline LaTeX equations directly at the cursor position (calling `editorJsRef.current?.insertInlineEquation`) when not editing an existing formula.
  - Implemented the complete interactive formatting and AI Assistant selection Bubble Menu (activated via text highlighting and right-click context menu event listeners) inside the shared collaborator page (`app/shared/[id]/page.tsx`).
  - Integrated AI model selection, tone customization selectors, and Assistant actions ("Polish with AI" and "Paraphrase Sentence") in the collaborator bubble menu.
  - Added a responsive side-by-side AI text comparison modal ("Teks Asli" vs "Hasil Perbaikan AI") for Co-Editors to review, edit, and apply AI suggestions directly to the text canvas.
- Improved LaTeX Math Helper Panel Usability:
  - Made the LaTeX Math Helper header, search inputs, and category tabs sticky by removing `overflow-y-auto` from the outer panel and wrapping only the math items grid in a flex-1 scrolling container.
  - Applied the identical sticky layout enhancements to the Math Helper panel in both the collaborator shared view (`app/shared/[id]/page.tsx`) and the owner's editor dashboard (`components/editor/editor-layout.tsx`).
- Standardized Global Custom Scrollbar Styling:
  - Unified scrollbar styling across all devices and web rendering engines by adding global CSS scrollbar selectors to `app/globals.css`.
  - Configured a premium, ultra-thin width of `4px` with fully rounded tracks and slate color overlays to match the application's clean academic minimalist aesthetics.
- Enabled Smart Auto-Language Detection for AI Writing Assistant:
  - Updated the prompt construction logic in `/api/v1/ai/improve` endpoint (`app/api/v1/ai/improve/route.ts`) to instruct the LLM to automatically detect and write in the exact same language as the input text (preserving Indonesian or English natively), rather than strictly overriding it based on document citation settings.
- Integrated Citation Details Modal in Shared Document Page:
  - Bound `onCiteClick` handler to `<EditorJsEditor />` inside `app/shared/[id]/page.tsx` to handle inline citation node click events.
  - Implemented the dynamic React portal modal `activeModalCitation` at the bottom of the shared page view, using `findMostRelevantSentence` and `HighlightedAbstract` helper components to show the matching abstract snippet and highlighted journal details (supporting both read-only and co-editor modes).
- Resolved Collaborative Document Text Alignment Loss:
  - Transitioned the EditorJS text alignment styling (Left, Center, Right, Justify) from transient local-only storage to cloud-synchronized document settings.
  - Implemented automatic database synchronization in `components/editor/scholar-editor.tsx` and `app/shared/[id]/page.tsx` that writes the active block alignments map directly to the `settings.alignments` JSONB column on save.
  - Configured mount loaders to automatically read `settings.alignments` from cloud-loaded document details and populate the client-side `localStorage` cache (`scholarflow.editorjs.alignments.v1`) on startup, ensuring paragraph layouts render identically for collaborators, guest readers, and owners alike.
  - Resolved an auto-save race condition on both the owner's editor and collaborator page by refactoring `triggerDebouncedSave` to read alignments directly from `localStorage` at the execution instant. This ensures concurrent DOM content saves do not overwrite settings alignment payloads, securing consistent formatting across page refreshes and exports (Word/PDF).
  - Fixed read-only mode alignments by expanding `restoreBlockAlignments` to target non-editable block containers (`.ce-paragraph`, `.ce-header`, `.cdx-block`) when the editor is in readOnly mode (where `contenteditable="true"` is not present).
- Fixed Read-Only Shared View Bibliography Rendering:
  - Allowed `upsertBibliography` to execute on the read-only shared page (removing the `isCoEditor` check) to ensure the dynamic premium blur mask and upgrade banner are correctly rendered at runtime according to the owner's plan tier.
  - Implemented a loading guard `activeReferenceIds.length > 0 && entries.length === 0` in `app/shared/[id]/page.tsx`'s bibliography update effect, preventing transient empty loading states from deleting the pre-rendered bibliography blocks on startup.
  - Refactored `scrambleHtmlText` in `components/editor/editorjs-editor.tsx` to automatically identify and bypass scrambling HTML entities (e.g. `&nbsp;`, `&amp;`), resolving browser replacement character () rendering errors in scrambled references.
  - Added global stylesheet classes `.sf-bibliography-fade-container`, `.sf-bibliography-blur`, and `.sf-fade-overlay` to `app/globals.css` with `!important` declarations, ensuring that the blur filter and height boundaries are correctly applied even if the editor's read-only sanitizer strips HTML inline style attributes.
  - Added `contenteditable="false"` to all bibliography lock containers to prevent EditorJS's strict read-only parser from sanitizing and stripping out the `div` wrapper elements from the DOM canvas.
  - Explicitly registered a `paragraph` tool override in `new EditorJS` inside `components/editor/editorjs-editor.tsx` with a custom `sanitize` profile. This whitelists `div` and `span` tags along with their `class`, `style`, and `contenteditable` attributes, forcing EditorJS to permanently preserve the premium bibliography blur layout.
  - Integrated the `PricingModal` component into the shared workspace page (`app/shared/[id]/page.tsx`) and configured the `'sf-trigger-pricing'` event listener to toggle `isPricingOpen` to `true`, allowing guest readers and co-editors to view pricing packages inside a modal dialog without being redirected to login.
  - Refactored the bibliography block deletion loop inside `upsertBibliography` to check for and delete the premium banner block at `foundIdx + 2` if it exists, preventing card duplication on database auto-saves.

## v0.2.3
- Redesigned the Writing Templates Selector inside the document setup modal with high-fidelity visual cards, accent backgrounds, categories filter pills (All, Academic, Journals, General), and real-time search filtering.
- Implemented realistic multi-paragraph academic template documents (in both English and Indonesian) for Skripsi, IEEE journals, APA journals, and reports, pre-populating them with scientific topics (Sentiment Analysis using Deep Learning, Thesis Management Systems, etc.) to serve as instant writing drafts.
- Added an Outline Preview panel inside the setup modal to display an interactive stepper outline (e.g. Chapter 1 to Chapter 5) when selecting a writing template.
- Implemented a premium glassmorphism loading overlay with a spinning loading indicator and a pulsing sparkles logo showing "Processing Document..." during document creation, retrieval, and switching.
- Created a modular and reusable React component `ConfirmModal` (`components/editor/confirm-modal.tsx`) and `LimitWarningModal` (`components/editor/limit-warning-modal.tsx`) using React Portals (`createPortal` under `document.body`) to prevent CSS Stacking Context layering bugs and ensure modals cover the sticky top navbar.
- Replaced basic browser `alert()` windows for free-tier folder/project limit caps and bibliography exports with the premium `LimitWarningModal` redirecting to the pricing modal.
- Replaced the browser native `confirm()` prompts for deleting documents with the styled danger-red `ConfirmModal` in the sidebar panel.
- Implemented a premium auto-dismissing Toast Notification system (`toastMessage`) at the bottom right corner with slide-up animations to confirm document deletions.
- Disabled the delete document icon for the currently active/selected document in the sidebar with disabled buttons, opacity-20 fades, and descriptive helper tooltips ("Dokumen aktif tidak dapat dihapus").
- Added a click-navigation guard to ignore document selection in the sidebar and prevent reloading screen overlays if the clicked document is already selected and active.
- Verified TypeScript compilation (`npx tsc --noEmit`) successfully with exit code 0.

## v0.2.4
- Added Co-Editor Commenting and Owner Notification Bell Features:
  - Created a database SQL migration `20260807000001_create_comments_and_notifications.sql` defining `document_comments` and `document_notifications` tables with indexes and secure Row Level Security (RLS) policies allowing public guest edit access.
  - Implemented the comments helper API module `lib/api/comments.ts` to fetch, insert, resolve comments and mark notifications as read.
  - Added a premium interactive floating bubble context menu option to add comments on selected editor text for Co-Editors on the shared collaborator page (`app/shared/[id]/page.tsx`).
  - Added a responsive Comments Sidebar list panel on both the owner's editor dashboard (`components/editor/editor-sidebar.tsx`) and the collaborator's shared page (`app/shared/[id]/page.tsx`).
  - Implemented an automated background polling mechanism (executing every 5 seconds) to fetch and sync comments and notifications dynamically.
  - Integrated a premium glassmorphic Notification Bell icon (`IconBell`) inside the main editor header layout (`components/editor/editor-layout.tsx`) displaying the count of unread notifications in a red badge.
  - Added a smooth scroll-to-block alignment and temporary background-pulse blink highlight effect inside the editor canvas when clicking comments or notification links.
  - Resolved a text selection collapse bug by updating `handleSelectionChange` to ignore focus switches when editing comments.
  - Added a real-time feedback toast notification loop on the shared collaborator page to alert guests instantly when the owner resolves their comments.
  - Resolved RLS insert violations on anonymous notification creations by executing pure inserts without select-returning requests.
  - Resolved temporal dead zone lexical reference compile errors by reorganizing Next.js hooks at the top of the component file.
  - Fixed horizontal overflow scrollbars inside the notification bell dropdown list by adding responsive `whitespace-normal` and `break-words` text wrapping.
  - Added dynamic name autofill attributes inside the shared page comments input, binding to active authentication credentials.
  - Created SQL migration `20260807000002_add_notification_select_policy.sql` to explicitly add select permissions on shared document notifications.

## v0.2.5
- Implemented Inline Comment Highlight & Resolved Comments History System:
  - Added custom CSS styles `sf-comment-mark` in `app/globals.css` with a soft yellow amber background (`#FEF08A`), gold bottom border (`#EAB308`), pointer cursor, and custom keyframe animations `@keyframes sf-comment-pulse` (indigo pulse) and `@keyframes sf-comment-resolve-flash` (green emerald flash transition).
  - Updated EditorJS sanitizer profiles in `CustomFormatsSanitizerTool` and `paragraph` tool config in `components/editor/editorjs-editor.tsx` to whitelist `mark` tags with `class`, `style`, `data-comment-id`, and `data-author` attributes, preventing loss of inline comment marks on save.
  - Expanded `EditorJsMethods` interface with imperative helpers:
    - `addCommentMark(commentId, authorName)`: Wraps highlighted selection in `<mark class="sf-comment-mark" data-comment-id="...">`.
    - `highlightAndRemoveCommentMark(commentId)`: Triggers a 2-second soft green emerald transition animation on the marked canvas text before unwrapping the `<mark>` tag back to regular text without altering written content.
    - `scrollToCommentMark(commentId)`: Scrolls the editor canvas smoothly to the marked text and applies a temporary indigo pulse highlight.
  - Bound `.sf-comment-mark` click events on the editor canvas container to trigger `onCommentMarkClick`, opening and selecting the corresponding comment card in the sidebar.
- Added Active vs Resolved Comments Sub-Tab Filter:
  - Redesigned the comments sidebar panel in `components/editor/editor-sidebar.tsx` with sub-tab toggles: **Aktif** (Active) and **Selesai** (Resolved) displaying active and resolved comment counts.
  - Configured resolved comments to be archived under the **Selesai** sub-tab with a green `✓ Selesai` badge, keeping the canvas clean while preserving complete comment history.
- Enhanced Bubble Context Menu Positioning & Mouse Pointer Accuracy:
  - Fixed an off-screen menu positioning bug in `app/shared/[id]/page.tsx` caused by adding `window.scrollY` and `window.scrollX` to CSS `position: fixed` elements.
  - Implemented exact mouse pointer positioning (`e.clientX`, `e.clientY`) when right-clicking on highlighted text in both shared collaborator view (`app/shared/[id]/page.tsx`) and owner editor view (`components/editor/editor-layout.tsx`).
  - Implemented smart viewport bounds calculation (*Anti-Overflow Clamping*): if the selection/right-click occurs near the bottom of the browser viewport, the menu automatically pops up **above** the cursor/selection, clamping `top` and `left` coordinates inside viewport boundaries (`10px` offset) to prevent any off-screen clipping.
- Fixed Auto-Save Trigger Timing Sensitivity:
  - Refactored `triggerDebouncedSave` in `app/shared/[id]/page.tsx` and `components/editor/scholar-editor.tsx` to move `setSaveStatus('saving')` inside the debounced `setTimeout` callback.
  

## v0.2.6
- Enhanced Inline Comment Mark Contrast, Hover State & Browser Native Tooltip:
  - Fixed plain white text rendering inside comment marks by adding explicit dark text color (`color: #78350F !important`) to `mark[data-comment-id], mark.sf-comment-mark, .sf-comment-mark` in `app/globals.css`.
  - Added dynamic hover styling (`:hover`) with rich golden yellow (`#FACC15`), dark text (`#451A03`), amber border (`#D97706`), and a vibrant glow ring shadow (`box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.4)`).
  - Added native browser tooltip `title` attribute (`title="Komentar oleh [Nama] (Klik untuk lihat)"`) when creating comment marks, and whitelisted `title` in EditorJS sanitizer configs (`CustomFormatsSanitizerTool` & `paragraph` sanitize rules).
- Automated Canvas Comment Mark Restoration & DOM TreeWalker Synchronization:
  - Added `syncCommentMarks` method to `EditorJsMethods` in `components/editor/editorjs-editor.tsx`.
  - Utilized `document.createTreeWalker` and DOM `Range` API to scan active comments fetched from database (`selected_text`) and automatically wrap unhighlighted canvas text with `<mark class="sf-comment-mark" data-comment-id="..." data-author="...">`.
  - Integrated auto-sync `useEffect` hooks in both Owner (`components/editor/scholar-editor.tsx`) and Co-Editor (`app/shared/[id]/page.tsx`) views, guaranteeing that canvas text is always highlighted when active comments exist.
- Redesigned Co-Editor Comments Panel into a Full-Height Fixed Right Sidebar:
  - Transformed the Co-Editor comments UI in `app/shared/[id]/page.tsx` from a floating card popup into a dedicated **Full-Height Fixed Right Sidebar** (`fixed top-0 right-0 h-screen w-80 md:w-96 bg-white border-l border-slate-200 z-[99] shadow-2xl`).
  - Configured sidebar to span 100% top-to-bottom (`100vh`) along the right edge of the browser window with smooth slide-in animation.
  - Added sub-tab navigation (**Aktif** with indigo badge & **Selesai** with green checkmark badge) for Co-Editors.
  - Enhanced comment cards with author initials avatar badges, amber quote boxes (`"selected text"`), click-to-scroll canvas integration, and hover highlight hints.



