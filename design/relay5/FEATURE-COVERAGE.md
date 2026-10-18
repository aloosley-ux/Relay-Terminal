# Relay 5.0 feature coverage and acceptance map

This map prevents existing Relay 4 functionality from disappearing in the redesign. “Concept” means designed only. Detailed state behavior lives in `WORKFLOWS.md`. Product-owner approval and implementation validation are pending.

| Relay 4 capability / evidence | Disposition in 5.0 concept | FigCraft destination | Minimum engineering acceptance |
|---|---|---|---|
| PowerShell 5/7 shell via native ConPTY | Preserve, terminal presentation refined | 02 Terminal Workspace · main and split frames | Uses real configured shell; startup/error feedback; no fake command output; input/output remain selectable and copyable |
| Multiple live sessions and tabs | Preserve; tab is sole live-session switcher | 02 main | Create, activate, rename, reorder/close per product policy; focus returns to active pane; stable tab labels at compact widths |
| Split panes and pane focus | Preserve; clearer active-pane edge and split affordance | 02 split | Split, focus, resize, unsplit; maintain correct working directory/process; prevent pane below usable minimum |
| Command history/result treatment and copy output | Preserve | 02 main; workflow spec | Running/completed/failed result states; clipboard confirmation; long output remains available per existing behavior |
| Multiline/large paste review | Preserve and make risk legible | 05 Paste review | Review before shell input, cancel safely, deliberate confirm; no pasted command executes merely from preview |
| Search terminal output | Preserve; discoverable action | 02, documented workflow | Search match, no-match, wrap/next/previous, cancel and keyboard focus behavior; shortcut conflicts checked |
| Copy last output / all output | Preserve | 02 and feature map | Handles empty output and clipboard failure with feedback; text stays accurate to selected session |
| Workspace/folder persistence and recents | Preserve; separate from session tabs | 02 left workbench; 03 Projects | Add, open, remove, missing path, permission error, path chooser cancel, duplicate and recent ordering states |
| Git branch/working-tree observation | Preserve as local observation | 03 Projects | Unknown/loading/error/clean/changed states; stale values cannot appear as fresh; no invented remote status |
| npm/Cargo task discovery | Preserve; launch surfaced in project context | 03 Projects and Tasks | Real manifest discovery, no task if absent, safe launch into shell; command origin and target session clear |
| Files and bounded text preview | Preserve; read-only boundary explicit | 03 Files | Search/browse/read-only; unsupported/oversized/binary/permission/missing file states; no edit/save affordance |
| Process/port observation | Preserve but clarify owned vs external | 03 Tasks & Processes | Show ownership and source; terminate only Relay-owned task with confirmation; external process remains observe-only |
| Saved actions: Insert and Run | Preserve with explicit distinct verbs | 03 Saved Actions | Insert changes prompt only; Run is explicit and target shell shown; empty/invalid, cancel, failure and success states |
| Local integrations/controllers | Preserve existing optional scope; no new provider assumed | 03 Integrations | Provider absent/unknown/stale/permission denied; validate provenance before supported action; no false positive state |
| Appearance Studio themes and ANSI colors | Preserve and improve preview clarity | 04 Appearance | App and terminal palettes separate; ANSI swatches and readable output; live preview; cancel/revert |
| Scoped appearance: global/workspace/session | Preserve; current scope explicit | 04 Appearance | Apply at selected scope, inheritance and reset clear; persistence matches existing scope model |
| Backdrop, typography, effects | Preserve with reduced-motion consideration | 04 Appearance | Contrast, terminal readability, performance, reduced-motion behavior and opaque text/cursor selection verified |
| Settings: shell/profile/window/accessibility | Preserve | 04 Settings | Shell unavailable/error, profile load failure, safe defaults, screen reader mode, reduced motion and restart-needed state |
| Session definition restore to fresh processes | Preserve; recovery states truthful | 05 Recovery | Missing shell/path, partial restore, failed process start, retry/open-folder; no process or old output replay |
| Terminal-only / native window behavior | Preserve; compact mode reviewed | 02 main; 06 responsive | Native controls, F11 entry/exit, focus/restore, resize, DPI and minimum size verified in runtime |
| Keyboard shortcuts and command palette | Preserve confirmed bindings; proposed broader search | 02 and 05 Palette | Shortcuts do not steal normal terminal input; palette keyboard loop/escape/empty/results/no match; owner review for expanded scope |
| New proposal: workbench grouping | Proposed redesign, requires owner approval | 02–04 | Demonstrate at least 3 core user tasks faster or with fewer errors in comparative test before committing |
| New proposal: searchable cross-area palette | Proposed, requires owner approval | 05 Palette | Results are grouped and source-labelled; activation semantics and command risk are tested; no command runs from selection alone |

## Acceptance status

All rows have a design destination. This is **design coverage, not implementation parity**. Runtime acceptance remains unverified. “Unknown” is intentional where Relay 4 documentation/code does not demonstrate an exact state or the Windows capture endpoint did not expose the app UI.

