# Relay Terminal 5.0.0

Relay Terminal 5.0.0 completes the Switchline identity integration and packages the existing Windows desktop product as an in-place upgrade to Relay 4.0. The release keeps the `com.relay.terminal` application identifier and its established settings location.

## Identity and Windows integration

- Applies the accepted Switchline mark in the application chrome and embeds matching icon artwork in the Windows executable and NSIS installer/uninstaller. Existing Windows taskbar pins may retain the old cached image from an earlier version; the approved artwork is present in the installed 5.0 executable. Run `scripts/repair-windows-shortcut-icons.ps1` to repair existing shortcut icon paths; if Windows still shows the old cache, unpin and re-pin Relay Terminal from Start.
- Retains the original product name and application identity so Windows sees one Relay Terminal installation.
- Uses the configured Microsoft WebView2 bootstrapper when the Evergreen runtime is missing.
- Keeps the native VectorCraft and FigCraft identity files in `design/current/switchline-identity/` for future editing.

## Existing Relay capabilities

Relay 5.0 retains the features shipped in Relay 4.0: interactive PowerShell sessions, tabs and split panes, keyboard shortcuts and search, project/workspace browsing, task and process inspection, saved actions, bounded read-only file previews, local integrations, session-definition recovery, and Appearance Studio.

The five established appearance themes, independent application and terminal palettes, scoped settings, wallpaper/background effects, ANSI colors, typography, cursor settings, and custom theme import/export remain unchanged.

## Upgrade and data

The installer retains the production identifier `com.relay.terminal`. Settings, saved actions, workspace definitions, theme files and Appearance Studio configuration continue to use `%APPDATA%\com.relay.terminal\settings.json`. Relay restores saved session definitions into fresh shells; it does not restore running processes or previous terminal output.

See [TEST-REPORT-5.0.md](TEST-REPORT-5.0.md) for the checks run against the packaged application and installer. Generated executable and installer files are local release artifacts under `Build/Release-5.0.0/`.
