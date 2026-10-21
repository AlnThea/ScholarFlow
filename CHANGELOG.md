# ScholarFlow CHANGELOG 📜

All notable changes, architectural milestones, and UI improvements to the ScholarFlow AI Academic Co-Pilot project will be documented in this file.

## ⚡ [v0.43.0] - 2026-10-21 (Zero-Citation Purge, Bilingual Bibliography Header & Academic Integrity Barometer Exclusion)

### 🎯 Zero-Citation Purge & Academic Integrity Isolation (`lib/editor/methods/block-methods.ts`, `components/editor/editorjs-editor.tsx`, `lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `lib/editor/academic-integrity.ts`, `hooks/use-editor-citation.ts`)
- **Reliable Zero-Citation Deletion via Programmatic Bypass (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`)**:
  - Resolved regression where deleting all citations in a document left behind ghost "Daftar Pustaka / References" headers and blurred reference blocks.
  - Root cause: `editor.blocks.delete` user-guard blocked deletions when `isRenderingRef` was reset prematurely by asynchronous `onReady` timeouts.
  - Added dedicated `isProgrammaticSystemUpdateRef` to safely bypass user-deletion blocks during internal `upsertBibliography` operations.
  - Refactored bibliography block cleanup to query block models directly from `editorRef.current.blocks` and delete in descending index order (`[N, N-1, ...]`): prevents index-shifting errors and cleans up header, content, and banner cards in a single atomic pass.
- **Bilingual Bibliography Header (Daftar Pustaka ↔ References) (`lib/editor/editor-utils.tsx`, `hooks/use-editor-citation.ts`, `components/editor/scholar-editor.tsx`)**:
  - Dynamically renders header as **Daftar Pustaka** when active language is Indonesian (`id`) and **References** when English (`en`), reactively updating on language toggle.
  - Implemented `isBibliographyHeaderText` to recognize all variations across legacy and new formats.
- **Exclusion from Academic Integrity Barometer, Heatmap & AI Burstiness (`lib/editor/editor-utils.tsx`, `lib/editor/burstiness-engine.ts`, `lib/editor/academic-integrity.ts`, `components/editor/sidebar-burstiness-tab.tsx`)**:
  - Bibliography header, citations, and upgrade cards are strictly stripped from `extractTextFromContent`, `calculateBurstiness`, and `calculateAcademicIntegrity`.
  - Academic Integrity Barometer (`70% Originality`, AI-likeness, rhythm) and Canvas Heatmap analyze only author manuscript prose without reference list noise.
- **Verification**:
  - Full TypeScript type check (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 223 unit tests across 27 test files.

## ⚡ [v0.42.9] - 2026-10-21 (Dynamic In-Text Citation Deletion & Real-Time Bibliography Synchronization)

### 🎯 Live DOM & Bibliography Synchronization Hardening (`hooks/use-editor-citation.ts`, `lib/editor/methods/block-methods.ts`, `components/editor/editorjs-editor.tsx`, `components/editor/scholar-editor.tsx`)
- **Reactive DOM Reference IDs & Set-Union Bug Resolution (`hooks/use-editor-citation.ts`)**:
  - Fixed issue where deleting in-text citations (`<cite>`) from document content did not remove them from the 'Citations & Library' sidebar tab or bottom bibliography list.
  - Root cause: `bibliographyEntries = useMemo(...)` computed unique IDs via `allUniqueIds = Array.from(new Set([...orderedIds, ...activeReferenceIds]))`. Because mathematical set union always retains elements from `orderedIds` (loaded from static document blocks), deleted citations could never be evicted.
  - Added `hasInitializedLiveStats` flag to `useEditorCitation`: once live stats initialize (`editorJsStats !== null`), reference IDs are strictly derived from live DOM elements (`activeReferenceIds`). If all citations are removed, the library and bibliography immediately clear reactively.
- **Empty Bibliography Cleanup & Persistence (`lib/editor/methods/block-methods.ts`, `lib/editor/editor-tools.ts`)**:
  - Updated `upsertBibliography`: when all citations are deleted (`entries.length === 0`), all existing bibliography blocks (header, content, and premium lock cards) are deleted from the Editor.js canvas.
  - Dispatches `saveCleanContent().then(onContentChange)` to persist the cleared state to database/storage, and safely restores caret position.
  - Standardized `upsertBibliography` return types to `Promise<boolean>`, ensuring `lastUpsertedBibliographyKeyRef` properly flags success and prevents loop retries.
- **Ghost Citation Pruning & Real-Time Typing/Cut Listeners (`components/editor/editorjs-editor.tsx`)**:
  - Enhanced `calculateLiveStats()` to remove empty/ghost `<cite data-citation="true">` elements that can linger in `contenteditable` when users backspace citation tags.
  - Added `onInput` and `onCut` event listeners to the editor canvas wrapper to immediately trigger live stats recalculation whenever users delete, cut, or backspace citations.
- **Automated Verification**:
  - Full TypeScript validation (`npx tsc --noEmit`) passes with 0 errors.
  - Full Vitest suite passes all 222 unit tests across 27 test files.

## ⚡ [v0.42.8] - 2026-10-21 (Right-Click Context Menu & Bubble Menu Citation Search Synchronization)

### 🎯 Citation Search Query State Synchronization & Context Menu Hardening (`components/editor/scholar-editor.tsx`, `hooks/use-editor-citation.ts`, `hooks/use-editor-ai.ts`, `components/editor/bubble-menu/format-menu.tsx`, `components/editor/bubble-menu/citation-menu.tsx`, `components/editor/editor-layout.tsx`)
- **Direct Selection State Linking (`scholar-editor.tsx`, `use-editor-citation.ts`, `use-editor-ai.ts`)**:
  - Resolved regression where highlighting text and clicking 'Cari Kutipan / Sitasi' (Find Citations) from right-click context menu or floating bubble menu resulted in premature 'No citations found'.
  - Identified root cause: `useEditorCitation` was previously passed an empty string `''` placeholder (`// selectedText will be passed as empty initially`), causing `runCitationSearch` to immediately exit on `if (!selectedText.trim()) return;` without querying the OpenAlex/Crossref API.
  - Lifted and bound `selectedText` / `setSelectedText` state in `ScholarEditor`, sharing it simultaneously across `useEditorCitation` and `useEditorAi`.
- **Multi-Source Query Fallback Engine (`use-editor-citation.ts`, `format-menu.tsx`)**:
  - Upgraded `runCitationSearch` to accept an explicit `customQuery?: string` with robust 3-stage fallback: explicit query -> `selectedText` state -> DOM `window.getSelection()?.toString()`.
  - Updated `FormatMenu` button click to immediately extract and pass the active selection query to `onFindCitation(query)`.
- **Right-Click Context Menu Event Dispatch Guard (`editor-layout.tsx`)**:
  - Added immediate `onSelectionChange?.(text)` dispatch in `onContextMenu` when user right-clicks selected text, ensuring state is synchronized before opening the popup.
- **Dark Mode & Bilingual Polish on Citation Results Modal (`citation-menu.tsx`)**:
  - Integrated `useLanguage()` with dynamic English/Indonesian labels for loading, error, and empty result banners.
  - Added full Tailwind `dark:` variants across article cards, header, and buttons.
- **Automated Unit Testing (`__tests__/utils/editor-interaction-hardening.test.ts`)**:
  - Added unit test validating multi-stage query resolution with fallback to window selection.
  - All 222 unit tests passing with 0 errors across 27 test files.

## ⚡ [v0.42.7] - 2026-10-20 (Free Tier Bibliography Visual Blur & Editor.js Toolbar Deletion Guard Hardening)

### 🎯 Bibliography Lock, Visual Obfuscation & Editor.js Toolbar Suppression (`components/editor/editorjs-editor.tsx`, `lib/editor/methods/block-methods.ts`, `app/globals.css`, `hooks/use-editor-citation.ts`)
- **Restored Visual Obfuscation & Premium Blur (`lib/editor/methods/block-methods.ts`, `app/globals.css`)**:
  - Resolved regression where the generated bibliography section (`Daftar Pustaka / References`) rendered fully exposed and readable for Free tier users.
  - Re-applied `.sf-bibliography-blur` (3px blur with reduced opacity) and `.sf-bibliography-fade-container` along with scrambleHtmlText (`Xxxxx, X. (2024)...`) on free tier accounts.
  - Reinstated the prominent "References are a paid feature - Upgrade Now" call-to-action banner card (`.sf-premium-banner-container`).
  - Added non-intrusive retry timer in `use-editor-citation.ts` to ensure bibliography insertion waits until Editor.js finishes initial rendering rather than dropping citations silently.
- **Editor.js Floating Toolbar (`+` and `::`) Suppression on Locked Blocks (`editorjs-editor.tsx`, `app/globals.css`)**:
  - Eliminated the issue where hovering over the locked references block caused Editor.js's floating tune controls (`.ce-toolbar`, including `.ce-toolbar__plus` and `.ce-toolbar__settings-btn` / `::`) to appear, allowing users to open the tune menu and delete the locked block.
  - Intercepted Editor.js internal modules `Toolbar.moveAndOpen` and `BlockSettings.open` in `editorjs-editor.tsx` to automatically abort and close the floating toolbar whenever targeting system-locked blocks.
  - Added dynamic cursor vertical tracking via `onMouseMove` and `onMouseDownCapture` on the editor canvas container: if the pointer Y coordinate intersects any system-locked block's vertical bounding box, `.ce-toolbar` is immediately hidden (`opacity: 0`, `visibility: hidden`, `pointer-events: none`) and click events are cancelled.
  - Added CSS `:has()` rules in `app/globals.css` ensuring `.ce-toolbar` is suppressed whenever hovering on `.sf-system-locked-block` or `.sf-bibliography-blur`.
- **System-Locked Immutability & Deletion Interception**:
  - Wrapped `editor.blocks.delete` in `editorjs-editor.tsx` to prevent accidental or programmatic deletion of system-locked blocks.
  - Prevented keyboard `Backspace` and `Delete` keydowns from removing or merging into system-locked blocks in `onKeyDown`.
- **Test Suite Verification**:
  - All 221 unit tests across 27 test files continue to pass with 0 errors.

## ⚡ [v0.42.6] - 2026-10-20 (Persistent Inline Formatting Toggle & Post-Reload DOM Unwrapping Hardening)

### 🎯 Inline Formatting State & Bidirectional Toggle Hardening (`lib/editor/methods/inline-methods.ts`)
- **Multi-Layered Active State Detection (`toggleInlineFormat`)**:
  - Resolved the bug where bold, italic, underline, or strikethrough formatting applied prior to a page refresh could not be removed or untoggled upon page reload.
  - Implemented multi-layered detection combining native `document.queryCommandState(cmd)`, bidirectional DOM tree traversal (checking parent tags and computed CSS styles `fontWeight >= 600`, `fontStyle: italic`, `textDecoration: underline`), and downward DOM inspection across `blockEl.getElementsByTagName(tag)` intersecting the active selection.
  - Added comprehensive tag and command mapping for all inline styles: `bold` (`B`, `STRONG`), `italic` (`I`, `EM`), `underline` (`U`), `strikethrough` (`S`, `DEL`, `STRIKE`), `superscript` (`SUP`), `subscript` (`SUB`), and `code` (`CODE`).
- **Precise Post-Reload DOM Element Unwrapping**:
  - Eliminated the bug where failing upward traversal from `range.commonAncestorContainer` (which defaults to `<div class="ce-paragraph">` on reloaded text selections) caused `toggleTag` to wrap already-formatted text in duplicate tags (`<b><b>...</b></b>`).
  - Added deterministic unwrap mechanics using `DocumentFragment` extraction, unwrapping parent containers as well as all enclosed formatting elements within the selection boundary while preserving surrounding inner text.
- **Immediate State Synchronization & Autosave Hook Trigger**:
  - Dispatched synthetic `input` and `selectionchange` events directly on the active block element post-mutation, keeping Editor.js's internal data model and toolbar active button indicators in complete synchronicity.
  - Chained `calculateLiveStats()` and `saveCleanContent().then(content => onContentChange(content))` to immediately persist format toggling to cloud storage.
- **Right-Click Context Menu & Floating Bubble Menu Parity (`format-menu.tsx`, `editor-bubble-menu.tsx`)**:
  - Fixed truncated `getBtnClass` template literal in `FormatMenu`, ensuring right-click/selection popup buttons accurately reflect active formatting states (`bg-indigo-100 font-bold`).
  - Added `IconSuperscript` and `IconSubscript` to the right-click bubble menu for complete feature alignment with the main top ribbon toolbar.
  - Full Dark Mode compatibility applied across popup containers and button rows (`dark:bg-slate-900`, `dark:border-slate-800`).
- **Unit Test Coverage (`__tests__/utils/editor-lifecycle-hardening.test.ts`)**:
  - Added automated test suite validating that pre-existing HTML bold tags (`<b>`) loaded from stored cloud data are properly unwrapped and untoggled by `toggleInlineFormat('bold')`, confirming DOM mutation and `onContentChange` invocation.
  - Full test suite passing at **221/221 unit tests across 27 test files**.

## ⚡ [v0.42.5] - 2026-10-20 (Autosave Caret Position Preservation & Bibliography Sync Hardening)

### 🎯 Caret Position Stability & Autosave Cloud Sync Hardening
- **Autosave Referential Guard & Content Identity Preservation (`hooks/use-editor-document.ts`)**:
  - Implemented referential equality preservation in `setCurrentDocument` on debounce completion: if `contentToSave` is structurally identical to `prev.content`, `prev.content` retains its exact object reference.
  - Prevents downstream hooks (`useMemo`, `useEffect`) from unnecessarily invalidating and re-running on routine background autosaves when the user is actively typing.
- **Ordered Reference IDs Keying & Upsert Idempotency (`hooks/use-editor-citation.ts`)**:
  - Replaced object-reference dependency in `bibliographyEntries` with `orderedReferenceIdsKey`, ensuring bibliography entries only recompute when actual `<cite>` tags are added, removed, or reordered.
  - Added `lastUpsertedBibliographyKeyRef` guard in the `useEffect` that calls `upsertBibliography`: if the formatted entries and plan tier haven't changed, `upsertBibliography` execution is completely bypassed.
- **Intelligent Bibliography DOM Cache & Caret Restoration (`lib/editor/methods/block-methods.ts`)**:
  - Added pre-mutation DOM comparison in `upsertBibliography`: if the existing bibliography header and formatted paragraphs already exist in the canvas with identical HTML, the function immediately returns without deleting or modifying blocks.
  - Implemented `getCaretCharacterOffsetWithin` and `setCaretCharacterOffsetWithin` helpers in `lib/editor/editor-utils.tsx`: if the user is typing in a paragraph block while bibliography synchronization occurs, their active `contentEditable` element and character offset are captured and restored post-mutation.
  - Eliminated automatic `caret.setToBlock(foundIdx - 1, 'end')` cursor displacement when the user is actively typing in a non-bibliography block.
- **Heatmap Highlight Caret Preservation (`components/editor/sidebar-burstiness-tab.tsx`)**:
  - Enhanced `toggleHeatmap` in `SidebarBurstinessTab` to preserve and restore the active caret character offset across `innerHTML` highlight regex replacements when AI Heatmap is enabled.
- **Unit Test Suite Expansion (`__tests__/utils/editor-lifecycle-hardening.test.ts`)**:
  - Added unit tests verifying `getCaretCharacterOffsetWithin` and `setCaretCharacterOffsetWithin` accuracy in nested contenteditable DOM elements and styled formatting tags.
  - Total test suite passing at **220/220 unit tests across 27 test files**.


## ⚡ [v0.42.4] - 2026-10-20 (Brand Logo & Academic Integrity Speedometer Gauge Geometry Fix)

### 🎯 Academic Integrity Barometer Speedometer Geometry Hardening (`components/editor/academic-integrity-barometer.tsx`)
- **SVG Arc & Gauge Geometry Calibration**:
  - Eliminated the broken circle-clipping bug caused by `-rotate-90` combined with `h-24 overflow-hidden`, which previously chopped the speedometer in half and caused it to render as a bizarre detached right-side curve.
  - Rebuilt the gauge using a true 180° semicircular SVG coordinate path (`viewBox="0 0 200 110"`) with exact mathematical quadrant boundaries:
    - **Red Zone (0% - 45%)**: High AI Likeness / Low Originality (`#f43f5e`, 25 to 88.27).
    - **Yellow Zone (45% - 75%)**: Moderate AI Rhythm / Review Recommended (`#f59e0b`, 88.27 to 153.03).
    - **Green Zone (75% - 100%)**: Strong Human Originality (`#10b981`, 153.03 to 175).
  - Recalibrated needle pivot point and central axis to `(100, 100)`, ensuring smooth, centered rotation matching the 0%–100% dial sweep.
- **Paraphrase Studio Free-Tier Gate & Selection UX (`components/editor/paraphrase-studio.tsx`)**:
  - Refactored `Priority Sentences` card click handler: clicking a priority sentence now loads and focuses the sentence into `selectedSentence` without abruptly triggering the subscription paywall modal.
  - Added subtle `PRO` badges on priority sentence items in Free tier and restricted instant AI generation to Pro accounts, allowing Free users to preview and manually inspect sentences comfortably.
- **Precise DOM Sentence Selection & Highlight Targeting (`components/editor/academic-integrity-barometer.tsx`)**:
  - Replaced paragraph-level `classList.add('bg-amber-100')` (which improperly colored the entire paragraph block) with DOM TreeWalker text range selection (`window.getSelection().addRange(range)`).
  - Clicking a sentence card under "Kalimat Berisiko Perlu Penyesuaian" now accurately selects and blocks only the specific sentence (from its first word to its punctuation) while smoothly scrolling it into view.
- **Smart Fallback Document-Wide Integrity Analysis (`components/editor/sidebar-burstiness-tab.tsx`)**:
  - Automatically evaluates the full manuscript when no text is highlighted, eliminating the misleading 100% "Awaiting Text" state.
  - Implemented auto-reactive `Entire Doc` toggle state: toggle is automatically ON when no text is selected (indicating full document scope), and automatically flips to OFF when text is highlighted (focusing on the selection), with a dynamic badge showing active word count and scope.
- **History Undo/Redo Boundary Exception Shielding (`lib/editor/methods/history-methods.ts`)**:
  - Protected `undoRef.current.undo()` and `redo()` with `canUndo()` / `canRedo()` guards and defensive `try...catch` blocks to prevent `TypeError: can't access property "data", t[n] is undefined` when undo history boundary is reached.

### 🎨 Official Brand Logo & Responsive Icon Integration (Non-Editor Scopes)
- **Homepage Landing Page Integration (`app/page.tsx`)**:
  - Integrated official brand logo (`navbar-logo-40x40.png`) across the Landing Page top navigation bar, initial loading screen, and bottom footer brand mark.
- **Root Metadata & Multi-Resolution Favicon Suite (`app/layout.tsx`, `public/favicon.ico`, `app/favicon.ico`)**:
  - Configured high-resolution favicon links (16x16, 32x32, 192x192, 512x512) and Apple Touch Icon (180x180) in Next.js RootLayout metadata.
  - Linked OpenGraph social share card (`og-social-share-1200x630.png`) for social previews.
- **Authentication Pages Brand Elevation (`app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`)**:
  - Replaced generic SVG book icons with official high-res logo emblem (`navbar-logo-64x64.png`) wrapped in frosted-glass badge with interactive hover animations.
- **Main Dashboard & Workspace Navbars (`app/dashboard/page.tsx`, `app/billing/page.tsx`, `app/settings/page.tsx`)**:
  - Added official navbar logo mark (`navbar-logo-40x40.png`) to top headers alongside module titles.
- **Sidebar & Workspace Navigation Logo (`components/editor/sidebar/sidebar-logo.tsx`)**:
  - Replaced legacy SVG purple gradient circle (`SF`) in the dashboard sidebar with the official high-resolution logo (`navbar-logo-40x40.png`).
- **Specialty Workspaces & Public Sharing (`app/dashboard/library/page.tsx`, `app/dashboard/bibliometric/page.tsx`, `app/shared/[id]/page.tsx`, `app/not-found.tsx`)**:
  - Integrated official brand mark on Reference Library, Bibliometric Network Workspace, Co-Editor Shared Document header, and 404 Not Found screen.
  - Strict preservation of Editor canvas & ribbon components as requested ("kecuali yang halaman editor").


## ⚡ [v0.42.3] - 2026-10-19 (Zen Mode Autosave Debounce & Zero-Latency Local Snapshot)

### 🧘 Zen / Focused Mode Autosave Delay (4,500ms) & Zero-Latency Local Cache
- **Autosave Debounce Relaxation (`hooks/use-editor-document.ts`, `hooks/use-shared-document-sync.ts`)**:
  - Relaxed the cloud save debounce delay from an aggressive 1,500ms to a calm **4,500ms (4.5 detik)** in both owner editor and co-editor shared workspace.
  - Eliminates rapid status indicator flickering in the user's peripheral vision during academic writing sprints, granting authors natural thinking pauses between sentences.
- **Zero-Latency Local Offline Snapshot (`hooks/use-editor-document.ts`)**:
  - Integrated immediate synchronous `localStorage.setItem` snapshot (`scholarflow.offline_backup.[id]`) at millisecond 0 inside `triggerDebouncedSave`.
  - Ensures 100% data safety against unexpected tab closures or network interruptions even during the extended 4.5s debounce window.

## ⚡ [v0.42.2] - 2026-10-19 (Editor.js Toolbar Alignment & Heading Typography Normalization)

### 🎯 Heading Baseline & Toolbar Vertical Alignment Normalization
- **EditorJS Header Padding & Baseline Adjustment (`app/globals.css`)**:
  - Overrode `@editorjs/header`'s inflated default `padding: .6em 0 3px` with compact `padding-top: 2px !important; padding-bottom: 4px !important`.
  - Neutralized Editor.js internal `Toolbar.moveAndOpen()` baseline miscalculation where `fontSize * 0.8` combined with large `.6em` padding pushed the `+ ::` toolbar action button 25px–35px downward.
  - Headings (H1 through H6) now vertically center and align neatly with the floating `+ ::` actions button.
- **Academic Typography Hierarchy & Section Spacing (`app/globals.css`)**:
  - Established clean academic heading scale for `h1.ce-header` (1.875rem), `h2.ce-header` (1.45rem), `h3.ce-header` (1.2rem), and `h4-h6.ce-header` (1.05rem).
  - Added natural academic block separation via `.ce-block:not(:first-child):has(.ce-header)` without introducing margin onto the heading itself, preserving precise toolbar offset calculations.
- **Dark Mode Support for Editor.js Toolbar & Popovers (`app/globals.css`)**:
  - Added comprehensive dark mode styles for `.ce-toolbar__plus`, `.ce-toolbar__settings-btn`, `.ce-toolbox`, `.ce-popover`, and `.cdx-search-field`.
- **Ghostwrite Route Helper Refactoring (`lib/ai/ghostwrite-helper.ts`)**:
  - Extracted `buildGhostwritePrompt` out of `app/api/v1/ai/ghostwrite/route.ts` into a dedicated helper to satisfy Next.js App Router route module typing requirements.

## ⚡ [v0.42.1] - 2026-10-19 (Autosave Debounce & Editor Loop Resolution)

### 🛡️ Elimination of Infinite Autosave Loop & Referential Stability Hardening
- **EditorJS Initial Mount & Render Shielding (`components/editor/editorjs-editor.tsx`)**:
  - Consolidated initial DOM restoration actions (`restoreBlockAlignments`, `renderAllInlineMath`, `calculateLiveStats`, and `adjustAllCodeTextareaHeights`) directly into the `editor.render().then(...)` promise block.
  - Extended `isRenderingRef.current` hold duration to 400ms after DOM setup finishes, shielding KaTeX rendering and textarea resizing mutations from erroneously triggering Editor.js's internal `onChange` MutationObserver.
- **Symmetric Block Content Normalization (`lib/editor/editor-utils.tsx`)**:
  - Implemented `normalizeBlockDataForComparison` in `getContentComparisonString` to normalize block data and strip ephemeral whitespace (`&nbsp;`) differences and Editor.js temporary block ID discrepancies.
  - Prevents false-positive "dirty document" detections between Supabase raw JSON and Editor.js sanitized output.
- **State Referential Equality & Fast Check Guard (`hooks/use-editor-document.ts`)**:
  - Added fast dirty check guard inside `triggerDebouncedSave`: returns immediately without arming timer or setting `Saving...` status if title and normalized content are already equal to `lastSavedContentRef.current`.
  - Preserved referential equality in `setCurrentDocument` and `setDocuments` by returning the previous state reference when content, title, and settings are identical, preventing unnecessary component re-render loops.
- **Alignment Comparison Hardening (`components/editor/scholar-editor.tsx`)**:
  - Replaced fragile `JSON.stringify` comparison in `onAlignmentChange` with key-by-key comparison, avoiding false saves caused by varying key order in localStorage.

## ⚡ [v0.42.0] - 2026-10-18 (Phase 42: Latent Compilation, Icon Import, API Key Pool & Scoping Resilience Audit)

### 🛡️ Codebase-Wide Static Typing, Icon Imports & API Rotation Hardening
- **Tabler Icons Import Resolution**:
  - Replaced non-existent `IconSpellCheck` with official `IconTextSpellcheck` in `AcademicLinterModal` and `SidebarDocumentTab`.
  - Replaced non-existent `IconBookOpen` with official `IconBook` in `ConceptMapModal` and `LiteratureMatrixModal`.
- **Component Props & State Destructuring**:
  - Added missing `externalTargetSentence` destructuring to `ParaphraseStudio` props in `components/editor/paraphrase-studio.tsx`.
  - Added safe fallback `latestResult.monthly_quota || 0` when invoking `saveLocalQuotaState`.
  - Added `institution?: string | null` to `UserProfile` in `components/auth/auth-provider.tsx` for seamless multi-tenant campus attribution.
  - Aligned `CitationItemForMatrix` in `lib/editor/literature-matrix.ts` with nullable properties from `CitationCandidate`.
- **Editor Layout State & Modal Bridge Hardening**:
  - Replaced stale `currentUser?.id` with `user?.id` on `AcademicScaffoldModal` in `components/editor/editor-layout.tsx`.
  - Corrected `showAlertModal` type from `'danger'` to `'error'` across `versionHistory` toast and `ReferenceDropzone`.
  - Refactored language toggling to directly pass toggled string (`setLanguage(language === 'en' ? 'id' : 'en')`).
  - Aligned `PeerReviewModal` caller props (`userId={user?.id}`, `userPlan={activePlanId || 'free'}`).
  - Added safe runtime assertion for `(editorJsRef.current as any)?.saveCleanContent`.
- **AI Key Rotation & Server Logger Route Resilience**:
  - `interpret-stats`: Lifted `let aiGenerationId` outside `try` block to ensure background failure logging in `catch`.
  - `paper-chat` & `peer-review`: Fixed `geminiKeyPool.execute<string>` argument signature (`customApiKey` instead of `{ customKey: ... }`), mapped `tenantKeyRes.customKey`, fixed `quotaRecord.remaining`, and passed object payload to `completeAiGeneration`.
  - `generate-outline`: Upgraded to automatic key rotation and failover via `geminiKeyPool.execute`, fixed tenant key resolver parameters, corrected `recordPersonalTokenConsumption` argument ordering, and hardened `completeAiGeneration`.
- **Test Hardening & Static Check Cleanliness**:
  - Resolved `tsc --noEmit` type assertions across `__tests__/utils/editor-interaction-hardening.test.ts` and `__tests__/utils/citation-transformer.test.ts`.
  - Cleaned up boolean expression in `__tests__/utils/concept-map.test.ts`.
  - Verified 100% clean compilation (`npx tsc --noEmit` -> 0 errors) and 100% test pass rate (**218/218 Vitest tests across 27 files**).

## ⚡ [v0.41.0] - 2026-10-18 (Phase 41: Editor Canvas Lifecycle, Block Persistence & Rich Content Bridge)

### 🚀 Canvas Lifecycle & Rich Content Persistence Hardening
- **Unified `render` and `renderContent` Method Compatibility**:
  - Implemented async `render` method alias on `buildBlockMethods` in `lib/editor/methods/block-methods.ts`, sanitizing data, initializing undo history, rendering inline math, and adjusting code textarea heights.
  - Aligned `handleChangeCitationStyle` in `hooks/use-editor-document.ts` and `restoreRevision` in `hooks/use-version-history.ts` to support both `renderContent` and `render`, fixing silent re-render failures when switching citation styles (APA ↔ IEEE ↔ Vancouver) or restoring version snapshots.
- **AI History Studio Canvas Text Insertion Bridge**:
  - Updated `handleInsertSynthesizedText` in `components/editor/scholar-editor.tsx` to accept a `customText?: string` argument.
  - Enables "Apply to Canvas" in `AIHistoryModal` to successfully insert selected polished sentences and abstracts directly into the user's active manuscript.
- **Rich Contextual HTML Insertion Engine (`insertHtmlAtCursor`)**:
  - Upgraded `insertHtmlAtCursor` in `lib/editor/methods/inline-methods.ts` with stored cursor range restoration (`targetRange = lastHighlightedRangeRef || lastSelectionRangeRef`), direct contextual HTML fragment insertion (`targetRange.createContextualFragment(html)`), and synthetic `input` event dispatching.
  - Preserves rich `<cite data-citation="true">` elements from Paper Chat and synthesis tools without stripping tags into plain text.
- **Toolbar & Menu Block Auto-Save Persistence**:
  - Connected `saveCleanContent().then(onContentChange)` triggers across all block creation methods in `lib/editor/methods/block-methods.ts` (`insertImage`, `insertTable`, `insertCodeBlock`, `insertMathBlock`, `insertBibliographyText`, and `setBlockType`).
  - Ensures inserted visual assets, LaTeX equations, and bibliography blocks immediately sync to React document state and persist across browser reloads.
- **Safe Suggestion Target Replacement & Input Event Propagation**:
  - Enhanced `addSuggestionMark` in `lib/editor/methods/suggestion-methods.ts` to locate and replace `oldText` with `<del>/<ins>` diff markup instead of appending duplicate text at the end of paragraphs.
  - Added synthetic `input` event dispatching across `acceptSuggestion`, `rejectSuggestion`, `batchAcceptAllSuggestions`, and `batchRejectAllSuggestions` for instant EditorJS reactivity.
  - Added multi-tier container fallback lookup in `lib/editor/methods/cross-reference-methods.ts`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/editor-lifecycle-hardening.test.ts`)**: Added 4 unit tests verifying rich `<cite>` tag preservation, non-duplicate suggestion replacement, customText prioritization in text insertion, and unified render/renderContent interfaces. Total Vitest suite passing at **218/218 tests across 27 test files**.

## ⚡ [v0.40.0] - 2026-10-18 (Phase 40: Canvas & Document Editor Interaction Hardening & Data Flow Reliability)

### 🛡️ Canvas & Document Editor Interaction Hardening
- **Smart In-Text Reference Mention (`@cite` / `@ref` / `@`) Alignment**:
  - Fixed DOM container ID mismatch in `useCitationMention` (`hooks/use-citation-mention.ts`) and `components/editor/editor-layout.tsx` by syncing `holderId` to `'editorjs-holder'`.
  - Added multi-tier container fallback lookup (`document.getElementById(holderId) || document.getElementById('editorjs-holder') || document.querySelector('.codex-editor') || container.closest('[contenteditable="true"]')`) so typing `@cite:` or `@` reliably captures cursor coordinates and opens the reference candidate overlay.
- **Literature Matrix Canvas Table Injection Bridge**:
  - Upgraded `onInjectTableToEditor` in `components/editor/editor-layout.tsx` to call `editorJsRef.current?.insertBlocks([tableBlock])`, ensuring that generated literature review comparison tables immediately render on the active EditorJS canvas and trigger auto-save.
- **Academic Scaffolding Outline Persistence & Auto-Save Sync**:
  - Fixed `onApplyBlocks` in `AcademicScaffoldModal` (`components/editor/editor-layout.tsx`) to immediately trigger `onContentChange(newDocContent)` upon rendering new outline blocks, preventing draft loss on page refresh or tab change.
- **Academic Linter One-Click Fix Target & Content Sync**:
  - Updated DOM selector in `AcademicLinterModal.onApplyFix` to target `#editorjs-holder`, and connected automatic clean content persistence via `saveCleanContent().then(onContentChange)`.
- **Resilient In-Text Citation Fallback**:
  - Hardened `insertCitation` in `lib/editor/methods/citation-methods.ts` with a smart fallback: when a researcher clicks "Insert Citation" from the library sidebar without an active text selection, the citation anchor is gracefully appended to the active block or the last paragraph block instead of silently returning with no action.
- **Live Stats Recalculation on Re-render**:
  - Wired `calculateLiveStats()` into `renderContent()` in `lib/editor/methods/block-methods.ts` so live word, character, and citation statistics instantly update on block changes.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/editor-interaction-hardening.test.ts`)**: Added 3 unit tests verifying mention trigger detection, multi-style in-text citation formatting, and safe DOM node replacement. Total Vitest suite passing at **214/214 tests across 26 test files**.

## ⚡ [v0.39.0] - 2026-10-18 (Phase 39: Automated Journal Submission Package Builder & Cover Letter AI)

### 🚀 Automated Journal Submission Package Builder & Cover Letter AI
- **Submission Package & Cover Letter Engine (`lib/editor/submission-package.ts`)**:
  - Formal academic cover letter generator (`buildCoverLetter`): synthesized standard salutation, target journal name, manuscript type, novelty/significance rationale, scope fit statement, and 4 core originality/non-duplication declarations in bilingual EN & ID formats.
  - Manuscript submission metrics extractor (`extractSubmissionMetrics`): evaluates total word count, abstract length, table count, figure count, and bibliography reference tally.
  - Independent peer reviewer suggestion engine (`generateSuggestedReviewers`): scans cited literature in the manuscript library to derive senior domain authorities while excluding active authors, and generates contact info and non-conflicted rationales.
  - Research highlights synthesizer (`synthesizeHighlights`): formats 3 to 5 high-impact, concise bullet points (max 85 characters each) strictly compliant with Elsevier and IEEE submission standards.
  - Complete submission package bundler (`buildJournalSubmissionPackage`) and consolidated Markdown exporter (`exportSubmissionPackageMarkdown`).
- **Submission Package Modal UI (`components/editor/modals/submission-package-modal.tsx`)**:
  - Fullscreen 2-column workspace with left sidebar metadata parameters and 5 focused section tabs.
  - Target journal quick-fill presets for IEEE Transactions, Elsevier Information and Software Technology, Springer Empirical Software Engineering, SINTA 1 Dikti, and PLOS ONE.
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/submission-package.test.ts`)**: Added 5 unit tests verifying metric extraction, reviewer suggestions from cited references, highlights length constraints (≤ 85 chars), bilingual cover letter construction, and complete Markdown package bundling. Total Vitest suite passing at **211/211 tests across 25 test files**.

## ⚡ [v0.38.0] - 2026-10-18 (Phase 38: Cross-Paper Concept Map & Citation Network Visualizer)

### 🚀 Cross-Paper Concept Map & Citation Network Visualizer
- **Concept & Network Graph Engine (`lib/editor/concept-map.ts`)**:
  - Academic keyword and concept extractor (`extractAcademicKeywords`) with comprehensive bilingual stopword filtering (EN & ID), frequency ranking, and minimum length thresholds.
  - Thematic cluster classifier (`classifyThematicCluster`) categorizing citations into 5 distinct academic themes: Methodology, Fundamental Theory, Empirical Evidence, Computational & Model, and Application Domain.
  - Concept network graph builder (`buildConceptNetworkGraph`):
    - Computes shared concept keywords and Jaccard similarity between all library references.
    - Calculates degree centrality weights (`degree`) and identifies the most influential paper (`mostCentralNodeId`).
    - Evaluates total graph density and creates bidirectional edge relationships.
  - Radial SVG coordinate calculator (`computeRadialLayout`): places the central paper at the origin and distributes surrounding nodes radially with cluster-based color encoding.
  - Mermaid diagram synthesizer (`generateMermaidConceptGraph`): outputs clean, copyable Mermaid graph syntax for Markdown documentation.
- **Concept Map Modal UI (`components/editor/modals/concept-map-modal.tsx`)**:
  - Interactive SVG network stage with dynamic node sizing proportional to connection degree and an animated pulse ring on the central paper.
  - Edge concept chips labeling the shared thematic keywords connecting paper pairs.
  - Rich interactive state: hovering or clicking any paper activates neighbor highlighting, spotlights connected edges, and dims unrelated nodes.
  - Header statistics bar summarizing paper count, concept links, active clusters, graph density, and top influential paper.
  - Filter pills allowing researchers to isolate specific thematic clusters.
  - Inspector side drawer showcasing title, authors, year, abstract snippet, key concept pills, and connected bibliography references with external DOI / paper links.
  - 1-Click "Copy Mermaid Code" action for documentation embedding.
  - Strict compliance with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Cross-Paper Concept Map* card with "Explore Concept Map" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_concept_map` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + N` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/concept-map.test.ts`)**: Added 5 unit tests verifying stopword-filtered keyword extraction, thematic clustering, graph construction with centrality weighting, radial layout positioning, and Mermaid diagram output. Total Vitest suite passing at **206/206 tests across 24 test files**.

## ⚡ [v0.37.0] - 2026-10-18 (Phase 37: Journal Formatting & Publishing Presets Configurator)

### 🚀 Journal Formatting & Publishing Presets Configurator
- **Author Guidelines & Presets Engine (`lib/editor/journal-presets.ts`)**:
  - Implemented authoritative publisher guidelines database:
    - *IEEE Transactions & Journals*: Numeric IEEE format, max 8,000 words, ≤ 200 word abstract, ≤ 12 visuals, and ≥ 75% reference recency.
    - *Elsevier ScienceDirect*: APA/Harvard author-year format, max 8,500 words, ≤ 250 word abstract, and ≤ 10 visuals.
    - *Springer Nature / Scientific Reports*: Vancouver style, max 6,500 words, ≤ 200 word abstract, and ≥ 80% recency.
    - *SINTA 1 & 2 Accredited Journal (Dikti)*: APA style, max 6,000 words, ≤ 200 word abstract, and ≥ 80% recency.
    - *PLOS ONE Open Access*: Vancouver style, flexible length up to 12,000 words, and open methodology priority.
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/journal-presets.test.ts`)**: Added 5 unit tests verifying document metric extraction, reference recency calculations within 5-year windows, IEEE and Elsevier criteria auditing, and standard preset catalog. Total Vitest suite passing at **201/201 tests across 23 test files**.

## ⚡ [v0.36.0] - 2026-10-18 (Phase 36: Interactive Literature Matrix & Synthesis Grid)

### 🚀 Interactive Literature Matrix & Synthesis Grid
- **Literature Matrix & Synthesis Engine (`lib/editor/literature-matrix.ts`)**:
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/literature-matrix.test.ts`)**: Added 7 unit tests verifying methodology inference, sample size regex detection, user-edit preservation, Markdown table escaping, RFC 4180 CSV generation, and EditorJS table block structure. Total Vitest suite passing at **196/196 tests across 22 test files**.

## ⚡ [v0.35.0] - 2026-10-18 (Phase 35: Conference & Thesis Defense Slide Deck Generator)

### 🚀 Conference & Thesis Defense Slide Deck Generator
- **Slide Deck Generator Engine (`lib/editor/slide-deck-generator.ts`)**:
  - Automatically synthesizes EditorJS manuscript blocks into standard 9-slide academic defense and conference decks:
    - *Title Slide*: Title, author, academic institution, session track badge.
    - *Problem Statement & Background*: Empirical gap, real-world context, core tension.
    - *Research Objectives & Scope*: Questions, target hypotheses, parameters.
    - *Theoretical Framework & Literature*: Baseline literature, underlying theoretical models.
    - *Methodology & Research Design*: Population, sampling, instruments, and analysis pipeline.
    - *Key Results & Empirical Findings*: Primary statistical/thematic evidence addressing hypotheses.
    - *Discussion & Scientific Contribution*: Theoretical implications and comparative analysis.
    - *Conclusion & Recommendations*: Concluding takeaway message and future study avenues.
    - *References & Acknowledgments*: Closing citations, supervisor gratitude, and Q&A invitation.
  - Generates standard **Marp Markdown** (`marp: true`, lead classes, speaker notes, custom styling).
  - Generates **Standalone Offline HTML Presentation**: Self-contained single-file HTML deck with keyboard navigation (`ArrowLeft` / `ArrowRight`), fullscreen toggle, speaker notes drawer, and responsive slide cards.
  - Automatically calculates estimated presentation duration (~1.75 minutes per slide).
- **Slide Deck Modal UI (`components/editor/modals/slide-deck-modal.tsx`)**:
  - Fullscreen 16:9 widescreen presentation stage with live carousel preview and slide counter.
  - Thumbnails sidebar displaying all slides with active selection state and category badges.
  - 3 Visual theme presets: Modern Academic (Indigo/Slate), Classic Navy (Blue/Amber), and Minimal Emerald.
  - Toggleable Speaker Notes / Narration Guide drawer with presentation tips.
  - 1-Click "Download Standalone HTML Deck" and "Copy Marp MD" action buttons.
  - Strict compliance with Tailwind Dark Mode and bilingual EN ↔ ID localization.
- **Sidebar & Editor Layout Integration**:
  - Added dedicated *Defense Slide Deck* card with "Open Slide Generator" button in `components/editor/sidebar-document-tab.tsx`.
  - Registered `cmd_slide_deck` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + E` in `editor-layout.tsx` and cheat sheet entry in `shortcuts-modal.tsx`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/slide-deck-generator.test.ts`)**: Added 5 unit tests verifying HTML text stripping, English and Indonesian deck generation, Marp Markdown export formatting, and standalone HTML bundle generation. Total Vitest suite passing at **189/189 tests across 21 test files**.

## ⚡ [v0.34.0] - 2026-10-18 (Phase 34: Academic Grammar & Style Linter)

### 🚀 Academic Grammar, Formality & Style Linter
- **Academic Writing Linter Engine (`lib/editor/academic-linter.ts`)**:
  - Comprehensive scientific rule dictionary supporting both English and Indonesian language conventions.
  - Catches informal colloquial words (e.g. *a lot of*, *huge*, *kids*, *banget*, *bikin*), colloquial contractions (*don't*, *can't*, *tdk*, *dgn*, *yg*), vague/sweeping claims (*everyone knows that*, *sudah jelas bahwa*), and first-person bias (*in my opinion*, *saya menemukan bahwa*).
  - Academic Formality Index calculator (`calculateAcademicStyleScore`): computes formality score (0 - 100) and letter grades (A, B, C, D) based on issue density per 100 words.
  - Safe, non-destructive replacement applicator (`applyLintReplacement`).
- **Academic Linter Modal UI (`components/editor/modals/academic-linter-modal.tsx`)**:
  - Interactive audit modal with letter grade badges, real-time issue count, and category filter pills (All, Informal Words, Contractions, Vague Claims, First Person).
  - Issue inspection cards explaining why each pattern violates scientific publishing standards with 1-click formal replacement buttons and dismiss actions.
  - Full compatibility with Tailwind Dark Mode (`dark:`) and bilingual EN ↔ ID localization.
- **Sidebar Integration (`components/editor/sidebar-document-tab.tsx`)**:
  - Added dedicated *Academic Style Linter* card with "Launch Style Audit" button in the Document stats sidebar tab.
- **Global Shortcuts & Command Palette**:
  - Registered `cmd_academic_linter` in `lib/editor/command-palette.ts`.
  - Added global keyboard shortcut `Ctrl + Shift + L` in `editor-layout.tsx` and cheat sheet in `shortcuts-modal.tsx`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/academic-linter.test.ts`)**: Added 9 unit tests covering English/Indonesian anti-patterns, contraction detection, objectivity checks, HTML tag stripping, and score calculations. Total Vitest suite passing at **184/184 tests across 20 test files**.

## ⚡ [v0.33.0] - 2026-10-18 (Phase 33: Multi-Chapter Thesis & Dissertation Project Binder)

### 🚀 Multi-Chapter Thesis & Dissertation Project Binder
- **Multi-Chapter Project Binder Engine (`lib/editor/project-binder.ts`)**:
  - Academic chapter number parsing supporting standard conventions (*"Bab 1: Pendahuluan"*, *"Chapter 2: Literature Review"*, *"Bagian 3"*).
  - Project chapter aggregator and extractor (`extractProjectChapters`) with word & character counting and ordering.
  - Cross-chapter continuous figure & table numbering engine (`extractCrossChapterFiguresAndTables`) conforming to Indonesian Higher Education (Dikti) and international standards (`Gambar {Bab}.{Nomor}`, `Tabel {Bab}.{Nomor}` / `Figure {Chapter}.{Number}`, `Table {Chapter}.{Number}`).
  - Master Bibliography aggregator (`consolidateMasterBibliography`) extracting citations from all chapters, deduplicating records by DOI or title/author, tracking which chapters cited each reference, and sorting by active citation style (APA/Harvard alphabetical or IEEE/Vancouver numeric appearance).
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/project-binder.test.ts`)**: Added 11 unit tests covering chapter parsing, word counting, cross-chapter figure/table numbering, master bibliography deduplication, style-based sorting, summary metrics, and multi-chapter compilation. Total Vitest suite passing at **175/175 tests across 19 test files**.

## ⚡ [v0.32.0] - 2026-10-18 (Phase 32: Smart In-Text Reference Mention (`@cite` / `@ref`) & Quick Citation Injector)

### 🚀 Smart In-Text Reference Mention & Quick Citation Injector
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/citation-mention.test.ts`)**: Added 13 unit tests covering token parsing, query extraction, multi-field local search, query scoring, external cloud fallback, and in-text citation HTML formatting. Total Vitest suite passing at **164/164 tests across 18 test files**.

## ⚡ [v0.31.0] - 2026-10-18 (Phase 31: Interactive Academic Thesis/Paper Outline & Structure Generator)

### 🚀 Academic Outline & Structure Scaffolding Engine
- **Academic Structure Presets Engine (`lib/editor/academic-templates.ts`)**:
  - Defined 4 standardized research presets: **IMRaD International Journal** (Scopus/WoS), **Indonesian Thesis (5 Chapters Standard)** (Dikti National Standard), **PRISMA 2020 Systematic Literature Review (SLR)**, and **Clinical & Organizational Case Study**.
  - Interactive research guiding prompts and section-by-section checklists detailing exact methodological and reviewer criteria.
  - AST block converters (`convertScaffoldToEditorJsBlocks`) producing valid EditorJS blocks with unique IDs and clean Markdown compiler (`convertScaffoldToMarkdown`).
- **AI Personalized Outline Generator Endpoint (`app/api/v1/ai/generate-outline/route.ts`)**:
  - AI route parsing research topic, field of study, and methodology to formulate tailored sub-sections with specific research questions.
  - Full resilience stack integration: 5-minute Smart Idempotency caching, Personal Token Quota guard, Multi-tenant Campus Dedicated AI key resolver, Gemini Key Pool failover, and Server-Side AI Logger.
- **EditorJS Scaffolding Builder & Canvas Injector (`lib/editor/methods/outline-scaffold.ts`)**:
  - `convertTailoredAirOutlineToBlocks` converting tailored AI sub-sections into structured EditorJS blocks.
  - `injectScaffoldIntoEditorJs` supporting both Append (insert at end) and Replace (fresh scaffold) modes.
- **Interactive Scaffolding Setup Modal (`components/editor/modals/academic-scaffold-modal.tsx`)**:
  - Modern modal with dual-tab interface: **Standard Presets** vs **AI Tailored Scaffolding**.
  - Real-time tree preview, writing guidance toggles, checklist toggles, insertion mode selector, Dark Mode, and bilingual EN/ID support.
- **Keyboard Shortcuts & Command Palette Integration**:
  - Registered `cmd_academic_scaffold` in `lib/editor/command-palette.ts`.
  - Added global shortcut `Ctrl + Shift + O` in `components/editor/editor-layout.tsx` and updated `shortcuts-modal.tsx` cheat sheet.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/academic-templates.test.ts`)**: Added 11 unit tests covering preset retrieval, bilingual generation, markdown conversion, AI tailored block translation, and prompt builders. Total Vitest suite passing at **151/151 tests across 17 test files**.

## ⚡ [v1.5.0] - 2026-10-17 (Phase 30: Figure & Table Scientific Auto-Numbering Engine)

### 🚀 Scientific Cross-Referencing & Auto-Numbering Engine
- **Cross-Reference AST Engine (`lib/editor/cross-reference.ts`)**:
  - Sequential extraction and numbering of all `image` ("Figure X" / "Gambar X") and `table` ("Table Y" / "Tabel Y") blocks across active manuscript.
  - Generates interactive, accessible in-text citation anchors with `data-cross-ref="true"`, `data-ref-type`, and `data-target-id`.
  - Reactive in-text re-numbering engine (`updateHtmlCrossReferences`, `reindexContentCrossReferences`): automatically updates in-text anchor labels whenever figures or tables are reordered, inserted, or removed.
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

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/cross-reference.test.ts`)**: Added 11 unit tests covering sequential numbering, bilingual labels, custom markup generation, in-text re-indexing, and shorthand parsing. Total Vitest suite passing at **140/140 tests**.

## ⚡ [v1.4.0] - 2026-10-17 (Phase 29: Live "Track Changes" / Suggesting Mode)

### 🚀 Track Changes & Suggesting Mode Engine
- **Core Suggesting & Diff Engine (`lib/editor/suggesting-engine.ts`)**:
  - Semantic inline visual diff markup generator (`createSuggestionMarkup`): wraps deleted text in `<del class="sf-suggestion-del ...">` with strikethrough styling and proposed additions in `<ins class="sf-suggestion-ins ...">` with emerald underline styling.
  - Safe HTML escaping (`escapeHtml`) preventing malformed DOM injection and escaping special entities.
  - Targeted resolution engines (`applyAcceptSuggestionToHtml`, `applyRejectSuggestionToHtml`) that cleanly unwrap and remove diff nodes while preserving surrounding content and neighboring suggestions.
  - Batch resolution utilities and EditorJS block transformer (`transformEditorBlocksSuggestion`).
  - AST suggestion extractor (`extractSuggestionsFromHtml`) indexing embedded suggestion metadata (author, dates, status).
- **EditorJS DOM Suggestion Methods (`lib/editor/methods/suggestion-methods.ts`)**:
  - Implemented `addSuggestionMark`, `acceptSuggestion`, `rejectSuggestion`, `batchAcceptAllSuggestions`, `batchRejectAllSuggestions`, and `scrollToSuggestionMark` on active DOM contenteditables.
  - Connected `buildSuggestionMethods` into `hooks/use-editorjs-methods.ts` and `lib/editor/editor-tools.ts`.
- **Suggesting Mode Segmented Control (`components/editor/suggesting-mode.tsx`)**:
  - Dual-mode segmented button on toolbar switching between Direct Edit ("Sunting" ✍️) and Suggesting ("Menyarankan" 💡).
  - Dynamic pending suggestion count badge and dropdown review actions ("Terima Semua Usulan" / "Tolak Semua Usulan").
- **Review Action Floating Chips (`components/editor/suggesting-chips.tsx`)**:
  - Interactive floating cards on canvas margin displaying reviewer persona, timestamp, visual strikethrough/underline diff preview, and 1-click `[✓ Terima / Accept]` and `[✕ Tolak / Reject]` actions.
- **XSS & Security Hardening (`lib/utils/sanitize.ts`)**:
  - Preserved `del` and `ins` tags in DOMPurify `ADD_TAGS` along with custom tracking attributes (`data-suggestion-id`, `data-author`, `data-old-text`, `data-new-text`).
- **Command Palette & Keyboard Shortcut Hub Integration**:
  - Registered commands (`cmd_toggle_suggesting_mode`, `cmd_batch_accept_suggestions`, `cmd_batch_reject_suggestions`) in `lib/editor/command-palette.ts`.
  - Added global shortcut `Ctrl + Shift + S` in `components/editor/editor-layout.tsx` and cheat sheet entry in `components/editor/modals/shortcuts-modal.tsx`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/suggesting-mode.test.ts`)**: Added 12 unit tests covering markup generation, single accept/reject, batch transformations, and block tree updates. Total Vitest suite passing at **129/129 tests**.

## ⚡ [v0.9.8] - 2026-10-16 (Bidirectional Reactive In-Text Citation Style Transformer)

### 🚀 Citation Style Transformation Engine
- **In-Text Citation AST Transformer (`lib/editor/citation-transformer.ts`)**:
  - Full bidirectional format transformation across 6 international academic styles: APA 7th Edition, IEEE Numeric, Harvard, Vancouver, Chicago, and MLA 9th.
  - Multi-author parser (`extractFamilyName`) handling Western, Comma-delimited, and single-word author names.
  - Top-to-bottom document scan algorithm (`extractReferenceIdsInOrder`) resolving citation appearance sequence for IEEE/Vancouver numeric brackets (`[1]`, `[2]`).
  - Seamless JSON block transformer (`transformEditorContentCitations`) converting in-text `<cite>` labels reactively without losing block alignments or styles.
- **Dynamic Bibliography Re-Indexing (`sortAndFormatBibliography`)**:
  - Automatically re-indexes bibliography references according to the target style's rules:
    - **Numeric Styles (IEEE, Vancouver)**: Sorted strictly by appearance order in the manuscript (`[1]`, `[2]`, `[3]`).
    - **Author-Year Styles (APA, Harvard, MLA, Chicago)**: Sorted strictly in alphabetical order (A-Z) by the first author's family name.
- **Reactive Hooks Integration**:
  - `hooks/use-editor-document.ts`: Enhanced `handleChangeCitationStyle` to immediately transform canvas content, re-render EditorJS live, save to database, and display toast notifications.
  - `hooks/use-editor-citation.ts`: Upgraded `bibliographyEntries` memo with `sortAndFormatBibliography`.
- **Toolbar Citation Style Selector Component (`components/editor/citation-style-selector.tsx`)**:
  - Glassmorphic dropdown on `EditorJsToolbar` with format preview badges, sample indicators, Dark Mode, and bilingual EN/ID support.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/citation-transformer.test.ts`)**: Added 13 unit tests covering author parsing, format labels, document order extraction, bidirectional transformation, and bibliography re-indexing. Total Vitest suite passing at **60/60 tests**.

## ⚡ [v0.9.7] - 2026-10-16 (Document Version History & Time-Machine Snapshot - Rollback & Visual Diff)

### 🚀 Document Version History & Time Machine
- **PostgreSQL & Supabase Migration (`supabase/migrations/20261016000001_create_document_revisions.sql`)**:
  - Created `public.document_revisions` table with Row Level Security (RLS) policies allowing document authors and shared collaborators to view and create snapshots.
  - Added indexes on `(document_id, created_at DESC)` and `(user_id)`.
  - Added `DocumentRevision` model to universal `prisma/schema.prisma` with relation to `DocumentEntry`.
- **LCS Word-Level Visual Diff Engine (`lib/editor/diff-engine.ts`)**:
  - Implemented high-performance Longest Common Subsequence (LCS) word diff algorithm tracking changes (`added`, `removed`, `unchanged`).
  - `extractPlainTextFromEditorJs` normalizes EditorJS block trees (paragraphs, lists, code, captions) and decodes HTML entities for clean text comparison.
  - Quantitative diff statistics (`addedWords`, `removedWords`, `unchangedWords`) with net delta calculations.
  - Bilingual relative time formatter (`formatRelativeTime`).
- **Dual Revisions Storage & REST API (`lib/editor/version-history.ts` & `app/api/v1/documents/[id]/revisions/route.ts`)**:
  - LocalStorage fast caching layer (`loadLocalRevisions`, `saveLocalRevisions`, `appendLocalRevision`) with a 30-item FIFO safety limit for offline accessibility.
  - Background REST API with Supabase service-role bypass for seamless server persistence.
- **Custom Hook Engine (`hooks/use-version-history.ts`)**:
  - Smart background auto-snapshotting (every 15 minutes of active typing, or when document length changes by >= 80 words).
  - Manual milestone checkpoints with custom change summaries.
  - Automated pre-restore *Safety Backup* preventing accidental loss of current drafts when reverting.
- **Time-Machine Modal UI (`components/editor/modals/version-history-modal.tsx`)**:
  - Fullscreen slide-over drawer with chronological version timeline, badge classification (*Auto-save* vs *Checkpoint*), and word count counters.
  - Interactive Diff Viewer supporting both **Unified Diff** (inline text flow with color highlights) and **Side-by-Side Split View** (Snapshot vs Current Canvas).
  - One-click copy, custom confirmation restore dialog (zero native browser alerts), Dark Mode, and Bilingual (EN <-> ID) support.
- **Editor Header Navigation Integration (`components/editor/editor-header.tsx`)**:
  - Integrated "History" button with `IconHistory` in the header toolbar.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/version-history.test.ts`)**: Added 11 unit tests covering plain text extraction, word diff computation, time formatting, and local storage caching. Total Vitest suite passing at **47/47 tests**.

## ⚡ [v0.9.6] - 2026-10-16 (Real-Time Inline AI Ghostwriter - Tab-to-Accept ala Jenni AI)

### 🚀 Real-Time Inline AI Ghostwriter Engine
- **Predictive Autocomplete Endpoint (`app/api/v1/ai/ghostwrite/route.ts`)**:
  - Low-latency academic text prediction with `temperature: 0.25` and `maxOutputTokens: 120`.
  - Contextual prompt builder (`buildGhostwritePrompt`) tailoring suggestions based on paper title and the preceding context (last 600 chars) for both English and formal Indonesian.
  - Multi-tenant campus key resolver (`resolveTenantKey`), personal token quota validation (`checkPersonalQuota`), and server-side tracking (`createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`).
  - 5-minute Smart Idempotency caching (`generateIdempotencyKey`) avoiding redundant Gemini API calls.
- **Ghostwriter Hook Engine (`hooks/use-ghostwriter.ts`)**:
  - Debounced predictive trigger (`1300ms` typing pause) activating when typing pauses at the end of a sentence or paragraph.
  - Caret coordinate calculation via `Range.getBoundingClientRect()` positioning the suggestion directly beside the cursor.
  - Non-destructive DOM insertion via synthetic `input` event on the active contenteditable block without disrupting EditorJS internal state.
  - Keyboard shortcuts: `<kbd>Tab</kbd>` to accept full suggestion, `<kbd>Esc</kbd>` to dismiss, and `<kbd>Ctrl+J</kbd>` / `<kbd>Cmd+J</kbd>` to toggle Ghostwriter on/off.
- **Floating Ghostwriter Suggestion Component (`components/editor/ghostwriter-suggestion.tsx`)**:
  - Glassmorphism floating pill near the cursor with `IconSparkles`, italic academic continuation preview, and action buttons.
  - Fully responsive with Dark Mode (`dark:bg-slate-900/95`, `dark:border-slate-700`, `dark:text-slate-100`) and Bilingual (EN <-> ID) support.
- **EditorJS Toolbar Quick Switch (`components/editor/ghostwriter-toggle.tsx`)**:
  - Direct toggle button on the main toolbar with active indicator, loading spinner, and shortcut tooltip.
- **Quota Limit Protection**:
  - Uses existing application modal portals (`TokenQuotaModal` / `LimitWarningModal`) when monthly quota is exhausted; never relies on native browser `window.alert()`.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/ghostwriter.test.ts`)**: Added 8 unit tests covering prompt construction, context truncation, idempotency key generation, and keyboard shortcuts. Total Vitest suite passing at **36/36 tests**.

## ⚡ [v0.9.5] - 2026-10-16 (Full App-Wide Server-Side AI History Parity & Modular History Studio)

### 🚀 Server-Side AI History Full Parity
- **Synthesis Route Logging (`app/api/v1/ai/synthesize/route.ts`)**: Integrated `createPendingAiGeneration`, `completeAiGeneration`, and `failAiGeneration` tracking so literature review synthesis jobs are persisted in the Supabase backend with `generation_id` returned.
- **Statistical Output Interpreter Route Logging (`app/api/v1/ai/interpret-stats/route.ts`)**: Integrated server-side logging for multimodal vision (SPSS/PSPP table images) and tabular data interpretations.
- **Client Reactive Synchronization**:
  - `hooks/use-editor-ai.ts`: Updated `handleSynthesizeReview` to record synthesized literature reviews into `aiHistory` with tone `synthesis`.
  - `components/editor/sidebar-stats-tab.tsx`: Updated `handleInterpret` to record completed statistical analyses into client `aiHistory` with tone `statistical`.
  - `lib/editor/ai-history.ts`: Upgraded `convertCloudRecordToHistoryEntry` to seamlessly support `synthesis` and `statistical` / `stats` records from Supabase cloud sync.

### 🎨 Modular AI History Studio (`components/editor/modals/ai-history-modal.tsx`)
- **File Length Reduction**: Extracted modal JSX out of `components/editor/editor-sidebar.tsx`, trimming file length from 756 to 571 lines (strict adherence to `< 700 lines` guidelines).
- **Category Filter Tabs**: Added interactive filter pills with dynamic count badges (*All*, *Polish (Academic)*, *Paraphrase*, *Abstract*, *Synthesis*, and *Stats*).
- **Live Search Query**: Instant keyword filter across original drafts and AI-generated text.
- **Academic AI Disclosure Exporter**: Downloadable AI Transparency statement (`.md` format) for university and journal submission ethics compliance.
- **Micro-UX & Animations**: Animated "Copied!" feedback, glowing sparkles badge for ScholarFlow Academic AI, and full Dark Mode / Bilingual (EN <-> ID) support.

### 🧪 Automated Testing
- **Vitest Suite Expansion (`__tests__/utils/ai-history.test.ts`)**: Added 3 new unit tests covering deduplication, cloud record parsing, and local-cloud merging. Total test suite passing at **28/28 tests**.

## ⚡ [v0.9.4] - 2026-10-15 (Server-Side AI History Engine & System Architecture Suite)

### ☁️ ChatGPT-Style Server-Side AI History & Resilient Background Tasks
- **Supabase SQL Migration (`supabase/migrations/20261015000001_create_ai_generations_history.sql`)**: Created `public.ai_generations` table with granular Row Level Security (RLS) policies and chronological indexes. Enables background transaction persistence even if the client disconnects at second 2.
- **Universal Prisma Schema (`prisma/schema.prisma`)**: Integrated `AiGenerationEntry` model with relation to `UserProfile`.
- **Server AI Logger Engine (`lib/ai/server-ai-logger.ts`)**: Built `createPendingAiGeneration`, `completeAiGeneration`, `failAiGeneration`, and `fetchUserAiHistory` with service-role Supabase bypass.
- **History API Endpoints (`app/api/v1/ai/history/route.ts`)**: Implemented RESTful `GET` (fetch recent 20 generations) and `DELETE` (delete single or clear all) routes.
- **API Route Handlers Integration**: Injected server logging into `/api/v1/ai/improve` and `/api/v1/ai/abstract`.
- **Client-Cloud Dual Sync**: Hydrated cloud history in `hooks/use-editor-ai.ts` via `mergeAiHistories` and added real-time `Cloud Synced` badge in the AI History modal.
- **Enterprise White-Label Model Masking (`components/editor/editor-sidebar.tsx`)**: Replaced raw technical AI model names (`deepseek`, `gemini`, `claude`, etc.) with a prestigious `ScholarFlow Academic AI` brand badge for regular students/users, while maintaining granular raw model inspection and audit tags for Administrators.

### 🏛️ System Architecture Documentation Suite
- Created `doc/architecture/` containing complete technical specifications and Mermaid Sequence Diagrams:
  - `01-server-side-ai-history.md`: Server-Side AI Generation & Resilient Background Execution (ChatGPT-Style).
  - `02-smart-idempotency-cache.md`: Smart Idempotency Cache & Zero-Waste Token Deduplication (5-Minute TTL).
  - `03-token-quota-synchronization.md`: Personal AI Token Quota & Service-Role Quota Tracking.
  - `04-multi-tenant-campus-keys.md`: Multi-Tenant Campus Dedicated AI Key Resolver & Workload Segregation.
  - `README.md`: Index table and navigation guide.

## ⚡ [v0.9.3] - 2026-10-15 (Persistent AI Generation History & Cross-Session Restoration)

### 📜 Local Storage Persistence & Session Safety
- **Storage Engine (`lib/editor/ai-history.ts`)**: Built persistent `loadAiHistory` and `saveAiHistory` utilities with localStorage key `scholarflow.editor.ai-history.v1` and a FIFO capacity limit of 15 items, ensuring working AI drafts are retained across tab closes and browser refreshes.
- **Hook State Hydration (`hooks/use-editor-ai.ts`)**: Hydrated `aiHistory` from client localStorage on mount within `useEffect`, keeping the history synchronized when entries are added, deleted individually, or cleared altogether.
- **Enterprise Dark Mode & Bilingual Modal (`components/editor/editor-sidebar.tsx`)**: Upgraded the AI History Modal popup with full dark mode support (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`), tone pill indicators, model badges, side-by-side original vs. polished comparison, one-click clipboard copying, and direct 'Apply to Canvas' functionality.
- **Zero Database Changes**: Operating purely on the client-side working storage layer, this feature requires zero Supabase table migrations, ensuring zero extra latency or cloud bandwidth overhead.

## ⚡ [v0.9.2] - 2026-10-15 (Resilient AI Transaction & Zero-Waste Token Guard)

### 🛡️ Smart Idempotency Cache & Zero-Waste Token Deduplication
- **Engine (`lib/ai/idempotency-cache.ts`)**: Built a deterministic 64-bit double-pass FNV-1a hash caching engine with a 5-minute TTL to deduplicate identical AI prompts across both Edge and Node.js runtimes.
- **Deduplication Across All 4 AI Endpoints**:
  - `/api/v1/ai/improve`: Returns cached response in 0.01s with `0` tokens charged if the user submits the same text and tone within 5 minutes.
  - `/api/v1/ai/abstract`: Reuses recent context abstracts on page refreshes without re-calling Google Gemini.
  - `/api/v1/ai/synthesize`: Deduplicates literature review synthesis for identical reference selections.
  - `/api/v1/ai/interpret-stats`: Caches multimodal SPSS table analyses by combining user ID, config, and input data signatures.

### 🛡️ Browser Safety Guard (`window.onbeforeunload`) & Micro-UX Badges
- **Accidental Refresh/Close Prevention**: Integrated `beforeunload` event listeners in `useEditorAi`, `ParaphraseStudio`, and `SidebarStatsTab`, protecting users from losing active generations if they press F5, Ctrl+R, or Close Tab.
- **Cache Hit Indicator**: Added visual `⚡ 0 Token (Cache Instan)` status indicators to `SidebarWritingTab` and `ParaphraseStudio` with full dark mode and bilingual (EN <-> ID) support.
- **Unit Testing**: Added Vitest test suite in `__tests__/utils/idempotency-cache.test.ts` (5/5 tests passing, 25/25 tests passing in total suite).

## ⚡ [v0.9.1] - 2026-10-15 (AI Token Quota Consumption & Realtime Profile Synchronization Fix)

### 🛡️ Service-Role Database Permissions & Accurate Quota Tracking
- **Server-side Service Role Client (`lib/supabase-admin.ts`)**: Initialized privileged Supabase client utilizing `process.env.SUPABASE_SERVICE_KEY`, allowing backend route handlers to update user `ai_tokens_used` metrics without getting silently rejected by Row Level Security (`auth.uid() = id`).
- **Engine DB Client Upgrade (`lib/ai/token-quota.ts`)**: Upgraded `checkPersonalQuota` and `recordPersonalTokenConsumption` to leverage `supabaseAdmin || supabase`.

### ⚡ Client-Side State Synchronization & Paraphrase Studio Bridge
- **Paraphrase Studio User Context (`components/editor/paraphrase-studio.tsx`)**:
  - Connected `useAuth()` to provide `user.id` and `profile.subscription_plan` across all 3 concurrent `improveWriting` variations (`paraphrase`, `simplify`, `mimic`).
  - Added token quota synchronization to local cache via `saveLocalQuotaState` and triggered `refreshProfile()` upon generation.
  - Added proactive quota exhaustion handling that triggers `setIsPlanModalOpen(true)` if user reaches monthly allowance.
- **Editor AI Hook Reactive Synchronization (`hooks/use-editor-ai.ts`)**:
  - Created centralized `updateQuotaState` callback synchronizing `tokensUsed`, `monthlyQuota`, `localStorage`, and `refreshProfile()`.
  - Linked `updateQuotaState` across `runImproveWriting`, `runParaphrase`, `runSummarize`, `runGenerateAbstract`, and `handleParafrasePlagiat`.
- **Literature Review Synthesis Quota Guard (`app/api/v1/ai/synthesize/route.ts` & `lib/api/ai.ts`)**:
  - Integrated `checkPersonalQuota` and `recordPersonalTokenConsumption` into `/api/v1/ai/synthesize`.
  - Upgraded `synthesizeLiteratureReview` client function and `handleSynthesizeLiterature` hook to transmit user credentials and reactively update `updateQuotaState`.
- **SPSS / PSPP Statistical Interpreter Quota Protection (`app/api/v1/ai/interpret-stats/route.ts` & `components/editor/sidebar-stats-tab.tsx`)**:
  - Enforced `checkPersonalQuota` on multimodal vision and table analysis requests.
  - Calculated consumed tokens and recorded usage, automatically synchronizing `saveLocalQuotaState` and triggering `refreshProfile()` upon successful analysis.
- **Automated Verification**: Ran Vitest unit tests verifying 20/20 test cases pass.

## 🏛️ [v0.9.0] - 2026-10-15 (Multi-Tenant Campus Dedicated AI Key Resolver & Super Admin Key Config)

### 🔑 Per-Tenant Key Isolation & Resolution Engine
- **Tenant Key Resolver Engine (`lib/ai/tenant-key-resolver.ts`)**: Built an intelligent per-campus API key resolver that queries user university affiliation via `institution_members` or `profiles.institution_id`, isolates campus rate limits (`campus_text_key` vs `campus_vision_key`), and implements in-memory caching (5-minute TTL) with tiered failover pools (`campus_byok` -> `campus_pool` -> `pro_pool` -> `free_pool`).
- **End-to-End AI Endpoints Integration**:
  - `/api/v1/ai/improve`: Dynamic injection of resolved campus key and category pool into SSE streaming and direct generation runners, returning `tenant_source` and `institution_name` metadata.
  - `/api/v1/ai/abstract`: Upgraded to `geminiKeyPool` multi-key failover and tenant key resolution.
  - `/api/v1/ai/synthesize`: Upgraded to `geminiKeyPool` failover and campus tenant key resolution.
  - `/api/v1/ai/interpret-stats`: Multimodal SPSS vision analysis now resolves and injects `campus_vision_key` dedicated for university stats workloads.
- **Client Integration (`components/editor/sidebar-stats-tab.tsx`)**: Connected user session and active subscription tier to statistical interpreter API calls.
- **Super Admin Key Config (`components/admin/institution-modal.tsx`)**: Added dedicated BYOK input fields for `campus_text_key` and `campus_vision_key` with Dark Mode and Bilingual (EN <-> ID) support.
- **Automated Unit Testing**: Created comprehensive test suite in `__tests__/utils/tenant-key-resolver.test.ts` (9/9 tests passing in Vitest).

## 💳 [v0.8.5] - 2026-10-12 (Xendit Animated Payments & B2B Campus Admin Management)

### 🚀 Xendit Hosted Invoice & Animated In-App Checkout
- **Xendit Invoice Creation & Webhook Endpoints**: Implemented `/api/payments/xendit/create-invoice` and `/api/payments/xendit/webhook` supporting live Xendit API integration with graceful sandbox simulation fallback.
- **Rich 4-Stage In-App Animated Checkout Modal**: Created `XenditCheckoutModal` featuring invoice creation pulse, live countdown timer (`23:59:45`), active radar pulse listener (`animate-ping`), live polling detector, instant demo simulation trigger, and celebration confetti upgrade moment.
- **Gateway Selection Parity**: Updated `GatewaySelectorModal` and `PricingModal` to present Xendit Invoice alongside Stripe and Midtrans.
- **Hybrid API Key Management**: Supported Xendit credentials through both `.env` (`XENDIT_SECRET_KEY`) and Admin Panel (`/admin/gateways`).

### 🏛️ B2B Campus & Institutional Partner Management (`/admin/institutions`)
- **SQL Migration Script**: Created `supabase/migrations/20261012000001_create_institutions_table.sql` with RLS policies and table indexes.
- **Prisma Model**: Added `InstitutionEntry` universal model to `prisma/schema.prisma`.
- **API Service & Dual-Persistence**: Implemented `lib/api/institutions.ts` supporting full CRUD operations with `localStorage` dual-persistence fallback (`scholarflow.institutions.v1`).
- **Super Admin Management UI**: Built `app/admin/institutions/page.tsx`, `components/admin/institutions-table.tsx` with seat capacity progress bars and KPI metric cards, and `components/admin/institution-modal.tsx` with domain whitelisting and PIC email assignments.
- **Admin Sidebar Navigation**: Linked "Campus & Institutions" directly in `SidebarSettingsView`.
- **100% Bilingual & Dark Mode**: All new UI components strictly adhere to Tailwind Dark Mode and dynamic EN/ID localization.


### 🚀 B2B Campus Portal (Institution Dashboard)
- **Enterprise UI/UX Layout**: Implemented `/dashboard/institution` with a professional, Silicon Valley-standard SaaS dashboard utilizing `framer-motion` for smooth staggered animations and state transitions.
- **Micro-UX Refinements**: Built a robust Member Management data table featuring Search, Status Filters, **Pagination**, elegant **Empty States**, and **Skeleton Loading** placeholders.
- **Seat & Quota Management**: Added visual KPI cards with dynamic animated progress bars showing license capacity (e.g., "42/150 Seats Allocated") to drive PLG Upselling.
- **Usage Analytics**: Integrated `recharts` to render beautiful, responsive Area Charts (Platform Adoption Rate) and Pie Charts (Role Distribution) to provide campus admins with actionable ROI metrics.
- **Organization Branding**: Added a settings tab supporting custom organization names and Domain Whitelisting configuration (e.g., `@um.ac.id`) for automated member invites.
- **Role-Based Access Control (RBAC)**: Added visual badges and permission-ready UI for managing Campus Admins vs Standard Members.
- **100% Bilingual & Dark Mode**: Dashboard UI is fully compliant with EN/ID localization and responsive Tailwind Dark Mode.

## 🚀 [v0.7.0] - 2026-09-30 (Enterprise Burstiness & Academic Integrity)

### 🛡️ Professional Grade UI & Security
- **Heatmap / Inline Highlight**: Added non-destructive visual heatmap directly in the Editor canvas (`.ce-block`) that highlights detected AI buzzwords using safe regex DOM replacement without destroying block formats.
- **AI Lexical Analyzer & Buzzword Tracker**: Expanded `AI_BUZZWORDS` dictionaries with hundreds of words for both English and Indonesian. Implemented a professional UI in `SidebarBurstinessTab` that counts and displays specific detected cliches.
- **Citation Lock (Safe-Mode Paraphrase)**: Implemented robust dual-regex protection (supporting APA/Harvard and IEEE formats) in `ParaphraseStudio`. The system securely locks citations like `(Smith et al., 2020)` into `[CITE_N]` placeholders before calling Gemini, restoring them flawlessly post-generation to prevent AI hallucination or deletion.
- **Author Stylometry (Mimic My Voice)**: Upgraded the `improveWriting` API to accept an author's `styleReference`. Paraphrase Studio now dynamically reads the surrounding document text to instruct the AI to perfectly mimic the author's unique vocabulary, rhythm, and stylistic quirks instead of generating generic academic text.
- **Originality Certificate Export**: Added `handleExportReport` to generate and print a certified "ScholarFlow Originality Report" (PDF), providing researchers tangible proof of their document's burstiness score, lexical diversity, and human-written status.
- **Enterprise UI Refinements**: Added "SAFE-MODE" UI badge and visual warning alerts (Amber/Emerald states) for Lexical Analyzer. Fully responsive with Dark Mode and `isEn` bilingual support.

## 🚀 [v0.6.0] - 2026-09-22

### 📊 Bibliometric Network Analytics (Phase 5 & 6)
- **Dynamic NLP Keyword Extraction**: Replaced static regex keyword whitelist with advanced NLP extraction, integrating `keyword-extractor` and `stopword` for comprehensive bilingual (English & Indonesian) stopword filtering and true topic detection.
- **Thesaurus / Dictionary Auto-Save**: Connected the Thesaurus/Synonym dictionary to Supabase `user_profiles` (JSONB preferences) with a 2000ms debounce auto-save, ensuring workspace persistence across sessions. Added capability to map words to empty strings to dynamically exclude/hide irrelevant nodes.
- **High-Resolution & Vector Export**: 
  - Added **PNG (4K)** export feature leveraging 3x canvas upscaling and anti-aliasing.
  - Added **SVG (Vector)** export feature via custom programmatic mathematical generation of nodes and links for infinite-resolution academic poster printing.
- **Source Documents Drill-Down**: Upgraded node click interaction in the Detail Panel to list all underlying source documents (Title, Author, Year) contributing to the selected cluster.
- **True Clustering Algorithm (Louvain Modularity)**: Integrated `jlouvain` to compute actual Louvain Modularity communities/clusters, completely replacing randomized/dummy grouping.
- **Global Network Metrics Dashboard**: Implemented a floating dashboard in the bottom-left displaying Total Nodes, Total Links, Network Density, and Average Degree.
- **Metrics Data Export**: Added `Export CSV` functionality to download raw node metrics (Occurrences, Centrality, Cluster Group, Neighbors Count) for statistical analysis in SPSS or Excel.
- **Node Search & Auto-Zoom**: Optimized the existing search bar in the floating toolbar to trigger camera auto-panning and zoom onto targeted topics.
- **Layout Physics Switcher**: Added UI control to dynamically change the network layout algorithms (Force-Directed/Repulsion, Circular/Radial, Grid/Matrix, and Freeze/No Physics).
- **System-wide Bilingual & Dark Mode Refactoring**: Fully translated and styled all modals, sidebars, dashboard tabs, and payment flows to strictly support EN/ID language toggles and Tailwind dark mode classes seamlessly.

## 🚀 [Unreleased]

### 🏗️ Massive Architecture Refactoring & Type-Safety
- **Refactored**: Pemecahan secara masif komponen-komponen raksasa (seperti `page.tsx`, `editor-layout.tsx`, `use-editorjs-methods.ts`, dll) hingga berukuran `< 700 baris`. Arsitektur kini sangat modular.
- **Fixed**: Perbaikan 100% kompilasi TypeScript (*Type-Safe*).

### 🎨 Enterprise Dashboard Redesign
- **Redesigned**: Antarmuka User Dashboard (`app/dashboard/page.tsx`) dirombak menjadi kelas Enterprise (dengan *Metrics Cards*, *Quick Access* ber-grid elegan, dan animasi *hover* transisi yang mulus).

### 📊 Bibliometric Network Analysis (Ultimate Professional Parity)
- **Added**: Fitur *Node Search & Focus* dengan *camera zoom* dan penyorotan dinamis.
- **Added**: Fitur *Overlay Visualization (Trend Analysis)* untuk mewarnai *node* berdasarkan rata-rata tahun terbit.
- **Added**: Ekstraksi dan penghitungan *PageRank Centrality* langsung di grafik untuk mendeteksi *node* terpenting.
- **Added**: Dukungan *Density Visualization (Heatmap)* untuk menyorot konsentrasi klaster topik tanpa garis graf.
- **Added**: Fitur *Time-Slicing Animation* untuk menganimasikan rentang tahun evolusi graf secara otomatis (*Play/Pause*).
- **Added**: Fungsi Ekspor *GraphML* untuk memigrasikan hasil graf ke Gephi, VOSviewer, atau Cytoscape.
- **Added**: Mode analisis baru: *Co-Citation* dan *Bibliographic Coupling* antar dokumen (Berdasarkan Daftar Pustaka).
- **Added**: Kontrol Visual (*Visual Tuning*) untuk *physics gravity* / tegangan antar *node* dan kontrol *scaling* ukuran teks/graf.

### 🔗 Sidebar Integration Fix
- **Fixed**: Perbaikan integrasi *Sidebar* dengan halaman *My Library* dan *Bibliometric Analysis*. Navigasi di luar *editor* konsisten dan bebas dari URL 404.
### ✨ Distraction-Free Zen Mode Layout
- **Added**: Upgraded the Left Sidebar (`MinimalSidebar`) to completely hide (`w-0`) when collapsed instead of shrinking to `w-16`. A floating Hamburger menu appears on the document header to toggle it, providing a fully immersive, distraction-free writing canvas for the user.

### 🛡️ Enterprise Professional Standards (Phase 8 Planned)
- **Planned**: Add Error Boundaries for robust component crash recovery.
- **Planned**: Implement DOMPurify to prevent XSS (Cross-Site Scripting) vulnerabilities in EditorJS and UI components.
- **Planned**: Introduce automated testing suite (Vitest/Jest for unit tests, Playwright for E2E).
- **Planned**: Interactive onboarding tours (Shepherd.js) and accessibility (a11y) improvements.

### ✨ Burstiness & Sentence Length Analyzer
- **Added**: Integrating a 100% Client-Side Sentence Variance (Burstiness) Analyzer to detect AI-generated text patterns using Math/Regex (Standard Deviation) and visualizing it with `recharts` in the editor sidebar.
- **Improved**: Dedicated "Burstiness" tab inside the right sidebar serving as the default open tab, allowing more space for chart visualizations.
- **Layout Tweaks**: Main canvas editor aligned to the left and right sidebar widened to `480px` for optimal analytics viewing.
- **Added (Cockpit Layout)**: Implemented 3-column architecture synchronizing the Right Sidebar with the Left Sidebar. The Left Sidebar automatically expands to a 350px `SentenceRhythmExplorer` when the Burstiness tab is active.
- **Added (Rhythm Explorer)**: Sentence tokenizer that breaks down the manuscript into clickable Sentence Cards grouped by length (short, standard, long, complex) with a visual Cadence Ribbon.
- **Added (Paraphrase Studio)**: Right-panel UI containing a 4-box metrics grid and an interactive AI Paraphrase Studio with smart priority sentence highlighting.
- **Added (AI Integration)**: Connected the Paraphrase Studio to the Gemini API (concurrently generating 3 variations: Rhythmic, Clause Split, and Scholarly Flow).
- **Added (Real-time Sync)**: "Apply" function replaces text directly within the EditorJS data blocks in real-time.
- **Added (Smart Replace & Auto-Scroll)**: Implemented DOM traversal for auto-scrolling to clicked sentences and a flexible Regex engine to overwrite text without stripping HTML formats (bold, italic, citations).
- **Added (Document Toggle)**: Switch to analyze the burstiness of the entire document text at once instead of just selected segments.
- **Added (Paywall & PLG)**: Locked the Paraphrase Studio feature behind a Pro subscription, rendering a disabled UI with an "Upgrade to Pro" call-to-action button for Free Tier users.

## 🛠️ [v0.7.5] - 2026-08-11

### 🔌 AI Provider Management Table & Database Column Alignment Fix
- **Registered AI Providers Table Section**:
  - Added dedicated **Section 0: Provider AI Terdaftar & Gateway Kredensial** table on `/admin/models` page displaying Provider ID, Provider Name, Engine Type, API Base URL, API Key Status, Edit Provider action, and **Delete Provider** action.
- **Database Payload Alignment**:
  - Fixed insert/update payload matching in `lib/api/ai-models.ts` for Supabase `public.ai_providers` (`id`, `name`, `type`, `base_url`, `api_key`) and `public.ai_models` (`provider_id`).

---

## 🎯 [v0.7.3] - 2026-08-11

### 🔌 Pure Dynamic Provider Registration & Cleaned Default Catalog
- **Cleaned Built-In Defaults**:
  - Removed pre-seeded Hugging Face, Groq, and Together AI providers from `DEFAULT_PROVIDERS` in `lib/api/ai-models.ts`. Only `Google Gemini Direct` and `OpenRouter API` remain as hardcoded built-ins.
- **100% Dynamic Provider Addition**:
  - Hugging Face, Groq Cloud, Together AI, or Custom OpenAI proxies are now added **100% dynamically** by the Admin via the **+ Tambah Provider AI** modal.

---

## 🗄️ [v0.7.2] - 2026-08-11

### 💾 SQL Migration & Prisma Schema for AI Providers Table
- **Supabase Migration Script**:
  - Created official SQL migration script [20260811000003_create_ai_providers_table.sql](file:///c:/web/ScholarFlow/supabase/migrations/20260811000003_create_ai_providers_table.sql) to provision `ai_providers` table and default seed data.
- **Prisma Schema Update**:
  - Added `AiProviderEntry` model to [schema.prisma](file:///c:/web/ScholarFlow/prisma/schema.prisma) and linked `provider_id` field in `AiModelEntry`.

---

## ✨ [v0.7.1] - 2026-08-11

### 🎨 Clean & Streamlined Add/Edit AI Model Modal
- **Clean 4-Field Model Modal**:
  - Refactored Add/Edit AI Model Modal to focus purely on Model setup: **AI Provider selection**, **Gateway Key**, **Model Display Name**, and **Real API Model ID**.
  - Replaced cluttered model-level Base URL / API Key inputs with a clean **Linked Provider Credentials Info Badge** that shows the parent Provider credentials.
- **Top Banner Quick Provider Management**:
  - Added **Manage Providers** button directly in the `/admin/models` dashboard top banner alongside the **Add New Model** button for rapid provider management.

---

## 🏛️ [v0.7.0] - 2026-08-11

### 🏢 2-Tier AI Provider & Model Management Architecture
- **Provider & Model Decoupling**:
  - Implemented 2-tier Provider management in `lib/api/ai-models.ts` (`AIProvider` & `AIModel`), allowing Admins to register AI Providers (Hugging Face, Groq, Together AI, Custom Proxy) with API Keys & Base URLs **once**.
- **Model Provider Linking**:
  - When adding new AI Models, Admins select the registered Provider from a dropdown and enter only the **Model ID** (e.g. `meta-llama/Llama-3.3-70B-Instruct`). Models automatically inherit API credentials from their parent Provider.
- **Provider Modal & Persistence**:
  - Added Provider Management Portal (`isProviderModalOpen`) and dual-persistence in Supabase `ai_providers` table & LocalStorage (`scholarflow.ai_providers.v1`).

---

## 🔑 [v0.6.2] - 2026-08-11

### ⚡ Dynamic In-App API Key Configuration for Multi-Model Providers
- **In-App Dynamic API Key Entry**:
  - Enhanced Create/Edit AI Model Modal to dynamically display **API Key & Base URL** input fields whenever selecting `Hugging Face`, `Groq Cloud`, `Together AI`, or `Custom OpenAI` providers.
  - Allows Admins to input provider tokens (`hf_xxxx`, `gsk_xxxx`, `tgp_xxxx`, etc.) directly through the UI without editing `.env` or restarting the server.
  - Gemini & OpenRouter maintain default fallback to `.env` variables if custom keys are left empty.

---

## 🤖 [v0.6.1] - 2026-08-11

### 🤗 Hugging Face, Groq Cloud & Together AI Multi-Model Catalog Support
- **Hugging Face Inference & Router API (`huggingface`)**:
  - Implemented `callHuggingFace` supporting 1-key multi-model routing across Hugging Face Hub models (e.g. `meta-llama/Llama-3.3-70B-Instruct`, `Qwen/Qwen2.5-Coder-32B-Instruct`, `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`).
  - Accepts `HUGGINGFACE_API_KEY`, `HF_TOKEN`, or custom model key.
- **Groq Cloud & Together AI Native Support (`groq`, `together`)**:
  - Added dedicated provider choices and badge indicators for Groq Cloud (`https://api.groq.com/openai/v1`) and Together AI (`https://api.together.xyz/v1`).

---

## 🔄 [v0.6.0] - 2026-08-11

### 🔑 Gemini Multi-API Key Failover & Rotation Pool
- **Automatic Multi-Key Failover Engine**:
  - Implemented [gemini-key-pool.ts](file:///c:/web/ScholarFlow/lib/ai/gemini-key-pool.ts) allowing ScholarFlow to accept multiple Google Gemini API keys (comma or whitespace separated) from `.env` (`GEMINI_API_KEYS` or `GEMINI_API_KEY`) or Admin Model configurations.
  - Automatically tracks rate limits (HTTP 429 / Quota Exceeded / Resource Exhausted) and puts exhausted keys in a temporary cooldown state while instantly failing over to key #2, #3, etc.
  - **Zero UI Complexity**: Displays only 1 single Gemini model to the end user while transparently scaling daily quota capacity up to 3x, 5x, or 10x in the backend.
  - **Auto-Reset**: Cooldown states automatically expire when keys are restored by Google API reset timers.

---

## 🌐 [v0.5.5] - 2026-08-11

### 🌍 100% Bilingual UI i18n & Modal Button Spacing Polish
- **100% Bilingual Support for Admin AI Models (`/admin/models`)**:
  - Upgraded `/admin/models` dashboard view and Create/Edit AI Model Modal to be 100% bilingual (`language === 'en'` vs `language === 'id'`).
  - Added dynamic English and Indonesian translations for headers, descriptions, stats cards, table headers, status badges, modal fields, placeholders, helper hints, option labels, tooltips, and action buttons.
- **Mandatory UI i18n Rule Enforcer**:
  - Created [ui_i18n.md](file:///c:/web/ScholarFlow/.agents/rules/ui_i18n.md) and updated [AI_RULES_MINI.md](file:///c:/web/ScholarFlow/AI_Rules/AI_RULES_MINI.md) with mandatory bilingual i18n guidelines for all future component developments.
- **Modal Button Spacing & Padding Polish**:
  - Fixed invalid `px-4.5` Tailwind CSS class on modal action buttons, replacing it with `px-6 py-2.5 inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap` for ample, symmetrical padding.

---

## 🚀 [v0.5.4] - 2026-08-11

### 🎯 Canvas Text Selection Apply Fix & Dual-Persistence Database Backup
- **Selection Range Auto-Restore for AI Apply**:
  - Upgraded `insertText` in `editorjs-editor.tsx` and `scholar-editor.tsx` to automatically remember and restore the exact text selection range (`lastHighlightedRangeRef` / `lastSelectionRangeRef`) when clicking **Apply** in the right sidebar.
  - Refocused the main document canvas element (`contenteditable`) and replaced original text with AI polished results in real-time, triggering EditorJS auto-save and statistics re-calculation.
- **Auto-Switching Right Sidebar to Writing Tab**:
  - Upgraded `scholar-editor.tsx` and `editor-sidebar.tsx` so that triggering AI Polish, Paraphrase, Summarize, Generate Abstract, or Plagiarism Paraphrase automatically opens and switches the right sidebar straight to the **Writing (AI Assist)** tab (`'writing'`).
- **Database Schema Migration & Dual-Persistence Backup**:
  - Added **LocalStorage Dual-Persistence** (`scholarflow.ai_models.v1`) to `lib/api/ai-models.ts` so custom AI models added or edited via the Admin Panel remain persisted locally even if cloud DB table migrations are pending.
  - Gracefully sanitized Supabase insert/update payloads to fallback to base fields (`id`, `name`, `model_id`, `is_enabled`, `is_premium`) if custom schema columns are missing.
  - Created official SQL migration file [`supabase/migrations/20260811000002_update_ai_models_provider_fields.sql`](file:///c:/web/ScholarFlow/supabase/migrations/20260811000002_update_ai_models_provider_fields.sql) and updated [`prisma/schema.prisma`](file:///c:/web/ScholarFlow/prisma/schema.prisma).
- **Custom React Alert & Confirm Modal Portal**:
  - Replaced native browser `alert()` and `confirm()` prompts with a high-contrast, custom React Modal Portal (`showAlertModal` & `showConfirmModal`).
- **Live Provider Engine Indicators**:
  - Added **Tipe Provider API Badge** in Admin AI Models tables (`Google Gemini`, `Custom OpenAI`, `OpenRouter`) and **Live Engine Indicator Banner** in the editor toolbar.

---

## ⚡ [v0.5.3] - 2026-08-11

### 🎛️ Admin AI Model Active Toggles & Test Connection Feature
- **High-Contrast Toggle Switches (`/admin/models`)**:
  - **Off State**: Upgraded to a high-contrast theme featuring a 2px crisp border (`border-2 border-slate-400`), dark slate knob (`bg-slate-500`), inner background shadow (`bg-slate-200 shadow-inner`), and distinct `Off` badge label (`text-slate-600 bg-slate-100 border-slate-300`).
  - **Free Tier On State**: Vivid emerald green theme (`bg-emerald-500 border-emerald-600 shadow-emerald-500/20 ring-2 ring-emerald-500/20`) with white knob and emerald status badge.
  - **Pro Writer On State**: Vivid enterprise indigo theme (`bg-indigo-600 border-indigo-700 shadow-indigo-500/20 ring-2 ring-indigo-500/20`) with white knob and indigo status badge.
  - **Global Switch Component**: Enhanced reusable `<Switch />` component with dark knob and crisp border styling when Off.
- **AI Gateway Test Connection System (`/api/v1/ai/test-connection`)**:
  - **Edge API Endpoint**: Created `/api/v1/ai/test-connection` route to ping Google Gemini, OpenRouter, and Custom OpenAI-Compatible endpoints with latency calculation (`ms`) and response validation.
  - **1-Click Table Action Button**: Added `⚡ Test Connection` button in the action column of both Free Tier and Pro Writer tables in `/admin/models`.
  - **Modal Integration**: Added `⚡ Uji Koneksi` button to the Admin AI Model Create & Edit Modal alongside `Simpan Data`.

---

## 📚 [v0.5.2] - 2026-08-11

### 🎓 Template Localization & Interactive UI Help Center
- **Template Localization Guide**: Added detailed developer and user guide at [doc/TEMPLATE_LOCALIZATION_GUIDE.md](file:///c:/web/ScholarFlow/doc/TEMPLATE_LOCALIZATION_GUIDE.md) covering template architecture, `TemplateMetadata` interface, bilingual (`en` & `id`) block functions, and step-by-step instructions for adding custom academic manuscript templates.
- **Interactive Help & Documentation Modal (`HelpModal`)**: Implemented a React portal modal component for interactive documentation directly accessible from the navigation sidebar.
  - **4 Module Tabs**: Custom Template Localization, AI Academic Co-Pilot & Prompts, Reference Library & PDF/RIS Imports, and Multi-Backend Architecture & Document Exports.
  - **Bilingual i18n Support**: Seamless switching between English and Indonesian in real-time.
- **Sidebar Navigation Integration**: Connected `MinimalSidebar` Help item (both expanded and collapsed states) to trigger the `HelpModal` portal in `EditorLayout`.

---

## 🚀 [v0.5.1] - 2026-08-10

### 🤖 LLM Gateway & Custom AI Provider Enhancements
- **Custom OpenAI-Compatible API Support**: Added full support for third-party API key sellers, custom proxy endpoints, private LLM instances (OneAPI, NewAPI, Groq, Together, LM Studio, Ollama), and custom API endpoints (`POST ${baseUrl}/chat/completions`).
- **Dynamic Provider Routing**: Upgraded backend API `/api/v1/ai/improve` to dynamically route requests based on `provider_type` (`gemini`, `openrouter`, `custom_openai`), custom `base_url`, and custom `custom_api_key` overrides.
- **Admin AI Models UI Redesign (`/admin/models`)**:
  - Split single table view into 2 clean grouped sections:
    1. 🎁 **Free Tier AI Models (Gratis)** (active vs off indicators, status toggle switches, Gateway Key, Display Name, API Model ID, Access Tier, and action controls).
    2. ⭐ **Pro Writer / Premium AI Models (Berbayar)** (restricted model tier management).
  - **Stats Overview Bar**: Added real-time counters for Total AI Models, Active Free Tier models, and Active Pro Writer models.
  - **1-Click Quick Toggle**: Enabled single-click toggling of model active/inactive status (`is_enabled`) directly from table rows.
  - **Enterprise Aesthetic**: Replaced rounded corner styling from `rounded-3xl`/`rounded-2xl` to crisp, professional enterprise borders (`rounded-xl` and `rounded-lg`).
- **Admin Modal Upgrade**: Added **Provider API Type** selector (`Google Gemini Direct`, `OpenRouter API`, `Custom OpenAI-Compatible API`), **Custom API Base URL** input field, and **Custom API Key** input field to the AI model creation and editing modal.

---

## ⚡ [v0.5.0-architecture] - 2026-08-10

### 🛡️ Architecture Sprint Milestone (EPICs 1 - 5)
- **EPIC 1: Database & Backend Abstraction (Repository Pattern)**:
  - Unified `IDataService` contract interface at `@/lib/services/types.ts`.
  - Implemented `SupabaseDataService` adapter and `ExpressDataService` HTTP REST client adapter with JWT Auth header handling.
  - Built Service Factory & `DataProvider` React Context Provider governed by `NEXT_PUBLIC_BACKEND_TYPE` (`supabase` vs `express`).
- **EPIC 2: Multi-Hosting Adapters**:
  - Vercel Edge Runtime compatibility (`export const runtime = 'edge'`).
  - Cloudflare Pages / Workers OpenNext compatibility layer and Security Headers (`X-Frame-Options`, `X-Content-Type-Options`).
  - Production Express.js VPS Docker containerization (`Dockerfile`, `docker-compose.yml`, and Nginx Reverse Proxy config).
- **EPIC 3: Hybrid Sync Engine**:
  - Created `HybridSyncEngine` combining Supabase WebSocket Realtime with Express.js Smart HTTP Polling.
  - Automatic 3x failover guarantee with background reconnection recovery.
  - Integrated `Page Visibility Guard` (`document.visibilityState`) to pause heartbeats and polling on inactive browser tabs.
- **EPIC 4: AI Engine & Performance Optimization**:
  - Upgraded `/api/v1/ai/improve` and `/api/v1/ai/abstract` to support Gemini 2.0 Streaming (SSE ReadableStream).
  - Token Bucket Edge Rate Limiter enforcing a 15 Request Per Minute (15 RPM) guard per client IP.
  - Client-side in-memory RIS/BibTeX parsers and Next.js `dynamic()` bundle splitting for KaTeX and PDF.js.
- **EPIC 5: Testing & Production Readiness**:
  - Multi-DB Prisma ORM Schema (`prisma/schema.prisma`) for PostgreSQL and MySQL.
  - Security RLS Audit and resilience testing.

---

## 📝 [v0.4.0] - 2026-08-09

### 🌐 Internationalization (i18n) & UI Polish
- **Bilingual Context Provider**: Added `LanguageProvider` and `useLanguage` hook supporting English and Indonesian.
- **UI Localization**: Localized layout components, sidebars, confirmation modals, setup wizard, Stripe/Midtrans checkout, and LaTeX Math Helper.
- **AI Target Language Prompting**: AI backend automatically detects and responds in the target document language.
- **Document Export Enhancements**: MS Word MHTML (`.doc`) export with embedded base64/blob images, client-side PDF export, highlight mapping, and Free plan bibliography export restriction modal.
- **UI/UX Redesign**: Grouped menu-list sidebar, My Documents file explorer tree (15-item limit), centralized document creation, and custom React modals for inline equations and hyperlinks.
