# Command copying in Relay 4

Select text and press **Ctrl+Shift+C**. **Ctrl+C** also copies when the terminal has a selection; otherwise it interrupts the shell. Right-click opens a menu without changing your selection. Applications that request mouse reporting retain right-click; hold **Shift** to open Relay's menu instead.

Right-click a command or its output to copy its command text or completed result separately. **Ctrl+Shift+O**, the status-bar **Copy last output** action, and the command palette copy the most recently completed result. **Copy all output** copies the active terminal buffer, including retained scrollback. **Shift+F10** opens the keyboard menu for the last completed command; arrows, Home, End and Escape navigate it.

Commands are not rerun by any copy action. Paste retains the existing multiline review. Saved commands and the composer retain their separate Insert and Run actions.

## How identification works

An in-memory PowerShell hook wraps `PSConsoleHostReadLine`, reporting the accepted command as UTF-8/base64. It emits session-token-scoped OSC 633 messages before execution and at the next prompt. The hook does not edit profile files, remap Enter, parse keystrokes, or infer commands from displayed prompt strings. Existing profile prompts are wrapped when profile loading is enabled. Both Windows PowerShell and PowerShell 7 use the same hook.

xterm's parser processes boundaries in stream order. Its markers track rows through scrolling and reflow. Completed output is read from rendered buffer cells: ANSI styling is omitted, soft-wrapped rows are joined without dropping boundary spaces, and a prompt sharing the last output row is excluded. A snapshot keeps completed copies stable across later resizes. Ready state also follows parser order, rather than arriving ahead of pending output.

History is local, memory-only and bounded to 100 commands and roughly 2 million UTF-16 code units per terminal, with at most 1 million per result. The terminal retains 10,000 scrollback rows. If a command exceeds those limits, Relay copies the retained tail and explicitly reports truncation. Clearing scrollback also clears command snapshots. Closing a tab discards them. There is no disk transcript or command-history database.

## Boundaries and fallbacks

- Command output means rendered terminal text, not a byte-for-byte stdout/stderr capture. Cursor movement and carriage-return progress updates retain their final rendered form. stdout and stderr are combined by ConPTY.
- Results become copyable when the shell returns to its prompt. A still-running command can be copied by selecting text or using Copy all output.
- Alternate-screen programs are not treated as ordinary command results; select or copy their current screen. A full-screen application that never requests an alternate buffer may still appear as rendered output.
- A replacement prompt/readline function, disabled PSReadLine, nested interactive shell or remote shell can remove integration. Selection and copy-all remain available. Relay does not invent missing boundaries. Nested `cmd /c` and Bash command output is supported as the outer PowerShell command's result; per-command tracking inside nested interactive shells is not promised.
- Clearing the terminal buffer can invalidate old markers. Completed snapshots may remain available via Copy last output until explicitly cleared or evicted.
- The random token prevents unrelated sequences being interpreted accidentally; it is not a security boundary against a program already running as the same user.
