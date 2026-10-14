# Relay Terminal 3.0 — Windows validation

13 October 2026. All GUI suites connected to actual packaged Tauri/WebView2 executables through loopback debugging endpoints. Each suite used a dedicated `RELAY_DATA_DIR`, isolated WebView data and owned ConPTY processes. The user's normal settings, running Relay instance and external services were not modified.

| Check | Result |
| --- | --- |
| Rust backend tests | 9 passed |
| Appearance schema, migration, scope precedence and invalid imports | Passed |
| Established native regression | 22 groups passed |
| Project/task/process/file acceptance | 17 groups passed |
| Native keyboard/layout interactions | 12 groups passed |
| Appearance native acceptance | 10 groups passed |
| Targeted system/mixed-palette/scope acceptance | 6 groups passed |
| Theme library/wallpaper/native validation | 4 groups passed |
| Mixed-theme saving, undo, zoom and backdrop controls | 5 groups passed |
| Native restart and scoped appearance identity | Passed |
| Final packaged terminal grid fit | 4 layouts passed |
| TypeScript, production Vite, Tauri release and NSIS build | Passed |
| Final native frontend page errors | None in completed suites |
| Source whitespace and mechanical design detector | Passed; detector returned no findings |
| Penpot validation | No errors; 120 token bindings |

The regression suite exercises actual PowerShell commands, saved actions, quoting/Unicode, independent tabs, close confirmation, cancellation, clipboard review, selection, search, palette, settings and native ConPTY resizing. The final output stress test wrote 20,000 lines in **2,914 ms**, retained bounded 10,000-line scrollback, and answered a UI interaction in **34 ms**.

Acceptance starts an owned local HTTP server, deduplicates its task, runs concurrent successful/failed tasks, reads its logs, interrupts it and verifies its port closes. External Cortana and RDC inventory states and process IDs remain unchanged. RDC was stopped in this environment; its absence is observed rather than treated as a requirement to start it. File tests cover filtering, Unicode, binary detection and 128 KB bounded previews.

Appearance tests prove the same terminal DOM, PowerShell variable and scrollback survive all five theme changes, typography/ANSI edits, split/layout changes and overrides. They cover independent application/terminal themes, custom save/edit/rename/delete/undo, invalid imports, decoded local PNG wallpaper persistence and portable wallpaper roundtrip under the packaged CSP, native rejection of malicious colour/URL/numeric values, reduced motion and native minimisation. Mixed-theme saving retains application mode, deletion/undo preserves appearance, and keyboard/settings zoom starts from the effective custom font size. Restart restores the same tab appearance identity and settings while intentionally creating fresh shell processes.

Layout acceptance covers Terminal, Projects, Processes and Files in dark/light at **760×500**, **1000×700** and **1400×880**. Release captures add **1080×720**, compact Studio, F11 mode and live splits. Repeatedly choosing the already-selected current project is also checked: discovered tasks remain visible.

The final rebuilt executable reran all 10 appearance acceptance groups. A separate geometry check confirms the rendered xterm grid plus padding fits its host in floating, Studio, split and compact layouts. Padding lives on the xterm element so FitAddon accounts for it; hidden layout transitions do not resize ConPTY to a one-row grid.

## Performance

Three warm launches: controls **543 / 399 / 390 ms**, real prompt **1,401 / 1,218 / 1,230 ms**. Medians: **399 ms** and **1,230 ms**. Measurements include CDP observer overhead and 40 ms endpoint sampling; they are not cold-start guarantees.

Windows process-tree samples include Relay, WebView2 and its shell descendants. CPU is percent of **one logical core**, not percent of the entire machine. Private memory is aggregate private bytes; shared working sets should not be interpreted as additional unique memory. Samples last approximately three seconds and do not establish sustained thermal or battery performance.

| Sample | CPU/core | Private MiB | GPU engine utilisation |
| --- | ---: | ---: | ---: |
| Preserved Relay 2.1 binary, one session | 2.58% | 267.72 | 0.016% |
| Relay 3 solid, one session | 0% | 255.85 | 0% |
| Relay 3 wallpaper after opening Studio | 0% | 305.15 | 0% |
| Final ambient gradient with 18 px blur | 5.16% | 347.92 | 1.04% |
| Final minimised window | 0% | 322.86 | 0% |

The active ambient workload explicitly enabled its CSS animation for measurement because Windows foreground-focus restrictions prevent reliable focus ownership through CDP. This measures the actual packaged renderer, but is not evidence of automated physical foreground interaction. The real native minimise control subsequently reported `minimized: true`, CSS `animationPlayState: paused`, and zero sampled CPU/GPU. Inactive windows also pause motion. Memory rows include assets/caches loaded earlier in that sample's profile; differences cannot be assigned solely to the backdrop. Ambient motion remains optional and off by default.

## Review and verification limits

The fresh-context Impeccable reviewer found five material issues. Targeted native checks and recaptures resolved all five; the final **ship** disposition applies to that fix list. The main composition, compact Studio and split layouts retain their original review result. The mechanical detector was run once, with no findings. Vercel guideline review informed native labels, keyboard separators, focus states, reduced motion and conditional loading.

- Native export serialization/schema validation and import roundtrip pass. The **native Save dialog's selection, cancellation and write completion remain unverified**: the Computer Use native pipe was unavailable. The implemented exporter uses a native rfd dialog and validated JSON.
- The NSIS installer was built; **clean-machine installation/uninstallation was not exercised**. Executables are unsigned.
- Frost is a blurred internal backdrop, not Windows desktop acrylic. Native desktop transparency is not implemented.
- PowerShell 7, screen-reader/IME interaction, HDR/multiple GPU systems and exotic full-screen console programs were not exhaustively tested.
- Vite retains its existing large-entry-chunk advisory, mostly React/xterm; Studio is a separate lazy chunk of about 16 KB. No runtime dependency was added.

## Reproduction and artifacts

Build: `rtk proxy powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1`.

Launch a unique profile and free port with `scripts/launch-v2.ps1`; despite its historical name it accepts the new executable. Run `desktop-regression.mjs`, `desktop-acceptance.mjs`, `desktop-interactions.mjs` and the new `appearance-*.mjs` suites. Clipboard suites must run sequentially. `appearance-unit.mjs --seed <profile>` creates a disposable profile with navigation/composer visible for the legacy suites. `measure-effects.ps1` samples only the specified root process and its descendants.

Result JSONs: `artifacts/desktop-*-results.json`, `artifacts/appearance-tests/`. Native screenshots: `artifacts/relay3-release/`. Delivered copies, binaries, reports and SHA-256 manifests are in `Build/Relay-3.0-Evidence/` and `Build/`.
