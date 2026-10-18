# Relay 5.0 workflows and behavior specification

All screens are proposed and unimplemented. Use this as a behavior checklist with the FigCraft compositions; it supplements the prototype links rather than claiming the prototype covers every branch.

## Start, restore and navigate

1. On launch, load the last workspace/session definitions and validate paths and configured shells.
2. Show ready sessions as live tabs. Recovery copy states that each terminal is a fresh shell; prior processes and output did not resume.
3. For missing shell/path or a failed shell start, identify the failing item and offer retry, choose a valid path/shell or remove it from this restore. Preserve other sessions that started successfully.
4. Workspaces and recent folders are distinct from live session tabs. Opening a workspace should not silently replace or close another session.
5. New session: choose configured shell/profile, show starting state, then focus its prompt. If launch fails, leave existing sessions untouched and make retry/configuration available.
6. Rename, move, close: preserve a stable current tab indicator and return focus to a valid remaining pane. If the last tab closes, show the designed empty/new-session state.

## Run shell work

- A command moves through ready → running → completed or failed. Show the actual process result and elapsed/exit state only when known. Long-running output should continue to stream without making surrounding controls jump.
- Copy last output/copy all output reports success or clipboard failure. Empty output yields a quiet explanatory state.
- Find-in-output supports query, next/previous match, match count if available, no match, escape/cancel and return-to-terminal focus. `Ctrl+Shift+F` is a source-confirmed shortcut; verify WebView and shell conflict behavior.
- Multiline/large paste displays a review with the exact clipboard contents and the reason for review. Cancel returns to the unchanged prompt. Confirm inserts/submits only according to existing Relay paste semantics; preview itself never executes.
- Active-process close warns that the process may be interrupted; Continue returns to terminal, Close confirms the action. Dismiss/escape has no side effect.

## Sessions and splits

- Session tabs identify shell/profile and may show activity without relying on color alone.
- Split creates a second shell pane in the current session and moves focus to the new pane only after it is ready. If creation fails, preserve the original pane and explain.
- Pane focus is keyboard reachable and visually explicit. Resize handles expose keyboard alternatives. Unsplit asks which pane to keep if closing it would discard an active process, then restores remaining pane geometry.
- On narrow windows, do not allow two unusably small panes. Fall back to single pane and offer a clear reason.

## Projects, files and tasks

- Choose/add workspace via native folder picker; cancel is neutral. Validate path and show loading, empty/no project metadata, Git clean/changed, Git unknown/error and task-discovery outcomes.
- Task launch identifies the project, exact discovered task and target/new shell. Launch creates a real process; it must not use a fabricated success toast. On start failure, show the failure and preserve the shell/tab.
- Files: browse/search locally; selection opens a bounded read-only preview. Show loading, no match, unsupported binary, too-large, deleted/missing and permission-denied states. Do not imply file editing or save.
- Processes: distinguish Relay-owned tasks from observed external processes, identify source/freshness and available actions. Termination is available only for a process Relay owns and requires confirmation. External processes remain observe-only.
- Ports/integration observations can be stale or unavailable. Show source and last update. Avoid a green “healthy” state where the controller did not confirm it.

## Saved actions and integrations

- Saved action picker shows description, command source and target context. `Insert` places text at the prompt and leaves execution to the user. `Run` has an explicit verb and confirm affordance if configured as consequential. Cancellation changes nothing.
- Empty list, malformed action, missing placeholders, unsupported shell, launch failure and success have explicit feedback.
- Integrations show provider/controller, permission boundary, last check and state: Unknown, Checking, Ready, Stale, Permission required, Unavailable, Error. User validates a specific source before any supported controller action. No auto-inference of success and no new provider presumed.

## Appearance and settings

- Opening Appearance does not restart shell. Preview updates live and identifies the active scope (session/workspace/global). Cancel/revert restores the previous appearance. Save copy/import/export operate on themes; parse/import failure leaves the current theme intact.
- Application chrome and terminal palette are independently selectable. Preview ANSI foreground/background, selection, cursor, prompt and long output; check all common color combinations.
- Scope inheritance shows where a value comes from. Reset names the affected scope before applying.
- Typography, backdrop and effects respect readability and reduced-motion setting. Backdrop never reduces contrast of terminal text/cursor/selection.
- Settings: shell/profile change shows if restart is needed; missing profile and failed shell are recoverable. Screen-reader mode must retain names, order and state; reduced motion disables ambient movement but not useful state feedback.

## Command palette and keyboard

- Open with source-confirmed `Ctrl+Shift+P`; focus search. Up/down moves result selection, Enter opens a safe destination or stages a command, Escape restores prior focus, and no-match is clear. Do not execute consequential actions solely by highlighting a result.
- Results (the broader cross-area search is proposed) have type/source labels and distinct activation semantics. Test collisions with PowerShell input and Windows/WebView accelerators.
- Global keyboard order has visible focus. Session tabs, navigation, split controls, search results and dialogs are operable without a pointer. Escape closes the topmost transient surface without discarding an unconfirmed action.

## State matrix

For every async/project/controller surface, specify these as applicable:

| State | User-facing behavior |
|---|---|
| Loading | Name the operation; keep existing working shell usable; avoid false zero/empty results |
| Empty | Explain why there is no content and give a useful next action where appropriate |
| Success | Confirm only the operation actually completed; preserve selected context |
| Error | Identify scope/source and practical recovery; avoid hiding shell output |
| Stale/Unknown | Show uncertainty and timestamp/source, not success color |
| Conflict | Explain what would be replaced/closed and offer a safe cancel path |
| Cancel | Leave data/processes/context unchanged unless cancellation itself can fail |
| Recovery | Keep successfully restored/working items; retry or route around only the failed item |

