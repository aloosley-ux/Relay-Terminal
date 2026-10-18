# Relay Terminal 5.1.0 — Appearance Studio

Relay 5.1.0 brings the approved unified Appearance Studio design into the Windows application. It keeps Relay's compact Switchline frame and puts a complete customisation workspace beside the real running shell.

## Appearance Studio

- Browse Harbor, Porcelain, Carbon, Tideland and Frost; mix application chrome and terminal palettes independently.
- Edit global, workspace and session appearance with explicit inherited/override state and source.
- Preview while the shell continues to run, reset the preview, apply changes to a selected scope, or close and discard staged edits.
- Tune all six application roles, four terminal foundation roles and all 16 named ANSI colours with HEX, RGB and HSV entry, visual colour selection and non-blocking contrast guidance.
- Compare terminal type, font availability, exact numeric values, cursor shape and blinking.
- Design solid, two-stop gradient, local wallpaper and ambient backgrounds. Set gradient angle, wallpaper position, applicable opacity/intensity/blur and ambient animation duration.
- Manage portable custom themes with immediate library save, edit, rename, duplicate, delete with undo, import and export.
- Open Quick appearance from session tabs, terminal surfaces and workspaces. Edit the selected session's existing appearance; split sessions retain separate palettes. Session tab colour and Lucide identity are also available.
- Use Studio in supported 760 × 500 windows with internal scrolling while keeping the terminal usable.

## Compatibility and safety

Existing `appearance` version 1 settings, five presets, theme JSON v1, scope precedence, numeric bounds, 40-theme limit, 500-override limit, store-size limit, wallpaper formats and image limits remain supported. Newly added fields are optional. Invalid theme input is rejected with recovery guidance. Wallpaper files remain local; remote references and SVG data imports are refused.

Appearance updates do not restart shells, discard terminal scrollback or change command execution. Application chrome resolves through the active session's scope; every session terminal resolves its own terminal theme.

## Windows downloads

The release package contains a standalone executable and NSIS installer. See `TEST-REPORT-5.1.md` for the verified artifacts, checksums, test results and remaining limitations.
