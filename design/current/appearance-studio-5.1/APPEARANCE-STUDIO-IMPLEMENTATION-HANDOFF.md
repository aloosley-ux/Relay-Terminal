# Relay 5.1 Appearance Studio — implementation handoff

**Status: approved design implemented in Relay 5.1.0.** This document records the accepted handoff and remains alongside the editable FigCraft source; it is not an implementation authorization gate.

This handoff refers to the 23-page editable FigCraft proposal and `REFINEMENT-REVIEW.md`. Keep the accepted Switchline Relay chrome, Lucide utility icons and live-terminal-first layout. The Appearance Studio remains the single authoritative editor; contextual controls are entry points into that same appearance model.

The design is approved and implemented on the `release/5.1.0-appearance-studio` branch. See [`docs/APPEARANCE-STUDIO.md`](../../../docs/APPEARANCE-STUDIO.md), [`RELEASE-NOTES-5.1.md`](../../../RELEASE-NOTES-5.1.md), and [`TEST-REPORT-5.1.md`](../../../TEST-REPORT-5.1.md) for the shipped behavior and validation evidence. The editable 23-page source remains [`Relay-Appearance-Studio-Professional-Review.figcraft`](Relay-Appearance-Studio-Professional-Review.figcraft); earlier directions remain preserved for history.

## Architecture and navigation

- Keep the docked Studio beside the live terminal at normal size. Its primary destinations remain **Themes**, **Type**, **Colour** and **Backdrop**.
- Keep `Apply to` as the shared target selector for **All terminals / Global**, **This workspace** and **This session**. Show the target identity, inheritance source and override state alongside the editor.
- Theme discovery and management live in Themes. App chrome and terminal schemes stay independently selectable and may be mixed. The active session's application theme colors Relay chrome; each session keeps its own terminal palette.
- Tabs, terminal surfaces and workspaces may open a compact **Quick appearance** flyout. The flyout identifies its exact session, exposes common adjustments and routes to the same full Studio state. It must not create a second appearance store or pane-position scope.
- At 760 × 500, retain the 420 px shell, four Studio destinations, one task-focused editor, internal scrolling as needed and a fixed Reset/Apply area. In split view, identify the selected session by tab/session name and split side; edits remain attached to that session.

## Existing behavior to preserve

- Presets: Harbor, Porcelain, Carbon, Tideland and Frost; independent app/terminal palettes; global, workspace and session choices; precedence **session → workspace → global**; inherited appearance and override removal.
- `followSystem` is in the appearance model/resolver. It resolves the global application and terminal appearance together from Windows light/dark preference, while workspace/session overrides take precedence. The current Studio has no direct re-enable switch.
- Appearance edits preview live on the existing shell. **Apply** stores the selected scope's choice; **Reset preview** restores its saved effective value; closing Studio clears an uncommitted preview. Appearance changes must not restart or recreate the shell.
- Preserve every editable role: six app colours; terminal background, foreground, cursor and selection; all 16 named ANSI values; font family; size 10–32 px; line height 1–2; letter spacing −1–4 px; padding 4–48 px; bar/block/underline cursor and blinking.
- Preserve Solid, Gradient, Wallpaper and Ambient backgrounds. Keep endpoint colours and angle 0–360°; wallpaper import and bundled Tideland; surface opacity 0.35–1, intensity 0–1, blur 0–40 px; ambient animation toggle and duration 10–120 seconds. Effects apply only to non-solid backgrounds; animation applies to Ambient. Text, selection and cursor remain crisp. Retain hidden/minimised and reduced-motion behavior.
- Preserve safety and validation: local PNG/JPEG/WebP wallpaper, existing encoded/file size limit, 8192 px edge and 16 MP limits, theme JSON validation and error recovery, 40 custom-theme maximum, font validation, and all existing stored appearance fields.
- Preserve theme lifecycle timing: saving a copy and saving edits/rename to a custom theme immediately persist the library and apply the theme to the selected scope; import immediately adds the validated library item and previews it, while Apply stores its appearance choice; delete immediately removes it and changes references to Harbor, with Undo restoring the prior store. Removing a workspace/session override also persists immediately and falls back to the next scope.

## Component and interaction work

1. Build the shared Studio shell, scope path/status and preview-draft actions first. Keep the active session and effective app/terminal choices explicit.
2. Improve the theme library and lifecycle actions while preserving their immediate-versus-staged semantics.
3. Implement role-organized app/terminal/ANSI colour editing, direct values and live terminal specimens. Contrast feedback must remain advisory and never coerce a custom value.
4. Implement mode-specific background editors. Keep gradient and wallpaper tools in the dock, preserve a useful live terminal, and hide or mark effects that do not apply to the selected mode.
5. Implement typography/cursor controls, then the shared contextual flyout and compact layout. Contextual actions must call the same scope and persistence paths as the Studio.

## Proposals, separate from existing functionality

- **New entry points:** right-click tab/terminal Quick appearance and a dedicated workspace context entry. The underlying per-session and per-workspace appearance scopes already exist.
- **New tab identity options:** tab colour/icon cues, separate from terminal palette colours.
- **New wallpaper positioning:** X/Y crop positioning. Current behavior is centered cover; do not implement positioning as if it already exists.
- **New contrast guidance:** a readable contrast estimate/reference may advise users, but must not block, rewrite or normalize expressive colours. WCAG ratios are guidance for text legibility, not an enforcement rule for custom themes.
- **New Follow Windows Studio control:** the data model/resolver supports following; the present Studio does not expose a direct switch. Keep the control clearly represented as a new UI capability.
- **New font discovery/comparison:** searchable installed-font selection and side-by-side font comparison; the current saved font-family field remains supported.

## Accessibility and acceptance criteria

- All controls have visible names and keyboard focus, keyboard-operable mode/theme/role selection and direct numeric entry beside sliders. Maintain sufficient text contrast and do not rely on hue alone for role identity.
- Preserve reduced-motion behavior; keep live terminal glyphs readable over any background. Keep override state, target identity, preview status and persistence timing understandable without relying on tiny notes or color alone.
- Verify all 23 screens remain editable and the parity matrix has a specific visual location for every existing capability. In implementation, verify scope precedence, inheritance removal, preview/reset/apply/close, immediate library actions, undo, import/export validation, and each background mode against the current model.
- Check visual behavior at 1080 × 720 and 760 × 500 in light, dark and custom themes. Confirm the live terminal stays visible, Split sessions remain independently styled, the quick editor fits its border, and changes do not restart shell processes or discard scrollback.

## Recommended implementation validation

Use unit tests for scope resolution, `followSystem`, background applicability/ranges, theme validation/import/export, 40-theme limits, delete fallback and undo. Use component tests for draft preview, Apply, Reset, close/discard and immediate library/inheritance operations. Then perform keyboard/screen-reader checks and native Windows/Tauri smoke testing with light/dark system preference and independently themed split sessions. These are future recommendations only; no tests or builds were run for this design handoff.
