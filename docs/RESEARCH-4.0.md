# Relay 4 product and engineering decisions

Reviewed 14 October 2026 against the local 3.0 source, release notes, test reports, native acceptance scripts, appearance documentation and editable Penpot boards. Competitor findings below are from official documentation, not claims of hands-on competitor testing.

| Reference | Relevant behaviour | Relay decision |
| --- | --- | --- |
| [Windows Terminal shell integration](https://learn.microsoft.com/en-us/windows/terminal/tutorials/shell-integration) | Semantic prompt/command/output marks, command selection and contextual actions | Use shell-reported boundaries; keep normal terminal rendering and selection. |
| [Windows Terminal actions](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions) | Selection-aware Ctrl+C and distinct clipboard actions | Copy selection with Ctrl+C; retain interruption when nothing is selected. |
| [WezTerm integration](https://wezterm.org/shell-integration.html) | Semantic zones supplied by shell escape sequences | Keep metadata independent of visible prompt formatting and buffer rendering. |
| [Ghostty integration](https://ghostty.org/docs/features/shell-integration) | Prompt navigation/output selection; integration can be lost inside a nested shell | Offer unobtrusive contextual operations and explicit fallback instead of pretending every shell is integrated. |
| [Warp block actions](https://docs.warp.dev/terminal/blocks/block-actions) | Separate command and result copying from block context menus | Separate copy targets, without adding persistent blocks or controls around every command. |
| [PowerShell line reader](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_psconsolehostreadline) | A function can override console line reading | Wrap accepted lines rather than intercepting Enter or relying on shell history parsing. |

The existing React/xterm architecture already preserves terminal instances across tab, split and appearance changes. It remains intact. Output metadata is maintained beside each terminal, outside React state; there is no rerender per output row. The new menu is only mounted on demand. No runtime dependency, background service or cloud integration was added.

The local VS Code environment includes PowerShell, TypeScript/React tooling and agent extensions. Available agent skills were inspected and applied: Impeccable's existing-product design/context and craft floor; UI/UX Pro Max's focus visibility/menu guidance; Vercel React guidance on transient values and event subscriptions. Existing Segoe/Cascadia typography and appearance tokens are retained.

## Relay 3 gaps resolved or bounded

- Recovery already started new processes. Relay 4 additionally restores active/split state and each tab's shell, flushes the current layout before close, and handles unavailable folders/shells. It explicitly describes recovery as fresh shells.
- Native theme export was already implemented using rfd and validated JSON. It is retained. Native dialog selection/cancel requires the unavailable Windows Computer Use pipe; serialization/import regression is automated separately.
- PowerShell 7 was not present. An official portable 7.6.7 build was downloaded into test artifacts; both shell families are exercised without changing the system shell installation.
- Frost intentionally remains an internal blurred backdrop. True desktop acrylic requires different native transparency/composition behaviour and would expand renderer/GPU compatibility risk without improving copying. No acrylic claim is made.
- Accessibility adds an explicit xterm screen-reader setting, a semantic keyboard context menu and composition-event shortcut guards. Physical IME and spoken screen-reader validation remain separate hardware/assistive-technology checks.
- Installer smoke uses the generated NSIS script with isolated product/binary identity and an identical application payload, because the real Relay product is already installed on this machine. This is packaging validation, not clean-VM or upgrade-path certification.
