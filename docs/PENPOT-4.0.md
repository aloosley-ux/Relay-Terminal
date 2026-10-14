# Relay 4 editable design

The existing connected Penpot file is preserved. New page **Relay 4 / Command workflows**:

- File: `52a5041f-08a1-80f1-8008-c5171920d528`
- Page: `b4819829-703d-80e1-8008-ca4f6204e1a5`
- Contextual command copy: `b4819829-703d-80e1-8008-ca4fd0cc1e81`
- Keyboard copy / unavailable boundary: `b4819829-703d-80e1-8008-ca4fd1179bfb`
- Recovered workspace: `b4819829-703d-80e1-8008-ca4fd15834bb`

All three 1080×720 boards contain editable shapes and text. They inherit Harbor colours and the terminal-first layout. The menu is 320 px wide with compact rows, command context at the top, distinct command/output/selection actions, and no per-command decorative controls. The status bar has no idle Ready label or dot. Keyboard and missing-boundary states were designed before implementing the React menu.

The first board was exported and visually inspected; a containment check found no overflowing descendants on any board. [SVG reference](design/relay4-command-menu.svg). Runtime screenshots are in `artifacts/relay4/`; those, not Penpot, are the application evidence. Penpot's available font substitutes for Windows Segoe/Cascadia; implementation retains native installed fonts.
