---
name: Relay Terminal
description: A calm Windows instrument for live local shells.
colors:
  harbor-background: "#1c2835"
  harbor-raised: "#27313d"
  harbor-text: "#e0e8ef"
  harbor-muted: "#a7b6c4"
  harbor-accent: "#93b8dd"
  harbor-border: "#344352"
  harbor-terminal: "#141e29"
  dark-selection: "#435c75"
  porcelain-background: "#eaf0f5"
  porcelain-raised: "#ffffff"
  porcelain-text: "#243441"
  porcelain-muted: "#526978"
  porcelain-accent: "#356d9b"
  porcelain-border: "#c8d2db"
  porcelain-terminal: "#f7f9fc"
  light-selection: "#c9daeb"
  carbon-background: "#302b27"
  carbon-raised: "#3b332d"
  carbon-text: "#eee4d6"
  carbon-muted: "#bcad9c"
  carbon-accent: "#d9b687"
  carbon-border: "#50473e"
  carbon-terminal: "#25211f"
  carbon-selection: "#635044"
  tideland-background: "#20343c"
  tideland-text: "#e4f0ee"
  tideland-muted: "#adc4c7"
  tideland-accent: "#94c6c1"
  tideland-terminal: "#152b33"
  frost-background: "#24323e"
  frost-text: "#e7eff5"
  frost-muted: "#b3c4d2"
  frost-accent: "#b6cfde"
  frost-terminal: "#18232e"
  frost-gradient-from: "#2b465c"
  frost-gradient-to: "#65747d"
  dark-success: "#9ac8ac"
  dark-amber: "#ddbb85"
  dark-danger: "#eea0a4"
  light-success: "#32684a"
  light-amber: "#826027"
  light-danger: "#ac3346"
  ansi-dark-black: "#273442"
  ansi-dark-red: "#d99596"
  ansi-dark-green: "#96bca3"
  ansi-dark-yellow: "#d7bb87"
  ansi-dark-blue: "#95b4d8"
  ansi-dark-magenta: "#b8a4d3"
  ansi-dark-cyan: "#8dbbc3"
  ansi-dark-white: "#d4dce5"
  ansi-dark-bright-black: "#8292a3"
  ansi-dark-bright-red: "#efb2b1"
  ansi-dark-bright-green: "#b5d4bc"
  ansi-dark-bright-yellow: "#ecd1a2"
  ansi-dark-bright-blue: "#b8cfee"
  ansi-dark-bright-magenta: "#d6bfe9"
  ansi-dark-bright-cyan: "#afd9df"
  ansi-dark-bright-white: "#f3f6fa"
  ansi-light-black: "#293742"
  ansi-light-red: "#ad3c48"
  ansi-light-green: "#32694d"
  ansi-light-yellow: "#806022"
  ansi-light-blue: "#385f9c"
  ansi-light-magenta: "#78528d"
  ansi-light-cyan: "#236f7d"
  ansi-light-white: "#687582"
  ansi-light-bright-black: "#6c7e89"
  ansi-light-bright-red: "#b74653"
  ansi-light-bright-green: "#387452"
  ansi-light-bright-yellow: "#886823"
  ansi-light-bright-blue: "#456ba7"
  ansi-light-bright-magenta: "#855c9a"
  ansi-light-bright-cyan: "#2d7886"
  ansi-light-bright-white: "#79858e"
typography:
  body:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', sans-serif"
    fontSize: "13px"
  title:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    letterSpacing: "-0.2px"
  label:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', sans-serif"
    fontSize: "12px"
  caption:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', sans-serif"
    fontSize: "11px"
  terminal:
    fontFamily: '"Cascadia Mono", "Cascadia Code", Consolas, monospace'
    fontSize: "14px"
    lineHeight: 1.25
    letterSpacing: "0px"
rounded:
  small: "4px"
  control: "5px"
  tab: "6px 6px 0 0"
  theme: "7px"
  dialog: "10px"
spacing:
  tight: "4px"
  control-gap: "7px"
  small: "8px"
  medium: "12px"
  studio: "18px"
  terminal: "20px"
  dialog: "24px"
components:
  button-primary:
    backgroundColor: "{colors.harbor-accent}"
    textColor: "{colors.harbor-terminal}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.harbor-text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    typography: "{typography.label}"
  button-secondary-hover:
    backgroundColor: "{colors.harbor-raised}"
  button-icon:
    textColor: "{colors.harbor-muted}"
    rounded: "{rounded.control}"
    width: "29px"
    height: "29px"
    padding: "0"
  input:
    backgroundColor: "{colors.harbor-terminal}"
    textColor: "{colors.harbor-text}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    typography: "{typography.body}"
  navigation-selected:
    backgroundColor: "{colors.harbor-raised}"
    textColor: "{colors.harbor-text}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  session-tab:
    textColor: "{colors.harbor-muted}"
    rounded: "{rounded.tab}"
  session-tab-selected:
    backgroundColor: "{colors.harbor-terminal}"
    textColor: "{colors.harbor-text}"
  status-chip:
    backgroundColor: "{colors.harbor-raised}"
    textColor: "{colors.harbor-muted}"
    rounded: "{rounded.small}"
    padding: "4px 9px"
    typography: "{typography.caption}"
  theme-tile:
    rounded: "{rounded.theme}"
    padding: "0 0 9px"
  dialog:
    backgroundColor: "{colors.harbor-background}"
    rounded: "{rounded.dialog}"
    padding: "24px"
    width: "540px"
---

# Design System: Relay Terminal

## Overview

**Creative North Star: "A calm Windows instrument"**

Relay gives live shell content the largest continuous surface. Its frame is compact, legible and familiar: quiet controls, precise separators and restrained selection. Supporting tools appear when needed; the shell stays visually and operationally present.

The five appearance worlds change material and temperature without changing the control language. Appearance Studio previews on the actual terminal, preserving its process and scrollback. Segoe controls and Cascadia shell content distinguish interface from output.

**Key Characteristics:**
- Terminal-first density with small, consistent Windows controls.
- Theme-aware tonal surfaces and sparse accent marks.
- Independent application and terminal palettes.
- Crisp foreground content over optional, subdued backdrops.

## Colors

### Primary

Harbor uses a slate-blue accent; Porcelain a deeper daylight blue; Carbon a warm sand accent; Tideland a pale sea-green; Frost a pale blue-grey. Use the active application accent for focus, primary actions and thin selection indicators.

### Neutral

Each theme has background, raised, text, muted, border and terminal roles. Tideland and Frost share Harbor's raised and border primitives. Dark presets share the dark selection and ANSI palette, except Carbon's warmer selection. Porcelain uses the light selection and ANSI palette. Terminal foreground and cursor come from its chosen preset's text and accent roles.

The runtime maps hover and selected-control backgrounds to application raised, faint text to muted, focus to accent, and separators to border. Success, amber and danger follow application light/dark mode. The frontmatter captures active preset primitives; old stylesheet root palettes are startup fallbacks, not additional theme worlds.

**The Independent Palettes Rule.** Application chrome follows the application theme; each shell follows its terminal appearance. Do not infer one from the other.

## Typography

Controls use Segoe UI Variable Text with Segoe UI fallback. Body text is compact; labels carry most control copy. Caption text serves paths, status and secondary instructions. Studio titles use the title role; modal headings are larger (20px), while workbench titles can reach (24px).

Shell content uses Cascadia Mono, Cascadia Code, Consolas, then monospace. The preset terminal size, line height and spacing are editable independently of interface text. Terminal cursor defaults to a non-blinking bar.

## Layout

The packaged window starts at (1080 × 720px) and supports a minimum (760 × 500px). The frame, session strip, directory row and status occupy (44px), (39px), (32px) and (28px); the terminal fills the remainder. Default pane padding uses the terminal spacing token. Split panes reserve (36px) at the top for captions and share a draggable divider.

Navigator starts closed. It is a temporary overlay below (820px); opening Studio hides it. Studio is a scrollable side pane (366px) with a minimum (320px), reducing to (340px) below (1000px). Its gallery has two columns with a (12px) gap. Below (820px), extra directory actions and dimensions recede and Studio-open session tabs shrink to a (96px) minimum. Preserve a usable shell beside the editor.

F11 terminal-only mode removes directory, status, navigator and composer chrome while keeping the session strip. The optional composer is a compact (36px) row, hidden by default. Supporting views use rows and separators rather than ornamental dashboard cards.

## Elevation & Depth

Tonal surfaces and narrow separators carry everyday depth. Tabs join the terminal surface. Elevation is reserved for overlays: dialogs, toasts, find controls and temporary compact navigation. Exact shadow values live in the sidecar.

Optional terminal backdrops occupy their own layer. Keep text, cursor and selection opaque; surface opacity changes backdrop contribution rather than fading foreground content. Tideland uses the bundled illustrated wallpaper. Frost uses its gradient endpoints with blur (18px).

## Shapes

Controls have compact, gently curved corners; status chips and swatches use the small radius. Session tabs round only their upper corners. Theme tiles use the theme radius with clipped previews; dialogs use the dialog radius. Use single-pixel borders and sparse accent strokes. Ordinary list rows stay flat.

## Components

Buttons are concise and native in scale. Primary actions use accent with terminal-coloured text; secondary actions have a border and transparent surface. Icon buttons use muted text and the control radius; common size is (29 × 29px), with smaller status and pane actions. Pressed buttons darken through brightness (.94); disabled buttons use opacity (.45).

Fields use terminal surface, a single border and the control radius. Studio fields use (8px 10px) padding and label typography. Keyboard focus is a (2px) accent outline offset (2px); composite search fields use an enclosing focus treatment. Do not remove the only focus indication.

Navigation uses compact rows, a raised selected surface and a small accent marker. Session tabs use muted inactive labels; selected tabs merge into the terminal with a bottom accent stroke (1px). Close controls appear on hover, selection or keyboard focus within.

Theme tiles show the real preset preview above their names; hover changes the border to muted and selection to accent. Studio itself remains beside the working terminal, not a detached mock preview. Its scope selector addresses global, workspace or session appearance.

State chips use a raised surface, border and caption text. Semantic success, amber and danger identify process state. Dialogs use bounded height with internal scrolling; their larger headings never become hero typography.

Control colour transitions take (100ms). Ambient drift is opt-in, uses the configured speed (30s default) and pauses while hidden or minimised. Reduced motion disables transitions and animation. Avoid animating ordinary shell output or layout changes.

## Do's and Don'ts

### Do:
- Do keep the live shell as the largest continuous working surface.
- Do resolve chrome and terminal appearance independently.
- Do preserve opaque text, cursor and selection over optional backdrops.
- Do retain visible keyboard focus and reduced-motion behaviour.
- Do use compact rows, modest corners and thin separators for supporting tools.

### Don't:
- Don't recreate a terminal or restart its shell to preview appearance.
- Don't import the retired CSS palette as a sixth theme.
- Don't expand supporting tools into ornamental dashboard cards.
- Don't let backdrop opacity fade terminal foreground content.
