# Appearance Studio — unified professional review

**Status:** unified design approved and implemented for Relay 5.1.0. This file and its 23-page editable FigCraft source are the approved visual reference; no earlier concept is promoted as the production baseline.

The first review labeled Follow Windows access, font discovery/comparison, contrast guidance, wallpaper positioning, and tab identity as proposals. They were subsequently approved for Relay 5.1.0 and are implemented. Labels on individual review pages record what was proposed at that review; they do not indicate a remaining release gap.

This milestone combines a complete docked Studio with contextual entry points into the same scoped appearance system. The Studio stays open beside the live shell at 366 px in a 1080 × 720 window; the compact theme view is shown at 760 × 500. The specialist editors use the same Relay frame and Apply/Reset contract. Context screenshots show one popup at a time.

## Visuals and editable source

Open [Relay-Appearance-Studio-Professional-Review.figcraft](Relay-Appearance-Studio-Professional-Review.figcraft) in FigCraft. Each page is composed of editable vector and text layers, including the Switchline mark, Lucide utility icon paths, controls and screen content.

| Screen | Full-resolution preview | FigCraft page |
|---|---|---|
| Complete Studio — theme library | [1080 × 720 PNG](professional-previews/professional-01-complete-appearance-studio.png) | 01 — Complete Appearance Studio |
| Compact Studio | [760 × 500 PNG](professional-previews/professional-01b-compact-760x500.png) | 01b — Compact Studio · 760 × 500 |
| Typography and cursor editor | [1080 × 720 PNG](professional-previews/professional-01c-typography-and-cursor.png) | 01c — Typography + cursor |
| Two independently themed split sessions | [1080 × 720 PNG](professional-previews/professional-01d-split-independent-sessions.png) | 01d — Two independently themed sessions |
| Application, terminal and ANSI colours | [1080 × 720 PNG](professional-previews/professional-02-colour-and-ansi.png) | 02 — Professional colour + ANSI |
| Ambient gradient and effects | [1080 × 720 PNG](professional-previews/professional-03a-ambient-background-effects.png) | 03a — Background · ambient effects |
| Wallpaper and effects | [1080 × 720 PNG](professional-previews/professional-03b-wallpaper-background-editor.png) | 03b — Background · wallpaper |
| Tab context menu | [1080 × 720 PNG](professional-previews/professional-04a-tab-context-menu.png) | 04a — Context · tab menu |
| Quick appearance editor | [1080 × 720 PNG](professional-previews/professional-04b-context-quick-editor.png) | 04b — Context · quick editor |
| Context handoff to full Studio | [1080 × 720 PNG](professional-previews/professional-04c-full-studio-context-destination.png) | 04c — Context · full Studio |

Context flow is sequential: right-click the session tab → choose **Quick appearance** → edit the session → close the flyout and enter the full Studio when needed. The terminal header and workspace row can expose the same shared editor. These are proposed entry points; the existing terminal context menu remains command/output focused.

## Feature-to-design coverage matrix

Audit basis: `src/appearance.ts`, `src/AppearanceStudio.tsx`, `src/TerminalMenu.tsx`, `src/App.tsx`, `src/terminals.ts`, `src-tauri/src/appearance.rs`, `docs/APPEARANCE-STUDIO.md`, `DESIGN.md`, and the approved Switchline references.

| Existing function or behavior | Proposed screen, control, or interaction |
|---|---|
| Built-in Harbor, Porcelain, Carbon, Tideland and Frost themes | **01 Complete Studio:** five live specimen tiles; selection previews against the running shell. **01b Compact:** same five choices at 760 × 500. |
| Independent application-chrome and terminal palettes; mixing any supported combinations | **01:** separate **Application chrome** and **Terminal scheme** selectors, visibly set to Harbor + Frost. **02:** distinct application and terminal role groups. |
| Global, workspace and session scope; session → pinned workspace → global inheritance | **01 / 02 / 03 / 04c:** **Apply to** selector, source breadcrumb and override status. **04b:** selected session and inherited source are shown before editing. |
| Following the Windows light/dark preference until a custom appearance is applied | Application theme selector's **Follow Windows** choice (a documented route in this proposal; the menu is closed in the static theme-library screen). |
| Creating, changing, inheriting and removing scope overrides | Scope selector offers Global, This workspace and This session. An override's scope menu includes **Use inherited appearance** to remove that local override. The status chip identifies the active override. |
| Live appearance preview without restarting/recreating a shell | **01 / 02 / 03 / 04b / 04c:** the live terminal surface is the preview target; **04b** explicitly says the running shell continues. |
| Apply, reset preview, close/cancel and discard | Fixed Studio footer: **Reset preview** and **Apply**; **04b** has session-scoped equivalents. The live/not-saved indicator remains separate from saved theme-library changes. Closing an unapplied editor discards its local preview. |
| Application background, raised surface, foreground text, muted text, accent and borders | **02:** six labelled **Application chrome** role rows, each with swatch and hex value; selecting a row opens the shared spectrum editor. |
| Terminal background, foreground, cursor and selection colours | **02:** four labelled **Terminal foundation** role rows with individual values and the shared picker. |
| All 16 editable ANSI values, normal and bright | **02:** eight named normal roles and eight named bright roles; each cell displays its own colour and hex value. No ANSI role is represented by an unlabeled number. |
| Precise colour picking and readable preview | **02:** square saturation/value spectrum, vertical hue strip, current/proposed swatches, direct HEX and RGB fields, and explicit **Cancel / Use this colour** actions. A realistic terminal specimen shows prompt, info, warning, error, pass and diff output in the selected palette. |
| Readability assistance without blocking expressive palettes | **02:** readability hint lives below the role editor and advises without changing or rejecting a selected colour. |
| Font family | **01c Type:** searchable installed-font selector, selected font and terminal specimen; sample comparison is an optional proposed convenience. |
| Font size 10–32 px; line height 1–2; letter spacing −1–4 px; padding 4–48 px | **01c:** precision slider paired with direct numeric value and displayed bounds for each property. |
| Cursor bar, block or underline; blinking on/off | **01c:** three named shape choices and a dedicated blink toggle. |
| Solid background | **03a / 03b:** persistent Solid mode choice; background colour uses the same individually editable terminal-background role and picker from **02**. |
| Two-colour gradient with start, end and angle | **03a:** labelled endpoint fields, a two-stop live preview, draggable direction line and numeric angle. The editor does not invent extra gradient stops. |
| Local wallpaper and bundled Tideland wallpaper | **03b:** artwork preview, **Choose local image** and **Use Tideland**. |
| Wallpaper formats and source/size restrictions | **03b:** PNG/JPEG/WebP, 4 MB, 8192 px maximum edge and 16 MP limit shown at the source control; remote URLs and SVG data are refused. Portable theme JSON image limits are shown in import validation feedback. |
| Ambient gradient effects | **03a:** visible ambient gradient canvas plus editable endpoints and angle; the surface itself previews behind terminal output. |
| Surface opacity 0.35–1; backdrop intensity 0–1; blur 0–40 px | **03a / 03b / 04b:** precision sliders with numeric values and bounds. **03b** keeps all three visible above the fixed footer. |
| Ambient animation toggle and 10–120 second duration | **03a / 04c:** explicit toggle, duration selector and 10–120 sec range. |
| Existing reduced-motion and visibility behavior; opaque text, cursor and selection | **03a:** motion note says animation respects reduced motion and pauses while hidden/minimised. The terminal specimen keeps glyphs and cursor crisp above the backdrop. |
| Save custom theme; current limit of 40 | **01:** **Save current as…** and `08 / 40` library count. |
| Edit and rename custom themes | **01:** pencil action on a saved theme opens its named edit/rename dialog; preserve validation messages beside the affected field. |
| Duplicate custom theme | **01:** copy action on the selected saved-theme row. |
| Delete custom theme with undo | **01:** trash action; deletion presents an undo toast rather than an irreversible confirmation maze. |
| Import/export portable theme JSON; validation, limits and errors | **01:** Import and Export actions. Import feedback is attached to the action; invalid version/values, over-limit JSON (6 MB), and invalid image payloads receive specific errors. Unknown fields are dropped as in the current validator. |
| Theme-library persistence vs local appearance preview | **01:** **Preview is live · not saved** and fixed Apply/Reset bar are visually separate from saved-theme row actions. Library operations remain persistent by their current semantics. |
| Save/edit/import selection persistence semantics | Saving or updating a custom theme persists the library item and selects/applies it to the current scope, as today. Import persists the theme item immediately while its selection remains a live preview until Apply. The Studio should label these two outcomes at the action point. |
| Session-specific theme/background/inheritance from a tab | **04a → 04b:** tab context command opens a small quick editor for the existing session appearance; inherited source is stated and first edits create the session override. |
| Terminal-surface contextual entry | Right-click the terminal surface or its header to open the same **04b Quick appearance** editor; no duplicate state model. |
| Workspace appearance inheritance/override | Workspace row exposes **Appearance…** into the same Studio with **This workspace** selected; scope breadcrumb identifies parent and effective override. |
| Two split sessions with distinct existing appearances | **01d:** Harbor and Carbon sessions side by side, each identified as a session/theme. Both are existing per-session overrides; no pane-position override is proposed. |
| Tab identity colour/icon as a new idea | **04b** labels this affordance **new proposal**, separate from terminal palette. It is not part of existing feature parity. |

## Research notes

**Documented product capabilities:** Wave documents contextual tab/background customization; [Wave customization](https://docs.waveterm.dev/customization). Windows Terminal documents per-profile schemes, opacity, background images, cursor and tab identity; [Windows Terminal profile appearance](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-appearance). VS Code documents terminal font, cursor, ANSI colours and tab presentation; [VS Code terminal appearance](https://code.visualstudio.com/docs/terminal/appearance). Warp documents gallery-based theme selection and custom themes; [Warp themes](https://docs.warp.dev/terminal/appearance/themes/). Blender documents editable interface theme colours and presets; [Blender Themes preferences](https://docs.blender.org/manual/en/latest/editors/preferences/themes.html).

**Interaction guidance and design recommendations:** Fluent's picker documents a spectrum with direct colour values; [Windows ColorPicker](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/color-picker). Photoshop documents endpoint/stop and angle manipulation for gradients; [Edit a gradient](https://helpx.adobe.com/ca/photoshop/desktop/adjust-color/color-effects-techniques/edit-a-gradient.html). Figma's UI3 retrospective documents why docked, resizable panels preserve workspace; [Figma UI3](https://www.figma.com/blog/our-approach-to-designing-ui3/). These are pattern references, not evidence that the proposal is faster. Keyboard focus, visible focus, contrast and target sizing should be checked against [WCAG 2.2](https://www.w3.org/TR/WCAG22/) before implementation.

**Design-only boundary:** only files under `design/appearance-exploration/` were created or edited. No Relay source, settings, running sessions, build or package was changed. This milestone stops for review; no direction is approved.
