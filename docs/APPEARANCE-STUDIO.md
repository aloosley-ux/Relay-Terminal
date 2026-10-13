# Appearance Studio

Open Appearance Studio from the window frame, status bar, command palette or **Ctrl+Shift+A**. It sits beside the actual terminal. Preview changes do not execute commands, reset scrollback or recreate PowerShell. **Apply** persists the selected scope; **Reset preview** restores its saved selection. Closing discards unapplied changes. Saving/importing a custom theme adds it to the library immediately.

Built-ins: **Harbor** (blue slate), **Porcelain** (daylight), **Carbon** (warm neutral), **Tideland** (illustrated coast), **Frost** (soft, blurred internal gradient). Choose application and terminal themes independently. Type controls cover installed font families, 10–32 px size, line height, letter spacing, padding, cursor shape and blinking. Colour controls cover foreground, background, selection, cursor, all 16 ANSI colours and the six application colour roles.

Backdrop supports solid, gradient, local wallpaper and optional ambient gradient. Surface opacity changes only the terminal background. Intensity and blur affect the backdrop. Animated ambient backgrounds pause when hidden or minimised and disable under reduced motion. Frost is an internal composited treatment; it does not expose the Windows desktop or enable native acrylic.

## Scope and storage

Resolution order: session → pinned workspace → global. Select **This workspace** from a session opened through a pinned workspace. A new unscoped session inherits global appearance. **Use inherited appearance** clears a workspace/session override. Restored tabs retain their appearance identity; their shell processes are fresh, as in Relay 2.1.

Settings use a versioned `appearance` object in Relay's existing atomically replaced local settings file. Legacy theme, font size, actions, workspaces and session options are preserved; old appearance settings migrate to Harbor or Porcelain. Legacy Settings dark/light/system controls remain available. The system preference follows OS changes until a custom appearance is applied. Per-session zoom uses the active scope without affecting other shells.

Custom themes can be duplicated, edited, renamed, deleted with undo, imported and exported. JSON uses `{ "format": "relay-theme", "version": 1, "theme": ... }`. Export uses a native Windows Save dialog; import uses the WebView file picker. Unknown theme fields are discarded. Remote URLs and SVG data imports are refused. PNG/JPEG/WebP files are embedded for portable export, up to 4 MB; imports are limited to 6 MB. Native settings validation bounds colours, typography, image URLs, effects, library size and override counts before writing.

## Window controls

- **Ctrl+Shift+B** toggles navigation; drag its edge or use arrow keys on the separator to resize.
- **F11** enters/exits terminal-only mode.
- **Ctrl+Shift+M** shows the optional command composer.
- **Ctrl+Shift+D** splits/unsplits; **Alt+Left/Right** focuses panes; the separator supports keyboard resizing.
- **Ctrl+Shift+P** opens the command palette; **Ctrl+,** opens session settings.

The default window is 1080×720, with support down to 760×500. Compact navigation overlays temporarily. Studio dismisses navigation to keep the live terminal usable.
