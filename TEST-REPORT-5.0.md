# Relay Terminal 5.0.0 validation

Validation was run on the packaged Windows release executable and generated NSIS installer on 17 October 2026. App data, WebView2 profile data, installer registration, and install targets for native acceptance tests were isolated under `artifacts/`; the existing Relay 4.0 installation and profile were not used or modified.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Release build | Pass | `npm run release` produced the Windows executable and NSIS installer. |
| Rust tests | Pass | `cargo test --manifest-path src-tauri/Cargo.toml`: 9 passed. |
| Appearance schema and migration | Pass | `scripts/appearance-unit.mjs` verified schema, migration, scope precedence and invalid imports. |
| Packaged native application | Pass | All eight `scripts/release-v4-tests.mjs` suites passed: Windows shell, PowerShell 7, regression, acceptance, interactions, appearance, advanced behavior and captures. |
| Theme and session preservation | Pass | All five established themes retained the same terminal DOM, live shell variable and scrollback; independent app and terminal themes, scoped overrides, Studio editing/import/export, and split-pane operations passed. |
| Output stress | Pass | 20,000 lines exercised; 601,317 characters retained, with the measured GUI response at 43 ms in the successful full run. |
| Windows icon resources | Pass | The executable and NSIS installer associated icons each matched the accepted 32×32 Relay icon at 100% pixel equality. The configured ICO includes 16, 32, 48 and 256 pixel sizes. |
| Windows file metadata | Pass | Product name, version 5.0.0, original filename, internal name, Relay publisher, description and copyright were present in the built executable. |
| 4.0 to 5.0 installer upgrade simulation | Pass | An isolated NSIS 4.0 install was replaced in place by the 5.0 payload under a synthetic identity. The settings file hash stayed unchanged across install, and the installed 5.0 app loaded the retained saved-action fixture. |
| Isolated installer install/uninstall | Pass | The generated installer installed a byte-identical release executable; the isolated uninstaller removed its executable and registration while leaving the test profile intact. |

The upgrade simulation used the archived 4.0 executable as the first payload and the 5.0 release executable as the second payload. Both generated installers used `com.relay.validation.upgrade` and an `artifacts/` install directory, so the test exercised replacement and settings retention without running either installer against the production `com.relay.terminal` registration or its user data.

## Release limits

- The package is unsigned. Windows may show the usual publisher warning until the release is signed.
- The installer uses Tauri's WebView2 download bootstrapper. A machine without the Evergreen WebView2 runtime needs network access during installation.
- Validation covers this Windows host and the exercised workflows; it is not a clean-machine or hardware compatibility certification.
- Optional Cortana controller integration was absent on the test host. The app reported that state without starting or changing external services.
- The experimental `design/relay5/` material remains archived reference material. It was not used to change the shipped interface, themes or functionality.

