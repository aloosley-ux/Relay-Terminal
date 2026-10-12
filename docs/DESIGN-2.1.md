# Relay Terminal 2.1 — desktop design

The product is a Windows PowerShell workbench. The shell is the primary work surface; projects, tasks, files and services support it.

## Evidence and product needs

The starting application used React 19, Tauri 2, WebView2, Rust/ConPTY and xterm.js. Inspection covered the frontend, terminal channel and flow control, settings persistence, project discovery, file bounds, process ownership and integration controllers. A disposable native profile was used to exercise the original release before changes: all 22 existing GUI regression groups and all six Rust tests passed.

There were no user interviews. The following needs are inferred from Relay's working features and tested workflows, rather than represented as findings from a recruited user study:

- Return to a live shell without losing its state or starting duplicate tasks.
- Open the right folder quickly and run its existing commands.
- Inspect output and files in context without turning Relay into an editor.
- Distinguish Relay-owned tasks from external services, and retain deliberate lifecycle controls.
- Work at small Windows window sizes and move between shells using the keyboard.

The initial native view had five competing layers: title controls, session tabs, a broad view rail, the folder toolbar and a right launcher panel. The sidebar repeated the pinned project as a recent folder and listed unrelated discovered locations. Empty inspectors reserved substantial space. These were observable interface problems, rather than reasons to replace the terminal engine.

## Research applied during development

| Primary source | Relevant behavior | Relay decision |
| --- | --- | --- |
| [Windows Terminal panes](https://learn.microsoft.com/en-us/windows/terminal/panes) | Multiple shells visible together; directional keyboard focus, resizing and clear focused-pane indication. | Split from a single shell creates another real session. Pane focus preserves physical positions. Alt+Left/Right moves focus. The divider supports pointer and keyboard resizing. |
| [Windows Terminal appearance](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/appearance) | Terminal tabs can be compact, with controls close to the active session. | Compact tabs adjacent to the terminal, one active underline, hover close controls and retained keyboard shortcuts. |
| [Windows Terminal command palette](https://learn.microsoft.com/en-us/windows/terminal/command-palette) | Search provides access to actions and profiles without displaying all controls permanently. | Existing palette retained; its keyboard selection now scrolls into view. |
| [Zed panel system](https://zed.dev/blog/new-panel-system) | Docks share a workspace, can be hidden, and retain their own focus behavior. | One navigator; project folders replace launchers in the same location. Collapsing it retains the four view controls. |
| [Zed tasks](https://zed.dev/docs/tasks) | Task concurrency, output reveal, terminal reuse and rerun policy are explicit. | Preserve Relay's real named task sessions and running-task deduplication. Do not hide failed task output or change existing shell ownership. |
| [VS Code terminal basics](https://code.visualstudio.com/docs/terminal/basics) | Terminal groups, directory context and task outcomes remain associated with their shells. | Keep shell state and task identity intact; focus and terminal dimensions remain correct through view changes and resizing. |
| [Windows NavigationView](https://learn.microsoft.com/en-us/windows/apps/design/controls/navigationview) | Consistent left navigation; compact presentation when space is constrained; settings at the bottom. | Familiar named views, shared navigator, bottom settings and an explicit compact mode. |
| [Windows command bars](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/command-bar) | Important commands occupy stable positions, with concise labels and contextual controls. | Keep folder actions next to the current directory and task actions next to the selected project. Remove descriptive slogans and repeated instructions. |
| [xterm.js options](https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions/) | Renderer theme, contrast, font settings and shell key handling are separate concerns. | Use the same theme surfaces in chrome and terminal, retain the minimum contrast setting, and route application shortcuts without leaking them into the shell. |

The broad UI skill search initially suggested a documentation landing page and an all-monospace presentation. Those recommendations did not fit a Windows workbench and were rejected. The focused keyboard guidance was applicable and informed the tab, palette and divider checks.

## Editable Penpot work

The connected file was **ArcLane — Design Playground**. Its existing pages and designs were preserved. A new page, **Relay Terminal / Product design**, contains editable dark/light terminal designs, project tasks, files, a process inspector, a compact terminal and reusable controls.

- File ID: `52a5041f-08a1-80f1-8008-c5171920d528`
- Relay page ID: `d87fc166-aa02-800a-8008-c7c31af3fe6c`
- Dark colors: `relay-dark` token set.
- Dimensions: `relay-dimensions` token set.
- Local reusable assets: `Relay / Button / Primary`, `Relay / Button / Secondary`.

All screens consist of editable text and vector shapes, rather than screenshot backgrounds. Containment was checked and corrected, and terminal and project exports were reviewed visually. Later refinements removed redundant launcher headings, discovered-folder lists and duplicate recent entries to follow the user's request for a quieter interface.

## Implementation decisions

Graphite surfaces and restrained violet selection replace the saturated blue workbench. The interface uses installed Windows typography; the terminal retains Cascadia Mono/Consolas. There are no downloaded interface fonts, decorative statistics, gradients, promotional copy or extra daemons.

`desktop.css` defines the final semantic palette and layout. `App.tsx` owns the unified navigator and session controls. `Workbench.tsx` portals its project list into that navigator, while file and process inspectors appear only on selection. Rust terminal ownership, atomic settings storage, multiline paste review and external-controller confirmations remain intact.

The release is identified as 2.1.0, with matching application chrome and Windows icon. Build and package scripts produce the standalone executable, NSIS installer and SHA-256 manifest.
