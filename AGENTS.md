# Relay Terminal — Project agent instructions

Relay is a fast, local-first Windows terminal built with Tauri/Rust, React and native shell sessions. Its product principle is **"a calm Windows instrument"**: live terminal first, compact familiar controls, optional contextual workbench; avoid dashboard-style chrome.

## Read these before UI, identity, appearance or icon changes
1. `DESIGN.md` — the established Relay product system: themes, semantic colour, typography, sizing, control states and terminal-first layout.
2. `.impeccable/design.json` and `.impeccable/relay-surface.md` — machine-readable component tokens and the desktop design brief.
3. `design/relay4-identity/README.md` and its referenced editable VectorCraft/FigCraft assets — **approved Switchline identity**, integrated into Relay 5.0.
4. `src/RelayIcons.tsx` — the approved Switchline brand mark. Utility and interface icons use `lucide-react` throughout the app.
5. Existing `src/style.css`, `src/desktop.css`, `src/studio.css`, `src/appearance.ts`, and actual component code — verify the runtime behaviour against any documentation.

Important authority boundary: `design/relay5/README.md`, `design/relay5/DESIGN-SYSTEM.md`, and related Night Gallery screens describe a **review concept, not the approved Relay 5.0 production visual identity**. Other creative-lab/direction studies also remain proposals unless the user explicitly approves them. Do not adopt them as production tokens by accident. Historical documents can reflect older versions; verify version and branch before acting.

## Preserve Relay's accepted product
- Keep the approved Switchline mark, Windows identity `com.relay.terminal`, existing themes, appearance settings, user data, native workflows and terminal/session behaviour unless the specific task requires an approved change.
- Application chrome and each terminal's palette are independently customisable. Icon colours must inherit the correct owning control/theme; do not bake a new palette into icons.
- For scoped asset work, do not quietly redesign layouts, replace unrelated components or modify release packaging. Separate feature branches from accepted releases; do not merge or publish without the user's request.

## Relay iconography
- Use the installed `lucide-react` family for all utility and interface icons. Do not introduce another custom UI glyph family or CSS-masked icon assets.
- Keep the approved Switchline mark in `RelayIcons.tsx` and product/installer identity assets unchanged. Do not use the brand mark as an action icon.
- Preserve familiar functional meaning and accessible labels. Icons inherit `currentColor` from their owning control and theme.

## Verification and reporting
- Build and test the changed frontend, inspect genuine in-app screenshots at real display size and multiple themes, and use native packaged checks when claiming Windows executable behaviour.
- Headless Playwright with mocked Tauri IPC verifies frontend visuals only; it does not validate native integration or an installer.
- Preserve and report actual failures, discrepancies, accepted/rejected designs and remaining work. Present comparisons for review before declaring visual designs approved.
