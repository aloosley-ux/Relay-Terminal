# Appearance Studio parity audit

**Audit date:** 2026-10-17  
**Status:** design coverage added; implementation remains unapproved  
**Evidence inspected:** src/AppearanceStudio.tsx, src/appearance.ts, src/studio.css, src-tauri/src/appearance.rs, plus the running Relay application.

## Finding

The first Relay 5.0 Appearance page was incomplete. It showed five preset previews, independent application/terminal theme selectors, scope, and a small sample, but omitted the authoring surface that makes Relay 4.0's Appearance Studio powerful. In particular, it did not show the ANSI editor, the full set of terminal and application colour values, typography and cursor controls, backdrop effects, theme lifecycle, or their validation states.

That gap is now covered by five editable frames on **05 — Appearance Atelier · Full Power and States**. Night Gallery is a starting theme in the library. It does not constrain the application or terminal palettes. An adjacent sixth frame is the Night Gallery visual system; it is a design-direction reference, not a locked theme.

## Feature map

| Relay 4.0 capability observed in source | Relay 5.0 editable design coverage |
|---|---|
| Independent application and terminal theme selection | Theme Library and Scope: separate Application theme and Terminal scheme selectors, shown as Night Gallery chrome plus Porcelain/Linen terminal. Users can mix any available schemes. |
| Application chrome colours: background, raised, text, muted, accent, border | Application and Terminal Colour: six separately named colour controls beside the live shell. |
| Terminal base colours: background, foreground, cursor, selection | Application and Terminal Colour: four terminal foundation values, plus a visible selection and cursor contrast specimen. |
| Sixteen editable normal and bright ANSI colours | Application and Terminal Colour: 16 individually selectable swatches with role labels, focus state, keyboard-navigation note, and a live ANSI specimen. |
| Font family, size (10–32 px), line height (1–2), letter spacing (-1–4 px), terminal padding (4–48 px) | Typography and Cursor: font-family entry, four live-preview sliders, current values, and a shell sample. |
| Cursor shape (bar, block, underline) and blink | Typography and Cursor: three explicit shape choices and a blink toggle in its on state. |
| Solid, gradient, wallpaper, and ambient background types | Wallpaper Import and Limits and Ambient Motion State show the two complex styles and their controls; all four style choices remain visible. Solid and gradient are available from the same style selector. |
| Gradient start/end colours and angle (0–360°) | Ambient Motion State: two editable stops and the angle control. Its preview is a live gradient, not wallpaper. |
| Surface opacity (.35–1), intensity (0–1), backdrop blur (0–40 px) | Wallpaper Import and Limits: surface opacity, image intensity, and blur. Ambient Motion State: surface opacity, ambient intensity, and blur. |
| Ambient animation and speed (10–120 seconds) | Ambient Motion State: explicit animation toggle and duration control. The example shows OS reduced-motion enabled, so saved animation is paused on that device. |
| Built-in Tideland and user-selected local wallpaper | Wallpaper Import and Limits: Tideland preview, local image selection and format labels. |
| Wallpaper upload constraints and safe failure | Wallpaper Import and Limits: PNG/JPEG/WebP, 4 MB maximum, 8192 px side limit and 16-megapixel cap. Oversized file state keeps the previous image selected. |
| Global, workspace and session scopes; inherit from the parent scope | Theme Library and Scope: current session, workspace and global destinations, plus Use inherited appearance. |
| Live preview without restarting the running shell; explicit Apply and Reset preview | All five frames keep a shell preview visible. Theme Library and Scope shows preview-only state, Reset preview, and Apply to session. |
| Save a custom theme, edit, duplicate, delete, undo deletion; up to 40 custom themes | Theme Library and Scope shows custom-theme editing, Save changes, Save a copy, Delete, and the 40-theme limit. An editable delete-feedback toast includes a clear Undo action. |
| Import/export versioned Relay JSON; embedded wallpaper; validation | Theme Library and Scope shows import, export, and an invalid-file state that leaves the preview unchanged. The design records the 6 MB import boundary. |

## Interaction and presentation decisions

- The center remains a live-output specimen with readable selectable output; appearance editing is a tool around the shell, not a replacement for the shell.
- The preview is visibly provisional until the user applies it to the chosen scope. Reset preview returns to the inherited or saved choice.
- A session override can be removed with **Use inherited appearance**. The scope remains explicit in the rail.
- Application chrome and terminal palette are edited separately. Each picker has a named role and value; ANSI controls identify both normal and bright variants.
- Wallpaper and theme-file errors keep the previously selected appearance intact. The error is adjacent to the relevant action and offers a recovery path.
- Backdrop image opacity/intensity/blur affect the surface behind output. Terminal text, selection and cursor remain sharp and usable.
- Ambient motion is paused when reduced motion is requested and when Relay is hidden/minimized; ordinary terminal output does not animate.
- Focus, hover, pressed, keyboard navigation, screen-reader names, and Windows high-contrast behavior still require implementation review. The conceptual screenshots do not certify accessibility contrast or runtime interaction.

## Remaining verification

This is a design-parity audit against Relay 4.0 source, not a code change. After a future implementation is approved, compare each listed state with the actual theme store, xterm preview, persisted scope, theme import/export, and reduced-motion behavior. Verify contrast for every ANSI combination and app-surface pairing at supported DPI and terminal sizes. Do not mark the design implemented solely because its frames are complete.

