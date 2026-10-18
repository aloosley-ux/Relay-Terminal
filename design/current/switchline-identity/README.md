# Relay 4.0 identity refinement

This source package records the identity work integrated into Relay Terminal 5.0.0. Relay keeps the original `com.relay.terminal` identifier, existing terminal-first layout and workflows, safety boundaries, and appearance engine.

## Switchline identity

**Switchline** is a continuous rounded route with a distinct handoff point. It is the selected Relay mark. Three original identity studies and the icon family are shown in [`assets/previews/Relay-Identity-Explorations.png`](assets/previews/Relay-Identity-Explorations.png). The source remains editable in [`assets/vectorcraft/Relay-Identity-Explorations.vectorcraft`](assets/vectorcraft/Relay-Identity-Explorations.vectorcraft) and [`assets/vectorcraft/Relay-AppIcon.vectorcraft`](assets/vectorcraft/Relay-AppIcon.vectorcraft). Selected artwork is also available as [`assets/svg/Relay-AppIcon.svg`](assets/svg/Relay-AppIcon.svg) and [`assets/previews/Relay-AppIcon.png`](assets/previews/Relay-AppIcon.png).

The VectorCraft source uses installed Segoe UI and opens without a missing-font prompt. VectorCraft's configured write root is `design/archive/relay5-concepts/creative-lab`; the original research files remain there unchanged. The canonical copies above are the maintained Relay 4 identity sources.

## Application integration

- [`src/RelayIcons.tsx`](../../../src/RelayIcons.tsx) retains only the approved Switchline brand mark. Relay's utility and interface icons use the installed `lucide-react` family throughout; their colour inherits from the owning control and active theme. The Switchline mark remains brand artwork and is not used as an action or navigation glyph.
- [`src/App.tsx`](../../../src/App.tsx) uses the mark in the existing titlebar and Lucide icons for interface controls. The icon-family change leaves product layout and behavior unchanged. Earlier control de-duplication remains: terminal name repeated in its active tab, Settings in titlebar and navigation footer, Appearance in titlebar and statusbar, Shortcuts in navigation footer and statusbar, and navigation toggle in the titlebar and tabbar. Workspace selection versus editing, and Copy last output versus Copy all output, remain separate controls.
- [`src-tauri/icons/`](../../../src-tauri/icons) contains generated Tauri icon assets, including the Windows `.ico`. The release bundle, NSIS installer, uninstaller, and executable all use the same source icon. The production configuration retains `com.relay.terminal` so a 5.0 install upgrades Relay 4 and uses its existing settings directory.

Regenerate Tauri icons from the editable artwork with:

```powershell
npm run tauri -- icon design/current/switchline-identity/assets/svg/Relay-AppIcon.svg --output src-tauri/icons
```

The Tauri CLI generates multiple platform sizes. Review generated changes and keep this branch's Windows and shared icon outputs aligned with the targets configured in `src-tauri/tauri.conf.json`.

## Editable UI and evidence

[`Relay-4-UI-Refinement.figcraft`](Relay-4-UI-Refinement.figcraft) is the FigCraft design area. It contains reusable identity/icon components, desktop 1080×720 and compact 760×500 layouts, open and collapsed navigator states, and a before/after comparison board. The board uses actual Windows captures at matching 1080×720 sizes. It notes that the baseline uses the user's Tideland appearance and the experiment uses Harbor base tokens; app and terminal customisation remain independent and semantic.

Curated native captures are in [`evidence/`](evidence):

- [`before-after-live-1080x720.png`](evidence/before-after-live-1080x720.png) — actual Relay 4.0 and experimental build comparison.
- [`before-1080x720.png`](evidence/before-1080x720.png) and [`after-1080x720.png`](evidence/after-1080x720.png) — full-size native application captures.
- [`before-compact-760x500.png`](evidence/before-compact-760x500.png), [`after-compact-open-760x500.png`](evidence/after-compact-open-760x500.png), and [`after-compact-collapsed-760x500.png`](evidence/after-compact-collapsed-760x500.png) — compact Windows views. The open navigator is an overlay; collapsing it exposes the terminal and active tab.

## Experimental build and tests

The original report below documents the earlier isolated identity experiment; its results are historical evidence, not 5.0 release validation. Current packaged application and installer checks are recorded in [`TEST-REPORT-5.0.md`](../../../TEST-REPORT-5.0.md). Local release files are generated under the ignored `Build/Release-5.0.0/` directory.

Build the production Windows executable and NSIS installer on a Windows development machine with Node/npm, Rust MSVC tools, Visual Studio C++ build tools, and WebView2:

```powershell
npm install
npm run release
```

`npm run release` builds with the production identity and release assets are copied by `scripts/package-v5.ps1`. Do not commit generated binaries, build caches, or disposable test profiles.

The committed [`TEST-REPORT.md`](TEST-REPORT.md) remains attached to the historical identity experiment. The current release report is [`TEST-REPORT-5.0.md`](../../../TEST-REPORT-5.0.md).

The experiment changes branding and the specific presentation cleanups above. It does not replace shell/session logic, workspaces, tasks, process ownership, safety boundaries, or appearance features. In particular, independent application/terminal colors, ANSI palettes, typography, cursor settings, gradients, wallpapers, effects, scoped overrides, and theme import/export continue to use the existing engine. No UI package or new workflow concept was added.

## References

Windows icon sizing follows [Microsoft app icon design guidance](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-design). Icon-only controls retain accessible names in line with [WAI-ARIA naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). 21st.dev patterns were reviewed; no match justified adding a dependency. PhotoCraft and EffectCraft were not used because raster imagery and motion did not materially improve this interface.
