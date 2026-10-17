# Relay Terminal

**A real PowerShell terminal, with the bits I kept wishing were in the same window.**

**Windows · Tauri 2 · Rust/ConPTY · React/TypeScript · xterm.js · v4.0**

Download [Relay Terminal 4.0.0](https://github.com/aloosley-ux/Relay-Terminal/releases/tag/v4.0.0): [Windows installer](https://github.com/aloosley-ux/Relay-Terminal/releases/download/v4.0.0/Relay-Terminal_4.0.0_x64-setup.exe) · [Standalone executable](https://github.com/aloosley-ux/Relay-Terminal/releases/download/v4.0.0/Relay-Terminal_4.0.0_x64.exe) · [SHA-256 checksums](https://github.com/aloosley-ux/Relay-Terminal/releases/download/v4.0.0/SHA256SUMS.txt).

[4.0 release notes](RELEASE-NOTES-4.0.md) · [4.0 validation](TEST-REPORT-4.0.md) · [Command copying](docs/COMMAND-OUTPUT.md) · [Relay 4 Penpot](docs/PENPOT-4.0.md)

The separate [`relay4-identity-refinement` experiment](design/relay4-identity/README.md) refines Relay's Switchline identity while preserving the 4.0 workflows and appearance engine. It is not merged into or installed over stable Relay 4.0. The editable artwork, FigCraft comparison, test report and local build instructions are documented there.

Historical 3.0 evidence: [3.0 release notes](RELEASE-NOTES-3.0.md) · [Native test results](TEST-REPORT-3.0.md) · [Appearance Studio](docs/APPEARANCE-STUDIO.md) · [Editable designs](docs/PENPOT-3.0.md)

![Relay 3 Appearance Studio beside a live Windows PowerShell session](docs/media/relay3-studio.png)

Relay started as a personal replacement for juggling ConEmu tabs, project folders, commands and local development services. Instead of building another dashboard that *looks* like a terminal, it runs actual PowerShell sessions and gives them a workspace.

Relay 3 opens into a floating terminal-first window. Its optional navigator, terminal-only mode and Appearance Studio keep supporting tools close without permanently reserving terminal space. Five themes, independent application/terminal styling and scoped visual overrides update live sessions without restarting their shells. It runs locally without a Relay account or a background service.

> **The idea:** keep the terminal real, make common work easier to reach, and don't run a pile of background services just to draw a UI.

## A look around

| Workspace | What it actually does |
| --- | --- |
| **Terminal** | Multiple real PowerShell sessions, persistent while the app is open; named tabs, side-by-side splits, search, copy/paste, working-directory tracking and saved commands. |
| **Projects** | Browse and pin local folders, discover Node and Cargo tasks, inspect Git branch/tracked changes, and open a project in its own terminal, Explorer or VS Code. |
| **Processes** | Observe Relay-owned tasks, existing local services and listening ports. Interrupt your own tasks; use explicit confirmations for supported external controllers. |
| **Files** | Search directory listings and preview bounded text files without leaving the terminal workspace. |

A command palette, keyboard shortcuts, Appearance Studio, saved actions and workspaces connect the four views. Tasks get named sessions; trying to launch the same running task again brings you back to it instead of quietly starting a duplicate.

**This is a local-first tool.** There is no Relay account, telemetry, model running in the background, subscription or automatic service polling. Commands *you* choose to run can of course access the network, like they would in any terminal.

## What makes it different?

- **An actual shell.** Rust manages Windows ConPTY sessions and xterm.js renders the output. Your commands, environment and child processes are real.
- **No mystery automation.** Saved actions do not execute automatically; multiline paste is reviewed before it can run; live sessions ask before closing.
- **Useful to *my* setup, not just a mock-up.** Relay can read an existing Cortana controller and observe Remote Desktop Commander processes and logs. These are optional, machine-specific integrations — Relay doesn't install or own either system.
- **Quiet when idle.** Discovery runs on navigation or explicit refresh, rather than a permanent repository scanner or daemon.
- **Reproducible evidence.** The release was exercised in the packaged Windows/WebView2 application, not just in browser previews or screenshots.

## Where it stands

**Relay is Windows-focused.** These are its current capabilities and boundaries. The v2.0 performance measurements below are historical samples; the [4.0 test report](TEST-REPORT-4.0.md) records current native acceptance and the remaining verification limits.

| Works today | Still limited / not promised |
| --- | --- |
| Real interactive PowerShell tabs and split panes | Existing shell processes are **not** restored after restarting Relay; restored tabs start fresh shells. |
| Named tasks with output, elapsed time and interruption | Task discovery currently favours Node and Cargo; other projects can use manually entered commands. |
| Local files, projects, settings and actions | The file viewer is bounded plain text, not a full editor or binary viewer. |
| Cortana service actions through an existing local controller | Integrations depend on that controller being installed/configured; RDC lifecycle management is read-only. |
| Windows release EXE and NSIS installer | Isolated-identity install/uninstall passes with the identical payload; clean-machine and installed-product upgrade testing remain unverified. Binaries are unsigned. |
| Windows PowerShell tested end to end | PowerShell 7.6.7 and Windows PowerShell pass 4.0 native tests; Vim, cmd and Git Bash child workflows are exercised. Other applications are not exhaustively tested. |

A custom PowerShell prompt can also disable Relay's current-directory and outcome reporting; the terminal itself still functions.

For details, read [the 4.0 test report](TEST-REPORT-4.0.md) and [release notes](RELEASE-NOTES-4.0.md).

## How it was made

**This was built with AI-assisted software development.** I defined the problem, directed the workflows and iterations, and used AI coding agents to help research, implement, debug and test it. I'm not going to describe every line as hand-written, or pretend prompting a prototype is the same as shipping working software.

The foundations are established tools, not a brand-new terminal engine:

| Layer | What Relay uses |
| --- | --- |
| Desktop application | **Tauri 2** and Windows **WebView2** |
| Native backend | **Rust**, `portable-pty` 0.9, Windows ConPTY and Job Objects |
| Interface | **React 19**, TypeScript, Vite, Lucide icons |
| Terminal view | **xterm.js 6** |
| Shell | Windows PowerShell, or PowerShell 7 when available |
| Testing | Rust tests, scripted GUI/native WebView2 tests and disposable settings profiles |

REA was used **selectively**, including passive inspection of Relay's own compiled WebView and narrow research into an installed ConEmu binary's published strings. That research informed workflows such as tabs and launch tasks; it did **not** supply ConEmu source, artwork or a copied terminal implementation. [Read the technical investigation](REA-FINDINGS.md).

Design and development also drew on public documentation for Windows Terminal/ConPTY, VS Code task discovery, xterm.js, Flow Launcher, Process Compose and Yazi. They're inspirations and references, not bundled proprietary components. The [release notes](RELEASE-NOTES-2.0.md) link to those sources.

**The test evidence matters more than the screenshots.** We caught real bugs in terminal flow control, shell prompts, task handling, resizing and process shutdown by exercising the application. That doesn't mean every workflow has been tested on every PC.

## Measured, not marketed

For the **10 October 2026** v2.0 release run on one Windows PC:

| Measurement | Observed |
| --- | ---: |
| Median warm launch to visible controls | **371 ms** |
| Median warm launch to PowerShell prompt | **1,221 ms** |
| Fresh one-session idle CPU | **0.273% of this machine** over ~10 seconds |
| Fresh aggregate private memory | **277.68 MiB** including descendant processes |
| Original GUI regression groups | **22 passed** |
| New v2.0 GUI acceptance groups | **16 passed** |
| Focused keyboard/error groups | **3 passed** |
| Rust tests | **6 passed** |

Those are **measured samples, not minimum-spec guarantees**. The full Windows WebView2 + PowerShell process tree consumes substantially more memory than the tiny Rust host process alone. [Methodology, caveats and test evidence](TEST-REPORT-2.0.md).

## Run Relay

This repository tracks the **source**, not personal test data or built executables.

On the development machine, the existing release files live under `Build/`:

- `Relay Terminal.exe` — standalone Windows executable.
- `Relay Terminal_4.0.0_x64-setup.exe` — NSIS installer.

Built executables are distributed as assets on the [4.0.0 GitHub release](https://github.com/aloosley-ux/Relay-Terminal/releases/tag/v4.0.0), alongside checksums and validation documentation. They are not stored in Git source history. The release uses versioned filenames; local copies remain under `Build/`, with upload-ready assets under `Build/Release-4.0.0/`.

Relay requires Windows 10 (1809+) or Windows 11 and WebView2. Use PowerShell 7 if installed; Windows PowerShell works too. The builds are currently unsigned.

## Build from source

You need Node.js/npm, Rust with the Windows MSVC toolchain, Visual Studio C++ build tools and WebView2.

```powershell
npm install
powershell -NoProfile -File scripts/build.ps1
```

For development:

```powershell
npm run desktop
```

The build script handles locating the standard Cargo binary directory. No cloud account or API key is required to build Relay.

## Data, permissions and safety

Settings, favourites, saved actions and tab/workspace definitions live at:

`%APPDATA%\com.relay.terminal\settings.json`

Relay does not edit your PowerShell profile to make shell integration work. Closing a live session terminates its contained child-process tree after confirmation. An action or command you explicitly run has the normal permissions of your Windows user; **Relay is not a security sandbox**.

Cortana integration invokes the existing local service controller when configured and selected. RDC remains observational because Relay has no verified local controller for its lifecycle. There is no regular background polling of either service.

Generated builds, logs, machine-specific settings, benchmark profiles and screenshots are excluded from version control.

## What's next?

No fake percentage-complete badge, no grand promises. The obvious next steps are cleaner onboarding away from the original machine, more portable project/task discovery, fuller keyboard/accessibility work, additional shell testing, and clean-PC installer verification.

If those get built and independently tested, this README can change with the evidence.

## Source, license and attribution

This is an **independent personal project**, built openly about its methods. Being visible in a Git repository does not automatically make it open source: **no redistribution license has been selected yet**. Third-party dependencies retain their own licenses.

Relay is not affiliated with ConEmu, Microsoft, ArtCraft or the other projects referenced above. Their product names are used descriptively; no proprietary source or assets have been copied into Relay.

---

*Built because I wanted to use it. Improved by testing what actually happens, not what the UI claims to do.*
