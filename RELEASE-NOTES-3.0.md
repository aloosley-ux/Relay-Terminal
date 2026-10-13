# Relay Terminal 3.0 — Appearance Studio

13 October 2026

Relay opens into a 1080×720 terminal-first window with quiet Windows chrome. Navigation starts closed, can be resized, and becomes a temporary overlay in compact windows. F11 removes supporting bars; the command composer is optional. Projects, saved actions, file previews, processes, logs and service integrations retain their real backend behaviour.

Appearance Studio opens beside the live shell. Harbor, Porcelain, Carbon, Tideland and Frost provide five distinct starting points. Application chrome and terminal schemes can be mixed independently. Edit fonts, line height, letter spacing, padding, cursors, terminal colours, all 16 ANSI colours and application colours. Solid, gradient, local wallpaper and ambient backgrounds compose behind actual xterm content.

Custom themes support duplication, editing, renaming, deletion with undo, portable JSON import and native-file export. Appearance resolves session → pinned workspace → global; restored tabs retain scoped appearance identity. Changes apply to existing xterm instances without resetting PowerShell, scrollback or selection. Settings migrate from 2.1 and still use atomic native storage.

Ambient motion is opt-in, pauses on inactivity/minimisation/hidden state, and respects reduced motion. Studio loads on demand. No new runtime dependencies, cloud accounts, polling service or JavaScript animation loop were introduced. The packaged executable and NSIS installer are accompanied by native screenshots and measured test evidence.

See [Appearance Studio](docs/APPEARANCE-STUDIO.md), [design system](DESIGN.md), [research](docs/RESEARCH-3.0.md) and [native test report](TEST-REPORT-3.0.md). Frost is an internal composited backdrop rather than Windows desktop acrylic. The native export Save dialog and clean-machine installer flow remain explicit verification limits in the report.
