# ScholarFlow Tasks

## Current Sprint Goal
Production-Ready Refactoring: Hybrid Sync Engine, Repository Pattern Data Provider Abstraction, Multi-Backend Support (`supabase` vs `express`), Multi-Hosting Adapters, dan Gemini 2.0 Streaming.

## Current Task
v0.5.0-architecture: Architecture Sprint EPICs 1, 2, 3, 4, 5 completed (Database Abstraction, Multi-Hosting Adapters, Hybrid Sync Engine, Gemini 2.0 Streaming, Edge Rate Limiter, Prisma Multi-DB Schema, Security Audit). Ready to continue with remaining application UI pages.

## Next Tasks (Master Roadmap - `doc/PRODUCTION_TASKS.md`)
- Complete remaining UI pages & user-facing feature modules.







## Do Not Work On Yet
1. [Completed] Transition Word export (.doc) from plain HTML to MHTML (multipart/related) to correctly embed base64/blob/external images.
2. [Completed] Implement dynamic bilingual (i18n) context provider.
3. [Completed] Localize editor layout, sidebars, and setup modals.
4. [Completed] Localize checkout (Stripe/Midtrans), sharing, and citation modals.
5. [Completed] Localize LaTeX Math Helper category tabs and quick formula library.
6. [Completed] Adapt AI backend routing (lang parameter) to synthesize, improve, and generate abstracts in the target language.
7. [Completed] Localize MS Word document export bibliography headers.
8. [Completed] Redesign admin settings sidebar layout into a grouped menu-list layout.
9. [Completed] Redesign main menu and help sidebar items with descriptive subtitles and grouped structures to align with the settings menu style.
10. [Completed] Redesign the My Documents sidebar panel layout into a premium file explorer tree structure.
11. [Completed] Link My Documents tab to exit active editor, switch dashboard tabs, and style project/independent lists flatly to match the provided layout.
12. [Completed] Remove the redundant Create New button from the main navigation, centralizing it inside the My Documents view.
13. [Completed] Redesign the Create New Document action in the documents panel to match the clean menu-list style.
14. [Completed] Limit the displayed list of Independent Documents to 15 items in the sidebar panel to prevent vertical clutter.
15. [Completed] Replace the native browser prompt when editing inline equations with the same custom React math modal.
16. [Completed] Replace the native browser prompt when inserting hyperlinks with a custom React link modal portal.
17. [Completed] Enable editing and unlinking of existing hyperlink elements inside the custom React link modal.
18. [Completed] Implement active state tracking for hyperlink formats and highlight the Link toolbar buttons when the text selection is inside an anchor element.
19. [Completed] Upgrade selection-link matching logic to check anchorNode, focusNode, and range contents for robust active toolbar highlighting.
20. [Completed] Upgrade existingLink matching logic inside toggleInlineFormat to support anchorNode, focusNode, and range fragment matching, enabling the "Edit Link URL" modal to correctly open when clicking Link buttons.
21. [Completed] Fix Link Modal button visibility by correcting Tailwind background and text color class names.
22. [Completed] Implement non-nesting highlighting logic with multi-color support and unhighlighting.
23. [Completed] Add highlight active state tracking to the editor toolbar buttons.
24. [Completed] Develop a floating round-card color picker popover for selecting highlight colors.
25. [Completed] Map text highlights to inline background-color styled span tags for Word export.
26. [Completed] Restyle highlight color choices from circles into proper square blocks.
27. [Completed] Implement text alignment mapping support during MS Word exports.
28. [Completed] Add a loading spinner indicator during MS Word exports.
29. [Completed] Implement high-fidelity client-side PDF export with dynamic print iframe.
30. [Completed] Condition bibliography/reference list inclusion during Word and PDF exports based on the user's plan.
31. [Completed] Refactor bibliography filtering in exports to strip HTML formatting and drop Free tier warning banners.
32. [Completed] Remove admin role bypass from Word/PDF export restrictions to allow testing plan limits.
33. [Completed] Implement case-insensitive keyword checks and early loop breaking for robust bibliography exclusion in Free plan.
34. [Completed] Remove warning popup confirmations for direct, seamless exports on both free and pro tiers.
35. [Completed] Group Word and PDF export actions into a single consolidated 'Export' dropdown button in the header layout.
36. [Completed] Relocate bibliography export options from the Library sidebar to the main Header Export dropdown menu.
37. [Completed] Replace native browser alerts with a custom premium React portal modal for the Free tier bibliography export upgrade lock.
38. [Completed] Implement public document sharing and collaboration with Read-Only and Co-Editor modes at `/shared/[id]` route.
39. [Completed] Implement Accepted & Rejected Suggestions History sub-tabs, card styling, and bilingual (i18n) support in editor sidebars.
40. [Completed] Add Co-Editor header message icon active notification badge counting comments and suggestions.
41. [Completed] Add User Authentication Status Indicator Badge (Logged In vs Guest) with direct login button in Co-Editor header.
42. [Completed] Implement Page Visibility API (`window.document.hidden`) to pause background polling when tabs are inactive.
43. [Completed] Redesign Admin AI Models Panel (`/admin/models`) into 2 grouped sections (Free Tier vs Pro Writer) with professional rounded-xl enterprise styling, stats bar, and 1-click status toggles.
44. [Completed] Implement Custom OpenAI-Compatible Provider support (third-party API key sellers, custom proxies, private LLMs) with Base URL & API Key input fields in Admin AI Models Modal.
45. [Completed] Add detailed user & developer guides for localizing custom templates (doc/TEMPLATE_LOCALIZATION_GUIDE.md) and interactive UI Help & Documentation modal.
46. [Completed] Upgrade Admin AI Model active toggle switch contrast (border-2, dark knob, emerald Free / indigo Pro) and add AI Gateway Test Connection API (/api/v1/ai/test-connection).
47. [Completed] Upgrade document selection apply logic to restore saved highlight ranges and refocus contenteditable elements when applying AI results.
48. [Completed] Enable automatic switching of right sidebar to Writing tab ('writing') when executing AI Polish, Paraphrase, Summarize, or Generate Abstract.
49. [Completed] Implement LocalStorage Dual-Persistence fallback for AI Models (scholarflow.ai_models.v1) to prevent custom models from disappearing on page refresh.
50. [Completed] Create SQL schema migration file (supabase/migrations/20260811000002_update_ai_models_provider_fields.sql) and update Prisma schema for custom LLM provider fields.
51. [Completed] Upgrade Admin AI Models view and modals to 100% bilingual i18n (en/id) and create mandatory UI i18n rule file (.agents/rules/ui_i18n.md).
52. [Completed] Implement Gemini Multi-API Key Rotation & Failover Pool (lib/ai/gemini-key-pool.ts) to automatically cycle across multiple API keys when quota (HTTP 429) is exceeded.

## Current Task
Completed Gemini Multi-API Key Failover Pool, 100% UI bilingual i18n, and modal button padding polish (v0.6.0).

## Next Tasks
- Complete remaining UI pages & user-facing feature modules.
- **Bibliometric Analysis** (Dashboard page + ECharts Network Graph MVP).

## Do Not Work On Yet
- SPSS / PSPP (Strategy decided: "AI Output Interpreter" - user uploads output tables, AI interprets and drafts academic narrative to editor. Do not build a full SPSS clone).
- SEM PLS
- Journal publishing
- Realtime collaboration
