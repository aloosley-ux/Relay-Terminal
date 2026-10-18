# Appearance Studio refinement review

**Status:** final correction pass accepted and implemented for Relay 5.1.0. The approved unified pages and the three earlier explorations remain preserved in the FigCraft file.

The positioning control, direct Follow Windows Studio switch, advisory contrast feedback, installed-font discovery, and tab identity were labeled proposals during design review. The user later approved them for release 5.1.0 and they are now implemented; page labels are retained as historical review context.

The refined screens keep the 1080 × 720 Relay 5.0 Switchline frame and a 366 px docked Appearance Studio. The 760 × 500 screen keeps a 420 px live shell, one task-focused Studio view, larger direct-entry controls and internal scrolling for lower controls. Every color/background manipulation stays in the Studio; the terminal remains visible as the live result.

## Review screens

Open [Relay-Appearance-Studio-Professional-Review.figcraft](Relay-Appearance-Studio-Professional-Review.figcraft). The refinement pages are editable vectors, text, shapes and controls. SVG imports are also preserved in `refinement-src/` and full-resolution PNGs are in `refinement-previews/`.

| Workflow | Full-resolution preview | FigCraft page |
|---|---|---|
| Ambient gradient and effects in the dock | [1080 × 720](refinement-previews/05a-background-gradient-docked-editor.png) | 05a — Background · gradient dock |
| Wallpaper, safe import and proposed positioning control | [1080 × 720](refinement-previews/05b-background-wallpaper-position-proposal.png) | 05b — Background · wallpaper position proposal |
| All application, terminal and 16 ANSI roles | [1080 × 720](refinement-previews/06a-colour-role-atlas.png) | 06a — Colour · complete role atlas |
| ANSI precision edit while shell specimen remains visible | [1080 × 720](refinement-previews/06b-ansi-precision-editor.png) | 06b — ANSI · precision editor |
| Choose global/workspace/session and see inheritance | [1080 × 720](refinement-previews/07a-scope-target-and-inheritance.png) | 07a — Scope · target and inheritance |
| Session override, independent themes, preview/apply/discard | [1080 × 720](refinement-previews/07b-session-override-and-chrome.png) | 07b — Scope · session override and chrome |
| Windows light/dark following at Global scope | [1080 × 720](refinement-previews/07c-global-windows-appearance.png) | 07c — Global · Windows appearance |
| Save, rename/edit, duplicate and delete with undo | [1080 × 720](refinement-previews/08a-theme-library-lifecycle.png) | 08a — Themes · library lifecycle |
| Invalid import and recovery with source limits | [1080 × 720](refinement-previews/08b-import-validation-recovery.png) | 08b — Themes · import recovery |
| Native JSON export save dialog | [1080 × 720](refinement-previews/08c-theme-export-save-dialog.png) | 08c — Themes · native export dialog |
| Compact live shell with full backdrop editor access | [760 × 500](refinement-previews/09a-compact-760x500-backdrop.png) | 09a — Compact · 760 × 500 backdrop |
| Right-click the Carbon session in a split | [1080 × 720](refinement-previews/10a-split-session-context-menu.png) | 10a — Split sessions · contextual menu |
| Quick edit targets that exact session | [1080 × 720](refinement-previews/10b-split-session-quick-editor.png) | 10b — Split sessions · quick editor |

## Background editing decision

The gradient editor keeps the visual direction line and two-stop sample inside the dock, beside exact endpoint values and a directly editable 0–360° angle. Its numeric effect controls stay in the same panel. This applies the useful direct-manipulation idea documented by Photoshop while leaving Relay's shell text, cursor and selection unobstructed.

Wallpaper uses a small Studio-only crop preview and direct X/Y values. **Image positioning is a new proposal:** Relay currently uses centered cover and exposes no positioning control. The screen keeps that current behavior visible beside the proposed adjustment. Wallpaper format, file-size and pixel limits are retained. No unimplemented fit modes are implied.

This separates directional gradient authoring from spatial wallpaper positioning while keeping one shared dock and one live terminal result. Solid, gradient, wallpaper and ambient modes stay available from the same mode row. Ambient motion still pauses while hidden/minimised and respects reduced motion.

## Feature-to-design coverage matrix

This matrix maps each existing capability to a drawn control or visible interaction state. Page numbers refer to pages in the editable FigCraft document.

| Existing function | Visible design location |
|---|---|
| Harbor, Porcelain, Carbon, Tideland and Frost | **01 Complete Appearance Studio:** five theme specimens and selection. **07c:** global preset comparison. |
| Independent application chrome and terminal palettes; mixed combinations | **01:** separate Application theme and Terminal scheme selectors. **07b:** Porcelain chrome with Carbon terminal in one active session; app chrome follows that session. |
| Global, workspace and session targets | **07a:** open Apply to menu names All terminals (Global), This workspace and This session. |
| Effective source, inherited state and override state | **07a:** session inherits from Relay Terminal, with effective app and terminal shown separately. **07b:** explicit session override and Global → workspace → session path. |
| Remove override and return to inheritance | **07b:** Use workspace appearance removes the session override and falls back through workspace/global resolution. **10b:** the selected `pwsh` session override can return to workspace appearance; this removal persists immediately in the existing Studio model. |
| Follow Windows light/dark preference | `followSystem` exists in `AppearanceStore` and resolves both global app and terminal palettes from Windows light/dark. The current Studio does not expose a direct re-enable switch; **07c marks that switch NEW PROPOSAL** and shows Windows Dark resolving to Harbor chrome + Harbor terminal. Workspace/session overrides still take precedence. |
| Live preview without restarting/recreating a shell | **05a / 05b / 06b / 07b / 10b:** live shell specimen remains visible during edits; session processes and scrollback remain present. |
| Apply, reset preview, close/discard | **07b / 10b:** theme and colour edits preview live; Apply saves to the selected scope, Reset restores its saved value, and closing Studio discards the draft. Override removal is a separate immediate action. |
| Application background, raised surface, foreground, muted text, accent and border colours | **06a:** six individually labelled application roles with values. |
| Terminal background, foreground, cursor and selection colours | **06a:** four labelled terminal foundation roles with values. The terminal background role is the Solid background colour. |
| All 16 individually editable ANSI values, normal and bright | **06a:** all 16 named values in explicit Normal 0–7 / Bright 8–15 groups. **06b:** all 16 remain visible while one is edited. |
| Precise color selection and values | **06b:** square spectrum, hue strip, current/new previews, direct HEX, RGB and HSV fields. The terminal sample remains visible beside the picker. |
| Readability feedback without arbitrary restrictions | **06b:** selected ANSI blue shows 7.85:1 against the terminal background and a WCAG AA normal-text reference. Marked advisory/new; no value is blocked or changed. |
| Font family | **01c Typography + cursor:** chosen family is visible. The current text-entry field is preserved; searchable installed-font lists and font comparison are clearly marked **new proposals**. |
| Font size 10–32 px; line height 1–2; letter spacing −1–4 px; terminal padding 4–48 px | **01c:** each has direct numeric value and range. |
| Cursor bar/block/underline and blinking | **01c:** three named shape controls and Blink cursor toggle. |
| Solid background | **05a / 05b / 10b:** Solid remains an explicit mode. **10b** shows the solid colour and marks opacity, intensity and blur as not used in Solid. Its editable terminal-background value is also in **06a**. |
| Gradient endpoints and angle | **05a:** two endpoint color/value controls, an in-Studio directional sample and numeric degree entry. No additional stops. |
| Local wallpapers and bundled Tideland | **05b:** Choose local image and Use Tideland actions with preview. |
| Wallpaper restrictions | **05b:** local PNG/JPEG/WebP only, under 4 MB, ≤8192 px per edge and ≤16 megapixels; remote URLs and SVG data are rejected. **08b:** imported themes also validate embedded image data. |
| Wallpaper positioning | Current behavior **Center / Cover** is stated in **05b**. X/Y crop positioning is explicitly marked **NEW PROPOSAL**, not current capability. |
| Ambient effects and opacity/intensity/blur | **05a:** ambient mode, surface opacity 0.35–1, intensity 0–1, blur 0–40 px, all with numeric values. **05b** repeats all three for wallpaper. |
| Ambient animation and duration 10–120 seconds | **05a:** animation toggle and editable seconds value/range. **03a** also shows reduced-motion and visibility behavior. |
| Reduced motion, hidden/minimised behavior; crisp terminal glyphs | **03a / 05a:** motion behavior note; preview keeps terminal foreground content readable and independent from backdrop opacity. |
| Save current theme; maximum 40 custom themes | **08a:** Save a copy, name field, and 08 / 40 saved count. |
| Edit and rename custom theme | **08a:** selected theme, rename field and Save theme changes action. |
| Duplicate a custom theme | **08a:** Save a copy action. It saves and selects/applies immediately. |
| Delete custom theme with undo | **08a:** delete row action, fallback-to-Harbor state and Undo delete. |
| Import portable theme JSON | **08a / 08b:** Import action; a valid import is added immediately and selected as live preview until Apply. |
| Invalid import recovery, limits and validation | **08b:** invalid version error, choose again, 6 MB JSON limit, 40-theme limit, PNG/JPEG/WebP wallpaper, 8192 px edge and 16 MP. Unknown JSON fields are discarded by the existing importer. |
| Export portable JSON | **08a / 08c:** Export action opens the native Export Relay theme save dialog; default filename `relay-theme.json`. |
| Theme library persistence versus appearance persistence | **08a:** each action carries its own persistence signal: Save changes and Save a copy say they save and apply now; Import says it saves now; Delete is labeled `Delete now` and offers Undo; the separate staged preview area says Apply is required to keep the appearance selection. |
| Contextual tab customization | **NEW PROPOSAL:** **04a → 04b → 04c** adds a right-click tab entry into the shared session editor and full Studio. Existing session appearance remains the edited state. |
| Contextual terminal customization | **NEW PROPOSAL:** **04b / 10b** adds the same quick editor entry from terminal output; **10b** targets `pwsh` in the right split. |
| Workspace customization | **Existing scope:** **01 / 07a** select This workspace in the shared Studio. A dedicated workspace context-menu entry is a **NEW PROPOSAL**. |
| Independently styled split sessions | **01d / 10a / 10b:** Harbor and Carbon sessions remain independently themed; right-click and quick edit identify `pwsh · Carbon`. No pane-position override. |
| Tab identification colour/icon as a separate new idea | **04b:** the tab identity cue is marked as a new proposal, separate from the existing terminal palette. |
| Compact-window access | **09a:** 760 × 500 with 420 px live shell, all four Studio section tabs visible, one task-focused editor, 27 px controls with direct numeric values, internal scroll for remaining backdrop controls, and fixed Reset/Apply. The scale remains legible instead of compressing the normal screen. |

### Persistence semantics from the current implementation

- Theme, palette, typography and background edits are live previews until **Apply**. **Reset preview** restores the saved effective choice. Closing the Studio clears the unsaved preview.
- Removing a workspace or session override is an immediate persistent operation in `AppearanceStudio.tsx`; it removes that map entry and resolves the next inherited level without requiring Apply. **10b** labels this action `Use workspace` / `Saved now` separately from the draft controls.
- Saving a copy or saving changes to a custom theme immediately persists the library entry and applies that custom theme to the selected scope. Rename is part of Save theme changes. In **08a**, the `SAVES + APPLIES NOW` text is attached to each save action.
- Import immediately adds the validated theme to the library and previews its selection; **Apply** persists the appearance choice. **08a** labels the Import action `Saved now` and separates that library write from the staged preview/Apply area.
- Delete immediately removes the theme and changes any stored choices that referenced it to Harbor; **Undo theme deletion** restores the prior store.
- Application chrome is resolved from the active session's application theme. Each session's terminal palette remains independent. Split layout position is not a scope.
- Solid background uses the terminal background role directly; the engine applies the opacity/intensity/blur effects only to non-solid backdrops. **10b** therefore shows those effect values as inactive for Solid.
- Windows-following is represented as a proposed Studio re-enable control because `followSystem` is present in the model/resolver but the current `AppearanceStudio.tsx` exposes no direct switch. With Windows Dark selected, **07c** shows the effective dark Harbor application and terminal palettes together.

## Research used for specific design decisions

**Documented guidance:** Microsoft documents spectrum selection with direct HEX/RGB/HSV entry and advises a square spectrum or direct numeric fields when precision matters ([Windows ColorPicker](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/color-picker)). Adobe documents direct endpoint/angle gradient editing ([Photoshop gradient editing](https://helpx.adobe.com/photoshop/desktop/adjust-color/color-effects-techniques/edit-a-gradient.html)). WCAG 2.2 defines contrast, keyboard and focus criteria ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)).

**Design recommendations, not product facts:** keeping all color controls docked protects the terminal specimen; an advisory contrast ratio supports legibility without constraining unusual palettes; a Studio-only crop control is a proposal for wallpaper positioning, since current Relay behavior remains centered cover.

**Design-only:** only files in `design/current/appearance-studio-5.1/` were changed. No application source, settings, build, package or active terminal was touched. This milestone stops for review; no visual direction is approved.
