# Relay 4.0 identity experiment · verification

**Branch:** `relay4-identity-refinement`  
**Build:** Tauri Windows release, separate product identity `com.relay.terminal.identity-refinement`  
**Executable:** `Relay-Identity-Experiment.exe`  
**Installer:** NSIS installer built for review; not installed.

## Results

| Verification | Result | Coverage |
|---|---:|---|
| Rust unit suite (`scripts/rust-test.ps1`) | 9 passed | Rust core tests |
| Release regression (`--only regression`) | 22 groups passed | Real keyboard input, shell action safety, session isolation, close/cancel handling, workspace search, clipboard, command palette, output stress, scrollback and persistence |
| Appearance (`--only appearance`) | 10 passed | Five themes, independent application and terminal colors, typography, ANSI, cursor, motion settings, import/export, overrides, compact settings and JS errors |
| Interactions (`--only interactions`) | 12 passed | Splits, keyboard navigation, palette, collapsed navigator, reduced motion, dark/light layouts at 760/1000/1400 px |
| Acceptance (`--only acceptance`) | 17 passed | Task server behavior, ownership/deduplication/interruption, process and service continuity, folder browsing, two ConPTY panes and commands |
| Advanced (`--only advanced`) | 9 passed | Ctrl+C, multiline input, older output context menu, CMD/Git Bash, Vim, screen reader tree, IME and copy-all fallback |
| Native capture checks (`--only captures`) | passed | Context menu capture and compact viewport containment |
| PowerShell commands (`--only command-pwsh`) | 11 passed | Soft wrapping, ANSI, Unicode, copy-last shortcut, output stress/scrollback and responsive state |
| Windows command paths (`--only command-windows`) | 11 passed | Windows shell command behavior and wrapping |
| Windows release build | passed | Frontend and Rust build; separate NSIS package generated |

The large-output regression wrote 601,303 characters in 3,408 ms and measured a 48 ms UI response. Appearance and interaction checks reported no JavaScript errors. Tests ran against the isolated executable and test profiles.

## Visual evidence

Native captures were taken in the Windows app at 1080×720 and 760×500. The 1080×720 live comparison is embedded in the editable FigCraft board and exported as `design/relay4-identity/evidence/before-after-live-1080x720.png`. Compact evidence includes both navigator overlay states. The compact open navigator is an intentional overlay; its collapsed state shows the full terminal prompt and active tab.

## Limits and outstanding items

- An initial all-in-one release-runner attempt encountered a stale clipboard value in one Windows soft-wrap assertion after earlier command-window checks. The Windows command suite was rerun on its own and all 11 checks passed. All requested suites above were subsequently run individually; no product failure reproduced.
- The frontend build still reports Vite's existing large-chunk warning (about 707 kB minified); no dependency was added by this refinement.
- The run measured large-output response but did not produce a dedicated memory or DPI-scaling profile. Existing UI tests covered native 1366×768 and 1920×1080 layouts; high-DPI behavior was not separately profiled.
- One temporary empty PowerShell tab created in the stable Relay window during baseline inspection remains open. The app's close prompt warned that a live shell might own background processes, so it was left running; no command was entered in that stable tab. The stable installation itself was not modified.
- The experimental NSIS installer was built but not installed. No merge to the stable branch has occurred.
