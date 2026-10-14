# Relay Terminal 4.0

14 October 2026

- Copy an executed command or its result independently. Right-click terminal content for contextual actions; use Ctrl+Shift+O for the last completed result.
- Copy selected text and all retained output with clear labels. Ctrl+C copies a selection and otherwise interrupts. Multiline paste review remains intact.
- PowerShell integration tracks accepted commands, including multiline input and history recall. Wrapped output preserves spaces; clipboard text excludes ANSI styling. Large results are bounded, with explicit truncation feedback.
- Remove the idle Ready label and dot. Status reports starting, running, ended or error only when relevant.
- Restore tab names, folders, shell choices, active tab and split layout in fresh processes. Flush layout on close and recover gracefully from missing folders/shells. No command runs automatically on recovery.
- Preserve custom profile prompts, add screen-reader support in Settings, guard composition input from global shortcuts, and provide keyboard navigation for the terminal context menu.
- Fix Ctrl+C at an idle prompt leaving the UI busy, and readiness racing ahead of rendered output.

The Tauri/ConPTY process containment, existing task/workspace/file tools and Appearance Studio remain in place. No runtime dependency or background service was added.

See [copy behaviour and limits](docs/COMMAND-OUTPUT.md), [research](docs/RESEARCH-4.0.md), [Penpot designs](docs/PENPOT-4.0.md) and [validation](TEST-REPORT-4.0.md).

Known constraints: recovery creates new shells and does not restore old output; nested interactive shells may lack command boundaries; clipboard results represent rendered text, not raw output streams; Frost is an internal backdrop, not desktop acrylic; binaries remain unsigned. Native Save dialog interactions and physical IME/screen-reader operation are not claimed as verified.
