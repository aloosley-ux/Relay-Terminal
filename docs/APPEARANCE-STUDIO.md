# Appearance Studio in Relay 5.1

Appearance Studio edits the live session beside the terminal. The shell process, output and scrollback stay in place while a preview updates. Open it from the window controls, command palette, status bar or **Ctrl+Shift+A**. Right-click a session tab, terminal surface, workspace breadcrumb or an open workspace row to open **Quick appearance** for that exact target.

![Appearance Studio beside a running PowerShell session](media/appearance-studio-5.1.png)

## Themes and palettes

The built-in theme library contains **Harbor, Porcelain, Carbon, Tideland and Frost**. The Application chrome and Terminal scheme selectors are independent, so any supported application/terminal pairing can be used. Relay's chrome follows the active session's resolved application palette; each visible terminal pane uses its own session palette. Split panes therefore can use different terminal themes at the same time.

Theme tiles preview real palette roles. Choosing a theme stages a selection. Custom themes can be edited, renamed, duplicated and deleted. The library supports up to 40 saved custom themes. **Save custom theme**, **Import**, **Rename**, **Duplicate** and **Delete** are library actions: they save immediately. Delete presents **Undo theme deletion** to restore both the item and references.

Portable files use `{ "format": "relay-theme", "version": 1, "theme": ... }`. **Import** accepts valid JSON up to 6 MB and reports malformed JSON, unsupported versions, invalid colours or ranges, the 40-theme limit and oversized wallpapers inline. **Export current** uses the native Windows Save dialog. Unknown fields are discarded. Remote URLs and SVG data payloads are rejected. Local PNG, JPEG and WebP wallpapers are limited to 4 MB, 8192 pixels per edge and 16 megapixels; the bundled Tideland SVG remains available.

## Scope, preview and persistence

Appearance resolves **session → pinned workspace → global**. The target selector identifies the chosen layer, and its state row says whether the value is an override or inherited, with the source. **Use inherited** removes a workspace or session override immediately; it does not rewrite the parent scope. When editing Global while the active session has a local override, the Studio explains that global changes affect sessions inheriting Global.

Palette, type and background edits are live previews. **Apply** persists the staged appearance to the selected scope. **Reset** reloads that scope's saved value. Closing Studio discards its staged preview. Custom theme library operations persist immediately and remain distinct from this staged Apply flow. Changing a global appearance manually turns off Follow Windows; toggling Follow Windows itself is an immediate persisted preference. When enabled, Windows light/dark changes update inheriting sessions without restarting their shells.

## Colour and ANSI

The Colour editor separates **Application**, **Terminal** and **ANSI 16** palettes. Application roles are background, raised surface, foreground text, muted text, accent and border. Terminal foundation roles are background, foreground, cursor and selection. All eight normal ANSI roles and all eight bright roles remain individually editable and named.

Each role opens a precise editor with a visual Windows colour picker, HEX, RGB and HSV inputs, current/background comparison and a contrast ratio hint. Contrast is advisory: Relay does not reject or rewrite unconventional user colours. A realistic output specimen shows prompt, information, success, warning, error and diff roles. Terminal foreground and cursor remain opaque over background effects.

## Type and cursor

Font family offers common Windows terminal fonts with local availability checks and retains an editable font stack for other installed fonts. The live specimen uses the selected stack. Font size is 10–32 px, line height 1–2, letter spacing −1–4 px and terminal padding 4–48 px. Cursor shape is bar, block or underline; blinking can be enabled or disabled. Numeric fields beside sliders allow precise entry.

## Backgrounds and effects

Choose **Solid**, **Gradient**, **Wallpaper** or **Ambient**. The compact composition preview sits in Studio; the real live terminal remains visible beside the editor.

- **Solid:** terminal background colour. Effects not used by solid mode are not presented as active controls.
- **Gradient:** start and end colours and angle, with direct numeric entry and common angle stops.
- **Wallpaper:** local image, bundled Tideland option and horizontal/vertical positioning.
- **Ambient:** two gradient colours, angle, animation toggle and 10–120 second duration.
- For non-solid modes, surface opacity is 0.35–1, backdrop intensity is 0–1 and blur is 0–40 px. The effects apply only to the background layer.

Ambient motion pauses when Relay is hidden or minimised and is disabled by Windows reduced-motion preference. Wallpaper formats, dimensions and image size are checked before embedding. These changes do not recreate a terminal.

## Quick appearance and tab identity

Quick appearance identifies its session and workspace, exposes the independent application and terminal themes, background mode, and surface opacity when the selected mode uses it. **Use inherited** removes the selected local override. Reset clears the preview; Apply persists the selected scope; **Open full Appearance Studio** carries the target and scope into the complete editor. The terminal's regular copy, paste, find and scrollback commands remain in its context menu.

Right-click a workspace row when it has a live session to edit that workspace's appearance. A workspace without a live terminal asks the user to open it first; right-click does not start a shell. Session tab colour and Lucide identity icon can be edited in the Studio and are stored with that session's appearance choice.

## Compact windows and accessibility

At the supported minimum 760 × 500 size, Studio becomes a bounded side overlay with internal scrolling and larger direct-entry controls; the live terminal remains visible. The normal 1080 × 720 layout remains docked. Editors are keyboard navigable, named for assistive technology and retain visible focus. Contrast feedback does not block user choice. Reduced-motion behaviour covers ambient effects and transitions.

Appearance is stored in Relay's existing version 1 `appearance` settings object. New fields are optional and validated; older preference files continue to load without migration. Native validation retains the 40-theme limit, 500 override limit, 24 MB store limit and existing wallpaper and numeric bounds.
