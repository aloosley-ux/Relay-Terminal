import { Terminal, type ITheme } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { Channel, invoke } from '@tauri-apps/api/core';
import type { PtyEvent, Session, Settings } from './types';

export const themes: Record<string, ITheme> = {
  dark: { background: '#111820', foreground: '#e1e8f1', cursor: '#99bfff', cursorAccent: '#111820', selectionBackground: '#4c658999', black: '#344457', red: '#ed9295', green: '#96c9a7', yellow: '#e3c68a', blue: '#91b5e9', magenta: '#c5a1dd', cyan: '#86c6cc', white: '#d9dfe5', brightBlack: '#7e91a7', brightRed: '#ffadb0', brightGreen: '#b5e1c2', brightYellow: '#f4dca8', brightBlue: '#b0cefa', brightMagenta: '#dfb9f5', brightCyan: '#a6e1e4', brightWhite: '#ffffff' },
  light: { background: '#f8f9fa', foreground: '#29333d', cursor: '#257e69', cursorAccent: '#f8f9fa', selectionBackground: '#9ccfc080', black: '#29333d', red: '#b93443', green: '#24724b', yellow: '#8d6615', blue: '#3466ae', magenta: '#8852a4', cyan: '#267880', white: '#77818b', brightBlack: '#75818c', brightRed: '#c94b59', brightGreen: '#34835a', brightYellow: '#9b7622', brightBlue: '#4a7abc', brightMagenta: '#9b65b7', brightCyan: '#388c94', brightWhite: '#a5adb6' },
};
export const effectiveTheme = (theme: Settings['theme']) => theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
export interface TerminalRecord { terminal: Terminal; fit: FitAddon; search: SearchAddon; host: HTMLDivElement; observer: ResizeObserver; channel: Channel<PtyEvent>; id: string; write: (data: string) => void; dispose: () => void }
export const records = new Map<string, TerminalRecord>();
export async function createTerminal(session: Session, settings: Settings, change: (key: string, patch: Partial<Session>) => void, error: (text: string) => void): Promise<void> {
  const host = document.createElement('div');
  host.className = 'terminal-host';
  host.dataset.session = session.key;
  const terminal = new Terminal({ theme: themes[effectiveTheme(settings.theme)], fontFamily: '"Cascadia Mono", "Cascadia Code", Consolas, "Courier New", monospace', fontSize: settings.fontSize, lineHeight: 1.2, letterSpacing: 0, scrollback: 10000, cursorStyle: 'bar', cursorBlink: true, allowProposedApi: false, convertEol: false, minimumContrastRatio: 4.5, rightClickSelectsWord: true });
  const fit = new FitAddon();
  const search = new SearchAddon();
  terminal.loadAddon(fit); terminal.loadAddon(search);
  // Do not interpret our private marker as terminal output.
  terminal.parser.registerOscHandler(777, () => true);
  let id = '';
  let disposed = false;
  let pendingAck = 0;
  let ackTimer: ReturnType<typeof setTimeout> | undefined;
  let chain = Promise.resolve();
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const write = (data: string) => {
    if (!id || disposed) return;
    if (data.includes('\r') || data.includes('\x03')) change(session.key, { status: 'busy' });
    // Preserve input ordering across asynchronous IPC calls.
    chain = chain.then(() => invoke<void>('write_input', { id, data })).catch(e => error(String(e)));
  };
  const channel = new Channel<PtyEvent>();
  channel.onmessage = event => {
    if (disposed) return;
    if (event.type === 'output') {
      const binary = atob(event.data);
      terminal.write(Uint8Array.from(binary, c => c.charCodeAt(0)), () => {
        pendingAck += event.bytes;
        if (!ackTimer) ackTimer = setTimeout(() => {
          const bytes = pendingAck; pendingAck = 0; ackTimer = undefined;
          if (id && !disposed) void invoke('ack_output', { id, bytes }).catch(() => {});
        }, 10);
      });
      if (host.style.display === 'none') change(session.key, { unread: true });
    } else if (event.type === 'ready') { change(session.key, { cwd: event.cwd, status: 'ready', lastSuccess: event.succeeded }); }
    else if (event.type === 'exit') { change(session.key, { status: 'exited', exitCode: event.code }); }
    else { error(event.message); change(session.key, { status: 'error' }); }
  };
  const resize = () => {
    if (disposed || !host.isConnected || host.offsetWidth < 20 || host.style.display === 'none') return;
    try { fit.fit(); } catch { return; }
    change(session.key, { cols: terminal.cols, rows: terminal.rows });
    if (id) void invoke('resize_session', { id, cols: terminal.cols, rows: terminal.rows }).catch(() => {});
  };
  const observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 40); });
  const record: TerminalRecord = { terminal, fit, search, host, observer, channel, id, write, dispose: () => { disposed = true; observer.disconnect(); clearTimeout(ackTimer); clearTimeout(resizeTimer); terminal.dispose(); host.remove(); records.delete(session.key); } };
  records.set(session.key, record);
  terminal.onData(write);
  terminal.onResize(({ cols, rows }) => {
    change(session.key, { cols, rows });
    if (id && !disposed) void invoke('resize_session', { id, cols, rows }).catch(() => {});
  });
  terminal.attachCustomKeyEventHandler(e => {
    if (e.type !== 'keydown') return true;
    if (e.ctrlKey && e.shiftKey && ['C', 'V', 'F', 'P', 'T', 'W', 'B', 'L', 'D'].includes(e.key.toUpperCase())) return false;
    if (e.ctrlKey && ['Tab', ',', '+', '=', '-'].includes(e.key)) return false;
    if (e.altKey && /^[1-9]$/.test(e.key)) return false;
    return true;
  });
  try {
    const result = await invoke<{ id: string; pid: number; shell: string; cwd: string }>('create_session', { cwd: session.cwd, shell: settings.shell, loadProfiles: settings.loadProfiles, cols: 100, rows: 30, output: channel });
    id = result.id; record.id = id;
    change(session.key, { ...result });
    resize();
  } catch (e) { change(session.key, { status: 'error' }); error(String(e)); }
}
export function mountTerminal(key: string, container: HTMLElement, active: boolean) {
  const record = records.get(key); if (!record) return;
  if (!record.host.isConnected) { container.appendChild(record.host); record.terminal.open(record.host); record.observer.observe(record.host); }
  record.host.style.display = active ? '' : 'none';
  if (active) { requestAnimationFrame(() => { if (record.host.offsetWidth < 20 || record.host.offsetHeight < 20) return; try { record.fit.fit(); if (record.id) void invoke('resize_session', { id: record.id, cols: record.terminal.cols, rows: record.terminal.rows }).catch(() => {}); } catch {} const focused = document.activeElement; if (!(focused instanceof HTMLElement && focused.matches('input, textarea, select') && !container.contains(focused))) record.terminal.focus(); }); }
}
export function terminalText(key: string) {
  const term = records.get(key)?.terminal; if (!term) return '';
  const buffer = term.buffer.active;
  const lines: string[] = [];
  for (let i = 0; i < buffer.length; i++) { const line = buffer.getLine(i); if (line) { const content = line.translateToString(true); if (line.isWrapped && lines.length) lines[lines.length - 1] += content; else lines.push(content); } }
  return lines.join('\r\n').trimEnd();
}
