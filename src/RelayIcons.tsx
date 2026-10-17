import type { ReactNode } from 'react';

type IconProps = { size?: number };

function Glyph({ size = 16, children }: IconProps & { children: ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

/** The Relay switchline mark: one route with a visible handoff point. */
export function RelayMark({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 5h7.5c4 0 4 6.5 0 6.5H9.8c-4 0-4 6.5 0 6.5H20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11.5" cy="11.5" r="2.5" fill="var(--bg)" />
    <circle cx="11.5" cy="11.5" r="1.15" fill="currentColor" />
  </svg>;
}

export function RelayNavOpen({ size }: IconProps) {
  return <Glyph size={size}><path d="M3.5 4.5h17v15h-17zM8.5 4.5v15m4-9.5 3.5 2-3.5 2" /></Glyph>;
}

export function RelayNavClosed({ size }: IconProps) {
  return <Glyph size={size}><path d="M3.5 4.5h17v15h-17zM8.5 4.5v15m8-9.5-3.5 2 3.5 2" /></Glyph>;
}

export function RelaySearch({ size }: IconProps) {
  return <Glyph size={size}><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></Glyph>;
}

export function RelayTerminal({ size }: IconProps) {
  return <Glyph size={size}>
    <path d="M4 4.5h16v15H4zM7 7.5h4.4c2.6 0 2.6 4.3 0 4.3h-1c-2.6 0-2.6 4.2 0 4.2h6.1" />
    <circle cx="11.4" cy="11.8" r="1.7" fill="var(--terminal)" stroke="none" />
    <circle cx="11.4" cy="11.8" r=".75" fill="currentColor" stroke="none" />
  </Glyph>;
}

export function RelayWorkspace({ size }: IconProps) {
  return <Glyph size={size}><path d="M2.5 7h6.8l2 2H21.5v10h-19zM2.5 10h19M6 14h5m3 0h.1" /></Glyph>;
}

export function RelayAction({ size }: IconProps) {
  return <Glyph size={size}><path d="M4 5.5h11v4.5h-5v4.5h8m-3-3 3 3-3 3" /><circle cx="4" cy="5.5" r="1" fill="currentColor" stroke="none" /></Glyph>;
}

export function RelayProcesses({ size }: IconProps) {
  return <Glyph size={size}><path d="M6 6h14M6 12h14M6 18h14" /><circle cx="3.5" cy="6" r="1.1" fill="currentColor" stroke="none" /><circle cx="3.5" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="3.5" cy="18" r="1.1" fill="currentColor" stroke="none" /></Glyph>;
}

export function RelayFiles({ size }: IconProps) {
  return <Glyph size={size}><path d="M5.5 2.8h8l5 5v13.4h-13zM13.5 2.8v5h5M8.5 12h7m-7 4h7" /></Glyph>;
}

export function RelayAppearance({ size }: IconProps) {
  return <Glyph size={size}><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M7.3 8.3a5.5 5.5 0 0 0 0 7.4" /></Glyph>;
}

export function RelaySettings({ size }: IconProps) {
  return <Glyph size={size}><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="2" fill="var(--bg)" /><circle cx="16" cy="12" r="2" fill="var(--bg)" /><circle cx="6" cy="18" r="2" fill="var(--bg)" /></Glyph>;
}

export function RelayHelp({ size }: IconProps) {
  return <Glyph size={size}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M9.8 9a2.4 2.4 0 1 1 4 1.8c-1.1.8-1.8 1.1-1.8 2.7M12 16.8v.1" /></Glyph>;
}
