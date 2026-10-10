# Relay 2.0

Relay now connects PowerShell, projects, tasks, processes and files in one desktop workspace. Its existing Rust/ConPTY engine, acknowledged xterm output, shell state, quoted paths, native clipboard, atomic settings and Windows Job Objects remain the foundation.

## What changed

- A compact workspace rail and coherent slate/blue interface, with dark, light and compact layouts.
- Project tools from real `package.json` scripts, package-manager lockfiles and Cargo manifests; Git branch/tracked-change summary; project pinning and external editor/folder actions.
- Named task sessions, duplicate-launch prevention, completion/failure and elapsed time, output inspection and interruption. Arbitrary PowerShell tasks can be launched through a form.
- A searchable process workspace connecting owned sessions, the canonical Cortana registry/controller, read-only RDC observation and IPv4/IPv6 TCP listeners. Local URLs can be copied/opened. Existing service log tails have file dates and bounded reads.
- A real file browser with filtering, binary detection, Unicode text preview and a 128 KB preview ceiling.
- Two live terminal panes, a palette spanning sessions/views/project tasks, and prompt-reported command success.
- An explicit test profile also isolates WebView2 data, allowing acceptance beside an existing Relay instance without sharing its browser lock or settings.

## Discoveries that shaped it

[VS Code's task discovery](https://code.visualstudio.com/docs/debugtest/tasks#_task-autodetection) made project manifests the source of useful commands. [Flow Launcher's implementation](https://github.com/Flow-Launcher/Flow.Launcher) informed keyboard search across work rather than another nested menu. [Process Compose](https://github.com/F1bonacc1/process-compose) informed distinct process ownership, readiness, logs and actions; Relay did not adopt another orchestrator. [Yazi](https://github.com/sxyazi/yazi) reinforced bounded, asynchronous directory loading. [xterm's flow-control guide](https://xtermjs.org/docs/guides/flowcontrol/) confirmed the existing acknowledgement design and shaped output-flood acceptance. [Windows Terminal shell integration](https://learn.microsoft.com/en-us/windows/terminal/tutorials/shell-integration) informed prompt-reported task outcome rather than guessing from rendered text.

Local inspection found seven Cortana services already governed by `Cortana-Service.ps1`, `Cortana-Status.ps1` and `services.json`. The old `:8765` controller was explicitly obsolete. RDC was an existing Node runtime with no verified local lifecycle controller; observing it and its logs preserves its sessions. Status and identity are refreshed by the canonical controller when the user requests an operation.

REA was used selectively for passive inspection of the actual compiled Relay WebView; it established rendered controls and runtime structure, with attach-window limitations. Source repositories supplied the design/technology evidence; no competing application was installed or blindly decompiled.

Visual critique corrected stylesheet precedence, moved observed applications before the longer Cortana list, made historical log timestamps visible, and kept file/path editing independent of async directory results. Acceptance also caught hidden PTY resizing; changing work views now preserves terminal dimensions.
