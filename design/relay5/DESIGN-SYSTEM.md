# Relay 5.0 design system

**Sources:** native FigCraft page `05 — Appearance Atelier + Field Kit` and preserved `Archive — 01 Foundations & Components`  
**Status:** Night Gallery is the selected design direction and default, not a fixed identity; all values require implementation and accessibility verification.

## Selected Relay 5 visual system

The new `Relay 5 / Night Gallery` and `Relay 5 / Terminal` variable collections are bound to the current flagship and Appearance Atelier screens. Night Gallery uses a deep plum application shell, warm porcelain terminal canvas and mint action/focus accent. The Terminal collection includes Linen and Carbon modes, so terminal appearance remains independent from application chrome. Five editable Appearance Studio screens expose these palettes to user customization; the swatches on this page explain the default direction only.

| Collection | Modes | Variable roles |
|---|---|---|
| `Relay 5 / Night Gallery` | Night Gallery, Porcelain | App canvas, panel, raised surface, primary/secondary text, action accent, focus mint, caution, subtle stroke |
| `Relay 5 / Terminal` | Linen, Carbon | Terminal canvas, inset, text, muted text, accent, prompt, selection, stroke |

The initial 31-variable semantic collection below remains intact on the archived first-proposal foundations page for comparison and recovery. It is not the source of truth for the selected design.

## Foundations

- **Purpose:** long-session terminal desktop; low-distraction chrome, a persistent shell and compact contextual workbench.
- **Color:** graphite Night surfaces and a mint accent, with a neutral Day mode. Semantic names describe roles rather than component-specific color. Success, warning, danger and information use distinct hues and text labels/icons; color alone does not convey state.
- **Typography:** Segoe UI for interface labels and controls; Cascadia Code/Consolas class monospace for shell, paths and command output. Terminal leading and font size must remain user adjustable. Interface labels should not be forced below 12 px in compact mode.
- **Spacing:** 4 px base rhythm; 8/12/16/24/32 px increments. Use consistent 1 px separators, modest 4–8 px corner radii and restrained elevation. Terminal stays visually quiet.
- **Density:** prioritize rows and direct labels over repeated cards. Keep the shell at least 60% of the default main window where a workbench is open; allow it to reclaim width.
- **Interaction:** visible focus, clear hover/selected/pressed/disabled states, keyboard-first without keyboard-only discoverability. Confirmation is reserved for consequential ambiguity, not every action.

## Semantic variables

The FigCraft variable collection `Relay 5 · Semantic` has modes `Night` and `Day`, with 31 local variables (20 color roles and 11 dimensions). Use `Inspect variables` in FigCraft for authoritative live values; update this table together with the file if values change.

| Role | Night | Day | Use |
|---|---|---|---|
| Surface/Canvas | `#111719` | `#F2F5F3` | app canvas |
| Surface/Panel | `#182123` | `#FFFFFF` | secondary work areas |
| Surface/Raised | `#202B2D` | `#E8EEEB` | active rows/dialogs |
| Surface/Terminal | `#0B1012` | `#FFFFFF` | shell canvas |
| Text/Primary | `#E8F0ED` | `#15211E` | primary copy |
| Text/Muted | `#A4B4AF` | `#52615C` | secondary copy |
| Text/Faint | `#788984` | `#56645F` | quiet labels; still must meet text contrast |
| Accent/Primary | `#79D4C2` | `#087868` | focus, primary action, selected indicator |
| State/Success | `#80D4A2` | `#236C41` | success plus label/icon |
| State/Warning | `#E2B76B` | `#835000` | warning plus label/icon |
| State/Danger | `#F08D8D` | `#A12F35` | destructive/error plus label/icon |
| State/Info | `#91BFE0` | `#315E85` | informational status |
| Stroke/Subtle | `#2A3739` | `#CED8D3` | separators and outlines |
| Focus/Ring | `#79D4C2` | `#087868` | keyboard focus; use visible outline beyond fill |
| Selection/Fill | `#21443D` | `#D7ECE5` | selected row/background |

Numeric variable set covers spacing, radius and control height. Maintain 4 px increments, minimum 24 px target dimensions where the WCAG exception does not apply, and resizable windows/panes. Shell font sizing remains user preference, not a fixed token.

## Contrast check

Ratios were calculated from sRGB relative luminance using the WCAG formula. Tested text/role on canvas pairs:

| Pair | Ratio | WCAG 2.2 AA normal text threshold |
|---|---:|---|
| Night primary / canvas | 15.61:1 | Pass |
| Night muted / canvas | 8.38:1 | Pass |
| Night faint / canvas | 4.92:1 | Pass |
| Night accent / canvas | 10.35:1 | Pass |
| Night selection text / selection fill | 9.25:1 | Pass |
| Day primary / canvas | 15.09:1 | Pass |
| Day muted / canvas | 5.94:1 | Pass |
| Day faint / canvas | 5.65:1 | Pass |
| Day accent / canvas | 4.91:1 | Pass |

This validates these chosen color pairs only. It does not validate all text on all component surfaces, terminal ANSI color combinations, transparency/backdrop effects, screenshots under scaling, or the actual rendered desktop app. Those checks remain required.

## Native component masters

Editable component masters and variants are on the foundations page. The 12 named masters form reusable sets for:

- `Button`: Primary and Secondary emphasis.
- `Navigation item`: Active and Inactive.
- `Session row`: Active and Inactive.
- `Status`: Running and Interrupted.
- `Search field`, `File row`, `Command result`, `Workspace item`.

Bind colors to semantic variables; do not hard-code a new one-off palette. Components need focus-visible, hover, pressed, disabled, loading and error treatment before engineering adopts them. States absent from the masters are documented as required states, not represented as completed components.

## Layout and responsive rules

- The 1440×920 primary composition keeps session tabs horizontal, workspace recents on the left, shell centered and utilities contextual.
- At 1080×720, reduce secondary labels and gutter before shrinking shell text; utility navigation remains available.
- At 760×500, tabs may horizontally scroll, secondary workbench labels collapse to icons with accessible names, and a single pane is preferred. Split remains available only if both panes satisfy minimum usable terminal dimensions.
- Dialogs stay centered in the available client area, have a visible title and cancel path, trap/return focus appropriately, and never cover the only feedback for a background operation.
- Window reflow, DPI scaling, minimum size, native titlebar, focus handoff and actual xterm dimensions require runtime validation.

## Motion and effects

Use short state transitions only when they clarify change. Respect reduced motion. Backdrops stay behind opaque text, cursor and selection. Never animate terminal content or delay shell input to create polish.

