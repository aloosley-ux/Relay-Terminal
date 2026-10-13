# Terminal research and Relay decisions

Reviewed official product documentation on 12–13 October 2026. This is workflow and implementation research; it does not claim hands-on testing of competitors.

| Product | Relevant workflow | Relay decision |
| --- | --- | --- |
| [Ghostty](https://ghostty.org/docs) | Native window conventions, keyboard-driven splits, large theme collection and a focused terminal surface | Keep the shell central; avoid a dashboard landing screen. Use a compact Windows frame and direct terminal input. |
| [Warp](https://docs.warp.dev/terminal/appearance/themes) | Visual theme picking, previews and persistent appearance; [vertical tabs](https://docs.warp.dev/terminal/windows/vertical-tabs/) expose session context | Preview against live shell content. Keep horizontal tabs for a floating window; no agent dashboard or command-block replacement. |
| [WezTerm](https://wezterm.org/config/appearance.html) | Separate tab-bar colours, terminal colour schemes, padding, inactive panes, background image, gradient and opacity | Separate application chrome from the terminal scheme; resolve appearance by scope. |
| [Wave Terminal](https://docs.waveterm.dev/customization) | Tab backgrounds and terminal themes can be selected independently | Store backdrop as an appearance layer rather than modifying terminal output. |
| [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-appearance) | Per-profile fonts, cursor shapes, backgrounds, opacity and image alignment | Expose practical controls with a live preview. Keep Windows keyboard and window conventions. |
| [Tabby](https://github.com/Eugeny/tabby) | Integrated split panes, tab persistence, configurable shortcuts and shell profiles | Preserve persistent named tabs, shortcuts and ConPTY ownership. Supporting workflows remain opt-in. |
| [kitty](https://sw.kovidgoyal.net/kitty/conf/) | Rich typography, explicit opacity, remote control and direct layout shortcuts | Prefer predictable controls and restrained effects; do not add a service or recreate sessions for visual changes. |

## xterm.js 6

The [6.0.0 type contract](https://raw.githubusercontent.com/xtermjs/xterm.js/6.0.0/typings/xterm.d.ts) says `allowTransparency` must be set before `Terminal.open()` and cannot be toggled later without reopening. Relay sets it once at creation. Appearance modifies `terminal.options`, never disposes or reopens a live terminal. The current renderer is xterm's DOM renderer; Relay adds no WebGL renderer dependency.

The default terminal background can contain alpha. ANSI cell backgrounds emitted by applications remain controlled by xterm. CSS never applies opacity, blur, filters or animated transforms to terminal text, cursor or selection. A pointer-transparent pseudo-element behind the xterm content holds the image/gradient. CSS keeps the viewport transparent. Solid mode hides this layer. Backdrop blur affects the backdrop itself, not the text or the operating-system desktop.

The ambient effect animates only a backdrop transform, avoiding JavaScript animation loops and repeated background-position painting. Visibility and minimisation pause motion, reduced-motion disables it. No performance claim is inferred from competitor documentation; native measurements are recorded separately.
