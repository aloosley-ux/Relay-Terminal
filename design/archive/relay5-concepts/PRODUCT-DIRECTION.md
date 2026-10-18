# Relay 5.0 product direction

**Status:** proposed for review · not approved · not implemented

## Product thesis

Relay should remain a fast, local-first desktop terminal whose shell is the main work surface. The next version should make active work legible and connected to its project without turning the terminal into a dashboard: workspace and recent-folder context sit beside the shell; sessions remain direct tabs; optional developer utilities open when needed and return to the same working context.

The promise is **terminal first, context within reach**. The shell keeps the largest uninterrupted area. Contextual surfaces help users find projects, files, tasks, saved actions, appearance controls and local integrations without replacing the terminal with decorative status cards.

## What the evidence supports

- Relay 4 already combines a real PowerShell/ConPTY terminal with tabs, splits, command-result handling, project/task discovery, file browsing, saved actions, local integrations, scoped appearance and fresh-shell session restoration. These are product capabilities, not visual themes.
- Relay 4 recovery explicitly restores workspace/session definitions into fresh shells and does not restore running processes or previous output. The design preserves that safety boundary and makes it explicit.
- Historical Relay designs explored contextual command surfaces, keyboard-first boundaries and recovery. The R4 recovery design says “reopened in fresh shells” and distinguishes non-restored activity. The new concept uses that clarity and updates the navigation/workbench model instead of copying that layout.
- Windows Terminal and VS Code validate established pane, tab, search, keyboard and accessibility conventions. WezTerm shows a more explicit workspace/multiplexer model. Warp documents vertical tabs and structured workflows. Those patterns are references, not proof that Relay should import their product models.
- The SDS v0.50 retrospective reinforces preservation, task-based design, explicit evidence boundaries, interaction-state coverage, reusable native components and acceptance traceability. The key adaptation is to keep terminal output and direct shell control primary.

## Design decisions

1. **One primary shell, optional workbench.** The terminal remains the largest region; a contextual panel can be opened for projects/files/tasks/actions/integrations. It should not become a permanent dashboard.
2. **Workspace and session are different concepts.** Workspace/folder recents appear in the left navigation. Live shell sessions are switched with a top tab strip; splits belong to one session. This avoids showing the same sessions twice.
3. **Make command intent explicit.** Saved actions expose Insert and Run as separate actions. Dangerous or multiline paste gets a review step. Closing an active process requires an explicit choice.
4. **Preserve user context, not process state.** Recovery says what can be restored and what cannot. It starts fresh shells and offers valid paths/shells; it never implies a process or output was restored.
5. **Make capabilities discoverable by keyboard and by visible controls.** The command palette is searchable and key-labelled, while common actions remain visible. Keyboard shortcuts are taken from Relay 4 source where confirmed.
6. **Treat appearance as a workflow.** App and terminal palettes stay separate; scope and live preview are visible; changes can be saved, imported/exported and reset at their actual scope.
7. **Be honest about optional/local integrations.** Show source, freshness, permission boundary and last check. Unknown/stale data is distinct from successful connection. Control actions require explicit source validation and confirmation.

## Direction requiring owner review

The concept proposes a more integrated project workbench, global command palette search across sessions/files/actions and more explicit process ownership. These may alter product scope and deserve explicit product approval before implementation. The design does not propose cloud accounts, telemetry, remote execution, command replay or automatic startup actions.

## Evaluation hypotheses

Test these with Relay users before approval:

- Switching from recent workspace to a particular live session is faster and less error-prone when workspace and session navigation are separated.
- Users can discover and safely run common project tasks without losing terminal context.
- Showing process ownership and state clarifies which work Relay can interrupt and which processes it can only observe.
- A compact left workbench plus tabs gives a better balance than keeping all utilities in a full-time wide sidebar.
- Scope-first appearance controls reduce accidental global theme changes.

Measure task success, time, wrong-action rate, keyboard-only completion, orientation after returning from workbench utilities, and perceived terminal area. Do not infer success from visual review alone.

