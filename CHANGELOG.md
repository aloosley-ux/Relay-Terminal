# Changelog

## 5.1.1 — Appearance scope handoff

- Resolve the Studio's initial palette from the chosen target scope. When a session overrides its workspace, opening the workspace editor now loads the workspace palette rather than the session palette.
- Preserve session precedence, show that a session override masks workspace changes, and keep **Use inherited** returning the session to the workspace palette.
- Add packaged native regression coverage for workspace quick editing, full Studio handoff, override precedence and inheritance restoration.

## 5.1.0 — Appearance Studio

- Rebuilt the Appearance Studio as a complete, docked editing environment with separate Themes, Type, Colour and Backdrop workflows.
- Preserved Harbor, Porcelain, Carbon, Tideland and Frost, independent application and terminal themes, and global → workspace → session inheritance.
- Added scope source/override status, Follow Windows control, precise live previews, Reset, Apply and discard semantics.
- Added labelled HEX/RGB/HSV colour editing, all 16 editable ANSI roles, realistic terminal specimens and advisory contrast feedback.
- Added font availability checks, exact numeric controls, cursor previews, all existing background modes and effects, and wallpaper positioning.
- Added contextual quick appearance from tabs, terminal surfaces and live workspace rows, including split-session targeting.
- Added per-session tab identity colour and Lucide icon.
- Preserved theme JSON compatibility, wallpaper validation, theme and override limits, and running terminal process/scrollback state.

## 5.0.0

See [5.0 release notes](RELEASE-NOTES-5.0.md).
