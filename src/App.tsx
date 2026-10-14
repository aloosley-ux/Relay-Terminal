import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Plus, X, Minus, Square, Terminal as TerminalIcon, PanelsTopLeft, Search, Folder, FolderOpen, ChevronRight, ArrowUp, Star, Clock3, Play, Pencil, Trash2, Copy, ClipboardPaste, Settings2, PanelLeftClose, PanelLeftOpen, Command, Code2, ExternalLink, GitBranch, Zap, ArrowDown, Check, Sun, Moon, Monitor, GripVertical, CircleStop, Keyboard, BookOpen, CornerDownLeft, ArrowRight, MoreHorizontal, Server, Files, Columns2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { basename, quote, type Action, type Bootstrap, type Session, type Settings, type Workspace, type TaskRun, type View, type ProjectDetails } from './types';
import { createTerminal, effectiveTheme, mountTerminal, records, terminalText, applyTerminalAppearance } from './terminals';

import Workbench from './Workbench';
import TerminalMenu, { type TerminalMenuState } from './TerminalMenu';
import type { CommandBlock } from './commandOutput';
import { migrateAppearance, resolveAppearance, builtInThemes, type AppearanceStore } from './appearance';
const AppearanceStudio = lazy(() => import('./AppearanceStudio'));

const win = getCurrentWindow();
type ModalState = { type: 'folders' | 'settings' | 'palette' | 'help' | 'task' } | { type: 'action'; action?: Action } | { type: 'workspace'; workspace?: Workspace } | { type: 'close'; session?: Session; all?: boolean } | { type: 'paste'; text: string } | { type: 'rename'; session: Session } | { type: 'delete'; action?: Action; workspace?: Workspace };
const iconMap: Record<string, LucideIcon> = { terminal: TerminalIcon, git: GitBranch, folder: Folder, code: Code2, zap: Zap, book: BookOpen };
function ActionIcon({ name }: { name: string }) { const Icon = iconMap[name] || TerminalIcon; return <Icon size={17} />; }
function IconButton({ icon: Icon, label, onClick, className = '', disabled = false }: { icon: LucideIcon; label: string; onClick: () => void; className?: string; disabled?: boolean }) { return <button type="button" className={`icon-button ${className}`} title={label} aria-label={label} onClick={onClick} disabled={disabled}><Icon size={16} /></button>; }

function Modal({ title, eyebrow, children, close, wide = false }: { title: string; eyebrow?: string; children: ReactNode; close: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, select, [tabindex="0"]') || []);
    const timer = setTimeout(() => (ref.current?.querySelector<HTMLElement>('[data-autofocus]') || focusable()[0])?.focus(), 40);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      if (e.key === 'Tab') { const els = focusable(); const first = els[0]; const last = els.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    document.addEventListener('keydown', handler, true);
    return () => { clearTimeout(timer); document.removeEventListener('keydown', handler, true); prev?.focus(); };
  }, [close]);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><div ref={ref} className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div><IconButton icon={X} label="Close dialog" onClick={close} /></div>{children}</div></div>;
}

export default function App() {
  const [studio, setStudio] = useState(false);
  const [preview, setPreview] = useState<AppearanceStore>();
  const previewAppearance = useCallback((a: AppearanceStore | undefined) => setPreview(a), []);
  const [boot, setBoot] = useState<Bootstrap>();
  const [settings, setSettings] = useState<Settings>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState('');
  const [view, setView] = useState<View>('terminal');
  const [split, setSplit] = useState('');
  const [splitRatio, setSplitRatio] = useState(50);
  const [tasks, setTasks] = useState<TaskRun[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>();
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const taskLaunchLocks = useRef(new Set<string>());
  const taskLaunchStarted = useRef(new Set<string>());
  const selectSession = (key: string) => { setView('terminal'); setActive(key); if (key === split) setSplit(active); change(key, { unread: false }); };
  const toggleSplit = async () => {
    setView('terminal');
    if (split) { setSplit(''); return; }
    setSplitRatio(50);
    const other = sessions.filter(s => s.key !== active && s.status !== 'error' && s.status !== 'exited').at(-1);
    if (other) setSplit(other.key);
    else if (active) { const original = active; await newSession(); setSplit(original); }
  };

  const [panel, setPanel] = useState<'workspaces' | 'actions'>('workspaces');
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState<ModalState>();
  const [toast, setToast] = useState<{ text: string; error: boolean }>();
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [findResult, setFindResult] = useState('');
  const [composer, setComposer] = useState('');
  const [context, setContext] = useState<TerminalMenuState>();
  const [recovered, setRecovered] = useState(false);
  const restoring = useRef(false);
  const terminalArea = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const sessionsRef = useRef(sessions);
  const activeRef = useRef(active);
  const closing = useRef(false);
  const persistence = useRef<Promise<unknown>>(Promise.resolve());
  const started = useRef(false);
  settingsRef.current = settings; sessionsRef.current = sessions; activeRef.current = active;
  const current = sessions.find(s => s.key === active);
  const currentFontSize = settings ? resolveAppearance(preview || migrateAppearance(settings), current).terminal.fontSize : 14;
  const notify = useCallback((text: string, error = false) => setToast({ text, error }), []);
  const closeModal = useCallback(() => { setModal(undefined); requestAnimationFrame(() => { const focused = document.activeElement; if (!(focused instanceof HTMLElement && focused.matches('input, textarea, select') && !terminalArea.current?.contains(focused))) records.get(activeRef.current)?.terminal.focus(); }); }, []);
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const prev = settingsRef.current; if (!prev) return;
    const next = { ...prev, ...patch };
    if ('theme' in patch) { const id=effectiveTheme(next.theme)==='light'?'porcelain':'harbor'; const a=migrateAppearance(next); next.appearance={...a,followSystem:next.theme==='system',global:{appTheme:id,terminalTheme:id,custom:{...builtInThemes.find(t=>t.id===id)!,fontSize:next.fontSize}}}; }
    else if ('fontSize' in patch) {const a=migrateAppearance(next); const target=sessionsRef.current.find(s=>s.key===activeRef.current); const r=resolveAppearance(a,target);const c={...r.choice,custom:{...r.terminal,fontSize:next.fontSize}};next.appearance={...a,sessions:{...a.sessions,[activeRef.current]:c}};}
    settingsRef.current = next; setSettings(next);
    persistence.current = persistence.current.catch(() => {}).then(() => invoke('save_settings', { settings: next })).catch(e => notify(`Could not save settings: ${e}`, true));
  }, [notify]);
  const recent = useCallback((path: string) => {
    const settings = settingsRef.current; if (!settings || settings.recents[0] === path) return;
    updateSettings({ recents: [path, ...settings.recents.filter(p => p.toLowerCase() !== path.toLowerCase())].slice(0, 12) });
  }, [updateSettings]);
  const change = useCallback((key: string, patch: Partial<Session>) => {
    setSessions(prev => {
      const existing = prev.find(s => s.key === key);
      if (!existing || Object.entries(patch).every(([k, v]) => existing[k as keyof Session] === v)) return prev;
      return prev.map(s => s.key === key ? { ...s, ...patch } : s);
    });
    if (patch.cwd && patch.status === 'ready') recent(patch.cwd);
    if (patch.status === 'ready' || patch.status === 'exited' || patch.status === 'error') {
      setTasks(prev => prev.map(t => t.key === key && t.state === 'running' ? { ...t, state: t.interrupted ? 'interrupted' : patch.status === 'ready' && patch.lastSuccess !== false ? 'complete' : 'failed', ended: Date.now() } : t));
    }
  }, [recent]);
  const newSession = useCallback(async (path?: string, name?: string, workspaceId?: string, restoredKey?: string, shellId?: string) => {
    const settings = settingsRef.current; if (!settings) return;
    const key = restoredKey && !records.has(restoredKey) ? restoredKey : crypto.randomUUID();
    let cwd = path || sessionsRef.current.find(s => s.key === activeRef.current)?.cwd || boot?.home || 'C:\\';
    if (restoredKey) {
      try { await invoke('list_folders', {path:cwd}); }
      catch { notify(`Recovery folder is unavailable: ${cwd}. Opened your home folder instead.`, true); cwd=boot?.home || 'C:\\'; }
      if (shellId && shellId !== 'auto' && !boot?.shells.some(s=>s.id===shellId)) { notify('A saved shell is unavailable. Recovery is using the automatic shell.', true); shellId='auto'; }
    }
    const session: Session = { key, id: '', name: name || basename(cwd), cwd, shell: '', pid: 0, status: 'starting', unread: false, cols: 100, rows: 30, workspaceId, shellId: shellId || settings.shell };
    const task = createTerminal(session, settings, change, text => notify(text, true));
    setSessions(prev => [...prev, session]); setActive(key); setComposer(''); setView('terminal');
    await task;
    return key;
  }, [boot?.home, change, notify]);
  const openWorkspace = (workspace: Workspace) => {
    const existing = sessions.find(s => s.workspaceId === workspace.id && s.status !== 'exited' && s.status !== 'error');
    if (existing) { selectSession(existing.key); } else void newSession(workspace.path, workspace.name, workspace.id);
  };
  const stopTask = (key: string) => { setTasks(prev => prev.map(t => t.key === key && t.state === 'running' ? { ...t, interrupted: true } : t)); records.get(key)?.write('\x03'); };
  const launchTask = async (name: string, command: string, path: string) => {
    const identity = path.toLowerCase() + '\0' + command;
    const existing = tasksRef.current.find(t => t.identity === identity && (t.state === 'queued' || t.state === 'running'));
    if (existing && sessionsRef.current.some(s => s.key === existing.key && s.status !== 'exited' && s.status !== 'error')) { selectSession(existing.key); return; }
    if (taskLaunchLocks.current.has(identity)) return;
    taskLaunchLocks.current.add(identity);
    try { const key = await newSession(path, name); if (key) setTasks(prev => [...prev, { key, identity, name, command, path, state: 'queued', started: Date.now() }]); }
    finally { taskLaunchLocks.current.delete(identity); }
  };
  useEffect(() => {
    for (const task of tasks) {
      if (task.state !== 'queued' || taskLaunchStarted.current.has(task.key)) continue;
      const session = sessions.find(s => s.key === task.key);
      if (session?.status === 'error' || session?.status === 'exited') { setTasks(prev => prev.map(t => t.key === task.key ? { ...t, state: 'failed', ended: Date.now() } : t)); continue; }
      if (session?.status !== 'ready' || !session.id) continue;
      taskLaunchStarted.current.add(task.key);
      setTasks(prev => prev.map(t => t.key === task.key ? { ...t, state: 'running', started: Date.now() } : t));
      change(task.key, { status: 'busy' });
      void invoke('run_action', { id: session.id, command: task.command, directory: '', execute: true }).catch(e => {
        setTasks(prev => prev.map(t => t.key === task.key ? { ...t, state: 'failed', ended: Date.now() } : t));
        change(task.key, { status: session.status }); notify(String(e), true);
      });
    }
  }, [tasks, sessions, change, notify]);
  const action = useCallback(async (command: string, execute: boolean, directory = '') => {
    const s = sessionsRef.current.find(s => s.key === activeRef.current);
    if (!s?.id) { notify('Open a terminal tab first.', true); return false; }
    if (execute) change(s.key, { status: 'busy' });
    try { await invoke('run_action', { id: s.id, command, directory, execute }); records.get(s.key)?.terminal.focus(); return true; }
    catch (e) { if (execute) change(s.key, { status: s.status }); notify(String(e), true); return false; }
  }, [change, notify]);
  const copy = useCallback(async (text?: string) => {
    const term = records.get(activeRef.current)?.terminal;
    const value = text ?? term?.getSelection() ?? '';
    if (!value) { notify('No text to copy. Select text or choose a command with output.'); return; }
    try { await invoke('clipboard_write', { text: value }); notify('Copied to clipboard'); } catch (e) { notify(String(e), true); }
  }, [notify]);
  const copyCommandOutput = (block?: CommandBlock) => {
    if (!block || block.output === undefined) { notify('No completed command output available. Use Copy all output or select text.'); return; }
    if (block.fullScreen) { notify('This command used a full-screen display. Select text or copy the current screen instead.'); return; }
    if (!block.output) { notify('This command produced no output.'); return; }
    void invoke('clipboard_write', { text: block.output }).then(() => notify(block.truncated ? 'Copied retained output; earlier lines exceeded scrollback limits.' : 'Copied command output')).catch(e => notify(String(e), true));
  };
  const closeContext = () => { setContext(undefined); records.get(activeRef.current)?.terminal.focus(); };
  const openContext = (key: string, x: number, y: number, line?: number) => {
    const record = records.get(key); if (!record) return;
    setContext({ key, x, y, selection: record.terminal.getSelection(), block: line === undefined ? record.commands.latest() : record.commands.atLine(line) });
  };
  const paste = useCallback(async () => {
    try { const text = await invoke<string>('clipboard_read'); if (/[\r\n]/.test(text)) setModal({ type: 'paste', text }); else records.get(activeRef.current)?.terminal.paste(text); } catch (e) { notify(String(e), true); }
  }, [notify]);
  const closeSession = async (session: Session) => {
    try { if (session.id) await invoke('close_session', { id: session.id }); records.get(session.key)?.dispose(); if (split === session.key) setSplit(''); setTasks(prev => prev.filter(t => t.key !== session.key)); setSessions(prev => { const remaining = prev.filter(s => s.key !== session.key); if (activeRef.current === session.key) setActive(remaining[Math.max(0, prev.findIndex(s => s.key === session.key) - 1)]?.key || ''); return remaining; }); closeModal(); } catch (e) { notify(String(e), true); }
  };
  const requestClose = (session: Session) => { if (session.status === 'exited' || session.status === 'error') void closeSession(session); else setModal({ type: 'close', session }); };
  const exitApp = async () => { closing.current = true; try { updateSettings({ startupTabs: sessionsRef.current.filter(s => s.status !== 'error' && s.status !== 'exited').map(s => ({id:s.workspaceId || '',name:s.name,path:s.cwd,sessionKey:s.key,shellId:s.shellId})), activeSession:active, splitSession:split, splitRatio }); for (const s of sessionsRef.current) { if (s.id) await invoke('close_session', { id: s.id }); } await persistence.current; await win.close(); } catch (e) { closing.current = false; notify(String(e), true); } };
  const toggleFavorite = (path: string) => { if (settings) updateSettings({ favorites: settings.favorites.includes(path) ? settings.favorites.filter(p => p !== path) : [...settings.favorites, path] }); };
  const openIn = async (target: string) => { if (!current) return; try { await invoke('open_directory', { path: current.cwd, target }); } catch (e) { notify(String(e), true); } };
  const searchTerminal = (back = false) => { const record = records.get(active); if (!record || !findText) return; const result = back ? record.search.findPrevious(findText, { incremental: true }) : record.search.findNext(findText, { incremental: true }); setFindResult(result ? '' : 'No matches'); };

  useEffect(() => {
    if (started.current) return; started.current = true;
    void invoke<Bootstrap>('bootstrap').then(data => { data.settings.appearance=migrateAppearance(data.settings); data.settings.navigatorWidth ||=236; setBoot(data); setSettings(data.settings); settingsRef.current = data.settings; }).catch(e => notify(String(e), true));
  }, [notify]);
  useEffect(() => {
    if (!boot) return;
    if (boot.settings.restoreTabs && boot.settings.startupTabs.length) {
      restoring.current = true;
      void (async () => {
        for (const tab of boot.settings.startupTabs.slice(0, 32)) await newSession(tab.path, tab.name, tab.id || undefined, tab.sessionKey, tab.shellId);
        if (boot.settings.activeSession && records.has(boot.settings.activeSession)) setActive(boot.settings.activeSession);
        if (boot.settings.splitSession && boot.settings.splitSession !== boot.settings.activeSession && records.has(boot.settings.splitSession)) setSplit(boot.settings.splitSession);
        setSplitRatio(Math.max(25, Math.min(75, boot.settings.splitRatio || 50)));
        restoring.current = false; setRecovered(true);
      })();
    }
    else void newSession(boot.home, 'PowerShell');
    // Bootstrap once; subsequent preference changes apply to new tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boot]);
  useEffect(() => {
    if (!terminalArea.current) return;
    for (const session of sessions) {
      mountTerminal(session.key, terminalArea.current, session.key === active || session.key === split);
      const host = records.get(session.key)?.host;
      if (host) { host.classList.toggle('pane-active', session.key === active); host.classList.toggle('pane-secondary', session.key === split); const pair = sessions.filter(s => s.key === active || s.key === split); host.classList.toggle('pane-left', session.key === pair[0]?.key); host.classList.toggle('pane-right', session.key === pair[1]?.key); host.onmousedown = () => { if (session.key !== active) { setActive(session.key); setSplit(active); } }; }
    }
    if (view === 'terminal' && !studio) requestAnimationFrame(() => { const focused = document.activeElement; if (!(focused instanceof HTMLElement && (focused.matches('[role=tab], [role=separator]') || focused.matches('input,textarea,select') && !terminalArea.current?.contains(focused)))) records.get(active)?.terminal.focus(); });
    change(active, { unread: false });
    // Hosts persist across tab changes so output and shell state remain intact.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sessions.length, split, view]);
  const layoutKey = sessions.map(s => `${s.name}\0${s.cwd}\0${s.workspaceId || ''}`).join('\n');
  useEffect(() => {
    if (!boot || !settingsRef.current || restoring.current) return;
    const timer = setTimeout(() => updateSettings({ startupTabs: sessionsRef.current.filter(s => s.status !== 'error' && s.status !== 'exited').map(s => ({ id: s.workspaceId || '', name: s.name, path: s.cwd, sessionKey:s.key, shellId:s.shellId })), activeSession:active, splitSession:split, splitRatio }), 300);
    return () => clearTimeout(timer);
  }, [layoutKey, boot, updateSettings, active, split, splitRatio, recovered]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(undefined), toast.error ? 7500 : 2600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!settings) return;
    const apply = () => {
      const store=preview || migrateAppearance(settings);
      const appearance=resolveAppearance(store,sessionsRef.current.find(s=>s.key===active));
      const root=document.documentElement;
      root.dataset.theme=appearance.app.mode;
      const c=appearance.app.app;
      const vars:Record<string,string>={bg:c.background,raised:c.raised,text:c.text,muted:c.muted,faint:c.muted,accent:c.accent,'accent-strong':c.accent,focus:c.accent,border:c.border,line:c.border,hover:c.raised,'accent-bg':c.raised,terminal:appearance.terminal.terminal.background};
      for(const [key,value] of Object.entries(vars))root.style.setProperty('--'+key,value);
      for(const [key,record] of records) applyTerminalAppearance(record,resolveAppearance(store,sessionsRef.current.find(s=>s.key===key)).terminal);
    };
    apply(); const mq=matchMedia('(prefers-color-scheme: dark)');mq.addEventListener('change',apply);const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',apply);return()=>{mq.removeEventListener('change',apply);motion.removeEventListener('change',apply);};
  }, [settings?.appearance, settings?.theme, settings?.fontSize, preview, active, sessions.length]);
  useEffect(() => { for (const r of records.values()) r.terminal.options.screenReaderMode = settings?.screenReaderMode || false; }, [settings?.screenReaderMode]);
  useEffect(()=>{let disposed=false;const visibility=()=>{void Promise.all([win.isMinimized(),win.isFocused()]).then(([min,focused])=>{if(!disposed)document.documentElement.dataset.motion=min||!focused||document.hidden?'paused':'running';}).catch(()=>{});};visibility();document.addEventListener('visibilitychange',visibility);let off:(()=>void)|undefined;void win.onFocusChanged(visibility).then(fn=>off=fn);return()=>{disposed=true;document.removeEventListener('visibilitychange',visibility);off?.();};},[]);
  useEffect(()=>{let off:(()=>void)|undefined;void listen<boolean>('relay-window-visible',event=>{document.documentElement.dataset.motion=!event.payload||document.hidden?'paused':'running';}).then(fn=>off=fn);return()=>off?.();},[]);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void win.onCloseRequested(e => { if (closing.current) return; e.preventDefault(); if (sessionsRef.current.some(s => s.status !== 'exited' && s.status !== 'error')) setModal({ type: 'close', all: true }); else void exitApp(); }).then(fn => cleanup = fn);
    return () => cleanup?.();
  }, []);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void win.onDragDropEvent(e => { if (e.payload.type === 'drop') { const paths = e.payload.paths.map(quote).join(' '); const s = sessionsRef.current.find(s => s.key === activeRef.current); if (!s || s.status !== 'ready') { notify('Wait for the prompt before dropping a path.', true); return; } records.get(s.key)?.write(paths); records.get(s.key)?.terminal.focus(); notify('Path inserted with PowerShell quoting'); } }).then(fn => cleanup = fn);
    return () => cleanup?.();
  }, [notify]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (modal || context || e.isComposing || e.keyCode === 229) return;
      if (view === 'terminal' && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) { e.preventDefault(); const bounds=records.get(active)?.host.getBoundingClientRect(); if(bounds)openContext(active,bounds.x+32,bounds.y+32); return; }
      if(e.key==='F11'){e.preventDefault();updateSettings({terminalOnly:!settings?.terminalOnly});setStudio(false);setView('terminal');return;}
      if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();setStudio(v=>!v);return;}
      if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();updateSettings({composerVisible:!settings?.composerVisible});return;}
      const ctrl = e.ctrlKey; const k = e.key.toLowerCase();
      if (ctrl && e.shiftKey) {
        if (k === 'd') { e.preventDefault(); void toggleSplit(); }
        if (k === 'p') { e.preventDefault(); setModal({ type: 'palette' }); }
        if (k === 't') { e.preventDefault(); void newSession(); }
        if (k === 'w' && current) { e.preventDefault(); requestClose(current); }
        if (k === 'b' && settings) { e.preventDefault(); updateSettings({ panelOpen: !settings.panelOpen }); }
        if (k === 'l') { e.preventDefault(); setModal({ type: 'folders' }); }
        if (k === 'f') { e.preventDefault(); setFindOpen(v => !v); }
        if (k === 'c') { e.preventDefault(); void copy(); }
        if (k === 'o') { e.preventDefault(); copyCommandOutput(records.get(active)?.commands.latest()); }
        if (k === 'v') { e.preventDefault(); void paste(); }
      } else if (e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key) && split) { e.preventDefault(); const pane = sessions.filter(s => s.key === active || s.key === split)[e.key === 'ArrowLeft' ? 0 : 1]; if (pane && pane.key !== active) selectSession(pane.key); } else if (ctrl && k === ',') { e.preventDefault(); setModal({ type: 'settings' }); }
      else if (ctrl && e.key === 'Tab' && sessions.length) { e.preventDefault(); const i = sessions.findIndex(s => s.key === active); selectSession(sessions[(i + (e.shiftKey ? sessions.length - 1 : 1)) % sessions.length].key); }
      else if (ctrl && ['=', '+', '-'].includes(e.key) && settings) { e.preventDefault(); updateSettings({ fontSize: Math.max(10, Math.min(32, currentFontSize + (k === '-' ? -1 : 1))) }); }
      else if (e.altKey && /^[1-9]$/.test(k)) { e.preventDefault(); const s = sessions[Number(k) - 1]; if (s) selectSession(s.key); }
      else if (e.key === 'F1') { e.preventDefault(); setModal({ type: 'help' }); }
      else if (e.key === 'Escape') { setStudio(false);setFindOpen(false); setContext(undefined); records.get(active)?.terminal.focus(); }
    };
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  });
  useEffect(() => { if (findOpen) { setTimeout(() => document.getElementById('terminal-find')?.focus(), 30); } else { records.get(active)?.search.clearDecorations(); } }, [findOpen, active]);
  useEffect(() => { if (!findText) { records.get(active)?.search.clearDecorations(); setFindResult(''); return; } searchTerminal(); }, [findText]);


  const recentFolders = (settings?.recents || []).filter(p => !settings?.workspaces.some(w => w.path.toLowerCase() === p.toLowerCase()) && !settings?.favorites.some(f => f.toLowerCase() === p.toLowerCase()) && p.toLowerCase().includes(filter.toLowerCase())).slice(0, 4);
  const visibleActions = settings?.actions.filter(a => `${a.name} ${a.description} ${a.command}`.toLowerCase().includes(filter.toLowerCase())) || [];
  const moveAction = (id: string, delta: number) => { if (!settings) return; const actions = [...settings.actions]; const i = actions.findIndex(a => a.id === id); const next = i + delta; if (next < 0 || next >= actions.length) return; [actions[i], actions[next]] = [actions[next], actions[i]]; updateSettings({ actions }); };
  const crumbs = current?.cwd.match(/^[A-Za-z]:\\|[^\\]+/g) || [];

  return <div className={`app ${settings?.terminalOnly?'terminal-only':''} ${studio?'studio-open':''}`} style={{'--navigator-width':`${settings?.navigatorWidth||236}px`} as React.CSSProperties}>
    <header className="titlebar"><IconButton icon={settings?.panelOpen?PanelLeftClose:PanelLeftOpen} label="Toggle navigation" onClick={()=>settings&&updateSettings({panelOpen:!settings.panelOpen,terminalOnly:false})}/><div className="brand"><div className="brand-mark"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5h5l5 7-5 7H3M15 5h6M15 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div><span>Relay</span></div><div className="title-drag" onMouseDown={e => { if (e.buttons === 1) void win.startDragging(); }} onDoubleClick={() => void win.toggleMaximize()}><span>{view === 'terminal' ? current?.name || 'Terminal' : ({ projects: 'Projects', processes: 'Processes', files: 'Files' }[view])}</span></div><button className="palette-trigger" onClick={() => setModal({ type: 'palette' })}><Search size={14} /><span>Find a command</span><kbd>Ctrl ⇧ P</kbd></button><div className="title-tools">{([{id:'terminal',icon:TerminalIcon,label:'Terminal'},{id:'projects',icon:Folder,label:'Projects'},{id:'processes',icon:Server,label:'Processes'},{id:'files',icon:Files,label:'Files'}] as const).map(i=><IconButton key={i.id} icon={i.icon} label={i.label+' view'} className={view===i.id?'selected':''} onClick={()=>{setView(i.id);if(i.id!=='terminal')updateSettings({terminalOnly:false,...(i.id==='projects'?{panelOpen:true}:{})});}}/>) }<IconButton icon={Sun} label="Appearance Studio" onClick={()=>setStudio(v=>!v)}/><IconButton icon={Settings2} label="Settings · Ctrl+," onClick={()=>setModal({type:'settings'})}/></div><div className="window-buttons"><IconButton icon={Minus} label="Minimize window" onClick={() => void win.minimize()} /><IconButton icon={Square} label="Maximize or restore window" onClick={() => void win.toggleMaximize()} /><IconButton icon={X} label="Close window" onClick={() => void win.close()} className="window-close" /></div></header>
    <div className="body"><aside className={`navigator ${settings?.panelOpen ? '' : 'collapsed'}`} aria-label="Workspace navigator">
    {settings?.panelOpen && view !== 'projects' && <aside className="tools-panel"><div className="panel-switch"><button className={panel === 'workspaces' ? 'active' : ''} onClick={() => { setPanel('workspaces'); setFilter(''); }}><PanelsTopLeft size={15} />Workspaces</button><button className={panel === 'actions' ? 'active' : ''} onClick={() => { setPanel('actions'); setFilter(''); }}><Zap size={15} />Actions</button></div><div className="panel-search"><Search size={14} /><input aria-label={`Search ${panel}`} value={filter} onChange={e => setFilter(e.target.value)} placeholder={panel === 'workspaces' ? 'Find a folder or project' : 'Find an action'} />{filter && <IconButton icon={X} label="Clear filter" onClick={() => setFilter('')} />}</div><div className="panel-content">
      {panel === 'workspaces' ? <>
        <div className="section-heading"><span>Pinned workspaces</span><IconButton icon={Plus} label="Add workspace" onClick={() => setModal({ type: 'workspace' })} /></div>
        {settings.workspaces.filter(w => `${w.name} ${w.path}`.toLowerCase().includes(filter.toLowerCase())).map(w => <div className="workspace-row" key={w.id}><button className="workspace-open" onClick={() => openWorkspace(w)} title={w.path}><div className="workspace-icon"><Folder size={17} /></div><span><strong>{w.name}</strong><small>{w.path}</small></span>{sessions.some(s => s.workspaceId === w.id && s.status !== 'exited') && <span className="live-indicator" title="Session open" />}</button><IconButton icon={MoreHorizontal} label={`Edit ${w.name} workspace`} onClick={() => setModal({ type: 'workspace', workspace: w })} /></div>)}
        {!settings.workspaces.length && <button className="pin-empty" onClick={() => setModal({ type: 'workspace' })}><Plus size={16} /><span>Pin a workspace</span></button>}
        {settings.favorites.length > 0 && <><div className="section-heading"><span>Favourite folders</span><Star size={12} /></div>{settings.favorites.filter(p => p.toLowerCase().includes(filter.toLowerCase())).map(p => <div className="directory-row" key={p}><button onClick={() => void newSession(p)} title={p}><Star size={14} /><span>{basename(p)}<small>{p}</small></span></button><IconButton icon={X} label={`Remove favourite ${basename(p)}`} onClick={() => toggleFavorite(p)} /></div>)}</>}
        {recentFolders.length > 0 && <><div className="section-heading"><span>Recent folders</span><Clock3 size={12} /></div>{recentFolders.map(p => <button className="recent-row" key={p} onClick={() => void newSession(p)} title={p}><Folder size={14} /><span>{basename(p)}</span><small>{p}</small></button>)}</>}
      </> : <><div className="section-heading"><span>Saved actions</span><IconButton icon={Plus} label="Add action" onClick={() => setModal({ type: 'action' })} /></div>{visibleActions.map(a => <div className="action-row" key={a.id}><div className="action-heading"><span className="action-icon"><ActionIcon name={a.icon} /></span><strong>{a.name}</strong><IconButton icon={Star} label={`${a.favorite ? 'Unfavourite' : 'Favourite'} ${a.name}`} className={a.favorite ? 'is-favorite' : ''} onClick={() => updateSettings({ actions: settings.actions.map(item => item.id === a.id ? { ...item, favorite: !item.favorite } : item) })} /><IconButton icon={Pencil} label={`Edit ${a.name}`} onClick={() => setModal({ type: 'action', action: a })} /></div>{a.description && <p>{a.description}</p>}<code title={a.command}>{a.command}</code>{a.directory && <div className="action-directory" title={a.directory}><Folder size={12} />{a.directory}</div>}<div className="action-buttons"><IconButton icon={ArrowUp} label={`Move ${a.name} up`} onClick={() => moveAction(a.id, -1)} disabled={settings.actions[0]?.id === a.id} /><IconButton icon={ArrowDown} label={`Move ${a.name} down`} onClick={() => moveAction(a.id, 1)} disabled={settings.actions.at(-1)?.id === a.id} /><IconButton icon={Copy} label={`Copy ${a.name} command`} onClick={() => void copy(a.command)} /><span /><button disabled={current?.status !== 'ready'} onClick={() => void action(a.command, false, a.directory)}>Insert</button><button className="action-run" disabled={current?.status !== 'ready'} onClick={() => void action(a.command, true, a.directory)}><Play size={11} fill="currentColor" />Run</button></div></div>)}{!visibleActions.length && <div className="panel-empty">{filter ? 'No matching actions.' : 'Save your everyday commands here.'}</div>}</>}
    </div><div className="tools-footer">{panel === 'workspaces' ? <button className="browse-button" onClick={() => setModal({ type: 'folders' })}><FolderOpen size={16} />Browse folders<span>Ctrl ⇧ L</span></button> : <button className="browse-button" onClick={() => setModal({ type: 'action' })}><Plus size={16} />Create an action</button>}</div></aside>}
<div id="project-navigator" className="project-navigator" /><div className="navigator-footer"><button aria-label="Session settings" title="Session settings" onClick={() => setModal({ type: 'settings' })}><Settings2 size={16} /><span>Settings</span></button><button aria-label="Workspace shortcuts" title="Keyboard shortcuts · F1" onClick={() => setModal({ type: 'help' })}><Keyboard size={16} /><span>Shortcuts</span></button></div><div role="separator" aria-label="Resize navigation" aria-orientation="vertical" aria-valuemin={200} aria-valuemax={360} aria-valuenow={settings?.navigatorWidth||236} tabIndex={0} className="navigator-resizer" onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();updateSettings({navigatorWidth:Math.max(200,Math.min(360,(settings?.navigatorWidth||236)+(e.key==='ArrowRight'?10:-10)))});}}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.parentElement!.style.width=`${Math.max(200,Math.min(360,e.clientX))}px`;}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){e.currentTarget.releasePointerCapture(e.pointerId);updateSettings({navigatorWidth:Math.max(200,Math.min(360,e.clientX))});e.currentTarget.parentElement!.style.width='';}}}/></aside><div className="workspace-content">
    <nav className="tabbar" aria-label="Terminal tabs"><div className="tab-list" role="tablist">{sessions.map((s, index) => <div className={`tab ${s.key === active ? 'selected' : ''}`} key={s.key}><button role="tab" tabIndex={s.key === active ? 0 : -1} aria-selected={s.key === active} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? sessions.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : sessions.length - 1)) % sessions.length; selectSession(sessions[next].key); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.tab.selected [role="tab"]')?.focus()); } }} onClick={() => { selectSession(s.key); }} onDoubleClick={() => setModal({ type: 'rename', session: s })} title={`${s.name}\n${s.cwd}\nAlt+${index + 1}`}><span className={`session-dot ${s.status} ${s.unread ? 'unread' : ''}`} /><span className="tab-name">{s.name}</span></button><IconButton icon={X} label={`Close ${s.name}`} onClick={() => requestClose(s)} /></div>)}</div><button className="new-tab" aria-label="New tab" title="New tab · Ctrl+Shift+T" onClick={() => void newSession()} disabled={!settings}><Plus size={16} /><span>New tab</span></button><div className="tabbar-spacer" /><IconButton icon={Columns2} label="Split terminal" disabled={!current} className={split ? 'split-selected' : ''} onClick={toggleSplit} /><IconButton icon={settings?.panelOpen ? PanelLeftClose : PanelLeftOpen} label="Toggle sidebar · Ctrl+Shift+B" onClick={() => settings && updateSettings({ panelOpen: !settings.panelOpen })} /></nav>
    {boot && settings && <Workbench view={view} boot={boot} settings={settings} sessions={sessions} tasks={tasks} current={current} reportProject={setProjectDetails} createTask={() => setModal({ type: 'task' })} open={openWorkspace} launch={(name, command, path) => void launchTask(name, command, path)} selectSession={selectSession} stop={stopTask} pin={path => setModal({ type: 'workspace', workspace: settings.workspaces.find(w => w.path.toLowerCase() === path.toLowerCase()) || { id: crypto.randomUUID(), name: basename(path), path } })} browse={() => setModal({ type: 'folders' })} notify={notify} copy={text => void copy(text)} />}
    <main className="terminal-main" style={{ display: view === 'terminal' ? undefined : 'none' }}><div className="pathbar"><button className="folder-trigger" onClick={() => setModal({ type: 'folders' })} title="Choose a folder · Ctrl+Shift+L"><FolderOpen size={16} /></button><div className="breadcrumbs" title={current?.cwd}>{crumbs.map((crumb, i) => <span key={`${crumb}-${i}`}><button onClick={() => { const path = crumbs.slice(0, i + 1).join('\\').replace(':\\\\', ':\\'); void action(`Set-Location -LiteralPath ${quote(path)}`, true); }}>{crumb.replace(/\\$/, '')}</button>{i < crumbs.length - 1 && <ChevronRight size={12} />}</span>)}</div>{current && <IconButton icon={Star} label={settings?.favorites.includes(current.cwd) ? 'Unfavourite current folder' : 'Favourite current folder'} className={settings?.favorites.includes(current.cwd) ? 'is-favorite' : ''} onClick={() => toggleFavorite(current.cwd)} />}<div className="pathbar-spacer" /><IconButton icon={ExternalLink} label="Open folder in Explorer" onClick={() => void openIn('explorer')} disabled={!current} /><IconButton icon={Code2} label="Open project in VS Code" onClick={() => void openIn('code')} disabled={!current} /><span className="toolbar-divider" /><IconButton icon={Copy} label="Copy selected text · Ctrl+Shift+C" onClick={() => void copy()} disabled={!current} /><IconButton icon={ClipboardPaste} label="Paste · Ctrl+Shift+V" onClick={() => void paste()} disabled={!current} /><IconButton icon={Search} label="Find in terminal · Ctrl+Shift+F" onClick={() => setFindOpen(v => !v)} disabled={!current} /></div>
      {recovered && <div className="recovery-notice" role="status"><span>Workspace reopened in fresh shells. Previous processes and output were not restored.</span><button onClick={() => setRecovered(false)}>Dismiss</button></div>}
      <div className="terminal-stage" onContextMenu={e => {
        const host=(e.target as HTMLElement).closest<HTMLElement>('.terminal-host');
        const key=host?.dataset.session || active; const record=records.get(key);
        if (!record) return;
        e.preventDefault();
        if (record.terminal.modes.mouseTrackingMode !== 'none' && !e.shiftKey) return;
        const screen=host?.querySelector('.xterm-screen')?.getBoundingClientRect();
        const line=screen && e.clientY>=screen.top && e.clientY<screen.bottom ? record.terminal.buffer.active.viewportY+Math.floor((e.clientY-screen.top)/(screen.height/record.terminal.rows)) : undefined;
        openContext(key,e.clientX,e.clientY,line);
      }}><div ref={terminalArea} className={`terminal-sessions ${split ? 'is-split' : ''}`} style={{ '--split-ratio': `${splitRatio}%` } as React.CSSProperties} />{split && <><div className="split-caption" style={{ '--split-ratio': `${splitRatio}%` } as React.CSSProperties}>{sessions.filter(s => s.key === active || s.key === split).map(s => <span key={s.key} className={s.key === active ? 'active' : ''}>{s.name}</span>)}<button aria-label="Close split view" title="Close split view" onClick={() => setSplit('')}><X size={13} /></button></div><div role="separator" aria-label="Resize terminal panes" aria-orientation="vertical" aria-valuemin={25} aria-valuemax={75} aria-valuenow={splitRatio} tabIndex={0} className="split-handle" style={{ left: `${splitRatio}%` }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const bounds = terminalArea.current?.getBoundingClientRect(); if (bounds) setSplitRatio(Math.max(25, Math.min(75, Math.round((e.clientX - bounds.left) / bounds.width * 100)))); }} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); setSplitRatio(r => e.key === 'Home' ? 25 : e.key === 'End' ? 75 : Math.max(25, Math.min(75, r + (e.key === 'ArrowRight' ? 5 : -5)))); } }} /></>}{!sessions.length && <div className="empty-terminal"><div className="empty-mark"><TerminalIcon size={32} /></div><h1>Open a terminal</h1><p>Start PowerShell here, or open a saved workspace.</p><button className="primary" onClick={() => void newSession()} disabled={!settings}><Plus size={16} />Open a terminal</button><button className="text-button" onClick={() => setModal({ type: 'folders' })}><FolderOpen size={15} />Choose a folder</button></div>}{current?.status === 'starting' && <div className="session-overlay">Starting PowerShell…</div>}{(current?.status === 'exited' || current?.status === 'error') && <div className="exit-banner"><span>{current.status === 'exited' ? `Session ended · exit code ${current.exitCode}` : 'Session could not start'}</span><button className="text-button" onClick={() => void newSession(current.cwd, current.name)}>Open a new session <ArrowRight size={14} /></button></div>}{findOpen && <div className="find-bar"><Search size={15} /><input id="terminal-find" aria-label="Find in terminal" placeholder="Find in terminal" value={findText} onChange={e => setFindText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchTerminal(e.shiftKey); } }} /><span>{findResult}</span><IconButton icon={ArrowUp} label="Previous match" onClick={() => searchTerminal(true)} /><IconButton icon={ArrowDown} label="Next match" onClick={() => searchTerminal()} /><IconButton icon={X} label="Close terminal search" onClick={() => setFindOpen(false)} /></div>}</div>
      <div className={`command-bar ${settings?.composerVisible?'composer-visible':''}`}><TerminalIcon size={15} /><input aria-label="Command input" value={composer} onChange={e => setComposer(e.target.value)} placeholder="Compose a command…" onKeyDown={e => { if (e.key === 'Enter' && composer.trim()) { e.preventDefault(); void action(composer, !e.shiftKey).then(ok => { if (ok) setComposer(''); }); } }} /><button className="insert-button" disabled={!composer.trim() || current?.status !== 'ready'} onClick={() => void action(composer, false).then(ok => { if (ok) setComposer(''); })}>Insert</button><button className="run-button" disabled={!composer.trim() || current?.status !== 'ready'} onClick={() => void action(composer, true).then(ok => { if (ok) setComposer(''); })}><Play size={12} fill="currentColor" />Run</button></div>
    </main>
    </div>{studio&&settings&&<Suspense fallback={<aside className="appearance-studio"><p>Opening Appearance Studio…</p></aside>}><AppearanceStudio store={migrateAppearance(settings)} session={current} update={appearance=>updateSettings({appearance})} preview={previewAppearance} close={()=>{setStudio(false);requestAnimationFrame(()=>records.get(active)?.terminal.focus());}}/></Suspense>}</div>
    <footer className="statusbar" data-status={current?.status}><IconButton icon={PanelsTopLeft} label="Terminal-only mode · F11" onClick={()=>{updateSettings({terminalOnly:!settings?.terminalOnly});setStudio(false);setView('terminal');}}/>{current && current.status !== 'ready' && <><span role="status">{({ starting: 'Starting', busy: 'Running', exited: 'Ended', error: 'Error' }[current.status])}</span><span className="status-separator" /></>}<span>{current?.shell || 'PowerShell'}</span>{current && <span className="status-dimensions">{current.cols} × {current.rows}</span>}<div className="statusbar-spacer" />{current?.status === 'busy' && <button className="stop-button" onClick={() => stopTask(active)}><CircleStop size={12} />Interrupt <kbd>Ctrl C</kbd></button>}<button onClick={() => copyCommandOutput(records.get(active)?.commands.latest())} disabled={!current} title="Copy last command output · Ctrl+Shift+O"><Copy size={12} />Copy last output</button><button onClick={() => void copy(terminalText(active))} disabled={!current}>Copy all output</button><span className="status-separator" /><button onClick={()=>updateSettings({composerVisible:!settings?.composerVisible})} title="Command composer · Ctrl+Shift+M"><TerminalIcon size={12}/>Compose</button><button onClick={()=>setStudio(v=>!v)} title="Appearance Studio · Ctrl+Shift+A"><Sun size={12}/>Appearance</button><button onClick={() => setModal({ type: 'help' })}>Shortcuts <kbd>F1</kbd></button></footer>
    {toast && <div className={`toast ${toast.error ? 'error' : ''}`} role={toast.error ? 'alert' : 'status'}><span>{toast.error ? <CircleStop size={16} /> : <Check size={16} />}</span><p>{toast.text}</p><IconButton icon={X} label="Dismiss notification" onClick={() => setToast(undefined)} /></div>}
    {context && <TerminalMenu state={context} close={closeContext} copy={text => void copy(text)} paste={() => void paste()} find={() => setFindOpen(true)} output={copyCommandOutput} />}

    {modal && settings && boot && <>
      {modal.type === 'folders' && <FolderDialog boot={boot} settings={settings} initial={current?.cwd || boot.home} close={closeModal} favorite={toggleFavorite} onOpen={async (path, same) => { if (same) { const ok = await action(`Set-Location -LiteralPath ${quote(path)}`, true); if (ok) closeModal(); } else { closeModal(); await newSession(path); } }} />}
      {modal.type === 'settings' && <SettingsDialog settings={{...settings,fontSize:currentFontSize}} boot={boot} update={updateSettings} close={closeModal} />}
      {modal.type === 'action' && <ActionDialog action={modal.action} currentPath={current?.cwd || boot.home} close={closeModal} save={a => { updateSettings({ actions: settings.actions.some(x => x.id === a.id) ? settings.actions.map(x => x.id === a.id ? a : x) : [...settings.actions, a] }); closeModal(); notify('Action saved'); }} remove={a => setModal({ type: 'delete', action: a })} />}
      {modal.type === 'workspace' && <WorkspaceDialog workspace={modal.workspace} initial={current?.cwd || boot.home} close={closeModal} save={w => { updateSettings({ workspaces: settings.workspaces.some(x => x.id === w.id) ? settings.workspaces.map(x => x.id === w.id ? w : x) : [...settings.workspaces, w] }); closeModal(); notify('Workspace pinned'); }} remove={w => setModal({ type: 'delete', workspace: w })} />}
      {modal.type === 'palette' && <Palette settings={settings} projects={boot.projects} close={closeModal} choose={task => { closeModal(); task(); }} action={action} openWorkspace={openWorkspace} newSession={() => void newSession()} folder={() => setModal({ type: 'folders' })} find={() => setFindOpen(true)} configure={() => setModal({ type: 'settings' })} appearance={()=>setStudio(true)} togglePanel={() => updateSettings({ panelOpen: !settings.panelOpen })} copyLast={() => copyCommandOutput(records.get(active)?.commands.latest())} copyOutput={() => void copy(terminalText(active))} sessions={sessions} selectSession={selectSession} navigate={v=>{setView(v);if(v==='projects')updateSettings({panelOpen:true,terminalOnly:false});}} project={projectDetails} launchTask={(name, command, path) => void launchTask(name, command, path)} />}
      {modal.type === 'close' && <Modal title={modal.all ? 'Close Relay Terminal?' : `Close “${modal.session?.name}”?`} eyebrow="YOUR SESSION" close={closeModal}><p className="dialog-description">{modal.all ? `${sessions.filter(s => !['exited', 'error'].includes(s.status)).length} live sessions will end.` : modal.session?.status === 'busy' ? 'A command is still running in this tab.' : 'This tab has a live PowerShell session.'} Closing ends the shell and its child processes. Any unsaved shell state will be lost.</p><div className="notice"><CircleStop size={18} /><span>Background work may be running even when the prompt is ready.</span></div><div className="modal-actions"><button className="secondary" onClick={closeModal}>Keep working</button>{!modal.all && modal.session && <button className="secondary" onClick={() => { records.get(modal.session!.key)?.write('\x03'); closeModal(); }}>Send Ctrl+C</button>}<button className="danger" onClick={() => modal.all ? void exitApp() : modal.session && void closeSession(modal.session)}>End {modal.all ? 'sessions & close' : 'session'}</button></div></Modal>}
      {modal.type === 'paste' && <Modal title="Paste multiple lines?" eyebrow="CLIPBOARD" close={closeModal}><p className="dialog-description">Line breaks can execute commands in PowerShell. Review the clipboard before pasting into this session.</p><pre className="paste-preview">{modal.text.slice(0, 12000)}</pre><div className="modal-actions"><button className="secondary" onClick={closeModal}>Cancel</button><button className="primary" onClick={() => { records.get(active)?.terminal.paste(modal.text); closeModal(); }}>Paste into terminal</button></div></Modal>}
      {modal.type === 'rename' && <RenameDialog session={modal.session} close={closeModal} save={name => { change(modal.session.key, { name }); closeModal(); }} />}
      {modal.type === 'delete' && <Modal title={`Delete ${modal.action ? 'action' : 'workspace'}?`} close={closeModal}><p className="dialog-description">Remove “{modal.action?.name || modal.workspace?.name}” from Relay. Your folders and files stay where they are.</p><div className="modal-actions"><button className="secondary" onClick={closeModal}>Cancel</button><button className="danger" onClick={() => { if (modal.action) updateSettings({ actions: settings.actions.filter(a => a.id !== modal.action!.id) }); if (modal.workspace) updateSettings({ workspaces: settings.workspaces.filter(w => w.id !== modal.workspace!.id) }); closeModal(); }}>Delete</button></div></Modal>}
      {modal.type === 'task' && <TaskDialog initial={current?.cwd || boot.home} close={closeModal} launch={(name, command, path) => { closeModal(); void launchTask(name, command, path); }} />}
      {modal.type === 'help' && <Modal title="Keyboard shortcuts" eyebrow="RELAY TERMINAL" close={closeModal}><p className="dialog-description">A real PowerShell session, with a few thoughtful shortcuts.</p><div className="shortcut-list">{[['Terminal-only mode', 'F11'], ['Appearance Studio', 'Ctrl Shift A'], ['Command composer', 'Ctrl Shift M'], ['Split / unsplit terminals', 'Ctrl Shift D'], ['New terminal tab', 'Ctrl Shift T'], ['Close active tab', 'Ctrl Shift W'], ['Next / previous tab', 'Ctrl Tab / Ctrl Shift Tab'], ['Go to a tab', 'Alt 1–9'], ['Choose a folder', 'Ctrl Shift L'], ['Command palette', 'Ctrl Shift P'], ['Find terminal text', 'Ctrl Shift F'], ['Copy / paste', 'Ctrl Shift C / V'], ['Interrupt a running command', 'Ctrl C'], ['Toggle tools panel', 'Ctrl Shift B'], ['Text size', 'Ctrl + / −'], ['Settings', 'Ctrl ,']].map(([name, key]) => <div key={name}><span>{name}</span><kbd>{key}</kbd></div>)}</div><p className="help-tip"><Star size={15} />Star the current folder to keep it close. Double-click a tab to rename it. Drop files or folders into a terminal to insert quoted paths.</p></Modal>}
    </>}
  </div>;
}

function FolderDialog({ boot, settings, initial, close, favorite, onOpen }: { boot: Bootstrap; settings: Settings; initial: string; close: () => void; favorite: (p: string) => void; onOpen: (p: string, same: boolean) => Promise<void> }) {
  const [path, setPath] = useState(initial); const [address, setAddress] = useState(initial); const [search, setSearch] = useState('');
  const [listing, setListing] = useState<{ path: string; parent?: string; children: { name: string; path: string }[] }>(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [selected, setSelected] = useState(initial);
  useEffect(() => { let alive = true; setLoading(true); setError(''); setAddress(path); void invoke<typeof listing>('list_folders', { path }).then(data => { if (alive && data) { setListing(data); setSelected(data.path); } }).catch(e => alive && setError(String(e))).finally(() => alive && setLoading(false)); return () => { alive = false; }; }, [path]);
  const browse = async () => { const result = await invoke<string | null>('pick_folder', { initial: path }); if (result) setPath(result); };
  const candidates = [...(listing?.children || []), ...Array.from(new Set([...settings.favorites, ...settings.recents, ...boot.projects])).filter(p => !listing?.children.some(c => c.path === p)).map(path => ({ name: basename(path), path }))];
  const matches = search ? candidates.filter(p => `${p.name} ${p.path}`.toLowerCase().includes(search.toLowerCase())) : listing?.children || [];
  return <Modal title="Go to a folder" close={close} wide><div className="folder-dialog-layout"><div className="folder-shortcuts"><div className="section-heading">Quick access</div>{Array.from(new Set([boot.home, ...boot.roots, ...settings.favorites, ...settings.recents.slice(0, 4)])).map(p => <button key={p} className={path === p ? 'active' : ''} onClick={() => { setPath(p); setSearch(''); }} title={p}>{settings.favorites.includes(p) ? <Star size={14} /> : <Folder size={14} />}<span>{p === boot.home ? 'Home' : basename(p)}</span></button>)}<button onClick={() => { setPath('C:\\'); setSearch(''); }}><Monitor size={14} />Local disk (C:)</button></div><div className="folder-browser"><div className="folder-address"><IconButton icon={ArrowUp} label="Parent folder" onClick={() => listing?.parent && setPath(listing.parent)} disabled={!listing?.parent} /><input data-autofocus aria-label="Folder path" value={address} onChange={e => setAddress(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPath(address); setSearch(''); } }} /><IconButton icon={CornerDownLeft} label="Go to folder path" onClick={() => { setPath(address); setSearch(''); }} /><IconButton icon={MoreHorizontal} label="Native folder picker" onClick={() => void browse()} /></div><div className="folder-filter"><Search size={15} /><input aria-label="Search folders" placeholder="Search folders, projects and recent locations" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="folder-items">{loading ? <div className="panel-empty">Opening folder…</div> : error ? <div className="form-error">{error}</div> : matches.length ? matches.map(item => <button key={item.path} className={selected === item.path ? 'selected' : ''} onClick={() => setSelected(item.path)} onDoubleClick={() => { setPath(item.path); setSearch(''); }}><Folder size={18} /><span>{item.name}<small>{search ? item.path : 'Folder'}</small></span><ChevronRight size={15} onClick={e => { e.stopPropagation(); setPath(item.path); setSearch(''); }} /></button>) : <div className="folder-empty"><FolderOpen size={24} /><span>{search ? 'No matching folders' : 'No subfolders here'}</span><small>{search ? 'Try a folder name or enter its full path above.' : 'You can open this folder using the buttons below.'}</small></div>}</div></div></div><div className="folder-selection"><Folder size={15} /><span title={selected}>{selected}</span><IconButton icon={Star} label={settings.favorites.includes(selected) ? 'Unfavourite selected folder' : 'Favourite selected folder'} className={settings.favorites.includes(selected) ? 'is-favorite' : ''} onClick={() => favorite(selected)} /></div><div className="modal-actions"><span className="modal-hint">Double-click a folder to browse it.</span><button className="secondary" onClick={() => void onOpen(selected, true)} disabled={loading || !!error}>Use in this tab</button><button className="primary" onClick={() => void onOpen(selected, false)} disabled={loading || !!error}><Plus size={15} />Open new tab</button></div></Modal>;
}

function ActionDialog({ action, currentPath, close, save, remove }: { action?: Action; currentPath: string; close: () => void; save: (a: Action) => void; remove: (a: Action) => void }) {
  const [draft, setDraft] = useState<Action>(action || { id: crypto.randomUUID(), name: '', icon: 'terminal', description: '', command: '', directory: '', favorite: false }); const [error, setError] = useState('');
  const edit = (patch: Partial<Action>) => setDraft({ ...draft, ...patch });
  const submit = async () => { if (!draft.name.trim() || !draft.command.trim()) { setError('Give the action a name and a command.'); return; } if (/[\r\n\x00\x1b]/.test(draft.command)) { setError('Use one line of PowerShell. Separate commands with semicolons.'); return; } if (draft.directory) { try { await invoke('list_folders', { path: draft.directory }); } catch (e) { setError(String(e)); return; } } save({ ...draft, name: draft.name.trim() }); };
  return <Modal title={action ? 'Edit action' : 'Create an action'} close={close}><form onSubmit={e => { e.preventDefault(); void submit(); }}><label className="field">Name<input data-autofocus aria-label="Action name" placeholder="e.g. Check project status" maxLength={60} value={draft.name} onChange={e => edit({ name: e.target.value })} /></label><div className="field"><span>Icon</span><div className="icon-picker">{Object.entries(iconMap).map(([name, Icon]) => <button type="button" key={name} aria-label={`${name} icon`} title={name} className={draft.icon === name ? 'selected' : ''} onClick={() => edit({ icon: name })}><Icon size={18} /></button>)}</div></div><label className="field">Description <span className="optional">optional</span><input aria-label="Action description" placeholder="A short reminder of what it does" value={draft.description} onChange={e => edit({ description: e.target.value })} /></label><label className="field">PowerShell command<textarea aria-label="PowerShell command" className="code-field" placeholder="git status --short --branch" rows={3} value={draft.command} onChange={e => edit({ command: e.target.value })} /><small>Use one line. Nothing runs when you save an action.</small></label><label className="field">Working directory <span className="optional">optional</span><div className="input-with-button"><input aria-label="Action working directory" placeholder="Use the active session’s current folder" value={draft.directory} onChange={e => edit({ directory: e.target.value })} /><button type="button" title="Choose action folder" aria-label="Choose action folder" onClick={async () => { const path = await invoke<string | null>('pick_folder', { initial: draft.directory || currentPath }); if (path) edit({ directory: path }); }}><FolderOpen size={16} /></button></div><small>A specified folder becomes this session’s current directory.</small></label><label className="checkbox-row"><input type="checkbox" checked={draft.favorite} onChange={e => edit({ favorite: e.target.checked })} /><Star size={14} />Favourite this action</label>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions">{action && <button type="button" className="text-danger" onClick={() => remove(action)}><Trash2 size={15} />Delete</button>}<span className="spacer" /><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" type="submit">Save action</button></div></form></Modal>;
}

function WorkspaceDialog({ workspace, initial, close, save, remove }: { workspace?: Workspace; initial: string; close: () => void; save: (w: Workspace) => void; remove: (w: Workspace) => void }) {
  const [draft, setDraft] = useState(workspace || { id: crypto.randomUUID(), name: basename(initial), path: initial }); const [error, setError] = useState('');
  return <Modal title={workspace ? 'Pin this workspace' : 'Add a workspace'} close={close}><form onSubmit={async e => { e.preventDefault(); if (!draft.name.trim()) { setError('Give this workspace a name.'); return; } try { await invoke('list_folders', { path: draft.path }); save({ ...draft, name: draft.name.trim() }); } catch (e) { setError(String(e)); } }}><label className="field">Workspace name<input data-autofocus aria-label="Workspace name" value={draft.name} maxLength={48} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label><label className="field">Folder<div className="input-with-button"><input aria-label="Workspace folder" value={draft.path} onChange={e => setDraft({ ...draft, path: e.target.value })} /><button type="button" aria-label="Choose workspace folder" onClick={async () => { const p = await invoke<string | null>('pick_folder', { initial: draft.path }); if (p) setDraft({ ...draft, path: p, name: draft.name || basename(p) }); }}><FolderOpen size={16} /></button></div></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions">{workspace && <button type="button" className="text-danger" onClick={() => remove(workspace)}><Trash2 size={15} />Remove</button>}<span className="spacer" /><button type="button" className="secondary" onClick={close}>Cancel</button><button type="submit" className="primary">Pin workspace</button></div></form></Modal>;
}

function RenameDialog({ session, close, save }: { session: Session; close: () => void; save: (name: string) => void }) { const [name, setName] = useState(session.name); return <Modal title="Rename this tab" close={close}><form onSubmit={e => { e.preventDefault(); if (name.trim()) save(name.trim()); }}><label className="field">Tab name<input data-autofocus aria-label="Tab name" maxLength={48} value={name} onChange={e => setName(e.target.value)} /></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" disabled={!name.trim()}>Rename</button></div></form></Modal>; }

function SettingsDialog({ settings, boot, update, close }: { settings: Settings; boot: Bootstrap; update: (patch: Partial<Settings>) => void; close: () => void }) {
  return <Modal title="Settings" close={close}><div className="settings-section"><h3>Appearance</h3><div className="theme-picker">{([['dark', Moon, 'Dark'], ['light', Sun, 'Light'], ['system', Monitor, 'System']] as const).map(([value, Icon, label]) => <button key={value} className={settings.theme === value ? 'selected' : ''} onClick={() => update({ theme: value })}><Icon size={19} /><span>{label}</span>{settings.theme === value && <Check size={14} />}</button>)}</div><div className="setting-row"><div><strong>Terminal text size</strong></div><div className="stepper"><IconButton icon={Minus} label="Decrease text size" onClick={() => update({ fontSize: Math.max(10, settings.fontSize - 1) })} disabled={settings.fontSize <= 10} /><span>{settings.fontSize} px</span><IconButton icon={Plus} label="Increase text size" onClick={() => update({ fontSize: Math.min(32, settings.fontSize + 1) })} disabled={settings.fontSize >= 32} /></div></div></div><div className="settings-section"><h3>Accessibility</h3><label className="setting-row"><div><strong>Screen reader support</strong><small>Expose terminal text to assistive technology</small></div><input aria-label="Screen reader support" role="switch" type="checkbox" checked={settings.screenReaderMode || false} onChange={e=>update({screenReaderMode:e.target.checked})}/></label></div><div className="settings-section"><h3>Sessions</h3><div className="setting-row"><div><strong>Default shell</strong><small>Applies to new terminal tabs</small></div><select aria-label="Default shell" value={settings.shell} onChange={e => update({ shell: e.target.value })}><option value="auto">Automatic (prefer PowerShell 7)</option>{boot.shells.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select></div><label className="setting-row"><div><strong>Load PowerShell profiles</strong><small>Use your existing shell customisations in new tabs</small></div><input role="switch" type="checkbox" checked={settings.loadProfiles} onChange={e => update({ loadProfiles: e.target.checked })} /></label><label className="setting-row"><div><strong>Reopen tabs on launch</strong><small>Restore folders, names, shells and split layout with fresh processes</small></div><input role="switch" type="checkbox" checked={settings.restoreTabs} onChange={e => update({ restoreTabs: e.target.checked })} /></label></div><div className="settings-local"><Folder size={16} /><div><strong>Settings file</strong><small title={boot.settingsPath}>{boot.settingsPath}</small></div></div><div className="modal-actions"><button className="primary" onClick={close}>Done</button></div></Modal>;
}

function Palette({ appearance, settings, projects, close, choose, action, openWorkspace, newSession, folder, find, configure, togglePanel, copyOutput, copyLast, sessions, selectSession, navigate, project, launchTask }: { appearance:()=>void; project?: ProjectDetails; launchTask: (name: string, command: string, path: string) => void; sessions: Session[]; selectSession: (key: string) => void; navigate: (view: View) => void; settings: Settings; projects: string[]; close: () => void; choose: (task: () => void) => void; action: (command: string, execute: boolean, directory?: string) => Promise<boolean>; openWorkspace: (w: Workspace) => void; newSession: () => void; folder: () => void; find: () => void; configure: () => void; togglePanel: () => void; copyOutput: () => void; copyLast: () => void }) {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState(0);
  useEffect(() => { document.querySelector('.palette-results .selected')?.scrollIntoView({ block: 'nearest' }); }, [selected, query]);
  const commands = [
    {name: 'Open Appearance Studio', group: 'Appearance', icon: 'code', shortcut: 'Ctrl Shift A', run:appearance},
    { name: 'Copy last command output', group: 'Terminal', icon: 'terminal', shortcut: 'Ctrl Shift O', run: copyLast },
    { name: 'New PowerShell tab', group: 'Terminal', icon: 'terminal', shortcut: 'Ctrl ⇧ T', run: newSession }, { name: 'Go to a folder', group: 'Navigation', icon: 'folder', shortcut: 'Ctrl ⇧ L', run: folder }, { name: 'Find in terminal', group: 'Terminal', icon: 'terminal', shortcut: 'Ctrl ⇧ F', run: find }, { name: 'Toggle sidebar', group: 'Appearance', icon: 'code', shortcut: 'Ctrl ⇧ B', run: togglePanel }, { name: 'Copy terminal output', group: 'Terminal', icon: 'terminal', shortcut: '', run: copyOutput }, { name: 'Open settings', group: 'Appearance', icon: 'code', shortcut: 'Ctrl ,', run: configure },
    ...settings.actions.map(a => ({ name: `Insert ${a.name}`, group: a.favorite ? 'Favourite action' : 'Saved action', icon: a.icon, shortcut: '', run: () => void action(a.command, false, a.directory) })),
    ...settings.workspaces.map(w => ({ name: w.name, group: 'Workspace', icon: 'folder', shortcut: '', run: () => openWorkspace(w) })),
    ...projects.filter(p => !settings.workspaces.some(w => w.path === p)).map(p => ({ name: basename(p), group: 'Project', icon: 'folder', shortcut: '', run: () => openWorkspace({ id: `discovered:${p}`, name: basename(p), path: p }) })),
    ...(project?.tasks || []).map(t => ({ name: `Run ${basename(project!.path)} / ${t.name}`, group: 'Project task', icon: 'zap', shortcut: '', detail: t.command, run: () => launchTask(`${basename(project!.path)} / ${t.name}`, t.command, project!.path) })),
    ...sessions.map(s => ({ name: s.name, group: 'Open session', icon: 'terminal', shortcut: '', run: () => selectSession(s.key) })),
    ...(['projects', 'processes', 'files'] as const).map(view => ({ name: view === 'projects' ? 'Project tasks and tools' : view === 'processes' ? 'Processes, services and ports' : 'Browse files and previews', group: 'Workspace view', icon: 'folder', shortcut: '', run: () => navigate(view) })),
  ].filter(c => `${c.name} ${c.group} ${'detail' in c ? c.detail : ''}`.toLowerCase().includes(query.toLowerCase()));
  return <Modal title="Command palette" close={close}><div className="palette-input"><Search size={19} /><input data-autofocus aria-label="Search commands" placeholder="Commands, actions, workspaces…" value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(i => Math.min(i + 1, commands.length - 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(i => Math.max(i - 1, 0)); } if (e.key === 'Enter' && commands[selected]) { e.preventDefault(); choose(commands[selected].run); } }} /></div><div className="palette-results">{commands.map((c, i) => <button key={`${c.group}-${c.name}`} className={i === selected ? 'selected' : ''} onMouseEnter={() => setSelected(i)} onClick={() => choose(c.run)}><ActionIcon name={c.icon} /><span>{c.name}<small>{c.group}{'detail' in c ? ` · ${c.detail}` : ''}</small></span>{c.shortcut && <kbd>{c.shortcut}</kbd>}{i === selected && <CornerDownLeft size={14} />}</button>)}{!commands.length && <div className="panel-empty">No matches. Try a project or action name.</div>}</div><div className="palette-footer"><span>↑ ↓ to move</span><span>↵ to choose</span><span>Esc to close</span></div></Modal>;
}

function TaskDialog({ initial, close, launch }: { initial: string; close: () => void; launch: (name: string, command: string, path: string) => void }) {
  const [name, setName] = useState(''); const [command, setCommand] = useState(''); const [path, setPath] = useState(initial); const [error, setError] = useState(''); const [checking, setChecking] = useState(false);
  const submit = async () => { setError(''); if (!name.trim() || !command.trim()) { setError('Give the task a name and a command.'); return; } if (/[\r\n\x00\x1b]/.test(command)) { setError('Use one line of PowerShell. Separate commands with semicolons.'); return; } setChecking(true); try { await invoke('list_folders', { path }); launch(name.trim(), command, path); } catch(e) { setError(String(e)); } finally { setChecking(false); } };
  return <Modal title="Run a task" close={close}><p className="dialog-description">Give a server, script or application its own PowerShell session.</p><form onSubmit={e => { e.preventDefault(); void submit(); }}><label className="field">Name<input data-autofocus aria-label="Task name" placeholder="e.g. Preview server" maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><label className="field">PowerShell command<textarea className="code-field" aria-label="Task command" placeholder="npm run dev" rows={3} value={command} onChange={e => setCommand(e.target.value)} /></label><label className="field">Folder<div className="input-with-button"><input aria-label="Task folder" value={path} onChange={e => setPath(e.target.value)} /><button type="button" aria-label="Choose task folder" onClick={() => void invoke<string | null>('pick_folder', { initial: path }).then(value => { if (value) setPath(value); })}><FolderOpen size={15} /></button></div></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" disabled={checking}><Play size={14} />Run in new session</button></div></form></Modal>;
}
