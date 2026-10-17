# Relay 4.0 identity refinement

This branch preserves Relay 4.0's terminal-first layout, workflows, safety boundaries, and appearance engine while refining its identity and reducing verified duplicate controls. The experimental build has a separate Windows app identifier and can run alongside stable Relay 4.0.

## Switchline identity

**Switchline** is a continuous rounded route with a distinct handoff point. It is the selected Relay mark. Three original identity studies and the icon family are shown in [`assets/previews/Relay-Identity-Explorations.png`](assets/previews/Relay-Identity-Explorations.png). The source remains editable in [`assets/vectorcraft/Relay-Identity-Explorations.vectorcraft`](assets/vectorcraft/Relay-Identity-Explorations.vectorcraft) and [`assets/vectorcraft/Relay-AppIcon.vectorcraft`](assets/vectorcraft/Relay-AppIcon.vectorcraft). Selected artwork is also available as [`assets/svg/Relay-AppIcon.svg`](assets/svg/Relay-AppIcon.svg) and [`assets/previews/Relay-AppIcon.png`](assets/previews/Relay-AppIcon.png).

The VectorCraft source uses installed Segoe UI and opens without a missing-font prompt. VectorCraft's configured write root is `design/relay5/creative-lab`; the original research files remain there unchanged. The canonical copies above are the maintained Relay 4 identity sources.

## Application integration

- [`src/RelayIcons.tsx`](../../src/RelayIcons.tsx) defines the Switchline mark and the bespoke navigation/view glyphs. Each is a small SVG React component with a `size` prop, shared rounded path geometry, and `currentColor` strokes/fills. This lets Relay's existing theme variables set their color. Utility and terminal action icons that were already distinct remain in place.
- [`src/App.tsx`](../../src/App.tsx) uses the mark and bespoke icons in the existing titlebar and navigation. It removes verified duplicates: terminal name repeated in its active tab, Settings in titlebar and navigation footer, Appearance in titlebar and statusbar, Shortcuts in navigation footer and statusbar, and navigation toggle in the titlebar and tabbar. Workspace selection versus editing, and Copy last output versus Copy all output, remain separate controls.
- [`src-tauri/icons/`](../../src-tauri/icons/) contains generated Tauri icon assets, including the Windows `.ico`. The stable [`src-tauri/tauri.conf.json`](../../src-tauri/tauri.conf.json) continues to point at `icons/icon.ico`; [`src-tauri/tauri.identity.conf.json`](../../src-tauri/tauri.identity.conf.json) overrides the experiment's product name and identifier only.

Regenerate Tauri icons from the editable artwork with:

```powershell
npm run tauri -- icon design/relay4-identity/assets/svg/Relay-AppIcon.svg --output src-tauri/icons
```

The Tauri CLI generates multiple platform sizes. Review generated changes and keep this branch's Windows and shared icon outputs aligned with the targets configured in `src-tauri/tauri.conf.json`.

## Editable UI and evidence

[`Relay-4-UI-Refinement.figcraft`](Relay-4-UI-Refinement.figcraft) is the FigCraft design area. It contains reusable identity/icon components, desktop 1080×720 and compact 760×500 layouts, open and collapsed navigator states, and a before/after comparison board. The board uses actual Windows captures at matching 1080×720 sizes. It notes that the baseline uses the user's Tideland appearance and the experiment uses Harbor base tokens; app and terminal customisation remain independent and semantic.

Curated native captures are in [`evidence/`](evidence/):

- [`before-after-live-1080x720.png`](evidence/before-after-live-1080x720.png) — actual Relay 4.0 and experimental build comparison.
- [`before-1080x720.png`](evidence/before-1080x720.png) and [`after-1080x720.png`](evidence/after-1080x720.png) — full-size native application captures.
- [`before-compact-760x500.png`](evidence/before-compact-760x500.png), [`after-compact-open-760x500.png`](evidence/after-compact-open-760x500.png), and [`after-compact-collapsed-760x500.png`](evidence/after-compact-collapsed-760x500.png) — compact Windows views. The open navigator is an overlay; collapsing it exposes the terminal and active tab.

## Experimental build and tests

The build is intentionally separate from the stable Relay 4.0 product identity. The tested files are local under the ignored `artifacts/relay4-identity/` directory:

- `Relay-Identity-Experiment.exe`
- `Relay-Identity-Experiment-setup.exe` (NSIS installer; built, not installed)
- `TEST-REPORT.md`

Reproduce the Windows executable and NSIS installer on a Windows development machine with Node/npm, Rust MSVC tools, Visual Studio C++ build tools, and WebView2:

```powershell
npm install
npm run tauri -- build --config src-tauri/tauri.identity.conf.json
```

The Tauri build outputs are under `src-tauri/target/release/` and `src-tauri/target/release/bundle/nsis/`. Copy the reviewed executable and installer into the local `artifacts/relay4-identity/` folder; do not commit either binary, the build cache, or temporary test profiles.

The committed [`TEST-REPORT.md`](TEST-REPORT.md) records the Rust, native GUI, appearance, interaction, acceptance, advanced, and Windows command verification results and outstanding limits. The detailed local copy remains at `artifacts/relay4-identity/TEST-REPORT.md`.

The experiment changes branding and the specific presentation cleanups above. It does not replace shell/session logic, workspaces, tasks, process ownership, safety boundaries, or appearance features. In particular, independent application/terminal colors, ANSI palettes, typography, cursor settings, gradients, wallpapers, effects, scoped overrides, and theme import/export continue to use the existing engine. No UI package or new workflow concept was added.

## References

Windows icon sizing follows [Microsoft app icon design guidance](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-design). Icon-only controls retain accessible names in line with [WAI-ARIA naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). 21st.dev patterns were reviewed; no match justified adding a dependency. PhotoCraft and EffectCraft were not used because raster imagery and motion did not materially improve this interface.
