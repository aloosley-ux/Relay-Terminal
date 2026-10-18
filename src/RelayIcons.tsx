type IconProps = { size?: number };

/** The Relay switchline mark: one route with a visible handoff point. */
export function RelayMark({ size = 22 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 5h7.5c4 0 4 6.5 0 6.5H9.8c-4 0-4 6.5 0 6.5H20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11.5" cy="11.5" r="2.5" fill="var(--bg)" />
    <circle cx="11.5" cy="11.5" r="1.15" fill="currentColor" />
  </svg>;
}
