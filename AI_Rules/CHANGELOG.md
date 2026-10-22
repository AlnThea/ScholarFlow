# ScholarFlow Changelog

## v0.44.2 - Flagged Sentences Deep Loading into Paraphrase Studio with Smooth Scroll & Instant Generation

- **Fix Paraphrase Studio Premature Unmount (`components/editor/paraphrase-studio.tsx`)**:
  - Resolved bug where clicking a flagged sentence caused `ParaphraseStudio` to return `null` and unmount whenever `metrics.totalSentences === 0` during debouncing or single-sentence selection.
  - Relaxed mounting guard to `if (!content && !selectedSentence && !externalTargetSentence) return null;`, ensuring the studio remains mounted and accessible.
- **Deep Load, Smooth Scroll & Visual Feedback (`components/editor/academic-integrity-barometer.tsx`, `components/editor/paraphrase-studio.tsx`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Implemented custom event `scholarflow:load-paraphrase-studio` and `requestAnimationFrame` state cycling for 100% reliable re-triggering even when clicking the same sentence multiple times.
  - Added smooth scroll transition (`studioCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`) and automatic textarea focus immediately upon clicking 'Load into Paraphrase Studio'.
  - Added animated checkmark visual state on the clicked sentence card: `Loaded! Opening Studio...` / `Dimuat! Membuka Studio...` for 2.5s.
  - Added glowing highlight pulse on `#paraphrase-studio-card` (`ring-2 ring-indigo-500/40 shadow-md bg-indigo-50/20`) when populated.
  - Auto-triggers variation generation (`handleGenerate(clean)`) for Pro tier accounts or opens upgrade dialog for Free tier.
- **Verification**:
  - TypeScript 0 errors (`npx tsc --noEmit`). All 229 Vitest unit tests pass across 27 files.


## v0.44.1 - Full-Screen Word Backstage Document Hub Modal Upgrade

- **Full-Screen Workspace / Backstage Layout (`components/editor/modals/document-hub-modal.tsx`)**:
  - Replaced the compact centered popup dialog (`max-w-4xl`) with an expansive, full-screen backstage hub (`fixed inset-0 z-[100] flex flex-col bg-slate-900/60 backdrop-blur-sm`).
  - Implemented top fixed header bar matching the History (Time Machine) modal, featuring document counts, Word Backstage badge, instant `+ New Document` trigger, and quick return button.
  - Introduced responsive 2-column layout:
    - **Left Navigation Rail (Sidebar)**: Category filters (`All Documents`, `Thesis & Research Projects`, `Independent Documents`), active thesis binder folders, cloud sync status indicator, and quick return button.
    - **Right Document Explorer (Main Area)**: Instant title search input, sorting dropdown (`Recently Edited` vs `Title A-Z`), and responsive multi-column cards grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- **Seamless Modal Portaling & Zero Logic Regression**:
  - Rendered via `createPortal(..., document.body)` to avoid container clipping or stacking context trap.
  - Fully retained all callbacks and states: `onSelectDocument`, `onCreateDocument`, `onDeleteDocument`, search query filtering, and chapter project groupings.
  - 100% Dark Mode compatible (`dark:` classes throughout) and dynamic bilingual EN ↔ ID localization.
- **Verification**:
  - Full TypeScript type-checking (`npx tsc --noEmit`) passes with 0 errors.
  - All 229 Vitest unit tests pass across 27 test files.


## v0.43.18 - Reviewer #2 Pro Tier Gating & Visual Badge Indicator

- **Pro Tier Gating (`components/editor/editor-layout.tsx`, `components/editor/editorjs-toolbar.tsx`)**:
  - Gated the AI Peer Reviewer (Reviewer #2) to Pro Writer and Campus accounts.
  - Automatically redirects Free tier users to the pricing upgrade dialog when clicking Reviewer #2, pressing `Ctrl+Shift+R`, or invoking via Command Palette.
  - Added a responsive `🔒 PRO` badge on the toolbar button for Free tier accounts with full dark mode support.
- **Verification**:
  - TypeScript 0 errors. All 229 Vitest unit tests pass across 27 files.


## v0.43.17 - Smart Document Language Detection & Reviewer #2 Language Override

- **Smart Manuscript Language Detection (`components/editor/modals/peer-review-modal.tsx`)**:
  - Automatically identifies whether a manuscript is written in Indonesian even when the UI is in English, defaulting Reviewer #2 feedback to Bahasa Indonesia.
- **Dedicated Language Selector in Reviewer #2**:
  - Embedded an instant language toggle (`🇮🇩 Bahasa Indonesia` / `🇬🇧 English`) inside the Reviewer #2 header for complete user autonomy.
- **Verification**:
  - TypeScript 0 errors. All 229 Vitest unit tests pass across 27 files.


## v0.43.16 - Real-Time Reactive Token Quota Deductions & Bilingual Reviewer #2 Localization

- **Reactive Token Quota Updates (`app/api/v1/ai/peer-review/route.ts`, `components/editor/modals/peer-review-modal.tsx`, `hooks/use-editor-ai.ts`)**:
  - Automatically updates the header token counter immediately when Reviewer #2 finishes without requiring manual page refresh.
  - Returns `tokens_used`, `monthly_quota`, and `tokens_remaining` from the API route and updates React state via direct callback and custom window events.
- **Language-Aware Reviewer #2 Localization (`app/api/v1/ai/peer-review/route.ts`, `lib/editor/peer-reviewer.ts`)**:
  - Enforced strict Indonesian output instruction when `language === 'id'`, guaranteeing 100% Indonesian evaluation even if the manuscript is written in English.
  - Isolated cache entries by language (`<documentId>.<lang>`), preventing stale reports across language switches.
- **Verification**:
  - TypeScript 0 errors. All 229 Vitest unit tests pass across 27 files.


## v0.43.15 - LaTeX & Journal Package Pro Tier Gating & HTML Entity Clean Output

- **Pro Account Gating (`components/editor/editor-header-actions.tsx`, `components/editor/editor-layout.tsx`, `components/editor/modals/latex-export-modal.tsx`)**:
  - Gated the LaTeX & Journal Package exporter to Pro plans and above. Free tier accounts are shown upgrade dialogs and `🔒 PRO` indicators.
  - Pro accounts get full instant access, clean preview, and one-click Overleaf .zip download.
- **LaTeX Entity Escaping Fix (`lib/editor/latex-exporter.ts`, `__tests__/utils/latex-exporter.test.ts`)**:
  - Decoded HTML entities (`&amp;` -> `&`, etc.) prior to LaTeX symbol escaping, resolving raw `\&amp;` output in bibliography and body text into clean valid LaTeX `\&`.
- **Verification**:
  - All 229 Vitest unit tests pass across 27 files (2 new tests added). TypeScript passed with 0 errors.


## v0.43.14 - Dropdown Stacking Context & Overflow Fix: Notifications & Export Button Overlap Resolution

- **Z-Index Layering Hierarchy (`components/editor/editor-header.tsx`, `components/editor/editor-sidebar.tsx`, `components/editor/editorjs-toolbar.tsx`)**:
  - Elevated `EditorHeader` (Navbar 1) to `z-40` and `EditorJsToolbar` (Navbar 2) to `z-30`.
  - Normalized `EditorSidebar` (Citations & Library) to `z-20` (matching other canvas sidebars).
  - Completely eliminates dropdown clipping and stacking overlap ("ketimpa") where the Notifications and Export dropdowns were previously trapped beneath Citations & Library.
- **Toolbar Dropdown Overflow Fix (`components/editor/editorjs-toolbar.tsx`)**:
  - Changed `EditorJsToolbar` tools row to `overflow-visible`, preventing browser `overflow-y: auto` clipping of the Export dropdown.
- **Natural Popover Positioning (`components/editor/editor-header.tsx`, `components/editor/editor-header-actions.tsx`)**:
  - Aligned Export menu with `left-0` for direct alignment beneath the Export trigger.
  - Aligned Notifications dropdown with `right-0 sm:-right-20 md:-right-24 max-w-[calc(100vw-2rem)]` to prevent covering the Export button below.
- **Verification**:
  - TypeScript check passed with 0 errors. All 227 Vitest unit tests pass across 27 files.


## v0.43.13 - Navbar Layout Optimization: Relocated Research Assistant, History & Reviewer to Ribbon Bar

- **Ribbon Tab Quick Actions Integration (`components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`)**:
  - Relocated **Research Assistant**, **Version History**, and **Reviewer #2** buttons to the right side of the Ribbon Tab row in Navbar 2, adjacent to the navigation tabs.
  - Purged the static placeholder text `• Ribbon Bar Active` to create a functional action bar.
  - Retained dark mode styling and bilingual localization (ID ↔ EN) with responsive text hide on small screens.
- **Verification**:
  - Full TypeScript type check passes with 0 errors. All 227 Vitest unit tests pass across 27 test files.

## v0.43.12 - HTML Entity & Non-Breaking Space Normalization & Save Persistence

- **Stray Leading Non-Breaking Space Purging (`lib/utils/sanitize.ts`, `components/editor/editorjs-editor.tsx`)**:
  - Automatically strips leading `&nbsp;`, `\u00A0`, and spaces at block starts upon render (`sanitizeEditorContent`) and upon save (`cleanSavedContent`), fixing persistence across page refreshes.
- **HTML Entity Decoding in Text Analysis (`lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`)**:
  - Introduced `cleanBlockHtmlText` to decode HTML entities (`&nbsp;`, `\u00A0`, `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`) into human-readable characters rather than raw entity codes.
- **DOM Range Selection Normalization (`components/editor/academic-integrity-barometer.tsx`)**:
  - Normalized `\u00A0` to standard space within `selectTextInElement` and `handleSentenceClick` for 100% reliable click-to-highlight in the editor.
- **Unit Testing**:
  - Added unit tests in `__tests__/utils/sanitize.test.ts` and `__tests__/utils/academic-integrity.test.ts`. All 227 unit tests passing across 27 files.

## v0.43.11 - Paragraph & Heading Isolation in Academic Integrity & Flagged Sentences

- **Strict Paragraph Boundary Segmentation (`lib/editor/burstiness-engine.ts`)**:
  - Replaced global whitespace flattening with newline-first paragraph segmentation (`.split(/\r?\n+/)`), preventing chapter headers (e.g., "BAB 1: PENDAHULUAN") and sub-sections ("1.1 Latar Belakang") from merging into adjacent paragraph sentences.
- **Section Heading Exclusion from AI Sentence Analysis (`lib/editor/editor-utils.tsx`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Implemented `excludeHeaders` option in `extractTextFromContent` and applied it to `sidebar-burstiness-tab.tsx` so structural headings are not treated as AI prose or prompted for paraphrasing.
- **Precise DOM Sentence Highlighting (`components/editor/academic-integrity-barometer.tsx`)**:
  - Standardized whitespace matching in `handleSentenceClick`, ensuring clicking a flagged sentence immediately navigates to and highlights the corresponding sentence in the editor canvas.
- **Unit Testing**:
  - Added unit tests in `__tests__/utils/academic-integrity.test.ts`. All 225 unit tests passing across 27 files.

## v0.43.10 - Auto-Purge Leftover Bibliography on Version History Restore & Zero-Citation Canvas Load

- **Version History Restore Auto-Purge (`lib/editor/methods/block-methods.ts`)**:
  - In `renderContent` (invoked when restoring a revision from Version History), added automated zero-citation detection via DOM `<cite[data-citation]>`.
  - When restored content has 0 in-text citations, automatically purges leftover bibliography header ("Daftar Pustaka" / "References") and blurred content from the bottom 4 blocks.
  - Safely saves and broadcasts clean content via `saveCleanContent().then(onContentChange)`.
- **Canvas Mount Auto-Cleanup (`components/editor/editorjs-editor.tsx`)**:
  - In `editor.render().then(...)` on initial load, auto-purges leftover bottom bibliography blocks if 0 citations are detected, preventing ghost bibliographies from persisting across sessions.
  - Fully protects active citations (> 0) without any accidental loss or deletion of author manuscript text.
- **Verification**:
  - Full TypeScript validation (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## v0.43.9 - Bottom-Anchored Bibliography Isolation Protecting Manuscript Body

- **Bottom-Anchored Backward Scan (`lib/editor/methods/block-methods.ts`)**:
  - Replaced global document block scanning with `findBibliographyHeaderIndex()`, which strictly scans backwards only within the bottom 4 blocks of the document (`total - 1` down to `Math.max(0, total - 4)`).
  - Matches strictly on heading tags (`h1..h6`, `.ce-header`) containing localized bibliography titles ("Daftar Pustaka" / "References").
  - Guaranteed physical immunity for all preceding manuscript body blocks: paragraphs, chapters, and sections are 100% untouched during bibliography updates or zero-citation purges.
- **Strict Keyboard Deletion Guard (`components/editor/editorjs-editor.tsx`)**:
  - Tightened block delete interception in Editor.js to strictly check for heading bibliography titles or `.sf-bibliography-blur` / `.sf-premium-banner-container`, preventing user paragraphs from false-matching system lock attributes.
- **Verification**:
  - Full TypeScript type check (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## v0.43.8 - Zero-Citation Canvas Purge, Bilingual Bibliography Header & Academic Integrity Barometer Exclusion

- **Programmatic System Deletion Bypass & Zero-Citation Purge (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`, `hooks/use-editorjs-methods.ts`)**:
  - Introduced `isProgrammaticSystemUpdateRef` to prevent internal system deletions during `upsertBibliography` from getting blocked by Editor.js user-deletion guards.
  - Replaced DOM querying while-loop with direct index iteration in descending order (`findBibliographyBlockIndices().sort((a,b) => b - a)`), reliably purging header, content, and upgrade banner blocks when citations reach zero.
- **Bilingual Bibliography Header Localization (`lib/editor/editor-utils.tsx`, `hooks/use-editor-citation.ts`, `components/editor/scholar-editor.tsx`, `lib/editor/editor-tools.ts`)**:
  - Dynamically titles the bibliography header based on user active language: 'Daftar Pustaka' (ID) vs 'References' (EN), while recognizing legacy multi-language strings with `isBibliographyHeaderText`.
- **Bibliography Exclusion from Academic Integrity Barometer & AI Burstiness (`lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `lib/editor/academic-integrity.ts`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Excluded bibliography header and formatted reference lists from `extractTextFromContent`, `calculateBurstiness`, and `calculateAcademicIntegrity` to ensure reference lists never skew manuscript originality or sentence rhythm.
  - Prevented Canvas Heatmap buzzword highlights from decorating system-locked bibliography blocks.
- **Unit Testing**:
  - Added unit test in `__tests__/utils/academic-integrity.test.ts`. All 223 unit tests passing across 27 files.

## v0.43.7 - Dynamic In-Text Citation Deletion & Real-Time Bibliography Synchronization

- **Reactive DOM Reference IDs & Set-Union Bug Fix (`hooks/use-editor-citation.ts`)**:
  - Fixed issue where deleting in-text citations from document content did not remove them from the Citations & Library sidebar tab or bottom bibliography list.
  - Switched from additive union `[...orderedIds, ...activeReferenceIds]` to dynamic live tracking via `hasInitializedLiveStats`: once editor live stats are active, references strictly track live DOM `activeReferenceIds`.
- **Empty Bibliography Canvas Cleanup & Auto-Save (`lib/editor/methods/block-methods.ts`)**:
  - When `entries.length === 0`, deletes all bibliography blocks and dispatches `saveCleanContent().then(onContentChange)`.
  - Standardized return values to `Promise<boolean>` for reliable caller syncing.
- **Ghost Citation Removal & Real-Time Listeners (`components/editor/editorjs-editor.tsx`)**:
  - Added cleanup of empty `<cite>` tags on backspaces.
  - Added `onInput` and `onCut` events to reactively recalculate live citation stats immediately.

## v0.43.6 - Right-Click Context Menu & Bubble Menu Citation Search Synchronization

- **Direct Selection State Linking (scholar-editor.tsx, use-editor-citation.ts, use-editor-ai.ts)**:
  - Resolved regression where highlighting text and clicking 'Cari Kutipan / Sitasi' (Find Citations) from right-click context menu or floating bubble menu resulted in premature 'No citations found'.
  - Fixed empty string placeholder in useEditorCitation, lifting and linking selectedText / setSelectedText state in ScholarEditor.
- **Multi-Source Query Fallback Engine (use-editor-citation.ts, format-menu.tsx)**:
  - Upgraded runCitationSearch with 3-stage query fallback: explicit query -> selectedText state -> DOM window.getSelection().
  - Updated FormatMenu button click to immediately pass active selection to onFindCitation(query).
- **Right-Click Context Menu Dispatch Guard (editor-layout.tsx)**:
  - Added immediate onSelectionChange(text) dispatch in onContextMenu.
- **Dark Mode & Bilingual Polish on Citation Results Modal (citation-menu.tsx)**:
  - Integrated useLanguage() with dynamic English/Indonesian labels for loading, error, and empty result states, and added full Tailwind dark variants.
- **Unit Testing**:
  - Added unit test in __tests__/utils/editor-interaction-hardening.test.ts. All 222 unit tests passing.

## v0.43.5 - Free Tier Bibliography Visual Blur & Editor.js Toolbar Deletion Guard Hardening

- **Free Tier Bibliography Visual Blur & Lock (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`, `app/globals.css`, `hooks/use-editor-citation.ts`)**:
  - Restored blurred and scrambled references text (`Xxxxx, X. (2024)...`) with `.sf-bibliography-blur` and `.sf-bibliography-fade-container` for Free tier users.
  - Reinstated the "References are a paid feature - Upgrade Now" call-to-action banner card (`.sf-premium-banner-container`).
  - Added persistent locking attributes `contenteditable="false"` and `data-sf-system-locked="true"`.
- **Editor.js Floating Toolbar (`+` and `::`) Suppression on Locked Blocks**:
  - Intercepted Editor.js internal modules `Toolbar.moveAndOpen` and `BlockSettings.open` in `editorjs-editor.tsx` to automatically abort and close the floating toolbar whenever hovering or targeting system-locked blocks.
  - Implemented dynamic cursor tracking via `onMouseMove` and `onMouseDownCapture` on the editor canvas container: if cursor Y coordinate intersects any system-locked block's vertical bounding box, `.ce-toolbar` is immediately hidden (`opacity: 0`, `visibility: hidden`, `pointer-events: none`).
  - Added CSS `:has()` rules in `app/globals.css` ensuring `.ce-toolbar` is hidden whenever hovering on `.sf-system-locked-block` or `.sf-bibliography-blur`.
- **System-Locked Immutability & Deletion Interception**:
  - Wrapped `editor.blocks.delete` in `editorjs-editor.tsx` to prevent accidental or programmatic deletion of system-locked blocks.
  - Intercepted keyboard `Backspace` and `Delete` keydowns from removing or merging into system-locked blocks in `onKeyDown`.

## v0.43.4 - Targeted Action Buttons Relocation (Export, Share, 49.2k, Settings) to Ribbon Tools Row

- **Targeted Action Buttons Relocation (`components/editor/editor-header-actions.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`, `components/editor/editorjs-toolbar.tsx`)**:
  - Relocated **ONLY** the 4 user-specified action buttons from the top header to the right corner of the Ribbon toolbar tools row (aligned with paragraph alignment buttons: Left, Center, Right, Justify, directly below the ribbon tab row):
    1. **TOMBOL EXPORT**: Complete export dropdown (Word `.docx`, PDF `.pdf`, LaTeX `.tex` + `.bib` Overleaf ZIP bundle, BibTeX `.bib`, RIS `.ris`, JSON, Markdown/Text).
    2. **SHARE**: Manuscript collaboration & permissions modal launcher.
    3. **49.2K**: AI Token Quota badge (`TokenQuotaBadge`) with plan limits and upgrade prompt.
    4. **ICON GERIGI (⚙️)**: Document & research settings modal trigger.
  - **Restored Header Action Capsule (`components/editor/editor-header.tsx`)**:
    - Retained all other navigation, collaboration, and tool launcher buttons directly in the top `EditorHeader`:
      - **Spotlight Command Palette** (`Ctrl + K`) quick search with rich tooltip.
      - **Notification Bell Dropdown** (`IconBell`) with unread ping indicator and real-time notification list.
      - **Pricing Button** (`IconCreditCard` / `Pricing` / `Langganan`).
      - **Research Assistant Panel Toggle** (`IconLayoutSidebarRightCollapse` / `Research Assistant` / `Asisten Riset`).
      - **Version History & Time Machine** (`IconHistory` / `History` / `Riwayat`).
      - **Reviewer #2 Simulator & Readiness Audit** (`IconMicroscope` / `Reviewer #2`).
      - **Keyboard Shortcuts Cheat Sheet** (`IconKeyboard` / `?`).
      - **Live Co-Editors Presence Avatars** (`activeUsers`).
  - Full Dark Mode (`dark:`) and Bilingual (EN <-> ID) support maintained across both containers.
  - Automated verification: `npx tsc --noEmit` compiled with 0 errors.

## v0.43.3 - Action Buttons Relocation to Ribbon Tools Row Right Corner

- **Action Controls Capsule Relocation (`components/editor/editor-header-actions.tsx`, `components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`)**:
  - Extracted header action controls into a modular, reusable `EditorHeaderActions` component containing:
    - Export dropdown (Word `.docx`, PDF `.pdf`, LaTeX `.tex` + `.bib` Overleaf ZIP bundle, BibTeX, RIS, JSON, Markdown text).
    - Notification bell dropdown with unread badge counter.
    - Share manuscript modal launcher.
    - AI Token Quota badge (`49.2k`).
    - Pricing / subscription upgrade button.
    - Research Assistant panel toggle.
    - Version History & Time Machine launcher.
    - Peer Reviewer #2 simulator button.
    - Document & research settings button (gear icon ⚙️).
    - Global keyboard shortcuts cheat sheet button (keyboard icon ⌨️).
    - Live co-editor presence avatars.
  - Relocated this action capsule from the top header to the right corner of the Ribbon toolbar tools row, placed directly below `• Ribbon Bar Active` and horizontally aligned with paragraph alignment buttons (Left, Center, Right, Justify).
  - Streamlined the top `EditorHeader`: now solely houses the clean Word-style document title, sync engine chip, real-time autosave status, and spotlight Command Palette (`Ctrl + K`).
  - Full Dark Mode (`dark:`) and Bilingual (EN <-> ID) support.
  - Automated verification: `npx tsc --noEmit` compiled with 0 errors.

## v0.43.2 - Dynamic Header Autosave Status & Word-Style Footer Indicators Migration

- **Dynamic Autosave Status Synchronization (`hooks/use-editor-document.ts`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`)**:
  - Connected `EditorHeader` to the real runtime autosave status (`statusLabel`) from `useEditorDocument`, replacing the previous static/unresponsive placeholder text under the document title.
  - **Instant Keystroke Feedback**: Immediately triggers `Menyimpan...` / `Saving...` with amber spinner on typing, with an optimal 3,000ms (3.0s) debounce tailored specifically for Supabase Free Tier write I/O limits.
  - **Word-Style Status Transition**: Shows `Tersimpan` / `Saved` upon save completion, then automatically transitions to `Tersimpan ke Cloud` / `Saved to Cloud` after 1.5s.
  - **Reactive Timestamp Synchronization**: Updates `currentDocument.updated_at` directly in React state to `new Date().toISOString()`, so the timestamp (`Disimpan HH:mm` / `Saved HH:mm`) updates in real time without requiring a page refresh.
  - Dynamically renders saving states:
    - Amber spinning loader (`IconLoader`) with `Menyimpan...` / `Saving...` and `Menyelaraskan perubahan...` during active cloud sync.
    - Emerald cloud icon (`☁️`) with `Tersimpan` -> `Tersimpan ke Cloud` and exact last saved timestamp once synced.
    - Error indicator (`⚠️ Gagal menyimpan`) if cloud sync fails.
- **Word-Style Bottom Footer Status Bar Indicators (`components/editor/editor-layout.tsx`, `components/editor/editorjs-toolbar.tsx`, `components/editor/ghostwriter-toggle.tsx`)**:
  - Removed the pinned right cluster from `EditorJsToolbar`, eliminating visual clutter from the top ribbon tabs.
  - Relocated **Ghostwriter AI Assistant Toggle** and **70% Originality Barometer Pill (`AcademicIntegrityPill`)** to the permanent bottom status bar footer right next to the `100% Zoom` badge.
  - Enhanced `GhostwriterToggle` with optional `className` prop for seamless vertical alignment inside the footer status bar.
  - Preserved 100% functionality: clicking Originality Pill still directly opens the Right Sidebar's Cadence & Burstiness Explorer, and toggling Ghostwriter still triggers autocomplete suggestion cycles (`Ctrl+J`).
  - Full Dark Mode (`dark:`) and Bilingual (EN <-> ID) support.
  - Automated verification: `npx tsc --noEmit` compiled with 0 errors.

## v0.43.0 - Modern Microsoft Word Ribbon Editor Layout & Two-Tier Header Migration

- **Modern Microsoft Word Ribbon Toolbar (`components/editor/editorjs-toolbar.tsx`, `components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`, `hooks/use-editor-layout-logic.ts`)**:
  - **4-Tab Modern Word Ribbon**: Restructured the previous flat horizontal toolbar into 4 categorized Microsoft Word Ribbon tabs:
    1. **Beranda (Home)**: Text styling, SuggestingModeControl, Undo/Redo, Heading select (`currentBlockType`), Font size select (`currentFontSize`), Inline formats (`B`, `I`, `U`, `S`, `Code`, `Super`, `Sub`, `Link`, `Highlight`), Paragraph alignment (`Left`, `Center`, `Right`, `Justify`).
    2. **Sisipkan (Insert)**: Grouped media, tables & mathematical insertions (`Picture`, `Table`, `Code Block`, `Cross-Reference (@fig, @tab)`, `Inline KaTeX`, `LaTeX Math Block`, `Math Helper Panel`).
    3. **Referensi (References)**: Grouped academic citation tools (`@ Citation`, `CitationStyleSelector` dropdown, `Cross-Reference`).
    4. **Tinjauan & AI (Review & AI)**: Grouped manuscript integrity & review tools (`AcademicIntegrityPill`, `GhostwriterToggle`, `SuggestingModeControl`).
  - **Right Pinned Ribbon Cluster**: Kept the Academic Integrity Barometer, Ghostwriter AI toggle, and Document Status label permanently visible on the right of the ribbon across tabs.
  - **2-Tier Document Header & Full-Width Ribbon (`components/editor/editor-header.tsx`, `components/editor/editor-layout.tsx`)**: Upgraded header to professional 2-tier layout:
    - Tier 1: Blue Word icon `[W]` + Editable title + Sync engine chip (`• Realtime WS` / `Smart Polling`).
    - Tier 2: Cloud sync status (`☁️ Tersimpan otomatis ke Cloud • Terakhir diedit baru saja`).
    - **Full-Width Top Navbars & Fixed Header Position**: Restructured editor layout hierarchy so that `EditorHeader` and `EditorJsToolbar` span the full 100% width of the screen. Placed `MinimalSidebar` below the Ribbon toolbar inside the workspace, ensuring the top navbar never shifts or moves when opening or closing the left sidebar.
  - **Word Canvas Bottom Status Bar (`components/editor/editor-layout.tsx`)**: Added unobtrusive bottom status footer with live Word Count, Character Count, Language indicator, and 100% Zoom badge.
  - **Modern Left Sidebar Segmented Tabs & Document Tree (`components/editor/sidebar/sidebar-documents-view.tsx`, `components/editor/minimal-sidebar.tsx`)**:
    - Replaced the previous search-heavy "My Documents" header with 2 sleek top Segmented Tabs: `[ 📁 Dokumen ]` and `[ 📊 Sentence Rhythm ]`.
    - Integrated `PROYEK SKRIPSI / THESIS` category header with quick `+ Baru` document creation button.
    - Upgraded document list cards to modern rounded-xl cards with active document indicator (`📄 Bab 1: Pendahuluan (Aktif)`), subtle hover delete icon, and independent documents support.
    - Embedded `SentenceRhythmExplorer` directly inside the Sentence Rhythm tab for quick cadence & burstiness checking.
    - Eliminated conflicting dual rendering where `MinimalSidebar` was rendering an unstyled standalone `SentenceRhythmExplorer` without tabs (`activeSidebarTab === 'burstiness'`). Now `SidebarDocumentsView` cleanly unifies both views under the approved tab navigation (`[ 📁 Dokumen ]` and `[ 📊 Sentence Rhythm ]`) matching `mockup-editor-concepts.html`.
    - **Ribbon File Menu & Document Hub Manager (`components/editor/editorjs-toolbar.tsx`, `components/editor/modals/document-hub-modal.tsx`, `components/editor/editor-layout.tsx`)**:
      - Added Microsoft Word-style distinctive blue `[ 📁 File ]` tab to the top ribbon toolbar bar.
      - Implemented scalable `DocumentHubModal` (Word Backstage View / Document Hub) equipped with real-time search, filter pills (`All`, `🎓 Thesis`, `📄 Independent`), date/alphabetical sorting, quick creation `+ New Document`, and safe deletion with modal confirmation.
      - Integrated `Ctrl + O` global keyboard shortcut to instantly open the Document Hub.
    - **Dedicated Sentence Rhythm Left Sidebar in Editor Mode (`components/editor/minimal-sidebar.tsx`)**:
      - Since documents are now managed comprehensively via the top ribbon's `File` menu (`[ 📁 File ]`), the editor's left sidebar now renders `SentenceRhythmExplorer` exclusively when `isDocumentEditor` is active.
      - Removed the redundant `[ 📁 Documents ]` tab and document tree inside the editor sidebar, providing a distraction-free, dedicated Cadence & Sentence Rhythm workspace.
    - **Full Bilingual EN <-> ID Synchronization for AI Rhythm & Burstiness (`components/editor/sidebar-burstiness-tab.tsx`, `components/editor/burstiness-chart.tsx`, `components/editor/academic-integrity-barometer.tsx`)**:
      - Connected `SidebarBurstinessTab` and `AcademicIntegrityBarometer` to reactive `useLanguage()` context so language toggles immediately update all labels, toggle titles (`Entire Doc` / `Semua Dokumen`), and descriptions in real time.
      - Fixed hardcoded title `AI Burstiness Score` -> `{isEn ? 'AI Burstiness Score' : 'Skor Burstiness AI'}` across both the burstiness tab and burstiness chart headers.
    - **Contextual Sidebar Bottom Controls (`components/editor/minimal-sidebar.tsx`)**: Conditionally hid the Admin settings, Language, Dark Mode row, and User profile card on the document editor page (`!isDocumentEditor`) while keeping them fully accessible on the general dashboard view. This maximizes the vertical tree space for chapters and documents matching the clean sidebar layout in `mockup-editor-concepts.html`.
    - Upgraded sidebar width to `w-72 sm:w-80` with comprehensive Light/Dark Mode classes.
  - **Physical A4 Paper Canvas & Dynamic Content Growth (`components/editor/editor-layout.tsx`, `components/editor/editor-header.tsx`, `app/globals.css`)**:
    - Resolved canvas overflow clipping where `align-items: stretch` in the scrollable flex viewport clamped `#editor-page-container` to the viewport height, causing long documents, images, and subsequent paragraphs to spill outside the white paper sheet onto the desk background.
    - Set `<main>` to `items-start` (`align-items: flex-start`) and `#editor-page-container` to `h-auto self-start min-h-[1050px]`, ensuring the white A4 paper expands seamlessly with arbitrarily long content, tables, and images.
    - Enhanced document title input in `components/editor/editor-header.tsx` with `min-w-[180px] sm:min-w-[220px]` and responsive search text truncation (`hidden xl:inline`), preventing title shrinkage when both sidebars are opened simultaneously.
  - **Zero Logic Regression**: 100% preserved all React hooks, Editor.js methods, keyboard shortcuts, onboarding tours (`data-tour`), and event handlers.
  - **Automated Verification**: Clean `tsc --noEmit -p tsconfig.json` compilation (0 errors).

## v0.42.3 - Zen Mode Autosave Debounce & Zero-Latency Local Snapshot

- **Zen / Focused Mode Autosave Delay (4,500ms) & Zero-Latency Local Cache (`hooks/use-editor-document.ts`, `hooks/use-shared-document-sync.ts`)**:
  - **Autosave Debounce Relaxation**: Relaxed the cloud save debounce timer from 1,500ms to 4,500ms (4.5s) across both single-user and co-editor shared sessions, eliminating visual distraction and rapid status indicator oscillations during drafting.
  - **Zero-Latency Local Offline Snapshot**: Integrated immediate synchronous `localStorage` snapshot in `triggerDebouncedSave` at millisecond 0, guaranteeing zero data loss during the 4.5s debounce window.
  - **Automated Verification**: Clean `tsc --noEmit` compilation (0 errors) and 100% test pass rate (218/218 Vitest tests).

## v0.42.2 - Editor.js Toolbar Alignment & Heading Typography Normalization

- **Heading Baseline & Toolbar Vertical Alignment Normalization (`app/globals.css`, `lib/ai/ghostwrite-helper.ts`, `app/api/v1/ai/ghostwrite/route.ts`)**:
  - **EditorJS Header Baseline Normalization**: Overrode `@editorjs/header`'s inflated default `padding: .6em 0 3px` with compact `padding-top: 2px !important; padding-bottom: 4px !important`, eliminating the baseline calculation offset in `Toolbar.moveAndOpen()` that pushed the `+ ::` toolbar action button 25px–35px below the heading line.
  - **Academic Heading Typography Hierarchy**: Defined a clean, standardized scale for `h1.ce-header` (1.875rem), `h2.ce-header` (1.45rem), `h3.ce-header` (1.2rem), and `h4-h6.ce-header` (1.05rem).
  - **Section Spacing**: Applied subtle academic block margin on `.ce-block:not(:first-child):has(.ce-header)` without adding heading margin that would skew Editor.js offset math.
  - **Dark Mode Support**: Added comprehensive dark mode classes for `.ce-toolbar__plus`, `.ce-toolbar__settings-btn`, `.ce-toolbox`, `.ce-popover`, and `.cdx-search-field`.
  - **Ghostwrite Route Typing Refactor**: Extracted `buildGhostwritePrompt` to `lib/ai/ghostwrite-helper.ts` to fulfill Next.js App Router route typing constraints.
  - **Automated Verification**: Clean `tsc --noEmit` (0 errors) and 100% test pass rate (218/218 Vitest tests).

## v0.42.1 - Autosave Debounce & Editor Loop Resolution

- **Elimination of Infinite Autosave Loop & Referential Stability Hardening (`components/editor/editorjs-editor.tsx`, `lib/editor/editor-utils.tsx`, `hooks/use-editor-document.ts`, `components/editor/scholar-editor.tsx`)**:
  - **EditorJS Initial Mount & Render Shielding**: Consolidated DOM adjustments (`restoreBlockAlignments`, `renderAllInlineMath`, `calculateLiveStats`, `adjustAllCodeTextareaHeights`) directly into the `editor.render().then(...)` promise block and extended `isRenderingRef.current` hold to 400ms after render to block false-positive `onChange` mutations.
  - **Symmetric Block Content Normalization**: Added `normalizeBlockDataForComparison` in `getContentComparisonString` to normalize block data and strip ephemeral whitespace (`&nbsp;`) differences and Editor.js temporary block ID discrepancies.
  - **State Referential Equality & Fast Check Guard**: Added fast check in `triggerDebouncedSave` to immediately abort redundant saves, and preserved referential equality in `setCurrentDocument` and `setDocuments` when content and list items have not changed.
  - **Alignment Key Order Resilience**: Hardened `onAlignmentChange` comparison against localStorage key order discrepancies.
  - **Automated Verification**: Clean `tsc --noEmit` compilation (0 errors) and 100% test pass rate (218/218 Vitest tests across 27 files).

## v0.42.0 - Latent Compilation, Icon Import, API Key Pool & Scoping Resilience Audit

- **Codebase-Wide Static Typing, Icon Imports & API Rotation Hardening (`components/editor/modals/academic-linter-modal.tsx`, `components/editor/sidebar-document-tab.tsx`, `components/editor/modals/concept-map-modal.tsx`, `components/editor/modals/literature-matrix-modal.tsx`, `components/editor/paraphrase-studio.tsx`, `components/editor/editor-layout.tsx`, `components/auth/auth-provider.tsx`, `lib/editor/literature-matrix.ts`, `app/api/v1/ai/interpret-stats/route.ts`, `app/api/v1/ai/paper-chat/route.ts`, `app/api/v1/ai/peer-review/route.ts`, `app/api/v1/ai/generate-outline/route.ts`)**:
  - **Tabler Icons Imports**: Replaced missing `IconSpellCheck` with `IconTextSpellcheck` and `IconBookOpen` with `IconBook`.
  - **Component Props & State Destructuring**: Destructured `externalTargetSentence` in `ParaphraseStudio` and added fallback quota `latestResult.monthly_quota || 0`.
  - **Auth UserProfile Enhancement**: Added optional `institution?: string | null` to `UserProfile` in `components/auth/auth-provider.tsx`.
  - **Editor Layout Resilience**: Fixed `currentUser?.id` to `user?.id`, aligned `showAlertModal` type `'danger'` to `'error'`, aligned `PeerReviewModal` props (`userId`, `userPlan`), and safely cast `editorJsRef.current` for `saveCleanContent`.
  - **AI Routes Key Rotation & Scoping**: Lifted `aiGenerationId` outside `try` in `interpret-stats`, corrected `geminiKeyPool.execute<string>` argument signatures and return mapping in `paper-chat` and `peer-review`, and upgraded `generate-outline` to automated key rotation.
  - **Automated Verification**: Clean `tsc --noEmit` compilation (0 errors) and 100% test pass rate (**218/218 Vitest tests across 27 files**).

## v0.41.0 - Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge

- **Canvas Lifecycle & Rich Content Persistence Hardening (`lib/editor/methods/block-methods.ts`, `hooks/use-editor-document.ts`, `hooks/use-version-history.ts`, `components/editor/scholar-editor.tsx`, `lib/editor/methods/inline-methods.ts`, `lib/editor/methods/suggestion-methods.ts`)**:
  - **Unified `render` and `renderContent` Method Compatibility**: Exposed `render` alias on `buildBlockMethods` and updated `use-editor-document.ts` and `use-version-history.ts` to call both `renderContent` and `render`, fixing citation style switcher (APA ↔ IEEE ↔ Vancouver) and version history rollback re-renders.
  - **AI History Studio Text Insertion Bridge**: Fixed `handleInsertSynthesizedText` in `scholar-editor.tsx` to accept a `customText?: string` argument, making the "Apply to Canvas" button in AI History Studio work seamlessly.
  - **Rich Contextual HTML Insertion Engine (`insertHtmlAtCursor`)**: Hardened `insertHtmlAtCursor` with selection range restoration, `targetRange.createContextualFragment(html)` insertion without stripping `<cite>` elements, and synthetic `input` event dispatching.
  - **Toolbar & Menu Block Auto-Save Persistence**: Added `saveCleanContent().then(onContentChange)` triggers across `insertImage`, `insertTable`, `insertCodeBlock`, `insertMathBlock`, `insertBibliographyText`, and `setBlockType`.
  - **Safe Suggestion Target Replacement & Input Event Propagation**: Replaced `oldText` with suggestion markup in `addSuggestionMark` to avoid duplicating text, and added synthetic `input` event dispatching across all suggestion actions.
- **Automated Testing Suite**:
  - Added `__tests__/utils/editor-lifecycle-hardening.test.ts` (4 unit tests). Vitest suite passing at **218/218 tests across 27 test files**.

## v0.40.0 - Canvas & Document Editor Interaction Hardening & Data Flow Reliability

- **Canvas & Document Editor Interaction Hardening (`components/editor/editor-layout.tsx`, `hooks/use-citation-mention.ts`, `lib/editor/methods/citation-methods.ts`, `lib/editor/methods/block-methods.ts`)**:
  - **In-Text Citation Mention Trigger Alignment**: Fixed container DOM ID mismatch by replacing `'scholarflow-editor'` with `'editorjs-holder'` and added multi-tier fallback lookups (`holderId || 'editorjs-holder' || '.codex-editor' || closest contenteditable`), ensuring typing `@cite:` or `@` reliably computes cursor coordinates and displays the reference search overlay.
  - **Literature Matrix Table Injection**: Resolved silent failure where `onInjectTableToEditor` accessed nonexistent private property `blocks` on `editorJsRef.current`. Switched to `editorJsRef.current.insertBlocks([tableBlock])` with fallback rendering and auto-save triggering.
  - **Academic Scaffolding Persistence**: Connected `onContentChange` callback inside `onApplyBlocks` in `AcademicScaffoldModal`, eliminating draft loss on browser refresh.
  - **Academic Linter Targeted Replacement & Auto-Save**: Corrected container selector to `#editorjs-holder` and connected `saveCleanContent().then(onContentChange)` upon applying formal fixes.
  - **Sidebar Citation Insertion Graceful Fallback**: Hardened `insertCitation` in `citation-methods.ts` so clicking "Insert Citation" from the library without pre-selected text appends the citation node to the active or last block rather than silently exiting.
  - **Live Statistics Recalculation**: Added `calculateLiveStats()` invocation inside `renderContent()` to keep word, character, and reference counts accurate on dynamic block changes.
- **Automated Testing Suite**:
  - Added `__tests__/utils/editor-interaction-hardening.test.ts` (3 unit tests). Vitest suite passing at **214/214 tests across 26 test files**.

## v0.39.0 - Automated Journal Submission Package Builder & Cover Letter AI

- **Submission Package & Cover Letter Engine (`lib/editor/submission-package.ts`)**:
  - Formal academic cover letter generator (`buildCoverLetter`) addressed to the Editor-in-Chief with scope fit, research significance, and originality guarantees (bilingual EN & ID).
  - Manuscript submission metrics extractor (`extractSubmissionMetrics`) computing total words, abstract words, tables, figures, and references.
  - Independent peer reviewer suggestion engine (`generateSuggestedReviewers`) scanning cited literature in the manuscript library.
  - Research highlights synthesizer (`synthesizeHighlights`) outputting 3-5 concise bullets with char length ≤ 85.
  - Complete submission package bundler (`buildJournalSubmissionPackage`) and Markdown exporter (`exportSubmissionPackageMarkdown`).
- **Submission Package Modal UI (`components/editor/modals/submission-package-modal.tsx`)**:
  - Fullscreen 2-column workspace with left sidebar metadata parameters and 5 focused section tabs.
  - Target journal quick-fill presets for IEEE Transactions, Elsevier, Springer, SINTA 1 Dikti, and PLOS ONE.
  - Tab 1: Live cover letter text editor with custom novelty & scope alignment inputs, 1-click copy, and `.txt` file download.
  - Tab 2: Research highlights manager with real-time character counter and warning badge for items exceeding 85 characters.
  - Tab 3: Mandatory ethical statements editor covering Conflict of Interest (COI), research grant funding disclosures, and data/code availability.
  - Tab 4: Interactive suggested reviewers table with 1-click regeneration from citation library and custom reviewer addition.
  - Tab 5: Manuscript inventory scorecard and consolidated Markdown package viewer with 1-click copy and `.md` file download.
  - Strict compliance with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Journal Submission Package* card with "Build Submission Package" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_submission_package` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + Y` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/submission-package.test.ts` (5 unit tests). Vitest suite passing at **211/211 tests across 25 test files**.

## v0.38.0 - Cross-Paper Concept Map & Citation Network Visualizer

- **Concept & Network Graph Engine (`lib/editor/concept-map.ts`)**:
  - Automatic academic keyword extractor with bilingual stopword filtering (EN & ID), frequency ranking, and minimum length checks.
  - Thematic cluster classifier sorting citations into 5 academic themes: Methodology, Fundamental Theory, Empirical Evidence, Computational & Model, and Application Domain.
  - Concept network graph builder (`buildConceptNetworkGraph`):
    - Jaccard similarity and shared keyword detection between all library references.
    - Centrality degree weighting (`degree`) and identifying the most influential paper (`mostCentralNodeId`).
    - Overall graph density computation and bidirectional edge link generation.
  - Radial SVG layout calculator (`computeRadialLayout`) placing central paper at origin with thematic color coding.
  - Mermaid diagram generator (`generateMermaidConceptGraph`) for easy copy & paste into research reports.
- **Concept Map Modal UI (`components/editor/modals/concept-map-modal.tsx`)**:
  - Fullscreen interactive SVG network stage with proportional node radii, connection degree badges, and an animated pulse ring on the central paper.
  - Edge concept chips displaying the shared thematic concepts connecting paper pairs.
  - Neighbor highlighting on hover and click: isolates connected references and dims unrelated nodes.
  - Header statistics bar (paper count, concept links, detected clusters, graph density, and top influential paper).
  - Thematic cluster filter pills to focus the view on specific research dimensions.
  - Inspector side drawer with title, authors, year, abstract, key concept tags, and connected references with DOI links.
  - 1-Click "Copy Mermaid Diagram" button.
  - Strict compliance with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Cross-Paper Concept Map* card with "Explore Concept Map" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_concept_map` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + N` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/concept-map.test.ts` (5 unit tests). Vitest suite passing at **206/206 tests across 24 test files**.

## v0.37.0 - Journal Formatting & Publishing Presets Configurator

- **Author Guidelines & Presets Engine (`lib/editor/journal-presets.ts`)**:
  - Authoritative publisher database: IEEE Transactions & Journals, Elsevier ScienceDirect, Springer Nature, SINTA 1 & 2 Dikti, and PLOS ONE.
  - Multi-metric extraction engine (`extractDocumentMetrics`): calculates total words, dedicated abstract word count, figures, and tables.
  - Reference recency auditor (`auditReferenceRecency`): calculates the exact proportion of citations published within the last 5 years.
  - Real-time audit scoring (`auditJournalReadiness`): produces a 0-100% readiness score with status badges (*Submission Ready*, *Needs Minor Adjustments*, *Substantial Revisions Needed*).
- **Journal Presets Modal UI (`components/editor/modals/journal-presets-modal.tsx`)**:
  - Left column preset picker with publisher descriptions and required citation style badges.
  - Interactive scorecard hero banner displaying readiness percentage and overall submission status.
  - 1-Click "Switch to Required Style" button: automatically converts manuscript citation style to match publisher requirements.
  - Comprehensive checklist cards with pass/warning/fail badges and target comparisons.
  - Recommended section structure badges for the active journal.
  - Full compliance with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Journal Target Presets* card with "Audit Journal Guidelines" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_journal_presets` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + J` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/journal-presets.test.ts` (5 unit tests). Vitest suite passing at **201/201 tests across 23 test files**.

## v0.36.0 - Interactive Literature Matrix & Synthesis Grid

- **Literature Matrix & Synthesis Grid Engine (`lib/editor/literature-matrix.ts`)**:
  - Automatically structures paper references into standard academic literature review matrix columns: Study / Citation, Methodology, Sample Size, Key Empirical Findings, Research Limitations & Gaps, and Synthesis Notes.
  - Heuristic metadata and abstract analyzer (`inferMatrixFieldsFromAbstract`) extracting research approaches (SLR, Meta-Analysis, Quantitative, Qualitative, Machine Learning), sample counts (`N = ...`), and core conclusions.
  - Safe user-state synchronization: preserves manual in-cell user edits and synthesis notes across library updates.
  - Multi-format exporters:
    - **Markdown Table**: Clean GFM-compliant markdown table with pipe escaping.
    - **CSV Archive**: RFC 4180 formatted CSV for statistical analysis in Excel or SPSS.
    - **Native EditorJS Table Block**: Formats into structured table blocks ready for 1-click injection into Chapter 2 (Literature Review).
- **Literature Matrix Modal UI (`components/editor/modals/literature-matrix-modal.tsx`)**:
  - Fullscreen tabular comparison grid with horizontal scrolling and sticky study/citation column.
  - Real-time inline cell editing for instant annotation and synthesis refinement.
  - Quick search filter across studies, authors, methodology, and findings.
  - Filter pills for methodology tags (Quantitative, Qualitative, Machine Learning, SLR).
  - 1-Click "Copy Markdown Table", "Download CSV", and "Insert Table to Manuscript" actions.
  - Strict compliance with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Literature Synthesis Matrix* card with "Open Synthesis Matrix" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_literature_matrix` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + T` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/literature-matrix.test.ts` (7 unit tests). Vitest suite passing at **196/196 tests across 22 test files**.

## v0.35.0 - Conference & Thesis Defense Slide Deck Generator

- **Slide Deck Generator Engine (`lib/editor/slide-deck-generator.ts`)**:
  - Automatically parses EditorJS manuscript AST blocks and maps them into 9 structured defense slides: Title, Problem Statement & Background, Research Objectives & Scope, Theoretical Framework & Literature, Methodology & Research Design, Key Results & Empirical Findings, Discussion & Scientific Contribution, Conclusion & Recommendations, and References & Acknowledgments.
  - Automatically calculates estimated presentation duration (~1.75 minutes per slide).
  - Formats into standard Marp Markdown (`marp: true`, lead classes, speaker notes, custom styling).
  - Generates standalone, self-contained offline HTML presentation deck with keyboard controls (`ArrowLeft` / `ArrowRight`), fullscreen toggle, and speaker notes drawer.
- **Slide Deck Modal UI (`components/editor/modals/slide-deck-modal.tsx`)**:
  - Fullscreen interactive presentation stage with live 16:9 widescreen carousel preview.
  - Sidebar thumbnail list of all slides with selection states and category badges.
  - 3 Visual design theme presets: Modern Academic (Indigo/Slate), Classic Navy (Blue/Amber), and Minimal Emerald.
  - Speaker Notes / Narration Guide drawer with presentation tips.
  - 1-Click "Download Standalone HTML Deck" and "Copy Marp MD" action buttons.
  - Strict compliance with Tailwind Dark Mode and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Defense Slide Deck* card with "Open Slide Generator" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_slide_deck` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + E` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/slide-deck-generator.test.ts` (5 unit tests). Vitest suite passing at **189/189 tests across 21 test files**.

## v0.34.0 - Academic Grammar & Style Linter (Automated Tone & Style Auditor)

- **Academic Style & Tone Linter Engine (`lib/editor/academic-linter.ts`)**:
  - Implemented bilingual scientific rule dictionaries (EN & ID) covering 4 critical academic writing categories:
    - `informal`: Replaces colloquial expressions (*"a lot of"*, *"banyak banget"*, *"kids"*, *"anak-anak"*, *"gonna"*) with formal scientific terminology (*"numerous"*, *"sejumlah besar"*, *"pediatric subjects"*, *"subjek anak"*).
    - `contraction`: Detects and expands English contractions (*"don't"*, *"can't"*, *"won't"*, *"it's"*) into formal academic prose (*"do not"*, *"cannot"*, *"will not"*, *"it is"*).
    - `sweeping`: Flags unhedged or hyperbolic statements (*"obviously"*, *"jelas sekali"*, *"undoubtedly"*, *"tidak diragukan lagi"*, *"pasti benar"*) and suggests cautious academic hedging (*"evidence suggests"*, *"bukti menunjukkan"*, *"it is plausible that"*).
    - `first_person`: Flags inappropriate first-person bias (*"I believe"*, *"saya rasa"*, *"in my opinion"*, *"kami membuktikan"*) and suggests objective passive/agentless formulations (*"the data demonstrates"*, *"data menunjukkan"*, *"the analysis reveals"*).
  - Academic Style Score calculator (`calculateAcademicStyleScore`) computing a 0-100 metric based on issue density per 1,000 words, mapped to Academic Letter Grades (Grade A, B, C, D) with descriptive tone assessments.
  - Safe replacement applicator (`applyLintReplacement`) replacing specific issue spans within EditorJS blocks non-destructively.
- **Academic Style Linter Modal UI (`components/editor/modals/academic-linter-modal.tsx`)**:
  - Score badge & rating header with dynamic color grading and issue counts breakdown.
  - Filter pills for All, Informal, Contractions, Sweeping, and First-person bias.
  - Interactive issue cards displaying matched text, suggested formal alternatives, academic reasoning, and 1-click "Terapkan Perbaikan" / "Apply Fix" button.
  - Empty state with celebratory academic excellence badge when no issues are detected.
  - Strict compliance with Tailwind Dark Mode and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Academic Style Linter* card with "Launch Style Audit" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_academic_linter` in `lib/editor/command-palette.ts` under the Review category.
  - Added global keyboard shortcut `Ctrl + Shift + L` in `components/editor/editor-layout.tsx` and cheat sheet entry in `components/editor/modals/shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/academic-linter.test.ts` (9 unit tests covering Indonesian & English rule matching, style score calculations, and block replacements). Vitest suite passing at **184/184 tests across 20 test files**.

## v0.33.0 - Multi-Chapter Thesis & Dissertation Project Binder

- **Multi-Chapter Project Binder Engine (`lib/editor/project-binder.ts`)**:
  - Chapter number parsing supporting academic conventions (*"Bab 1: Pendahuluan"*, *"Chapter 2"*, *"3. Metodologi"*).
  - Project chapter aggregator and extractor (`extractProjectChapters`) with word & character counting and ordering.
  - Cross-chapter continuous figure & table numbering engine (`extractCrossChapterFiguresAndTables`) conforming to Indonesian Higher Education (Dikti) and international standards (`Gambar {Bab}.{Nomor}`, `Tabel {Bab}.{Nomor}`).
  - Master Bibliography aggregator (`consolidateMasterBibliography`) extracting citations from all chapters, deduplicating records by DOI or title/author, tracking which chapters cited each reference, and sorting by active citation style.
  - Full manuscript compiler producing combined EditorJS AST blocks with chapter headings and section dividers (`compileBinderToUnifiedBlocks`), as well as consolidated Markdown export (`compileBinderToMarkdown`).
- **Thesis Project Binder Modal UI (`components/editor/modals/project-binder-modal.tsx`)**:
  - Modal hub with 4 interactive tabs: **Chapters / Sections**, **Master Bibliography**, **Figures & Tables Index**, and **Compile & Export**.
  - Thesis metrics bar: Total Words across all chapters, Estimated Total Reading Time, Figure & Table count, and Unique References count.
  - 1-click actions: "Export .bib File" (consolidated BibTeX archive) and "Copy Full Markdown Manuscript" ready for thesis defense/submission.
  - Strict compliance with Tailwind Dark Mode and bilingual EN ↔ ID localization.
- **Sidebar Integration (`components/editor/sidebar-document-tab.tsx`)**:
  - Added dedicated *Thesis Project Binder* card displaying active project name, chapter badge, and 1-click button to open the binder modal.
- **Global Shortcuts & Command Palette**:
  - Registered `cmd_project_binder` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + M` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/project-binder.test.ts` (11 unit tests). Vitest suite passing at **175/175 tests across 19 test files**.

## v0.32.0 - Smart In-Text Reference Mention (@cite / @ref) & Quick Citation Injector

- **Active Caret & Token Mention Parser (`lib/editor/mention-parser.ts`)**:
  - Implemented regex pattern matching detecting mention triggers: `@cite:`, `@ref:`, or standard `@` with trailing search query at current cursor position.
  - Non-destructive caret coordinate extractor (`getCaretCoordinates`) returning client bounding rectangles (`top`, `left`, `bottom`, `right`) from contenteditable selections.
  - Safe extraction helpers (`extractMentionQuery`, `isMentionTrigger`) for seamless typing interception.
- **High-Performance In-Memory Reference Indexer (`lib/editor/reference-search-index.ts`)**:
  - Multi-field scoring indexer across authors, title, year, journal/venue, abstract, and user citation labels with tokenized search queries.
  - Integrated debounce helper and Crossref / OpenAlex cloud search fallback for references not yet in the active library.
  - Dynamic citation label formatting based on active style (e.g., Author-Year `(Smith et al., 2023)` vs Numeric `[1]`).
- **Floating Mention Dropdown Overlay (`components/editor/citation-mention-dropdown.tsx`)**:
  - Compact (< 200 lines) floating popover positioned dynamically at caret coordinates with screen-edge boundary clamping.
  - Full keyboard accessibility: Arrow Up (`↑`) / Arrow Down (`↓`) navigation, `Enter` / `Tab` to select, and `Escape` to dismiss.
  - Real-time search highlighting, paper metadata chips (year, journal/venue), and external paper badge.
  - Strict compliance with Tailwind Dark Mode and bilingual EN/ID localization.
- **Non-Destructive In-Text Citation Injector (`lib/editor/methods/mention-injector.ts` & `hooks/use-citation-mention.ts`)**:
  - DOM range mutation replacing mention token with structured `<cite data-citation="true" ...>` element.
  - Dispatches synthetic `input` event to ensure EditorJS and reactive hooks track document content and bibliography changes.
  - Custom hook `useCitationMention` bound to active editor layout with zero UI lag.
- **Editor Layout & Shortcuts Integration**:
  - Mounted `<CitationMentionDropdown ... />` in `components/editor/editor-layout.tsx`.
  - Documented `@cite:` and `@` shortcuts in `components/editor/modals/shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/citation-mention.test.ts` (13 unit tests). Vitest suite passing at **164/164 tests across 18 test files**.

## v0.31.0 - Academic Thesis/Paper Outline & Structure Generator Engine

- **Academic Structure Presets Engine (`lib/editor/academic-templates.ts`)**:
  - Defined 4 standardized research presets: IMRaD International Journal (Scopus/WoS), Indonesian Thesis (5 Chapters Standard) (Dikti National Standard), PRISMA 2020 Systematic Literature Review (SLR), and Clinical & Organizational Case Study.
  - Guiding research prompts and section-by-section checklists detailing exact methodological and reviewer criteria.
  - AST block converters (`convertScaffoldToEditorJsBlocks`) producing valid EditorJS blocks with unique IDs and clean Markdown compiler (`convertScaffoldToMarkdown`).
- **AI Personalized Outline Generator Endpoint (`app/api/v1/ai/generate-outline/route.ts`)**:
  - AI route parsing research topic, field of study, and methodology to formulate tailored sub-sections with specific research questions.
  - Full resilience stack integration: 5-minute Smart Idempotency caching, Personal Token Quota guard, Multi-tenant Campus Dedicated AI key resolver, Gemini Key Pool failover, and Server-Side AI Logger.
- **EditorJS Scaffolding Builder & Canvas Injector (`lib/editor/methods/outline-scaffold.ts`)**:
  - `convertTailoredAirOutlineToBlocks` converting tailored AI sub-sections into structured EditorJS blocks.
  - `injectScaffoldIntoEditorJs` supporting both Append (insert at end) and Replace (fresh scaffold) modes.
- **Interactive Scaffolding Setup Modal (`components/editor/modals/academic-scaffold-modal.tsx`)**:
  - Modern modal with dual-tab interface: Standard Presets vs AI Tailored Scaffolding.
  - Real-time tree preview, writing guidance toggles, checklist toggles, insertion mode selector, Dark Mode, and bilingual EN/ID support.
- **Keyboard Shortcuts & Command Palette Integration**:
  - Registered `cmd_academic_scaffold` in `lib/editor/command-palette.ts`.
  - Added global shortcut `Ctrl + Shift + O` in `components/editor/editor-layout.tsx` and updated `shortcuts-modal.tsx` cheat sheet.
- **Automated Unit Testing**:
  - Added `__tests__/utils/academic-templates.test.ts` (11 unit tests). Vitest suite passing at **151/151 tests across 17 test files**.

## v1.5.0 - Figure & Table Scientific Auto-Numbering & Cross-Reference Engine

- **Cross-Reference AST Engine (`lib/editor/cross-reference.ts`)**:
  - Implemented automatic sequential indexing for image blocks (`Figure X` / `Gambar X`) and table blocks (`Table Y` / `Tabel Y`) with caption extraction and table preview snippets.
  - Interactive in-text anchor generator with secure HTML attribute escaping (`data-cross-ref="true"`, `data-ref-type`, `data-target-id`).
  - Reactive in-text re-numbering engine (`updateHtmlCrossReferences`, `reindexContentCrossReferences`): automatically updates in-text anchor labels whenever figures or tables are reordered or removed.
  - Shorthand syntax parsing (`@fig:1`, `@tab:1`, `@fig:blockId`) converting quick shorthand typing into interactive anchors.
- **EditorJS DOM Methods (`lib/editor/methods/cross-reference-methods.ts`)**:
  - Implemented `insertCrossReference`, `scrollToScientificItem`, and `refreshCrossReferences`.
  - Interactive smooth scroll on click: clicking cross-reference links in the editor canvas centers the target figure/table with an animated pulsing highlight ring.
- **Cross-Reference Picker Modal (`components/editor/modals/cross-reference-modal.tsx`)**:
  - Dialog with tabbed views (All, Figures, Tables), real-time search filtering, figure/table snippet previews, 1-click insertion, and manual re-index trigger.
  - Fully responsive with Dark Mode and bilingual EN/ID support.
- **Toolbar & Shortcut Integration**:
  - Added dedicated Bookmark button (`IconBookmark`) on `EditorJsToolbar`.
  - Registered `cmd_insert_cross_reference` and `cmd_refresh_cross_references` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + B` and cheat sheet entry in `shortcuts-modal.tsx`.
- **XSS & Security Hardening (`lib/utils/sanitize.ts`)**:
  - Added `data-cross-ref`, `data-ref-type`, and `data-target-id` to DOMPurify allowed attributes.
- **Automated Unit Testing**:
  - Added `__tests__/utils/cross-reference.test.ts` (11 unit tests). Vitest suite passing at 140/140 tests.

## v1.4.0 - Live "Track Changes" / Suggesting Mode (Google Docs & Word Style Revision Flow)

- **Inline Visual Diff Markup Engine (`lib/editor/suggesting-engine.ts`)**:
  - Implemented semantic `<del>` (old text with strikethrough & rose background) and `<ins>` (new text with underline & emerald background) generation with character escaping and attribute isolation.
  - Granular single suggestion accept/reject resolution (`applyAcceptSuggestionToHtml`, `applyRejectSuggestionToHtml`) and batch transformers (`transformEditorBlocksSuggestion`).
  - AST suggestion extractor (`extractSuggestionsFromHtml`) tracking suggestion item metadata.
- **EditorJS DOM Suggestion Methods (`lib/editor/methods/suggestion-methods.ts`)**:
  - Created `addSuggestionMark`, `acceptSuggestion`, `rejectSuggestion`, `batchAcceptAllSuggestions`, `batchRejectAllSuggestions`, and `scrollToSuggestionMark` on active DOM contenteditables.
- **Suggesting Mode Segmented Control (`components/editor/suggesting-mode.tsx`)**:
  - Segmented pill switcher between Direct Edit (Sunting ✍️) and Suggesting (Menyarankan 💡) with dynamic pending count badge and batch review dropdown.
- **Review Action Floating Chips (`components/editor/suggesting-chips.tsx`)**:
  - Canvas floating reviewer cards with diff preview, author persona, timestamp, and instant 1-click `[✓ Terima]` and `[✕ Tolak]` action chips.
- **DOMPurify XSS Hardening (`lib/utils/sanitize.ts`)**:
  - Allowed `<del>`, `<ins>`, and attributes `data-suggestion-id`, `data-author`, `data-old-text`, `data-new-text`.
- **Command Palette & Shortcut Hub**:
  - Registered `cmd_toggle_suggesting_mode`, `cmd_batch_accept_suggestions`, `cmd_batch_reject_suggestions` in `lib/editor/command-palette.ts`.
  - Added global shortcut `Ctrl + Shift + S` and cheat sheet documentation in `shortcuts-modal.tsx`.
- **Automated Unit Testing**:
  - Added `__tests__/utils/suggesting-mode.test.ts` (12 unit tests). Vitest passing at 129/129 tests.

## v0.9.8 - Bidirectional Reactive In-Text Citation Style Transformer (APA ↔ IEEE ↔ Harvard ↔ Vancouver)

- **In-Text Citation AST Transformer (`lib/editor/citation-transformer.ts`)**:
  - Implemented dynamic bidirectional transformer converting in-text citation tags across 6 international formats: APA 7th, IEEE, Harvard, Vancouver, Chicago, and MLA.
  - Smart author family name parsing (`extractFamilyName`) handling both Western ("Ashish Vaswani") and Academic Comma ("Vaswani, Ashish") notations.
  - Chronological scan algorithm (`extractReferenceIdsInOrder`) mapping citation appearance orders for numeric bracket generation (`[1]`, `[2]`).
  - Seamless JSON block transformer (`transformEditorContentCitations`) replacing in-text labels without mutating document structure.
- **Dynamic Bibliography Re-Indexing (`sortAndFormatBibliography`)**:
  - Automatic re-indexing based on active citation style:
    - **Numeric Styles (IEEE, Vancouver)**: Strictly sorted by order of appearance in the manuscript (`[1]`, `[2]`, `[3]`).
    - **Author-Year Styles (APA, Harvard, MLA, Chicago)**: Strictly sorted alphabetically (A-Z) by first author's family name.
- **Reactive Hook Engine Updates**:
  - `hooks/use-editor-document.ts`: Upgraded `handleChangeCitationStyle` to immediately transform in-text citations on canvas, render to EditorJS, save to cloud, and display feedback toasts.
  - `hooks/use-editor-citation.ts`: Integrated `sortAndFormatBibliography` into `bibliographyEntries` memo.
- **Toolbar Citation Style Selector Component (`components/editor/citation-style-selector.tsx`)**:
  - Interactive dropdown selector embedded on `EditorJsToolbar` beside the Citation button with sample previews, category badges (*Numeric* vs *Author-Year*), Dark Mode, and bilingual EN/ID.
- **Automated Unit Testing**:
  - Added `__tests__/utils/citation-transformer.test.ts` (13 unit tests). Vitest suite passing at 60/60 tests.

## v0.9.7 - Document Version History & Time-Machine Snapshot (Rollback & Visual Diff)

- **PostgreSQL & Supabase Migration (`supabase/migrations/20261016000001_create_document_revisions.sql`)**:
  - Created `public.document_revisions` table with RLS security policies, indexes on `(document_id, created_at DESC)` and `(user_id)`.
  - Added `DocumentRevision` model to `prisma/schema.prisma` with relation to `DocumentEntry`.
- **LCS Word-Level Visual Diff Engine (`lib/editor/diff-engine.ts`)**:
  - Longest Common Subsequence (LCS) word diff algorithm computing fine-grained changes (`added`, `removed`, `unchanged`).
  - `extractPlainTextFromEditorJs` text normalization and HTML entity decoder for clean comparison without DOM baggage.
  - Quantitative diff statistics (`addedWords`, `removedWords`, `unchangedWords`).
  - Bilingual relative time formatter (`formatRelativeTime`).
- **Dual Revisions Storage & REST API (`lib/editor/version-history.ts` & `app/api/v1/documents/[id]/revisions/route.ts`)**:
  - Fast client-side storage cache with FIFO capacity limit (max 30 revisions per doc).
  - Background cloud persistence to Supabase via admin client bypass.
- **Custom Hook Engine (`hooks/use-version-history.ts`)**:
  - Periodic background auto-snapshotting (every 15 minutes of active writing, or when >= 80 words change).
  - Manual milestone checkpoints with custom change notes.
  - Automated pre-restore *Safety Backup* before reverting drafts.
- **Time-Machine Modal UI (`components/editor/modals/version-history-modal.tsx`)**:
  - Glassmorphism slide-over drawer with chronological version timeline, badge classification (*Auto-save* vs *Checkpoint*), and word count counters.
  - Interactive Diff Viewer supporting both **Unified Diff** (inline text flow with color highlights) and **Side-by-Side Split View** (Snapshot vs Current Canvas).
  - One-click copy, custom confirmation restore dialog (zero native browser alerts), Dark Mode, and Bilingual (EN <-> ID) support.
- **Editor Header Navigation Integration (`components/editor/editor-header.tsx`)**:
  - Added "History" button with `IconHistory` to header toolbar.
- **Automated Unit Testing**:
  - Added `__tests__/utils/version-history.test.ts` (11 unit tests). Vitest suite passing at 47/47 tests.

## v0.9.6 - Real-Time Inline AI Ghostwriter (Tab-to-Accept ala Jenni AI)

- **Backend Autocomplete Predictive Route (`app/api/v1/ai/ghostwrite/route.ts`)**:
  - Implemented low-latency academic autocomplete prediction route with `temperature: 0.25` and `maxOutputTokens: 120`.
  - Built-in prompt engineer (`buildGhostwritePrompt`) tailoring continuations in English and formal Indonesian based on document title and the preceding context (600 characters).
  - Multi-tenant campus key resolver (`resolveTenantKey`), personal token quota validation (`checkPersonalQuota`), and server-side tracking (`createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`).
  - 5-minute Smart Idempotency caching (`generateIdempotencyKey`) preventing duplicate token burns on identical keystroke pauses.
- **Ghostwriter Hook Engine (`hooks/use-ghostwriter.ts`)**:
  - Auto-triggers predictions after a 1300ms pause in typing when the cursor is at the end of an academic sentence or paragraph.
  - Dynamically calculates caret coordinates via `window.getSelection().getRangeAt(0).getBoundingClientRect()` for precision floating positioning.
  - Non-destructive DOM insertion: appends prediction text via synthetic `input` event and updates active block in EditorJS without DOM corruption or cursor jumping.
  - Keyboard handlers: `<kbd>Tab</kbd>` to accept full suggestion, `<kbd>Esc</kbd>` to dismiss, and `<kbd>Ctrl+J</kbd>` / `<kbd>Cmd+J</kbd>` to toggle Ghostwriter on/off.
  - Persistence: user toggle preference is saved in `localStorage`.
- **Floating Ghostwriter Suggestion Component (`components/editor/ghostwriter-suggestion.tsx`)**:
  - Glassmorphism floating pill near the cursor with `IconSparkles`, italic academic text preview, and `<kbd>Tab</kbd> Accept` and `<kbd>Esc</kbd> Dismiss` buttons.
  - Full Dark Mode compatibility (`dark:bg-slate-900/95`, `dark:border-slate-700`, `dark:text-slate-100`) and dynamic bilingual support (`isEn ? ... : ...`).
- **Toolbar Quick Switch (`components/editor/ghostwriter-toggle.tsx` & `components/editor/editorjs-toolbar.tsx`)**:
  - Toggle button integrated right on the EditorJS toolbar showing active status, loading spinner, and keyboard shortcut hint.
- **Quota Limit Protection**:
  - Zero native browser `window.alert()`; automatically triggers the application's existing `TokenQuotaModal` / `LimitWarningModal` when monthly tokens are exhausted.
- **Automated Unit Testing**:
  - Added `__tests__/utils/ghostwriter.test.ts` (8 test cases testing prompt builders, idempotency caching, and keyboard rules). Total test suite passing at 36/36 tests.

## v0.9.5 - Full App-Wide Server-Side AI History Parity & Modular History Studio

- **Server-Side AI History for Literature Review Synthesis (`app/api/v1/ai/synthesize/route.ts`)**: Integrated `createPendingAiGeneration`, `completeAiGeneration`, and `failAiGeneration` tracking so literature review synthesis jobs are recorded on Supabase backend with `generation_id` returned.
- **Server-Side AI History for Statistical Interpreter (`app/api/v1/ai/interpret-stats/route.ts`)**: Integrated `createPendingAiGeneration`, `completeAiGeneration`, and `failAiGeneration` tracking for multimodal vision and tabular statistical analyses.
- **Client AI History Synchronization**:
  - `hooks/use-editor-ai.ts`: Updated `handleSynthesizeReview` to immediately record synthesized literature reviews into `aiHistory` with tone `synthesis`.
  - `components/editor/sidebar-stats-tab.tsx`: Updated `handleInterpret` to record completed statistical analyses into client `aiHistory` with tone `statistical`.
  - `lib/editor/ai-history.ts`: Upgraded `convertCloudRecordToHistoryEntry` to seamlessly support `synthesis` and `statistical` / `stats` records from Supabase cloud sync.
- **Modular History Studio (`components/editor/modals/ai-history-modal.tsx`)**:
  - Extracted inline modal JSX out of `components/editor/editor-sidebar.tsx`, reducing its file length from 756 to 571 lines.
  - Added Category Filter Tabs with dynamic counter badges: *All*, *Polish (Academic)*, *Paraphrase*, *Abstract*, *Synthesis*, and *Stats*.
  - Added Live Search Bar for searching original drafts or AI results by keyword.
  - Added **Export AI Audit Report** feature (.md markdown download) for academic AI disclosure and university compliance.
  - Micro-UX: Instant visual "Copied!" feedback and full Dark Mode / Bilingual (EN <-> ID) support.
- **Automated Unit Testing**: Created `__tests__/utils/ai-history.test.ts` (3 tests). Total Vitest suite passing at 28/28 tests.

## v0.9.4 - Server-Side AI History Engine & System Architecture Suite (ChatGPT-Style Resilience)

- **Supabase SQL Migration (`supabase/migrations/20261015000001_create_ai_generations_history.sql`)**: Created `public.ai_generations` table with granular Row Level Security (RLS) policies, indexes on `(user_id, created_at DESC)` and `status`, enabling background transaction persistence even if client disconnects at second 2.
- **Universal Prisma Schema (`prisma/schema.prisma`)**: Added `AiGenerationEntry` model with relation to `UserProfile` for cross-database multi-ORM compatibility.
- **Server AI Logger Engine (`lib/ai/server-ai-logger.ts`)**: Implemented `createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`, and `fetchUserAiHistory` with service-role Supabase bypass.
- **History API Endpoints (`app/api/v1/ai/history/route.ts`)**: Built RESTful `GET` (fetch recent 20 generations) and `DELETE` (delete single or clear all) routes.
- **API Route Integration**: Injected server logging into `/api/v1/ai/improve` and `/api/v1/ai/abstract`.
- **Client-Cloud Dual Sync**: Hydrated cloud history in `hooks/use-editor-ai.ts` via `mergeAiHistories` and added real-time `Cloud Synced` badge in the AI History modal.
- **Enterprise White-Label Model Masking (`components/editor/editor-sidebar.tsx`)**: Replaced raw technical AI model names (`deepseek`, `gemini`, `claude`, etc.) with a prestigious `ScholarFlow Academic AI` brand badge for regular students/users, while maintaining granular raw model inspection and audit tags for Administrators.
- **Architecture Documentation Suite (`doc/architecture/`)**: Authored 4 comprehensive architectural specifications with complete Mermaid Sequence Diagrams (`01-server-side-ai-history.md`, `02-smart-idempotency-cache.md`, `03-token-quota-synchronization.md`, `04-multi-tenant-campus-keys.md`, and `README.md`).

## v0.9.3 - Persistent AI Generation History & Cross-Session Restoration

- **Client-Side Storage Engine (`lib/editor/ai-history.ts`)**: Built persistent `loadAiHistory` and `saveAiHistory` utilities with localStorage key `scholarflow.editor.ai-history.v1` and a FIFO capacity limit of 15 items, ensuring working AI drafts are retained across tab closes and browser refreshes.
- **Hook State Hydration (`hooks/use-editor-ai.ts`)**: Integrated `loadAiHistory()` upon client mount inside `useEffect` to prevent SSR hydration mismatches, while persisting history changes automatically upon deleting single entries or clearing all history.
- **Dark Mode & Bilingual History Modal (`components/editor/editor-sidebar.tsx`)**: Upgraded AI History Modal with full Dark Mode support (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`), tone badge highlights, model tag badges, side-by-side comparison (original draft vs AI polished result), one-click clipboard copy, and 'Apply to Canvas' integration.
- **Zero Database Changes**: Required zero database schema modifications or migrations; client drafts remain fast and locally isolated without network latency.

## v0.9.2 - Resilient AI Transaction & Zero-Waste Token Guard

- **Smart In-Memory Idempotency Cache (`lib/ai/idempotency-cache.ts`)**: Built a deterministic 64-bit double-pass FNV-1a hash caching engine with a 5-minute TTL to deduplicate identical AI prompts across both Edge and Node.js runtimes.
- **Zero-Waste Token Deduplication Across 4 AI Endpoints**:
  - `/api/v1/ai/improve`: Instantly serves identical text improvement, paraphrase, and mimic requests within 5 minutes with `0` tokens consumed.
  - `/api/v1/ai/abstract`: Reuses recent context abstracts on page refreshes without re-calling Google Gemini.
  - `/api/v1/ai/synthesize`: Deduplicates literature review synthesis for identical reference selections.
  - `/api/v1/ai/interpret-stats`: Caches multimodal SPSS table analyses by combining user ID, config, and input data signatures.
- **Browser Unload Guard (`window.onbeforeunload`)**: Implemented tab close and refresh protection in `useEditorAi`, `ParaphraseStudio`, and `SidebarStatsTab`, warning users if they accidentally press F5 or close the tab while an AI generation is in progress.
- **Micro-UX Cache Badges**: Added visual `⚡ 0 Token (Cache Instan)` status indicators to `SidebarWritingTab` and `ParaphraseStudio` with full dark mode and bilingual (EN <-> ID) support.
- **Automated Unit Testing**: Created `__tests__/utils/idempotency-cache.test.ts` (5/5 tests passing, 25/25 tests passing in total suite).

## v0.9.1 - AI Token Quota Consumption & Realtime Profile Synchronization Fix

- **Server-side Service Role Client (`lib/supabase-admin.ts`)**: Created service-role Supabase client using `process.env.SUPABASE_SERVICE_KEY` with graceful fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY`, bypassing Row Level Security (RLS) constraints for server-side profile quota updates.
- **Quota Tracking Reliability (`lib/ai/token-quota.ts`)**: Upgraded `checkPersonalQuota` and `recordPersonalTokenConsumption` to utilize `supabaseAdmin || supabase`, preventing silent RLS failures when updating `ai_tokens_used` on the `profiles` table.
- **Paraphrase Studio User Context (`components/editor/paraphrase-studio.tsx`)**:
  - Connected `useAuth()` to extract `userId` and `currentPlan` and injected them into all 3 concurrent `improveWriting` calls (`paraphrase`, `simplify`, and `mimic`).
  - Added token quota synchronization to local cache via `saveLocalQuotaState` and triggered `refreshProfile()` upon successful generation.
  - Added proactive quota exhaustion handling that triggers `setIsPlanModalOpen(true)` if user reaches monthly allowance.
- **Editor AI Hook Reactive Synchronization (`hooks/use-editor-ai.ts`)**:
  - Added `updateQuotaState` callback that synchronizes `tokensUsed`, `monthlyQuota`, updates `localStorage`, and triggers `refreshProfile()`.
  - Linked `updateQuotaState` across all editor AI workflows: `runImproveWriting`, `runParaphrase`, `runSummarize`, `runGenerateAbstract`, and `handleParafrasePlagiat`.
- **Literature Review Synthesis Quota Guard (`app/api/v1/ai/synthesize/route.ts` & `lib/api/ai.ts`)**:
  - Integrated `checkPersonalQuota` and `recordPersonalTokenConsumption` into `/api/v1/ai/synthesize`.
  - Upgraded `synthesizeLiteratureReview` client function and `handleSynthesizeLiterature` hook to transmit user credentials and reactively update `updateQuotaState`.
- **SPSS / PSPP Statistical Interpreter Quota Protection (`app/api/v1/ai/interpret-stats/route.ts` & `components/editor/sidebar-stats-tab.tsx`)**:
  - Enforced `checkPersonalQuota` on multimodal vision and table analysis requests.
  - Calculated consumed tokens and recorded usage, automatically synchronizing `saveLocalQuotaState` and triggering `refreshProfile()` upon successful analysis.
- **Automated Unit Testing**: Verified 20/20 Vitest unit test suite passing across all utility modules.

## v0.9.0 - Multi-Tenant Campus Dedicated AI Key Resolver & Super Admin Key Config

- **Tenant Key Resolver Engine (`lib/ai/tenant-key-resolver.ts`)**: Built an intelligent per-campus API key resolver that queries user university affiliation via `institution_members` or `profiles.institution_id`, isolates campus rate limits (`campus_text_key` vs `campus_vision_key`), and implements in-memory caching (5-minute TTL) with tiered failover pools (`campus_byok` -> `campus_pool` -> `pro_pool` -> `free_pool`).
- **AI Endpoints Integration**:
  - `/api/v1/ai/improve`: Dynamic injection of resolved campus key and category pool into SSE streaming and direct generation runners, returning `tenant_source` and `institution_name` metadata.
  - `/api/v1/ai/abstract`: Upgraded to `geminiKeyPool` multi-key failover and tenant key resolution.
  - `/api/v1/ai/synthesize`: Upgraded to `geminiKeyPool` failover and campus tenant key resolution.
  - `/api/v1/ai/interpret-stats`: Multimodal SPSS vision analysis now resolves and injects `campus_vision_key` dedicated for university stats workloads.
- **Client Integration (`components/editor/sidebar-stats-tab.tsx`)**: Connected user session and active subscription tier to statistical interpreter API calls.
- **Super Admin Key Config (`components/admin/institution-modal.tsx`)**: Added dedicated BYOK input fields for `campus_text_key` and `campus_vision_key` with Dark Mode and Bilingual (EN <-> ID) support.
- **Automated Unit Testing**: Created comprehensive test suite in `__tests__/utils/tenant-key-resolver.test.ts` (9/9 tests passing in Vitest).

## v0.8.0 - Personal AI Token Quota & Fair Usage Policy Guard (Non-Campus Free & Pro)

- **Database & Prisma Schema Migration**: Added `ai_tokens_used`, `ai_monthly_quota`, and `ai_quota_reset_at` columns to `profiles` table (`supabase/migrations/20261013000001_add_user_ai_token_quota.sql` and `prisma/schema.prisma`).
- **Token Quota Engine (`lib/ai/token-quota.ts`)**: Implemented monthly quota checks, standard NLP token estimation, and dual-persistence fallback with `localStorage`.
- **API Guard & Tracking Routes**: Integrated personal token quota validation and consumption recording into `/api/v1/ai/improve`, `/api/v1/ai/abstract`, `/api/v1/ai/synthesize`, and created `/api/v1/ai/user-quota`.
- **Interactive UI Components**:
  - `components/ai/token-quota-badge.tsx`: Responsive progress bar badge showing remaining allowance with color indicators (Emerald, Amber, Rose).
  - `components/ai/token-quota-modal.tsx`: Detailed modal dialog explaining 30-day reset cycles, comparing Free (50k) vs Pro (1M) vs BYOK, with 1-click Upgrade trigger.
- **Editor Integration**: Integrated `TokenQuotaBadge` in both `EditorHeader` and `SidebarWritingTab`, connected to `useEditorAi`.
- **Automated Unit Testing**: Created `__tests__/utils/token-quota.test.ts` covering token heuristics, quota limits, and consumption tracking (11/11 tests passing in Vitest).

## v0.5.0-architecture - EPIC 5 Testing & Production Readiness (Architecture Sprint Complete)

- Created universal Prisma ORM schema in `prisma/schema.prisma` for PostgreSQL and MySQL multi-database support.
- Published step-by-step database migration guide in `doc/DATABASE_MIGRATION_GUIDE.md`.
- Completed Security & Row Level Security (RLS) Audit report in `doc/SECURITY_RLS_AUDIT.md`.
- Built automated health & resilience validator module in `lib/testing/resilience-validator.ts`.
- Marked ALL EPICs (1, 2, 3, 4, 5) as 100% completed in `doc/PRODUCTION_TASKS.md`.

## v0.6.0 - EPIC 4 AI Engine & Performance Optimization

- Upgraded `/api/v1/ai/improve` and `/api/v1/ai/abstract` API routes with Gemini 2.0 Flash (`gemini-2.0-flash`) SSE Streaming support (`ReadableStream` text/event-stream).
- Implemented `EdgeRateLimiter` sliding window module in `@/lib/ai/rate-limiter.ts` enforcing a strict 15 Request Per Minute (RPM) quota limit.
- Implemented In-Memory `TypedArray` RIS & BibTeX parser in `@/lib/ai/edge-parser.ts` safe for Serverless and Edge Runtimes.
- Applied Next.js `dynamic()` imports with `ssr: false` for heavy modal dialogs to accelerate First Contentful Paint (FCP).
- Marked EPIC 4 tasks as completed in `doc/PRODUCTION_TASKS.md`.

## v0.5.0 - EPIC 3 Hybrid Realtime & Polling Sync Engine

- Created core module `HybridSyncEngine` in `@/lib/sync/hybrid-sync-engine.ts` managing real-time document synchronization.
- Integrated Supabase Realtime WebSocket subscription (`postgres_changes` on `documents` table).
- Built Express.js Adaptive Smart HTTP Polling engine with dynamic intervals (3s active typing vs 15s idle).
- Implemented Auto-Fallback & Recovery System: 3x WebSocket disconnects automatically failover to HTTP polling with 30s background reconnect attempts.
- Integrated Page Visibility Guard (`document.visibilityState` listener) to pause polling/heartbeats on inactive tabs and trigger instant sync on tab focus.
- Created `<SyncProvider>` React Context and `useHybridSync()` hook in `@/lib/sync/index.ts`.
- Marked EPIC 3 tasks as completed in `doc/PRODUCTION_TASKS.md`.

## v0.4.0 - EPIC 2 Multi-Hosting Adapters (Deployment Flexibility)

- Configured explicit Vercel Edge Runtime compatibility (`export const runtime = 'edge'`) on Next.js API Routes.
- Enhanced `next.config.mjs` with Cloudflare Pages/Workers OpenNext compatibility options and Production Security Headers.
- Created production-grade `docker/Dockerfile` (multi-stage Node.js Alpine build) for Express.js REST API backend.
- Created `docker/docker-compose.yml` service orchestration (Express.js REST API + PostgreSQL database with healthchecks).
- Created `docker/nginx.conf` production Reverse Proxy configuration for aaPanel / VPS with SSL and WebSocket WSS support.
- Marked EPIC 2 tasks as completed in `doc/PRODUCTION_TASKS.md`.

## v0.3.0 - EPIC 1 Database & Backend Abstraction (Repository / Data Provider Pattern)

- Created unified interface `IDataService` and strict TypeScript domain models in `@/lib/services/types.ts`.
- Implemented `SupabaseDataService` adapter in `@/lib/services/supabase-service.ts` leveraging Supabase Auth & RLS.
- Implemented `ExpressDataService` REST adapter in `@/lib/services/express-service.ts` supporting JWT Bearer authentication headers and multi-database support (PostgreSQL, MySQL, MariaDB).
- Created Service Factory `getDataService()` and React Context `DataProvider` & `useDataService()` hook in `@/lib/services/index.ts`.
- Updated `.env.example` with `NEXT_PUBLIC_BACKEND_TYPE` and `NEXT_PUBLIC_EXPRESS_API_URL`.
- Marked EPIC 1 tasks as completed in `doc/PRODUCTION_TASKS.md`.

## v0.0.3 - Production Roadmap & Architecture Refactoring Setup

- Created production roadmap & task master checklist at `doc/PRODUCTION_TASKS.md`
- Defined EPICs for Database Abstraction, Multi-Hosting Adapters, Hybrid Sync Engine, AI Optimization, and Production Testing
- Updated `PROJECT_MAP.md` to reference `doc/PRODUCTION_TASKS.md`

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



## v0.2.7
- Real-Time Online Presence Stack & Cross-Browser Synchronization:
  - Created dedicated Next.js presence API endpoint (`app/api/v1/presence/route.ts`) and client helper module (`lib/api/presence.ts`) supporting 10-second heartbeat pings and 25-second active timeout threshold.
  - Implemented cross-browser real-time presence sync supporting Chrome, Edge, Firefox, Safari, and mobile browsers.
  - Integrated sleek **Icon-Only Avatar Stack** with status indicator dot 🟢 in top headers of both Owner view (`components/editor/editor-layout.tsx`) and Co-Editor view (`app/shared/[id]/page.tsx`):
    - Co-Editor view displays Document Owner's avatar icon 🟢 with native browser hover tooltip (`[Nama Owner] (Pemilik Dokumen) • Online`).
    - Owner view displays Co-Editors' avatar icons 🟢 with native browser hover tooltip (`[Nama Co-Editor] (Co-Editor) • Online`).
  - Integrated **Instant Leave Beacon** using `navigator.sendBeacon` and `beforeunload` event listeners in both Owner (`scholar-editor.tsx`) and Co-Editor (`page.tsx`) views. When a tab is closed or navigated away, a leave signal is sent instantly (0–1s), immediately clearing the online avatar badge from collaborators' headers.
- Track Changes / Suggesting Mode (Mode Sugesti) UI & Interactive Flow:
  - Added dedicated Track Changes CSS rules in `app/globals.css` for strikethrough red deleted text (`<del class="sf-suggestion-del">`) and emerald green inserted text (`<ins class="sf-suggestion-ins">`).
  - Whitelisted `<del>` and `<ins>` HTML tags along with custom attributes (`class`, `style`, `data-suggestion-id`, `data-author`, `title`) in EditorJS sanitizer configs (`CustomFormatsSanitizerTool` & `paragraph` sanitize rules).
  - Added imperative suggestion methods (`addSuggestionMark`, `acceptSuggestion`, `rejectSuggestion`) to `EditorJsMethods` in `components/editor/editorjs-editor.tsx`.
  - Added **Mode Switcher Toggle Button** (`✍️ Edit Langsung` vs `💡 Mode Sugesti`) in academic formatting toolbars of both Owner view (`components/editor/editor-layout.tsx`) and Co-Editor view (`app/shared/[id]/page.tsx`).
  - Added `💡 Usulkan Perubahan (Track Changes)` action in selection context bubble menus, opening a dedicated **Suggestion Modal** to propose text edits or deletions with 1-click submission.



## v0.2.8
- Remote Update Floating Banner Stabilization & Event-Driven Accepted Suggestion Sync:
  - Created `getContentComparisonString` normalization helper in `components/editor/scholar-editor.tsx` and `app/shared/[id]/page.tsx` that extracts JSON block arrays and strips dynamic `time` timestamps generated on `editor.save()`, eliminating false-positive remote update triggers during normal local typing and initial page loads/refreshes.
  - Refactored 5-second polling live sync to use event-driven accepted suggestion tracking (`processedAcceptedSuggestionsRef` & `acceptedLocallyRef`). The floating signal banner ("✨ Revisi usulan dokumen terbaru telah diterima! [ 🔄 Perbarui Editor ]") now triggers **exclusively** when a new suggestion is accepted remotely by another collaborator, and permanently hides upon clicking **Perbarui Editor** without recurring.
- Suggestion Card Rendering, Role-Based Accept/Reject Access Control & i18n Polish:
  - Fixed missing author name, deleted text, and replacement text rendering in the **💡 Usulan / Suggestions** right sidebar tab by adding field fallback resolution (`author_name || author`, `selected_text || old_text`, `suggested_text || new_text`).
  - Added role-based access control for suggestion actions: the creator of a suggestion now sees a `⏳ Pending Review by Owner / ⏳ Menunggu Peninjauan` indicator on their own cards, while the recipient (Owner / Co-Editor) sees the interactive `✕ Reject / Tolak` and `✓ Accept / Terima` buttons.
  - Added full Internationalization (i18n) support across suggestions sidebar tabs, card status badges, action buttons, selection context menus (`💡 Suggestions` / `💡 Usulan`, `Deleted:` / `Dihapus:`, `Replacement:` / `Pengganti:`), and the floating signal banner (`Latest document revision has been accepted! [ 🔄 Update Editor ]` vs `Revisi usulan dokumen terbaru telah diterima! [ 🔄 Perbarui Editor ]`).
  - Restricted `💡 Suggest Change (Track Changes)` option in selection context bubble menus (`editor-layout.tsx` & `page.tsx`) to display **only when Mode Sugesti (Suggesting Mode)** is active (`editorMode === 'suggest'`), hiding it cleanly when in Direct Edit Mode (`editorMode === 'edit'`).
- Real-Time Notification Bell 🔔 Integration for Track Changes Suggestions:
  - Integrated `createNotification` calls across Owner (`components/editor/scholar-editor.tsx`, `components/editor/editor-layout.tsx`) and Co-Editor (`app/shared/[id]/page.tsx`) views.
  - Submitting a new suggestion automatically triggers a bell notification and red badge for the document recipient (`[Author] proposed a suggestion: "..."` / `[Author] mengusulkan perubahan: "..."`).
  - Accepting or rejecting a suggestion automatically sends real-time bell feedback to the suggestion author (`[User] accepted your suggestion: "..."` / `[User] rejected your suggestion: "..."`).
  - Clicking any suggestion notification in the bell dropdown automatically focuses the sidebar on the **💡 Suggestions** tab.
- Supabase PostgreSQL Database Persistence for Track Changes Suggestions:
  - Created official SQL migration file `supabase/migrations/20260808000001_create_suggestions_table.sql` defining `document_suggestions` table with row-level security (RLS) policies and indexes for `document_id` and `status`.
  - Integrated Supabase client query methods (`select`, `insert`, `update`) inside `app/api/v1/suggestions/route.ts` with fallback to in-memory map for local development.
  - Enhanced `lib/api/suggestions.ts` `addSuggestion` to merge and maintain full suggestion arrays without losing previously submitted pending suggestions.



## v0.2.9
- Accepted & Rejected Suggestions History (Riwayat Usulan Selesai):
  - Added sub-filter toggle state (`suggestionSubTab: 'active' | 'history'`) to the suggestions sidebar in both Owner view (`components/editor/editor-sidebar.tsx`) and Co-Editor view (`app/shared/[id]/page.tsx`).
  - **Active Sub-Tab (💡 Aktif / Active)**: Displays pending track changes suggestions (`status === 'pending'`) with interactive Accept/Reject actions.
  - **History Sub-Tab (📜 Riwayat / History)**: Displays completed suggestions (`status === 'accepted'` or `status === 'rejected'`).
  - Restyled History Cards with clear visual status indicators:
    - **Accepted Suggestions**: Soft green accent background (`bg-emerald-50/30 border-emerald-200`) with green status badge (`✓ Accepted` / `✓ Diterima`).
    - **Rejected Suggestions**: Soft red accent background (`bg-rose-50/30 border-rose-200`) with red status badge (`✕ Rejected` / `✕ Ditolak`).
  - Added full bilingual support (i18n) across sub-tab toggles (`Active` / `Aktif`, `History` / `Riwayat`), status badges, and empty states.
  - Verified API and database integration (`/api/v1/suggestions` and `document_suggestions`) for smooth, real-time status transitions from Active to History.
  - Added active item notification badge (`comments` + `suggestions`) on the Co-Editor header message icon button (`IconMessage`), automatically displaying a pulsing badge when pending suggestions or active comments are present.
  - Added User Authentication Status Indicator Badge to the top right header in `app/shared/[id]/page.tsx`:
    - **Logged In Users**: Displays avatar initial, user name, and green online status dot (`🟢`), showing email on hover.
    - **Guest / Unauthenticated Users**: Displays amber guest badge (`🟡 Tamu / Guest`) with a direct `[ Masuk / Log In → ]` link for seamless authentication.
  - Implemented Page Visibility API Polling Optimization (`window.document.hidden` & `visibilitychange` event listener):
    - Automatically pauses background polling loops (`presence`, `suggestions`, `comments`, `notifications`) when the browser tab is hidden/inactive (`window.document.hidden === true`).
    - Immediately triggers an instant sync update when switching back to the ScholarFlow tab (`visibilitychange` event), eliminating unnecessary network traffic and keeping the development terminal quiet when viewing other tabs.


