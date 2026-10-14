# Relay Terminal 4.0 — validation

14 October 2026. Tests exercised packaged Tauri/WebView2 windows, native ConPTY shells and the Windows clipboard. Each release suite used its own settings/WebView profile. Clipboard suites ran sequentially. No cloud CI was used.

| Check | Result |
| --- | --- |
| TypeScript/Vite production build, Rust release and NSIS installer | Passed |
| Rust backend suite | 9 passed |
| Command copying, Windows PowerShell | 11 checks passed |
| Command copying, portable PowerShell 7.6.7 | 11 checks passed |
| Established terminal/workspace regression | 22 groups passed |
| Project/task/process/file acceptance | 17 groups passed |
| Keyboard, splits and responsive layouts | 12 groups passed |
| Appearance Studio native acceptance | 10 groups passed |
| Advanced command/native application checks | 9 groups passed |
| Restart recovery | Passed |
| Context menu at 1080×720 and 760×500 | Passed |
| Appearance schema/migration/import validation | Passed |
| Isolated-identity NSIS install/uninstall | Passed; payload hash checked |
| Source whitespace and scoped design detector | Passed |
| Scoped visual review of menu, recovery notice and idle status | Ship; no material findings |

Command tests cover separately copying command/output, older-command right-click, last-output shortcuts, all retained output, multiline accepted input, Unicode, ANSI, no-final-newline output, spaces across soft wraps, 12,000-line truncation and input after stress. Menu tests exercise Home/End/Escape and focus return. Additional native checks exercise `cmd /c`, Git Bash child output, actual Vim input/exit and recovery to PowerShell. Screen-reader mode exposes xterm's accessibility tree. Synthetic composition events bypass global shortcuts.

The established stress regression produced 20,000 lines in **2,918 ms**, retained **601,303 characters**, and responded to the measured GUI interaction in **30 ms** on this machine. These are single-run observations, not cross-device performance guarantees. Existing task tests started an owned HTTP server, verified its response, interrupted it and confirmed port release. External Cortana/RDC processes and service state remained unchanged.

Recovery checks started Windows PowerShell and PowerShell 7 in separate panes, preserved the active tab and 42% divider position, renamed a tab immediately before closing, and restarted from saved settings. The restarted shell had a different PID and no old sentinel variable. Missing saved directory/shell tests recovered to the home folder and available automatic shell. No live-process or transcript restoration is claimed.

## Packaging validation scope

The generated NSIS source was compiled with a separate validation product/binary identity. The application payload was byte-identical to the built release at that validation point. Installation and uninstallation returned zero, installed payload hashes matched, and uninstall removed its payload and registration while preserving the test profile. Existing personal Relay installation and settings were not removed. This is not a clean-machine, WebView2 bootstrap-install, or in-place upgrade certification. The distributed installer retains the real Relay identity. Builds remain unsigned.

## Corrections found during testing

- Removed a readiness race: frontend Ready state now follows xterm's parsed output rather than a backend event that can arrive before rendering.
- Ctrl+C at an idle prompt no longer leaves session state busy.
- Wrapped-line copying preserves spaces where a soft wrap occurs.
- Context menu tests were updated for proper `menuitem` semantics and readiness tests use state attributes instead of the removed Ready text.
- An incomplete command whose closing integration marker disappears is not falsely finalized by the next command's start marker. The final build includes this conservative fallback.

## Remaining limits

- Native theme Save-dialog selection/cancellation and physical IME/spoken screen-reader workflows remain unverified. The Windows Computer Use native pipe was unavailable. Export schema validation, import roundtrip, keyboard navigation, accessibility-tree activation and synthetic composition checks passed; these do not substitute for those physical workflows.
- Frost remains a blurred internal backdrop, not desktop acrylic. Existing reduced-motion/minimisation behaviour passes.
- Shell integration is automatic for PowerShell. Nested interactive/remote shells and replacement prompt/readline functions may lack boundaries; selection and copy-all remain available.
- Bounded rendered text is copied, not raw stdout/stderr. Full-screen and scrollback limits are explained in [Command output](docs/COMMAND-OUTPUT.md).
- Vite reports the existing large React/xterm entry-chunk advisory. Appearance Studio remains lazy-loaded; no new runtime dependency was added.

## Reproduction and evidence

- Build: `rtk proxy powershell -NoProfile -File scripts/build.ps1`
- Rust: `rtk proxy powershell -NoProfile -File scripts/rust-test.ps1`
- Portable test shell: `rtk proxy powershell -NoProfile -File scripts/get-test-pwsh.ps1`
- Native suites: `rtk proxy node scripts/release-v4-tests.mjs`
- Recovery: `rtk proxy node scripts/recovery-native.mjs`
- Packaging: `scripts/installer-smoke.ps1`, followed by closing the validation process and `scripts/installer-uninstall.ps1`.

Machine-local JSON/screenshots are in `artifacts/relay4/`, with established suite reports in `artifacts/desktop-*-results.json` and `artifacts/appearance-tests/`. Delivered evidence is copied to `Build/Relay-4.0-Evidence/`. Executables, personal profiles and large downloaded test dependencies are excluded from source control. Penpot references and the editable SVG are committed.
