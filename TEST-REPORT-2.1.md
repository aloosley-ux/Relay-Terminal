# Relay Terminal 2.1 — native acceptance

Date: **12 October 2026**. Environment: Windows, Tauri/WebView2 and installed Windows PowerShell. The test application used disposable `RELAY_DATA_DIR` profiles and a loopback WebView2 debugging endpoint. These are tests of the packaged release executable, not a browser mock of the backend.

## Results

| Check | Result |
| --- | --- |
| Existing GUI regression | 22 groups passed |
| Project, task, process and file acceptance | 16 groups passed |
| New desktop interaction and layout acceptance | 12 groups passed |
| Rust tests | 6 passed |
| TypeScript and production Vite build | Passed |
| Tauri release and NSIS installer build | Passed |
| Runtime page errors in final GUI suites | None |
| Source whitespace check | Passed |
| Penpot file validation | No errors |

## Behavior exercised

Persistent PowerShell variables, independent sessions, direct keyboard input, command history, Unicode, quoted directories, action Insert versus Run, action editing/reordering/favourites, workspace reuse, intentional session closing, clipboard review, terminal selection/search, palette navigation, Ctrl+C interruption and settings persistence were exercised through the real interface.

The output regression emitted **20,000 lines in 2,908 ms**, retained 601,903 characters within the configured scrollback, and measured **33 ms** for the subsequent GUI response in this run. These are single-machine samples, not performance guarantees.

Task acceptance launched a real Node HTTP server on a disposable loopback port, verified its response, prevented duplicate launch, ran a second successful task concurrently, reported a failed native command, interrupted the server and verified that its port was released. Existing Cortana and RDC service states and process IDs were unchanged. External-controller confirmation was opened and cancelled; malformed controller identifiers were rejected.

Files were browsed, filtered and previewed with Unicode, binary detection and a bounded 128 KB read. Native ConPTY dimensions matched the active pane. Dark/light rendering, text-size changes and native 1366×768 / 1920×1080 resizing were exercised by the original regression suite.

The additional desktop suite verified:

- Split creation from a single real shell.
- Stable pane positions with pointer and Alt+arrow focus.
- Keyboard resizing of the split divider.
- Arrow-key tab navigation with focus retained on the tab strip.
- Palette selection scrolling into view.
- Project folders in the shared navigator.
- No reserved process/file inspector when nothing is selected.
- View access through the collapsed navigator.
- Reduced-motion dialog behavior.
- All four views in both themes at **760×500, 1000×700 and 1400×880**, without horizontal overflow, root scrolling or terminal content covering the status bar.

## Iteration and visual review

The original release passed its regression before changes. During development, native resizing revealed that the moved terminal column retained its intrinsic height and could cover the status bar. Explicit column height constraints fixed the cause; the complete regression was rerun successfully. A transient width overflow during renderer fitting was also corrected.

Native screenshots were inspected for terminal, projects, processes, files and settings, including light and compact rendering. They were compared with the editable Penpot designs. Redundant launcher content, repeated labels and empty inspectors were removed during review rather than treated as harmless screenshot decoration.

## Evidence and reproduction

Machine-readable final results:

- `artifacts/desktop-regression-results.json`
- `artifacts/desktop-acceptance-results.json`
- `artifacts/desktop-interaction-results.json`

Screenshots: `artifacts/desktop-review/`, `artifacts/desktop-regression/` and `artifacts/desktop-acceptance/`.

Build with `rtk proxy powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1`. Launch a fresh disposable native profile using `scripts/launch-v2.ps1 -Profile artifacts/<new-profile>`, then run the desired `desktop-regression.mjs`, `desktop-acceptance.mjs` or `desktop-interactions.mjs` script. Optional first argument selects a debugging port. Use a separate fresh profile for each suite; the clipboard-based suites must run sequentially.

## Boundaries

The standalone packaged application was tested. The NSIS installer was built, but its upgrade run was deliberately stopped by the process guard because the user's separately installed Relay window was running. That window and its live shells were preserved. This is not a claim of clean-machine installation or uninstall validation.

Binaries remain unsigned. PowerShell 7, screen-reader behavior and every full-screen console application were not exercised. Existing fresh-shell restoration, bounded text preview and optional machine-specific integrations retain their documented limits. Historical 2.0 startup and idle measurements in the README were not presented as new 2.1 results.
