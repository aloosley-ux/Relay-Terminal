# Relay Appearance Studio Exploration and Approved Design

**Status:** The unified 23-page professional design is approved and implemented in Relay Terminal 5.1.0. The editable source and all earlier exploration work are preserved.

## Approved design and release

- [Approved implementation reference and coverage matrix](PROFESSIONAL-REVIEW.md)
- [Final correction pass](REFINEMENT-REVIEW.md)
- [Implementation handoff and status](APPEARANCE-STUDIO-IMPLEMENTATION-HANDOFF.md)
- [23-page editable FigCraft document](Relay-Appearance-Studio-Professional-Review.figcraft)
- Full-resolution concept previews: `professional-previews/` and `refinement-previews/`
- Editable source vectors: `professional-src/` and `refinement-src/`
- Shipped product guide: [`docs/APPEARANCE-STUDIO.md`](../../docs/APPEARANCE-STUDIO.md)
- Release validation: [`TEST-REPORT-5.1.md`](../../TEST-REPORT-5.1.md)

The implemented system keeps the complete Appearance Studio as the authoritative editor, with contextual tab, terminal and live-workspace entry points. It includes distinct application/terminal schemes, global/workspace/session inheritance, precise color and ANSI editing, typography, all background modes and effects, theme lifecycle actions, Follow Windows, wallpaper positioning, tab identity cues and compact-window behavior. Pane-position appearance overrides were not approved and are not part of the release.

## Final refinement milestone

The final correction pass fixed the live preview banner, Follow Windows representation, mode-specific background controls, compact-window ergonomics and immediate-versus-staged persistence language. It refined the full 16-role ANSI editor, precise color picker, scope/change management, wallpaper/effects editing and split-session quick editor.

- [Final refinement review](REFINEMENT-REVIEW.md)
- [Full resolution previews](refinement-previews/)
- [Editable source layers](refinement-src/)

## Unified professional review milestone

The unified design combines the complete docked Studio with contextual entry points, detailed specialist editing surfaces and live-terminal previews. It became the approved production visual reference after review.

- [Professional review and feature matrix](PROFESSIONAL-REVIEW.md)
- [Editable FigCraft source](Relay-Appearance-Studio-Professional-Review.figcraft)
- Full-resolution screens: `professional-previews/`
- Editable SVG sources: `professional-src/`

## Historical design reviews

The first architecture review and three earlier explorations remain preserved as historical, unapproved proposals. They are not the production baseline.

- [First architecture review](FIRST-REVIEW.md)
- [Architecture comparison FigCraft](Relay-Appearance-Architecture-Review.figcraft)
- Original exploration FigCraft: `Relay-Appearance-Exploration.figcraft`
- Early review previews: `previews/`

## Product baseline and implemented additions

Relay's source-backed appearance engine already included five built-in themes, independent application and terminal palettes, global/workspace/session scope precedence, inheritance removal, live preview and Apply/Reset, all colour roles and 16 ANSI values, typography and cursor controls, solid/gradient/wallpaper/ambient modes, effects, portable custom themes and image safety validation. The approved design retained these capabilities.

Relay 5.1 additionally implements contextual editing, per-session tab colour and Lucide icon, wallpaper positioning, contrast guidance, local font availability checks and a direct Follow Windows Studio switch. These were proposals in earlier design records and are now shipped behavior. A pane-position appearance override remains outside the appearance model.

The design follows the approved Switchline identity and Lucide icon system. It does not adopt the unapproved Night Gallery direction or alter Relay's overall layout, workspace system or terminal identity.
