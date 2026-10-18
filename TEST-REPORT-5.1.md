# Relay Terminal 5.1.0 validation

Validation used the packaged Windows x64 build, Microsoft WebView2, and fresh test profiles under `artifacts/appearance-studio-5.1-*`. The installed Relay profile was not used. Native tests ran through the test-window router on the designated VS Code monitor. Validation date: 18 October 2026.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Frontend typecheck and production build | Pass | `npm run build`, including TypeScript project checks and Vite production bundle. |
| Windows release build | Pass | `npm run release` generated `src-tauri/target/release/relay-terminal.exe` and the x64 NSIS installer. |
| Rust tests | Pass | `cargo test --manifest-path src-tauri/Cargo.toml`: 10 passed. |
| Appearance schema and migration | Pass | `node scripts/appearance-unit.mjs`: schema, migration, precedence, Follow Windows, independent palettes, wallpaper position, tab identity and invalid imports. |
| Packaged native Appearance Studio | Pass | `node scripts/appearance-studio-native.mjs 9237`: built-ins, independent selectors, live Windows preference, all ANSI roles and HEX editing, typography/cursor, all background modes, wallpaper positioning, ambient motion, custom-theme lifecycle, import errors, scope inheritance, contextual tab editing, split-session targeting, compact layout, and no WebView page errors. |
| Packaged desktop regression suites | Pass | `node scripts/release-v4-tests.mjs src-tauri/target/release/relay-terminal.exe`: all 8 suites passed, including native shells, session/pane interactions, workspaces, accessibility, terminal search, settings persistence and screenshots. The appearance suite now runs the 5.1 Studio acceptance script. 20,000-line output retained 601,317 characters; measured GUI response was 43 ms. |
| Running shell continuity | Pass | A PowerShell variable and output survived Studio edits; the split-session test edited the selected terminal without recreating either shell. |
| Native visual review | Pass | Packaged screenshots captured at 1080 × 720 and 760 × 500 in `docs/media/appearance-studio-5.1.png` and `artifacts/appearance-tests/`. The ANSI layout was refined after screenshot review so the specimen remains pinned above an unclipped full-width role editor. |
| Windows executable and installer | Pass | Tauri 2 x64 standalone executable and NSIS installer built. `scripts/package-v5.ps1` verified both embedded icons against the approved Relay icon at pixel match 1.0 and created SHA-256 checksums in `Build/Release-5.1.0/`. |
| NSIS install/uninstall | Pass | `scripts/installer-smoke-v5.ps1` compiled an isolated `Relay Studio Validation` installer, installed a byte-identical executable, then uninstalled it. It used a synthetic bundle ID and did not touch the normal Relay identity or profile. |

## Release limits

- The executable and installer are unsigned. Windows may show its normal publisher warning.
- The NSIS bundle uses the WebView2 Evergreen bootstrapper; a clean machine without WebView2 requires network access during installation.
- Validation covers the exercised workflows on this Windows host. It is not clean-machine, cross-version or hardware compatibility certification.
- The public [GitHub 5.1.0 release](https://github.com/aloosley-ux/Relay-Terminal/releases/tag/v5.1.0) is published with the standalone executable, NSIS installer, release metadata and SHA-256 manifest.
- Vite reports the main JavaScript chunk above 500 kB (713 kB minified); production build succeeds. This is a performance follow-up, not a failed validation.
- The composition event regression check is synthetic; physical IME hardware was not independently verified.
