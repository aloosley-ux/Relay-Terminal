# Relay Terminal 2.1

Relay has a new desktop interface, with its existing real PowerShell sessions, local tasks and service controls preserved.

- One left navigator replaces the broad view rail and right tools panel.
- Project folders occupy the same navigator; pinned folders are no longer repeated in recents.
- Compact session tabs and folder controls keep the shell close to its commands.
- File and process inspectors appear when an item is selected.
- Dark and light themes use a consistent graphite/violet system, Windows typography and a matching Windows icon.
- View slogans, scattered instructions, repeated running badges and decorative empty states have been removed.
- Splitting a single session creates a second shell. Pane focus keeps positions stable; Alt+Left/Right moves focus, and the divider supports pointer and keyboard resizing.
- Arrow keys navigate terminal tabs. Command-palette selection stays visible when navigating with the keyboard.
- Terminal resizing respects the available column height and cannot cover the status bar.

Saved settings and existing workspace/action formats are compatible. Reopened tabs still start fresh shells; running processes are not restored across application restarts.

Builds are in `Build/Relay Terminal.exe` and `Build/Relay Terminal_2.1.0_x64-setup.exe`, with SHA-256 hashes in `Build/SHA256.json`.

The editable designs are on the **Relay Terminal / Product design** page in the connected Penpot file. [Research and implementation decisions](docs/DESIGN-2.1.md) and [native acceptance results](TEST-REPORT-2.1.md) describe the evidence and validation.
