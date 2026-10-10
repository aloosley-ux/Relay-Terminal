# REA findings — Relay Terminal

Investigation was deliberately limited to installed-terminal identity, session/tab controls, launch tasks and startup directories. No existing application or configuration was changed.

## Installed artifact

REA `open_binary` identified `C:\Program Files\ConEmu\ConEmu64.exe` as a native x86-64 PE executable. SHA-256: `06c186ce306b75920b90ec70b54554891b81ae4946b4b5d4803e91765756f234`. The provider was Ghidra 12.1.4. The ephemeral analysis session was closed with `close_binary` after two focused string queries; no function decompilation was requested.

## Observations and implications

| Question | Shipped-artifact evidence | Design implication |
|---|---|---|
| Tabs / persistent consoles | `search_strings("cur_console")`, evidence `ev_10ecce84b1912fed029e2387905e985611ab4275b8cc5fcf87a43edc295b0abe`, found help text describing `-new_console` and `-cur_console`, creation in tabs, and `{powershell}` task examples. | Represent tabs as independently owned PTYs. Switching tabs must retain the shell, rather than rerunning a command. |
| Launch tasks / profiles | The same evidence contains task-style `{powershell}` / `{cmd}` names and a `-new_console` example with a PowerShell palette/profile parameter. The second focused query found a new-console popup with task submenus. | Separate shell selection, workspace starting directory and saved actions in the GUI. ConEmu command syntax is not copied. |
| Working directories | Second query, evidence `ev_db1b5416270ba635faf62a795165101e5f45d7fabd18bdb2a9c08e1918e94282`, found “Choose startup directory”, “Choose tab startup directory”, and `-StoreCWD` help describing reporting the current working directory. | Pass the initial directory to process creation, then keep the displayed path in sync with the actual shell through an in-memory prompt hook. |
| Deliberate closure | Second query found distinct confirmations for console, group and application closure, including creation/termination errors. | Confirm closing every live shell; terminate only its contained process tree after the user's choice. |

The installed `ConEmu\ConEmu_Sample.xml` independently exposes `StartTasksName`, `StartTasksFile`, `Tabs`, `HideInactiveConsoleTabs`, and command-history settings. This is sample configuration, not proof of the user's active settings.

## Limits

These are static shipped-string observations, not runtime proofs of ConEmu's implementation. No call graph, internal tab-state model or active user launch configuration was recovered. The original broader string query was interrupted by user steering; its result was not used or claimed. The two completed queries are the evidence above. REA reports that Windows Ghidra analysis is ephemeral and source-immutable, and that results cover the analyzed string inventory rather than runtime execution. No reverse-engineering of terminal rendering or PowerShell was attempted.

## Documented ConPTY behaviour reused

Reviewed Microsoft's [Windows Terminal MiniTerm example](https://github.com/microsoft/terminal/blob/main/samples/ConPTY/MiniTerm/MiniTerm/Terminal.cs), [pseudoconsole session documentation](https://github.com/MicrosoftDocs/Console-Docs/blob/main/docs/creating-a-pseudoconsole-session.md), and [portable-pty API](https://docs.rs/portable-pty/0.9.0/portable_pty/). ConPTY carries interactive input and VT output over pipes; terminal size is a separate control operation. Output must continue draining during closure to avoid deadlock. Relay delegates those APIs to portable-pty 0.9.0 and rendering to xterm.js 6, with an output reader thread, asynchronous input, explicit resize and bounded acknowledged output.

The environment initially lacked Rust. The user explicitly directed installation; Rust 1.99.0 stable (MSVC) was installed with the official rustup installer, reusing the existing Visual Studio C++ toolchain and WebView2. The finished architecture remains Tauri 2 + Rust + portable-pty + React/TypeScript + xterm.js. No Electron fallback was needed.

## Integration finding from Relay's real runtime

PSReadLine emits cursor-position queries at the prompt. xterm's generated replies must not be treated as user edits. A desktop GUI action test revealed this, and the backend now distinguishes CSI cursor/device/status replies from editable input. Literal-path quoting and this distinction have regression tests. Relay's prompt hook exists only in its own shell processes; no PowerShell profile file is modified.
