# ScholarFlow Tasks

## Current Sprint Goal
Enhance document export to Microsoft Word with correct media embedding.

## Current Priority
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

## Current Task
Integrated paragraph and header alignment retrieval and mapping to inline text-align styles in MS Word document exports.

## Next Tasks
- Add detailed user guides for localizing custom templates.

## Do Not Work On Yet
- SPSS
- SEM PLS
- Bibliometric
- Journal publishing
- Realtime collaboration
