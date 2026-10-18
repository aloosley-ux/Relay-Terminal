# Appearance Studio redesign · first review

**Status:** three new interaction architectures for review. None is approved. The earlier Palette Composer, Scope Map and Terminal First concepts remain preserved on their original pages and preview files. This is a design-only exercise; the SVGs and imported FigCraft layers are not application UI.

## What the implementation actually does

Audit sources: `src/appearance.ts`, `src/AppearanceStudio.tsx`, `src/TerminalMenu.tsx`, `src/App.tsx`, `src/terminals.ts`, `src-tauri/src/appearance.rs`, `docs/APPEARANCE-STUDIO.md`, `DESIGN.md` and the approved Switchline identity reference.

- Appearance is a versioned local settings object. Effective choice resolves **session → pinned workspace → global**. An unscoped session inherits global. The Windows light/dark preference is followed until a custom appearance is applied.
- Application chrome and terminal palette are independent; both can be mixed. A terminal session already has its own appearance override. Split view can already show two differently styled sessions; styling a pane by position would be a new feature.
- Studio edits preview against the live terminal without restarting its shell or clearing scrollback. **Apply** persists the selected scope, **Reset preview** restores the saved choice, and closing discards local un-applied changes. Theme-library mutations persist immediately; importing adds the library entry immediately while its selected appearance remains a preview until Apply. Saving or updating a custom theme also updates the selected scope in the current implementation.
- Existing theme library: Harbor, Porcelain, Carbon, Tideland and Frost; custom themes can be saved, edited, renamed, duplicated, deleted with undo, imported and exported. Storage is limited to 40 custom themes. Theme JSON is version 1, up to 6 MB. Unknown fields are dropped; invalid values are rejected.
- Application colour roles: background, raised surface, foreground, muted text, accent and border. Terminal roles: background, foreground, cursor and selection, plus 16 individually editable ANSI values (8 normal + 8 bright).
- Terminal type: font family; size 10–32 px; line height 1–2; letter spacing −1–4 px; padding 4–48 px; bar/block/underline cursor and blink toggle.
- Background modes: solid, gradient (start/end/angle), local wallpaper and ambient gradient. Effects: surface opacity 0.35–1, intensity 0–1, blur 0–40 px, animation on/off and duration 10–120 seconds. Tideland wallpaper is bundled. Ambient animation pauses while hidden/minimised and respects reduced motion. Text, cursor and selection remain opaque.
- Wallpaper guardrails: local PNG/JPEG/WebP only; 4 MB source limit, 8192 px per dimension and 16 million pixels. Portable theme JSON embeds raster images, up to 4 MB. Remote URLs and SVG data imports are refused. Native validation bounds the theme, overrides and settings before save.
- Existing context menu is terminal command/output focused. A tab context entry, quick appearance controls, independent tab icon/identity colour and right-click workspace appearance are proposals. Workspace appearance editing itself is existing and is reached from a session in a pinned workspace. A pane-position appearance override is not existing functionality and is not represented as such.

## First review directions

### 01 · Precision Inspector — role-led

An always-visible, docked inspector is the main work surface. It keeps scope and inheritance at the top, shows the two independent theme selections side by side, and exposes frequently edited colour roles as accurate-value rows. Specialist editors open in place from explicit links: a colour-role editor with picker + direct hex/RGB entry, an ANSI editor with 16 labelled swatches and output specimen, font/cursor editor, and background/effects editor. Theme management is its own library view. This is the most familiar, compact professional inspector model.

### 02 · Composition Workspace — canvas-led

The terminal preview becomes the organizing canvas. A recipe/library rail, center live composition (including two independently themed sessions), and a selected-property inspector replace the settings-form sequence. Users select a visible surface or semantic role to edit it; terminal palette editing stays tied to real ANSI output specimens. Theme discovery, mixing and management begin from the library rail. Precision remains in direct-value inspector fields. This maximizes visual feedback and supports compare-before-apply work, at the cost of more persistent studio footprint.

### 03 · Contextual First — entry-led

Small adjustments begin on the tab, terminal header or workspace row. The context menu offers commands and one **Quick appearance** flyout for common theme, background, opacity and inheritance actions; the flyout hands off to the same complete scoped Studio. The Studio keeps the actual scope, full feature sections and persistent Apply/Reset contract. A separately configurable **tab identity colour/icon** is marked as a *new proposal* in the menu, distinct from terminal palette. This keeps the shell prominent but tests whether users can discover deeper controls from contextual entry points.

All three are interaction architectures, not three skins: fixed inspector navigation vs. direct manipulation of a composition canvas vs. contextual quick edits with a canonical full Studio. The screens show a deliberately focused representative editing moment; full specialist surfaces are part of the proposed route model below and must be drawn at complete fidelity only after a direction is approved.

## Feature-to-design route map

This is the authoritative parity inventory for the next design stage. Names below are specific destinations/components in each proposed architecture; no source function is intentionally dropped. Detailed component screens remain for the approved-direction stage.

| Existing function | 01 · Inspector | 02 · Composition | 03 · Contextual first |
|---|---|---|---|
| Harbor, Porcelain, Carbon, Tideland, Frost discovery and selection | Theme Library · five preview tiles | Recipe rail · five live terminal samples | Quick Appearance · five tile strip; full list in Studio / Themes |
| Independent application/terminal themes and mixing | Scope header · paired Application and Terminal selectors | Recipe composition · two independent role chips in property inspector | Quick flyout selectors; full Studio / Themes keeps both selectors visible |
| Global, pinned workspace and session scope; effective source; override/removal; follow Windows light/dark | Scope/Inherits header · source chain, Follow system switch, Use inherited command | Scope inspector · Global → Workspace → Session path and per-scope override marker | Workspace/tab context entry plus Studio scope header; inherit clears only current override |
| Live preview; Apply; Reset preview; cancel/discard | Persistent footer; preview state label; close confirms discard when dirty | Canvas preview state; Apply/Reset command bar; close/discard state | Quick controls preview only; shared Studio footer owns Apply/Reset/discard |
| Six app roles: background, raised, text, muted, accent, border | Colour editor · named rows with picker and hex/RGB fields | App role inspector · selectable swatches then precise role editor | Studio / Colour · six named rows and complete picker; quick flyout does not replace it |
| Terminal background, foreground, cursor, selection | Colour editor · four semantic rows | Terminal role inspector · four editable values with specimen | Studio / Colour · four semantic rows and picker |
| All 16 ANSI values, normal/bright; exact individual editing | ANSI editor · labelled 2×8 normal/bright grid, focused value editor and specimen output | Palette inspector · labelled 16-colour grid over real output specimen; select any value for direct edit | Studio / Colour → ANSI · named 2×8 grid, picker/value entry and specimen; quick palette is only a shortcut |
| Font family; size 10–32 px; line height 1–2; spacing −1–4 px; padding 4–48 px | Type editor · installed-font chooser/search plus sliders and exact numeric inputs | Type property inspector · sample text at chosen settings; precise fields | Studio / Type · installed-font chooser and exact range/value controls |
| Cursor bar/block/underline and blink | Type editor · visual cursor specimen and controls | Type inspector · caret specimen and shape/blink controls | Studio / Type · shape selector and blink toggle |
| Solid, gradient start/end/angle, wallpaper/local/Tideland | Backdrop editor · mode tabs, gradient canvas/handles, image preview and local/Tideland choices | Backdrop layer inspector · direct on-canvas gradient stops/angle plus image/effects properties | Studio / Backdrop · mode tabs and complete solid/gradient/wallpaper/ambient editor |
| Opacity .35–1; intensity 0–1; blur 0–40 px | Backdrop editor · sliders with direct entry | Backdrop inspector · exact values plus live preview | Quick flyout for opacity; Studio / Backdrop includes all three values |
| Animation toggle; 10–120 second duration; pause/visibility/reduced-motion behavior | Ambient section · motion toggle, duration input, behavior note | Backdrop inspector · motion controls and live ambient specimen with behavior note | Studio / Backdrop → Ambient · toggle, duration and motion/visibility note |
| Theme save, edit, rename, duplicate, delete + undo; portable import/export; 40-theme limit and errors | Theme Library · row actions, capacity, Undo toast and validation/import/export states | Recipe rail opens Theme Library drawer; same row actions and capacity/error states | Context menu links to Studio / Themes; library owns all lifecycle actions and errors |
| Wallpaper format/size/dimension safety; JSON validation/limits | Wallpaper picker and import/export dialogs show accepted formats, size and validation feedback | Same through selected backdrop/library property drawer | Same in Studio; quick flyout links to full editor for file workflows |
| Independently styled sessions in split view | Live shell beside inspector; two session surfaces keep their own theme | Center composition shows both differently styled sessions at once | Context targets a session; Studio preview can show split sessions without pane-position styling |
| Right-click terminal/tab/workspace entry | Inspector opened from any context entry, with target named in header | Context entry selects matching composition object, then opens its inspector | Tab, terminal header and workspace row each provide scoped menu + shared full Studio entry |
| Proposed tab identity colour/icon; proposed pane-position override | Optional tab identification editor marked **New proposal**; pane-position override excluded | Optional session identity layer marked **New proposal**; pane-position override excluded | **New proposal** tab colour/icon entry is visibly separate from theme; pane-position override excluded |

## Focused research and design decisions

Documented patterns are evidence of product capabilities, not usability-test results. The recommendations here are design hypotheses for Relay.

- **Wave Terminal:** documented right-click tab actions for rename/background and terminal-header theme selection; background presets support solid, gradients and images with opacity. This supports targeted context entry points, while Relay keeps the local Studio as the complete editor. [Wave customization](https://docs.waveterm.dev/customization) · [Tab backgrounds](https://docs.waveterm.dev/tab-backgrounds)
- **Windows Terminal:** per-profile appearance documents color scheme, tab color, cursor, image background and opacity; the gallery presents previewable theme recipes. This supports separating session-identification cues from a shell palette and showing theme differences in terminal specimens. [Profile appearance](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-appearance) · [Theme gallery](https://learn.microsoft.com/en-us/windows/terminal/custom-terminal-gallery/theme-gallery)
- **VS Code:** documents terminal font/cursor/colors, identifiable tab title/icon/color, status and 16 ANSI colors; its minimum-contrast support can adjust text colors. Relay should show readability guidance as advice and allow users to keep expressive choices. [Terminal appearance](https://code.visualstudio.com/docs/terminal/appearance)
- **Warp:** documents a theme picker, custom theme creation from an image and explicit checkmark/save versus X/revert. This reinforces clear preview/persistence states and visual theme previews. [Warp themes](https://docs.warp.dev/terminal/appearance/themes/)
- **Blender:** documents per-editor colour selection, real-time changes, preset add/save/remove/install and reset. Its specialist list/detail model is a useful pattern for complete colour editing and lifecycle breadth. [Blender theme preferences](https://docs.blender.org/manual/en/latest/editors/preferences/themes.html)
- **Figma UI3:** Figma documents that it reversed floating panels after beta feedback that they cramped the canvas and slowed daily work; final panels are docked and resizable, with minimisation for more workspace. Relay should preserve a docked compact inspector and make any richer canvas architecture earn its footprint. [Figma's UI3 design process](https://www.figma.com/blog/our-approach-to-designing-ui3/)
- **Microsoft Fluent / Windows:** documented guidance distinguishes context menus (commands related to an element) from flyouts (light-dismiss content), supports Escape/outside dismissal, and recommends numeric text input where keyboard precision is preferable to a slider. [Flyouts](https://learn.microsoft.com/windows/apps/design/controls/dialogs-and-flyouts/flyouts) · [Sliders](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/slider) · [Keyboard interaction](https://learn.microsoft.com/en-us/windows/apps/design/input/keyboard-interactions)
- **WCAG 2.2:** design targets include text contrast, keyboard access and visible, unobscured focus; Focus Appearance at AAA specifies minimum focus-indicator area and contrast change. These are review criteria, not a conformance claim for these static screens. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)

## Review package

- Editable source: `Relay-Appearance-Architecture-Review.figcraft` (contains the prior concept pages plus the three new pages 04–06).
- Source compositions: `01-precision-inspector.svg`, `02-composition-workspace.svg`, `03-contextual-first.svg`. SVG import is editable as vector/text layers in FigCraft.
- Full-size previews: `previews/first-review-01-precision-inspector.png`, `previews/first-review-02-composition-workspace.png`, `previews/first-review-03-contextual-first.png`.
- `generate-first-review.mjs` regenerates the source compositions. No production files were changed; no build, application test or runtime session was run.

**Approval gate:** choose one direction or request a hybrid. Only then will the complete detailed editors, compact 760×500 behavior and final pixel-level feature coverage be developed. Nothing in this review is a production design approval.
