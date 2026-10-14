# Relay Terminal

Relay is a Windows terminal for people running local development commands and tasks. Its primary job is to keep live PowerShell sessions comfortable and accessible in a normally sized desktop window. Real sessions, direct keyboard input, tabs and splits are the core workflow. Projects, actions, files and process inspection support that workflow on demand.

The technical baseline is Relay 4.0: Tauri 2, Rust, contained ConPTY sessions, React and xterm.js 6. Existing commands, security boundaries, local storage and service control ownership are preserved. No cloud service or account is required. Appearance must never recreate a terminal or restart a shell.

The user has delegated product and design decisions, requested a complete replacement visual world, and explicitly asked for native packaged acceptance using isolated profiles. Existing personal settings and running external services must remain untouched.
