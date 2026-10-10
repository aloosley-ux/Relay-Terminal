# Relay Terminal — test report

Tested on 10 October 2026 on Windows build 26200, AMD Ryzen 5 7600X (12 logical processors), WebView2 154.0.4258.62. The app uses Tauri 2.12.2 and portable-pty 0.9.0. Windows PowerShell was available; PowerShell 7 was not installed.

## Actual desktop validation

Tests launched the embedded Windows executable and operated its real WebView2 controls with Playwright over a test-only loopback debugging endpoint. This was not a browser preview, mocked backend or simulated terminal. Copy-output assertions read the Windows clipboard after the GUI operation. Settings tests used an isolated directory in `artifacts`, leaving the normal user settings and existing profiles untouched.

The clean release acceptance pass completed all 22 checks, with no uncaught page errors. Evidence: `artifacts/gui-test-results.json`. The final folder-address refinement was verified separately on the rebuilt executable.

| Area | Verified behaviour |
|---|---|
| Real shell | Direct terminal keyboard input, Enter, persistent variables across commands, actual working-directory changes, ANSI syntax/output colours and Unicode including accents, Greek and Japanese. |
| Streaming / cancellation | Repeated live output from a long-running loop; GUI Interrupt/Ctrl+C stopped it before completion. |
| Tabs / workspaces | Three independent sessions; variables remain in their own tab; clicking a pinned workspace returns to the same shell. Tab closure can be cancelled, or deliberately ends the session. |
| Native process termination | A nested, long-running PowerShell process printed its PID; closing its busy tab through the GUI terminated that PID. `artifacts/child-close-test.json`. |
| Folders | Path entry, searchable discovered folders, favourites, recent paths, opening a new tab in Nostalgia and changing the current tab to Cortana. A regression check confirms an asynchronous folder listing does not overwrite an edited address. |
| Quoting | Action execution in a real folder containing spaces, `café`, an apostrophe, `$` and `;`; path arrived intact and the command ran in the intended persistent session. |
| Saved actions | Add, edit, delete, reorder, favourite, command preview; Insert does not execute; Run executes in the active session and changes to the chosen directory. Busy/partially edited prompts are guarded. |
| Clipboard / history | Native clipboard paste, terminal selection, context-menu Select all, copy shortcut, copy output, Unicode paste, and PowerShell Up-arrow history. Multiline paste review and cancellation. |
| Search / shortcuts | Terminal text search, command palette filtering, tab shortcuts and collapsible tools panel. |
| Git | Actual Git version, repository detection and read-only status/log commands in the existing Nostalgia repository. No repository files were changed. |
| Themes / resize | Dark at 1920×1080; light at 1366×768; font-size controls; terminal dimensions compared with `[Console]::WindowWidth/Height` after resizing. Screenshots were visually inspected. |
| Persistence | Restart restored theme, favourites, edited/favourited action, workspace and three tab folders/names. Fresh shell processes correctly do not retain old variables. `artifacts/restart-test.json`. |

Two focused Rust regression tests passed: PowerShell literal-path quoting/invalid-directory rejection, and distinguishing PSReadLine terminal replies from editable input. TypeScript checking, frontend production build, native release compilation and NSIS packaging passed.

## Measurements

| Measurement | Actual result |
|---|---|
| Process launch → visible controls | 369 / 360 / 358 ms; median **360 ms** |
| Process launch → rendered PowerShell prompt | 1221 / 1189 / 1186 ms; median **1189 ms** |
| Fresh one-session idle CPU | **0.260% of the machine** over 10 seconds (3.124% of one logical core) |
| Fresh aggregate private memory / working set | **279.90 / 503.92 MiB**, including app, WebView2, conhost and PowerShell |
| Native Relay process alone, fresh | **5.37 MiB private**, 25.43 MiB working set; CPU time delta 0 during the sample |
| Three sessions after substantial output, idle CPU | **0.195% of the machine** over 10.01 seconds |
| Three-session aggregate private memory / working set | **539.89 / 833.17 MiB** |
| 20,000 output lines | **2907 ms** through real PowerShell to completion/rendered end marker; about 602,000 characters retained within the 10,000-line buffer |
| Tools-panel response after that output | **26 ms** in the acceptance test |
| Portable executable / installer | Approximately **8.85 / 2.08 MiB** |

Startup numbers are three consecutive warm-filesystem launches, not cold-boot measurements. A 40 ms debugging-endpoint sample and Playwright attachment are included in the measured time. Idle figures sum the app's observed descendant process tree; working sets can double-count shared pages. WebView2 and shell processes account for most memory. Cursor blinking remained enabled. The debugging observer was present for testing. These are observations on this machine, not universal performance guarantees. Raw results are in `artifacts/startup-metrics.json`, `idle-fresh.json`, and `idle-metrics.json`.

## Screenshots

- `artifacts/screenshots/relay-dark-1920x1080.png` — real Git status/log output with the workspace panel.
- `artifacts/screenshots/relay-light-1366x768.png` — light theme with actions.
- `artifacts/screenshots/relay-folder-browser.png` — searchable folder browser.
- The `dark-1920x1080.png` / `light-1366x768.png` images preserve the output/resize stress-test state.

## Known limitations

- PowerShell 7 selection is implemented but could not be runtime-tested because it was absent. Existing-profile loading and arbitrary full-screen console applications were not exhaustively tested.
- Closing the app restores folders and names with new shells. It cannot resurrect running processes or variables after restart.
- Automatic project discovery uses the app's nearby `AI` ancestor and remembered roots. Other locations, including after installation elsewhere, are available through the folder browser and can be pinned. There is no recursive whole-drive index.
- Saved actions intentionally accept one line of PowerShell; use semicolons for multiple statements. GUI actions require an empty ready prompt; Ctrl+C resets an edited prompt. Filesystem browsing is bounded to 2,000 immediate subdirectories per view.
- The native drag/drop handler and PowerShell quoting are implemented; a real Explorer-to-terminal drag gesture was not automated. The native folder picker and external Explorer/VS Code launch controls were not part of the full GUI pass. VS Code must be installed in a standard supported location; errors are shown if unavailable.
- The installer was built and verified by Tauri/NSIS; a system-wide installation/uninstallation cycle was not performed. The executable itself was run and tested. Both builds are unsigned and require WebView2.
- Directory/readiness integration uses a session-only prompt hook. Redefining `prompt` inside a shell can disable that integration; ordinary terminal input/output continues to work.

No ConEmu files, PowerShell profiles, existing working-tree files, Cortana services, autostart settings or system security settings were changed. The Rust toolchain was installed at the user's explicit direction. Normal application launch has no debugging listener, cloud dependency or background service.
