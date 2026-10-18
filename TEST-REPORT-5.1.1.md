# Relay Terminal 5.1.1 validation

Validation used the packaged Windows x64 build, Microsoft WebView2, and fresh profiles under `artifacts/appearance-studio-5.1.1-*`. The installed Relay profile was not used. Native tests ran through the test-window router on the designated VS Code monitor. Validation date: 18 October 2026.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Frontend typecheck and production build | Pass | `npm run build`; TypeScript and Vite production bundle succeed. |
| Windows release build | Pass | `npm run release` generated the Relay 5.1.1 x64 executable and NSIS installer. |
| Rust tests | Pass | `cargo test --manifest-path src-tauri/Cargo.toml`: 10 passed. |
| Appearance schema/migration | Pass | `node scripts/appearance-unit.mjs` passes migration, scope precedence, Follow Windows, independent palettes, wallpaper positioning, tab identity and invalid import checks. |
| Packaged native Studio and scope handoff | Pass | `node scripts/appearance-studio-native.mjs 9237` covers custom themes, all colour/ANSI roles, typography, backgrounds, scope changes, workspace quick/full Studio with an overriding session, restoring workspace inheritance, session-targeted tabs and split terminals, compact layout and no WebView errors. |
| Packaged desktop regressions | Pass | `node scripts/release-v4-tests.mjs src-tauri/target/release/relay-terminal.exe`: all 8 suites pass. 20,000-line output retained 601,317 characters; measured GUI response was 44 ms. |
| Running shell continuity | Pass | Existing PowerShell variables and output survive both Studio and contextual changes; split panes continue running independently. |
| Native visual review | Pass | 1080 × 720 and 760 × 500 packaged screenshots are in `docs/media/appearance-studio-5.1.png` and `artifacts/appearance-tests/`. |
| Windows executable and installer | Pass | Tauri 2 x64 standalone executable and NSIS installer built. `scripts/package-v5.ps1` verifies both embedded Switchline icons and writes the SHA-256 manifest and release metadata to `Build/Release-5.1.1/`. |
| NSIS install/uninstall | Pass | `scripts/installer-smoke-v5.ps1` compiled an isolated `Relay Studio Validation` installer, installed a byte-identical executable and uninstalled it under a synthetic bundle ID; it did not touch the normal Relay identity or profile. |

## Release limits

- The executable and installer are unsigned. Windows may show its normal publisher warning.
- The NSIS bundle uses the WebView2 Evergreen bootstrapper; a clean machine without WebView2 requires network access.
- Validation covers the exercised workflows on this Windows host, not clean-machine or hardware compatibility certification.
- Vite warns that the main JavaScript chunk is 713 kB minified; the production build succeeds.
- The composition event regression is synthetic; physical IME hardware was not independently verified.

## Published release

Relay Terminal 5.1.1 is published at [GitHub Releases](https://github.com/aloosley-ux/Relay-Terminal/releases/tag/v5.1.1). The release includes the Windows x64 standalone executable, NSIS installer, `SHA256SUMS.txt`, and `RELEASE-METADATA.json`.
