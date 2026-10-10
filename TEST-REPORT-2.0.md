# Relay 2.0 release verification

Verified on this Windows machine on 10 October 2026, using the compiled release executable and its actual native WebView2 window. Tests used explicit isolated settings and browser-data directories. The installed Relay instance, Cortana services and RDC sessions were preserved.

## Acceptance

- **22 original GUI regression groups passed**, with zero page errors: persistent shell variables, direct typing, actions, quoting, independent tabs, streaming/interruption, folders, Git, clipboard, Unicode/history, search, multiline-paste review, bounded scrollback, themes, native resizing and persistence.
- **16 new GUI acceptance groups passed**, with zero page errors: real project manifest discovery, pinning, an actual Node HTTP server in a contained PTY, duplicate-launch prevention, owned listening-port identification, canonical service status/control review and cancellation, existing logs, concurrent successful/failed tasks, GUI server interruption, unchanged external service IDs/states, file previews/filtering, live split panes, palette navigation, arbitrary named task launch and compact/light/dark rendering.
- **3 focused keyboard/error groups passed**: split shortcut/pointer/tab switching, palette search by exact task command and execution, and invalid file paths preserving the entered address.
- **6 Rust tests passed**: PowerShell quoting/readiness reply handling, script-key quoting, service identifier/registry validation, trusted log selection and bounded log tails.
- Restart restored theme, saved/favourited actions, folders, workspaces and three tab names/directories with fresh shell state.
- A real nested PowerShell child was launched, its busy tab closed through the GUI, and its PID verified absent. Windows Job containment remains effective.
- A one-million-line real PowerShell pipeline was interrupted through the GUI while output streamed. Hidden PTY dimensions remained unchanged when navigating work views.
- TypeScript checking, Vite production build, Rust release compilation and NSIS packaging passed.

Tests use generated fixtures under `artifacts`, including a folder with spaces, Unicode, an apostrophe, dollar sign and semicolon. External services were observed and service confirmations cancelled; no actual Cortana start/stop/restart was issued. Their existing canonical controllers perform lifecycle operations when explicitly selected by the application user. RDC lifecycle controls are deliberately unavailable because no verified controller was found.

## Measurements

| Measurement | Result |
|---|---|
| Launch to visible controls, three warm runs | 385 / 371 / 370 ms; median **371 ms** |
| Launch to rendered PowerShell prompt | 1229 / 1221 / 1211 ms; median **1221 ms** |
| Fresh one-session idle CPU, 10.02 seconds | **0.273% of the machine**, 3.276% of one logical core |
| Fresh aggregate private / working-set memory | **277.68 / 506.86 MiB** |
| Fresh native Relay alone | **5.37 MiB private**, 25.59 MiB working set; zero CPU-time delta in sample |
| Six-session idle after acceptance/output stress | **0.494% of the machine**; 711.61 MiB aggregate private memory |
| Native Relay alone after that work | **7.34 MiB private**; zero CPU-time delta in sample |
| 20,000 real PowerShell output lines | **2918 ms**; bounded 10,000-line buffer, 601,903 retained characters |
| GUI response after that output | **34 ms** |
| Open process view during output flood | **70 ms** |
| GUI interruption to ready prompt during flood | **72 ms** |
| Tab switch in stress check | **32 ms** |
| Portable executable / NSIS installer | **9,746,944 / 2,283,191 bytes** |

These are observations on this machine, not cold-boot guarantees. Startup includes 40 ms endpoint sampling and CDP attachment. Idle totals cover each observed descendant process tree; working sets may count shared pages more than once. WebView2, cursor blinking and PowerShell account for most of the aggregate footprint. The six-session sample follows large-output tests, directory previews and service discovery. The final warm startup runs began after the shipping acceptance window closed; a separate restart check overlapped the final idle sample. Discovery is on demand; Relay adds no persistent indexer or process poller.

## Evidence and reproduction

Raw results: `artifacts/v2-regression-results.json`, `v2-acceptance.json`, `v2-focus-acceptance.json`, `restart-test.json`, `child-close-test.json`, `v2-startup-metrics.json`, `v2-idle-fresh.json`, `v2-idle-multi.json`, `v2-stress-metrics.json` and `v2-rea-runtime.json`.

Native screenshots were visually reviewed: `relay-2-terminal.png`, `relay-2-projects.png`, `relay-2-files.png`, `relay-2-cortana.png`, `relay-2-processes.png` plus `v2-projects-light.png` and `v2-compact-light.png` under `artifacts/screenshots`. REA passively observed the compiled WebView; its evidence explicitly does not bind a binary digest or recover pre-attachment activity. Packaging independently verifies the tested executable's SHA-256.

Use `scripts/launch-v2.ps1 -Profile artifacts\your-fresh-test-profile` to launch an isolated desktop acceptance instance on port 9225. Then run `scripts/accept-v2.mjs`, `focus-v2.mjs` and `stress-v2.mjs` with Node. Close only that test window using `scripts/close-test.mjs`. `scripts/gui-release-regression-v2.mjs` expects its dedicated fresh `artifacts/v2-final-regression-profile`. `scripts/benchmark-v2.mjs` launches and closes three isolated benchmark windows. Normal application launch enables no debugging endpoint.

## Limits

- The installer was built; a system installation/uninstallation cycle was not performed while the user's installed Relay was running. Deliverables are unsigned and require WebView2.
- PowerShell 7 is detected/preferred if installed; it was absent here, so runtime acceptance used Windows PowerShell. Arbitrary full-screen console applications were not exhaustively tested.
- Node scripts and Cargo tasks are discovered automatically. Python projects are identified, with arbitrary commands available through Run a task. Package managers must already be installed.
- Restored tabs are fresh shells. Running tasks, variables and in-memory task history do not survive app exit; no task automatically runs on restart.
- File previews are bounded plain text, with binary detection; UTF-16 files containing zero bytes may be classified as binary. Known service logs have separate UTF-16 decoding. File listings cap at 2,000 entries; Git summaries omit untracked-file scanning.
- TCP listener discovery is a snapshot, using this Windows installation's `netstat` output; a listening port is not an application health guarantee. RDC process presence does not establish remote connectivity.
- Native folder picking and Explorer/VS Code launch controls remain available; they were not exhaustively automated in this pass. Historical Cortana log files are shown with modification dates.
- Redefining PowerShell's prompt can disable directory/outcome integration while ordinary PTY interaction continues.
