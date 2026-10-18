# Research record

**Date:** 2026-10-17  
**Scope:** Relay 4 baseline, SDS design-production lessons, terminal competitors and desktop accessibility.

## Evidence types

- **Observed in source/docs:** actual Relay architecture and documented feature boundaries. This is the strongest available Relay behavior evidence for this phase.
- **Observed in historical design:** Penpot `Relay 4 / Command workflows` page and the `Relay 4 / Recovered workspace` artboard were inspected read-only. It shows a fresh-shell recovery notice rather than process restoration.
- **Runtime visual evidence:** Windows MCP was used to inspect the running Relay 4 application and capture its actual UI. `docs/media/relay-terminal.png` is the Relay 4 screenshot used in the side-by-side comparison; it is separate from the FigCraft-rendered Relay 5 concepts.
- **Observed in official documentation:** competitor capabilities and standards below. Documentation demonstrates documented product behavior, not comparative user success or marketing claims.
- **Hypothesis:** R5 interaction proposals and comparative-test questions in `PRODUCT-DIRECTION.md`.

## Relay 5 design iteration and evidence

The first Relay 5 proposal was compared against the running Relay 4 screen and its source. The difference was substantive: Relay 4 gives the terminal a broad, quiet canvas and warmer, more authored application chrome; the first 5.0 proposal reduced that character to a generic dark shell and simplified Appearance to theme selection. The selected Night Gallery direction restores a distinct visual voice and clearer task/workspace context. Its porcelain terminal treatment is intentionally mixable with other app and terminal palettes.

The appearance parity audit inspected `src/AppearanceStudio.tsx`, `src/appearance.ts`, `src/studio.css` and `src-tauri/src/appearance.rs`. Those sources document independent chrome and terminal schemes, six application roles, terminal foundation colours and 16 ANSI values, type/cursor controls, scoped appearance, solid/gradient/wallpaper/ambient backdrops, wallpaper constraints, preview/apply/reset behavior and custom-theme lifecycle. Five new editable FigCraft screens now cover the complete authoring workflow and key validation states. See `APPEARANCE-PARITY.md` for the capability map. The screenshots under `evidence/relay5-appearance-*.png` are rendered from these FigCraft layers.

### 21st.dev MCP exploration

#### Attribution audit

The original Relay 5 research text says 21st.dev informed workbench and appearance interactions, but it records no exact searches, result IDs, component-to-layer mapping, or design diff. The original QA review also says the MCP was unavailable. The artifact alone cannot settle when or how the listed patterns affected the first proposal. Treat that historical attribution as unverified: it may have been inspiration, but there is no evidence here that a specific first-proposal component or interaction changed because of it. The existing Command Palette screen already has grouped Actions/Recent Folders and keyboard movement hints; this audit cannot credit those features to 21st.dev.

#### Fresh catalogue pass and FigCraft experiment · 2026-10-17

I ran live `get_inspiration` searches against the 21st.dev catalogue. The calls returned metadata, confidence and rationale without component source. I supplied a Relay design-context summary, but the MCP returned `contextApplied: false` on all three searches, so these were catalogue searches rather than context-aware recommendations. No paid component-source retrieval, code installation, 21st AI generation, or marketplace component was used.

| Need and exact query | Specific result observed | What was useful | FigCraft disposition |
|---|---|---|---|
| `desktop command palette keyboard-first command search recents groups focus` | [Command Search by arihantcodes](https://21st.dev/@arihantcodes_1f7b8c4d/components/command-search), demo 28888 (confidence 0.57); also Command Menu 31354 by wensity | Live-filtered groups, arrow-key selection, shortcuts and per-item hints. | Validates the existing grouped palette treatment; no new palette change is claimed from this pass. |
| `resizable terminal split panels keyboard resize handle` | [Resizable by sean0205](https://21st.dev/@sean0205/components/resizable), demo 4135 (confidence 0.55); described as accessible panel groups with keyboard support. | The original split only says “drag divider to resize”; keyboard operation and a visible focus state are absent. | New page 06 shows a focused handle, resize hint, proposed arrow/Home/End keys and a reset affordance. This is an interaction proposal pending feasibility and keyboard testing. |
| `developer workbench file tree and live code preview contextual details` | [Tree Code Viewer by uilayout.contact](https://21st.dev/@uilayout.contact/components/tree-code-viewer), demo 19049 (confidence 0.58); also Tree View 23573 by ddoemonn, described as keyboard navigable. | Hierarchy, disclosure state, a selected file synchronized with its preview, and explicit tree navigation keys. | New page 06 adds an expanded project tree, visible keyboard focus, `↑/↓`, `←/→`, Enter guidance, and a source-backed `App.tsx` preview. Relay's read-only, 80 KiB preview limit stays explicit. |

The two new screens are original Relay compositions, not component imports: [file tree](./evidence/relay5-21st-file-tree.png) and [keyboard-resizable split](./evidence/relay5-21st-split-resize.png), on FigCraft page `06 — 21st.dev applied interaction study` (page ID 2281; frames 2429 and 2430). The App.tsx sample is taken from current Relay source. The file tree and Home/End/double-click resize contract are design concepts and have not been implemented or validated in the running app.

I rejected the `8bit Resizable` demo (13897): its pixel frame conflicts with Relay's Night Gallery visual language. I also rejected `Hairline Terminal` (36612), a pointer-responsive terminal illustration: it would decorate a fake terminal rather than improve Relay's real xterm/ConPTY surface. A marketplace result is useful only where its interaction maps to a Relay task and can be adapted without breaking native behavior.

Two theme searches, `terminal warm plum parchment mint theme` and `dark plum purple theme`, returned no results. That is why the existing Night Gallery/porcelain pairing remains; this pass does not claim 21st improved Relay's visual identity or palette. The current project has `.impeccable/design.json` but no `.21st/design.json`; the MCP reported `contextApplied: false` despite a context object being supplied. Correct project-context wiring is a concrete next opportunity, but I did not guess a file schema and present it as working.

The connected toolset also exposes AI sketch/code generation and theme retrieval. 21st's official MCP guide describes variant sketch generation as using AI credits and separates free catalogue search from paid/limited installs. A project-grounded visual-direction experiment could help with originality after context is accepted, but a generated web sketch would still need to be adapted for Relay's Tauri/xterm boundary. I left that credit-consuming route unused and would treat its output as a proposal, not a drop-in product screen. See [21st's MCP guide](https://docs.21st.dev/mcp) and [21st AI's description of catalog components and themes as structural/token context](https://docs.21st.dev/blog/introducing-21st-ai).

### Desktop software research beyond terminals

- [Blender workspaces](https://docs.blender.org/manual/en/latest/interface/window_system/workspaces.html) treats workspaces as task-shaped arrangements that can preserve specialist context. Relay uses this as a prompt for purposeful project/task layouts rather than one universal dashboard.
- [Windows Terminal panes](https://learn.microsoft.com/en-us/windows/terminal/panes) reinforces familiar pane creation, focus and sizing behavior. Relay retains explicit session ownership and keeps split panes subordinate to the shell.
- [VS Code custom layouts](https://code.visualstudio.com/docs/configure/custom-layout) demonstrates rearrangeable work areas and visibility controls. Relay’s workbench keeps navigational and utility surfaces contextual to avoid shrinking the terminal by default.
- [Figma UI3 design approach](https://www.figma.com/blog/our-approach-to-designing-ui3/) is a reference for balancing information density, workspace hierarchy and visual identity in a professional creative tool.

These sources suggest interaction patterns, not proof of superiority. The comparative board embeds actual Relay 4 and first Relay 5 captures alongside the chosen direction; proposed designs remain hypotheses until task-based review and runtime implementation.

## Relay 4 investigation

Inspected project documentation/release notes, `src/App.tsx`, `src/Workbench.tsx`, `src/AppearanceStudio.tsx`, `src/types.ts`, `src-tauri` terminal, storage and integration modules. Relay 4 is a Tauri 2 + React application using Rust and Windows ConPTY with xterm.js. It is local-first and account-free. Existing functions include PowerShell sessions, tabs/splits, output copy/history treatment, paste review, folders/workspaces, Git/task discovery, process/port observation, bounded read-only file preview, Insert/Run saved actions, optional local integrations, scoped Appearance Studio and session-definition restore into fresh shells. Recovery does not restore old process execution or terminal output, and saved actions are not automatically replayed. Relay 5 must retain these distinctions unless product evidence and owner approval support a change.

## SDS redesign lessons applied

Reviewed `C:\AI\SDS\docs\design\README.md`, `SDS-FigCraft-Native-Handoff.md` and supporting acceptance/parity/cutover records; also inspected the live FigCraft SDS project read-only. Helpful process patterns: native editable components/tokens, a system map, page/flow organization, separate historical refs from approved directions, responsive coverage, evidence/authority labels, acceptance records and an explicit runtime/prototype boundary. The SDS v0.50 critique warned that a cleaner monitor can lose the actual working job. Relay adapts the system discipline while preserving terminal screen area, direct shell input/output and process safety as primary product measures.

## Competitor and standards review

- [Windows Terminal panes](https://learn.microsoft.com/en-us/windows/terminal/panes), [tips and tricks](https://learn.microsoft.com/en-us/windows/terminal/tips-and-tricks), [tab titles](https://learn.microsoft.com/en-us/windows/terminal/tutorials/tab-title), [command-line arguments](https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments): reference for panes, search/keyboard use, tab naming and startup layouts. Keep proven tab/pane conventions; Relay’s richer local workbench needs stronger workspace/session distinction.
- [VS Code integrated terminal basics](https://code.visualstudio.com/docs/terminal/basics): terminal, split, move and link/navigation patterns. Use its established discoverability vocabulary without turning Relay into an IDE sidebar.
- [VS Code accessibility](https://code.visualstudio.com/docs/configure/accessibility/accessibility): terminal accessibility, keyboard navigation and contrast guidance. Desktop screen reader and actual terminal-emulator testing remain necessary.
- [WezTerm workspaces](https://wezterm.org/recipes/workspaces.html) and [multiplexer](https://wezterm.org/mux.html): evidence for workspace/mux concepts and durable session grouping. Relay’s existing recovery boundary differs; do not imply remote or process-persistent mux behavior.
- [Warp tab configs](https://docs.warp.dev/terminal/windows/tab-configs), [vertical tabs](https://docs.warp.dev/terminal/windows/vertical-tabs), [YAML workflows](https://docs.warp.dev/terminal/entry/yaml-workflows): documented alternatives for tab organization and reusable workflows. Useful prompts for discovery and command reuse, but new workflow execution scope requires owner approval.
- [21st MCP documentation](https://docs.21st.dev/mcp): the connected MCP supports metadata search and, separately, source retrieval and generation. This pass used metadata search only; the historical record was internally inconsistent and lacked traceable queries.
- [21st command palette guidance](https://preview.21st.dev/blog/react-command-palette-components): asks whether a palette is justified when a product has fewer than roughly fifteen commands, and recommends recents, grouped actions, source labels and a keyboard/focus contract. This supports keeping Relay's palette as a hypothesis until actual command volume and user task speed are tested. Its example uses `Ctrl+K`; Relay source confirms `Ctrl+Shift+P`, which the concept keeps.
- [21st terminal UI guidance](https://news.21st.dev/blog/terminal-ui-components): warns that decorative React terminal mockups do not replace a real terminal emulator, and calls out selectable command text, real monospace typography, reduced motion and light-theme ANSI contrast. R5 retains the actual xterm/ConPTY shell as the intended implementation surface; the FigCraft terminal is only a screen composition.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): measurable reference. Normal text contrast minimum 4.5:1 (SC 1.4.3); keyboard focus visible (2.4.7) and not obscured (2.4.11); target size minimum (2.5.8) 24×24 CSS px subject to exceptions. The design check uses these as review criteria, not a conformance claim.
- [Microsoft keyboard accessibility](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility) and [Windows accessibility basics](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/accessibility-overview): native desktop keyboard and assistive-technology considerations.

## Initial research record (preserved)

The earlier first-proposal research note claimed the running UI and 21st.dev MCP were unavailable. That limitation applied to the first proposal only and was superseded by the follow-up Relay 4 runtime capture and the 21st.dev MCP exploration logged above. Direct competitor hands-on testing and user testing remain outside this pass; sourced documentation does not establish that a proposed workflow is faster or better.

