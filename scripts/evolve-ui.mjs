import fs from 'node:fs';
const file = 'src/App.tsx';
let app = fs.readFileSync(file, 'utf8');
function edit(from, to) { if (!app.includes(from)) throw new Error(`Missing replacement: ${from.slice(0, 70)}`); app = app.replace(from, to); }
edit("MoreHorizontal } from 'lucide-react'", "MoreHorizontal, Server, Files, Columns2, LayoutGrid } from 'lucide-react'");
edit("type Workspace } from './types'", "type Workspace, type TaskRun, type View } from './types'");
edit("const win = getCurrentWindow();", "import Workbench from './Workbench';\nimport './workbench.css';\n\nconst win = getCurrentWindow();");
edit("  const [active, setActive] = useState('');", `  const [active, setActive] = useState('');
  const [view, setView] = useState<View>('terminal');
  const [split, setSplit] = useState('');
  const [tasks, setTasks] = useState<TaskRun[]>([]);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const taskLaunchLocks = useRef(new Set<string>());
  const taskLaunchStarted = useRef(new Set<string>());
  const selectSession = (key: string) => { setView('terminal'); setActive(key); if (key === split) setSplit(active); change(key, { unread: false }); };
  const toggleSplit = () => { setView('terminal'); setSplit(prev => prev ? '' : sessions.filter(s => s.key !== active && s.status !== 'error' && s.status !== 'exited').at(-1)?.key || ''); if (sessions.length < 2) notify('Open a second tab to split the terminal.'); };
`);
edit("    if (patch.cwd && patch.status === 'ready') recent(patch.cwd);", `    if (patch.cwd && patch.status === 'ready') recent(patch.cwd);
    if (patch.status === 'ready' || patch.status === 'exited' || patch.status === 'error') {
      setTasks(prev => prev.map(t => t.key === key && t.state === 'running' ? { ...t, state: patch.status === 'ready' && patch.lastSuccess !== false ? 'complete' : 'failed', ended: Date.now() } : t));
    }`);
edit("    setSessions(prev => [...prev, session]); setActive(key); setComposer('');", "    setSessions(prev => [...prev, session]); setActive(key); setComposer(''); setView('terminal');");
edit("    await task;\n  }, [boot?.home, change, notify]);", "    await task;\n    return key;\n  }, [boot?.home, change, notify]);");
edit("    if (existing) { setActive(existing.key); change(existing.key, { unread: false }); }", "    if (existing) { selectSession(existing.key); }");
edit("  const action = useCallback", `  const launchTask = async (name: string, command: string, path: string) => {
    const identity = path.toLowerCase() + '\\0' + command;
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
  const action = useCallback`);
edit("records.get(session.key)?.dispose(); setSessions", "records.get(session.key)?.dispose(); if (split === session.key) setSplit(''); setTasks(prev => prev.filter(t => t.key !== session.key)); setSessions");
edit("    for (const session of sessions) mountTerminal(session.key, terminalArea.current, session.key === active);", `    for (const session of sessions) {
      mountTerminal(session.key, terminalArea.current, session.key === active || session.key === split);
      const host = records.get(session.key)?.host;
      if (host) { host.classList.toggle('pane-active', session.key === active); host.classList.toggle('pane-secondary', session.key === split); host.onmousedown = () => { if (session.key !== active) { setActive(session.key); setSplit(active); } }; }
    }
    if (view === 'terminal') requestAnimationFrame(() => records.get(active)?.terminal.focus());`);
edit("  }, [active, sessions.length]);", "  }, [active, sessions.length, split, view]);");
edit("        if (k === 'p')", "        if (k === 'd') { e.preventDefault(); toggleSplit(); }\n        if (k === 'p')");
edit("setActive(s.key); change(s.key, { unread: false });", "selectSession(s.key);");
edit('<span>relay<span className="brand-sub">terminal</span></span>', '<span>relay<span className="brand-sub">2.0</span></span>');
edit("'A little less friction.'", "'Your local workspace'");
edit('<div className="body"><main className="terminal-main">', `<div className="body"><nav className="activity-rail" aria-label="Workspace views">{([{ id: 'terminal', label: 'Terminal', icon: TerminalIcon }, { id: 'projects', label: 'Projects', icon: LayoutGrid }, { id: 'processes', label: 'Processes', icon: Server }, { id: 'files', label: 'Files', icon: Files }] as const).map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} aria-label={item.label + ' view'} aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}><item.icon size={21} /><span>{item.label}</span>{item.id === 'processes' && sessions.some(s => s.status === 'busy') && <i />}</button>)}<div className="rail-spacer" /><button aria-label="Split terminal" title="Split terminal · Ctrl+Shift+D" className={split ? 'split-selected' : ''} onClick={toggleSplit}><Columns2 size={20} /><span>Split</span></button><button aria-label="Workspace shortcuts" onClick={() => setModal({ type: 'help' })}><Keyboard size={20} /><span>Shortcuts</span></button><div className="rail-version">Local workspace</div></nav>
    {boot && settings && <Workbench view={view} boot={boot} settings={settings} sessions={sessions} tasks={tasks} current={current} open={openWorkspace} launch={(name, command, path) => void launchTask(name, command, path)} selectSession={selectSession} stop={key => records.get(key)?.write('\\x03')} pin={path => setModal({ type: 'workspace', workspace: settings.workspaces.find(w => w.path.toLowerCase() === path.toLowerCase()) || { id: crypto.randomUUID(), name: basename(path), path } })} browse={() => setModal({ type: 'folders' })} notify={notify} copy={text => void copy(text)} />}
    <main className="terminal-main" style={{ display: view === 'terminal' ? undefined : 'none' }}>`);
edit('<div ref={terminalArea} className="terminal-sessions" />', '<div ref={terminalArea} className={`terminal-sessions ${split ? \'is-split\' : \'\'}`} />{split && <div className="split-caption"><span>{sessions.find(s => s.key === split)?.name}</span><button aria-label="Close split view" onClick={() => setSplit(\'\')}><X size={13} /></button></div>}');
edit("{settings?.panelOpen && <aside", "{settings?.panelOpen && view === 'terminal' && <aside");
edit('A command when you need it. Your tools when you don’t.', 'Run PowerShell here, or type directly in the terminal');
edit('Make yourself at home<span>', 'Keyboard shortcuts<span>');
edit('title="Make yourself at home."', 'title="Keyboard shortcuts"');
edit("['New terminal tab', 'Ctrl Shift T']", "['Split / unsplit terminals', 'Ctrl Shift D'], ['New terminal tab', 'Ctrl Shift T']");
// Include sessions and workspace views in the existing keyboard-driven palette.
edit('copyOutput={() => void copy(terminalText(active))}', "copyOutput={() => void copy(terminalText(active))} sessions={sessions} selectSession={selectSession} navigate={setView}");
edit('togglePanel, copyOutput }: { settings:', 'togglePanel, copyOutput, sessions, selectSession, navigate }: { sessions: Session[]; selectSession: (key: string) => void; navigate: (view: View) => void; settings:');
edit("  ].filter(c =>", "    ...sessions.map(s => ({ name: s.name, group: 'Open session', icon: 'terminal', shortcut: '', run: () => selectSession(s.key) })),\n    ...(['projects', 'processes', 'files'] as const).map(view => ({ name: view === 'projects' ? 'Project tasks and tools' : view === 'processes' ? 'Processes, services and ports' : 'Browse files and previews', group: 'Workspace view', icon: 'folder', shortcut: '', run: () => navigate(view) })),\n  ].filter(c =>");
fs.writeFileSync(file, app);
for (const config of ['package.json', 'package-lock.json', 'src-tauri/tauri.conf.json']) {
  const data = JSON.parse(fs.readFileSync(config, 'utf8')); data.version = '2.0.0';
  if (data.packages?.['']) data.packages[''].version = '2.0.0';
  if (config.endsWith('tauri.conf.json')) { data.app.windows[0].width = 1400; data.app.windows[0].height = 880; data.bundle.shortDescription = 'PowerShell and your local development workspace'; }
  fs.writeFileSync(config, JSON.stringify(data, null, 2) + '\n');
}
