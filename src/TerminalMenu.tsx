import { useLayoutEffect, useRef } from 'react';
import type { CommandBlock } from './commandOutput';
import { records, terminalText } from './terminals';

export interface TerminalMenuState { x: number; y: number; key: string; block?: CommandBlock; selection: string }
export default function TerminalMenu({ state, close, copy, paste, find, output, appearance }: {
  state: TerminalMenuState; close: () => void; copy: (text: string) => void;
  paste: () => void; find: () => void; output: (block?: CommandBlock) => void; appearance: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const record = records.get(state.key);
  useLayoutEffect(() => {
    const menu = ref.current!;
    const bounds = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(state.x, innerWidth - bounds.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(state.y, innerHeight - bounds.height - 8))}px`;
    menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const dismiss = (e: PointerEvent) => { if (!menu.contains(e.target as Node)) close(); };
    const resize = () => close();
    document.addEventListener('pointerdown', dismiss); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('pointerdown', dismiss); window.removeEventListener('resize', resize); };
  }, [state]);
  const act = (fn: () => void) => { close(); fn(); };
  const item = (label: string, fn: () => void, disabled = false, shortcut?: string) => <button role="menuitem" disabled={disabled} onClick={() => act(fn)}>{label}{shortcut && <kbd>{shortcut}</kbd>}</button>;
  return <div ref={ref} role="menu" aria-label="Terminal actions" className="context-menu terminal-context-menu" style={{ left: state.x, top: state.y }} onKeyDown={e => {
    e.stopPropagation();
    const items = Array.from(ref.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault(); items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
    } else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close(); }
  }}>
    <div className="terminal-menu-caption" title={state.block?.command}>{state.block?.command || 'No command at this position'}</div>
    {item('Copy selection', () => copy(state.selection), !state.selection, 'Ctrl ⇧ C')}
    {item('Copy command', () => copy(state.block!.command), !state.block)}
    {item('Copy command output', () => output(state.block), state.block?.output === undefined || !!state.block.fullScreen)}
    {item('Copy last output', () => output(record?.commands.latest()), !record?.commands.latest(), 'Ctrl ⇧ O')}
    {item('Copy all output', () => copy(terminalText(state.key)))}
    <hr />
    {item('Paste', paste, false, 'Ctrl ⇧ V')}
    {item('Select all', () => record?.terminal.selectAll())}
    {item('Find in terminal', find)}
    <hr />
    {item('Quick appearance…', appearance)}
    <hr />
    {item('Clear scrollback', () => { record?.commands.clear(); record?.terminal.clear(); })}
  </div>;
}
