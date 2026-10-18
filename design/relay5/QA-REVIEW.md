# Relay 5.0 design QA review

**Review level:** design concept review, not release approval  
**Revision:** initial review package · 2026-10-17  
**Owner approval:** pending

## Completed checks

- Created and saved a separate FigCraft document with 15 pages, 48 variables, 3 local styles, 12 native editable component masters / variant sets, and 15 named flow starts.
- Rendered and inspected the primary terminal, split layout, Appearance Studio, project/files/tasks/actions/integration compositions, paste/close/recovery/palette states and compact/laptop layouts.
- Visual review found and corrected duplicate session navigation: the left column now holds workspace/recent context while live sessions stay in tabs.
- Visual review found and removed a stray hex-label layer on Appearance Studio and corrected settings shell/profile/accessibility control alignment.
- A full-size Settings render then exposed an overlapping section heading; its position was corrected and re-exported.
- Replaced palette hints with source-confirmed `Ctrl+Shift+P`.
- Calculated selected semantic text contrast pairs. A Day faint-text failure at 4.22:1 was corrected from `#697873` to `#56645F`; current value is 5.65:1 on the Day canvas.
- Read-only historical Penpot recovery artboard reviewed. It reinforces explicit “fresh shells” recovery and non-restored process/output boundary.
- Project docs label concept content as representative and separate proposed behavior from observed capability.
- Added FigCraft page `06 — 21st.dev applied interaction study`: an original keyboard-ready file tree/read-only preview and a focused, keyboard-resizable split. Exported both for review and cited the exact 21st.dev demo results in `RESEARCH.md`.
- Verified the file-tree preview excerpt against current `src/App.tsx`; retained the documented 80 KiB and read-only limits.

## Render inspection and assets

PNG files in `evidence/` are exports from the native FigCraft frames, not application captures. Exports cover the product map, foundations, terminal, split, project, files, tasks, saved actions, integrations, appearance, settings, paste, close, recovery, palette, laptop, compact and handoff. `relay5.tokens.json` and `relay5.tokens.css` are the FigCraft variable exports for engineering reference. The historical Penpot recovery board was inspected read-only in the design tool and is documented in `RESEARCH.md`.

## Measurable review criteria

- **Contrast:** WCAG 2.2 AA normal text ≥4.5:1; large text ≥3:1. Selected role/canvas pairs pass (see `DESIGN-SYSTEM.md`). Full component-surface and ANSI matrix remains open.
- **Keyboard:** every primary action and modal state keyboard-operable; visible and unobscured focus; focus returns to initiating context; no shortcut collision with shell input. Design specifies but does not prove these runtime behaviors.
- **Targets:** aim for 24×24 CSS px minimum subject to WCAG exceptions; ensure small terminal affordances can be keyboard reached.
- **Density:** default screen gives shell majority area and keeps workspace recents/tabs distinct. Test high-tab/high-recents data with users.
- **Responsive:** artboards at 1440×920, 1080×720 and 760×500; verify real Tauri window min-size, DPI scaling, long names, tab overflow, pane minimums and titlebar behavior.
- **States:** workflow specification covers loading, empty, error, stale/unknown, conflict, cancel, success and recovery where applicable. Not every branch has an individual frame.
- **Traceability:** every scoped R4 feature maps to a page and engineering acceptance in `FEATURE-COVERAGE.md`.

## Open design risks

1. No direct Relay 4 interactive UI session was captured because Windows control returned the WebView shell/another foreground window. Validate tab, split, paste, close, recovery, Appearance and integrations in a working runtime before approval.
2. No moderated usability sessions, timing study or keyboard-only testing occurred. Direction hypotheses need user evaluation.
3. Several complete workflow branches live in behavior docs rather than frames; create additional frames before implementation for any branch where UI wording/layout changes materially.
4. Light-theme contrast is checked for selected role/canvas pairs only. Check every label on actual surfaces, terminal ANSI combinations, selection/cursor and effects.
5. Compact 760×500 layout is a composition, not a verified minimum. Test actual Tauri/Windows client size and split limits.
6. FigCraft prototype links are selective; complete links and state variables are not equivalent to production interaction.
7. Feature ownership semantics for external processes/integration sources must be verified against actual Relay service behavior.
8. Global searchable commands across product areas and project workbench grouping are significant proposed scope. Owner approval required.
9. The first-proposal claim that 21st.dev influenced existing interactions cannot be audited from its records. This review now has live metadata results and explicit FigCraft layers; no code was retrieved or installed. The keyboard tree and resize interaction proposals still need runtime implementation and keyboard-only review. See `RESEARCH.md`.

## Gate status

**Ready for product-owner review of direction, information architecture, visual language and scoped proposals. Not ready for implementation handoff as an approved specification.** Promote only after direct runtime verification, user workflow testing, accessibility/contrast pass, technical constraints review and explicit owner approval. All files remain design-only; the Relay 4 application was not modified.

