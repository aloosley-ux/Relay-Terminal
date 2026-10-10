import fs from 'node:fs';
let file = 'src/App.tsx', app = fs.readFileSync(file, 'utf8');
function edit(from, to) { if (!app.includes(from)) throw new Error(from.slice(0, 80)); app = app.replace(from, to); }
edit("'folders' | 'settings' | 'palette' | 'help'", "'folders' | 'settings' | 'palette' | 'help' | 'task'");
edit('current={current} open={openWorkspace}', "current={current} createTask={() => setModal({ type: 'task' })} open={openWorkspace}");
edit("record.host.isConnected && record.host.style.display !== 'none'", "record.host.isConnected && record.host.offsetWidth >= 20 && record.host.offsetHeight >= 20 && record.host.style.display !== 'none'");
edit("if (view === 'terminal') requestAnimationFrame(() => records.get(active)?.terminal.focus());", "if (view === 'terminal') requestAnimationFrame(() => { const focused = document.activeElement; if (!(focused instanceof HTMLElement && focused.matches('input,textarea,select') && !terminalArea.current?.contains(focused))) records.get(active)?.terminal.focus(); });");
edit("{modal.type === 'help' &&", "{modal.type === 'task' && <TaskDialog initial={current?.cwd || boot.home} close={closeModal} launch={(name, command, path) => { closeModal(); void launchTask(name, command, path); }} />}\n      {modal.type === 'help' &&");
app += `
function TaskDialog({ initial, close, launch }: { initial: string; close: () => void; launch: (name: string, command: string, path: string) => void }) {
  const [name, setName] = useState(''); const [command, setCommand] = useState(''); const [path, setPath] = useState(initial); const [error, setError] = useState(''); const [checking, setChecking] = useState(false);
  const submit = async () => { setError(''); if (!name.trim() || !command.trim()) { setError('Give the task a name and a command.'); return; } if (/[\\r\\n\\x00\\x1b]/.test(command)) { setError('Use one line of PowerShell. Separate commands with semicolons.'); return; } setChecking(true); try { await invoke('list_folders', { path }); launch(name.trim(), command, path); } catch(e) { setError(String(e)); } finally { setChecking(false); } };
  return <Modal title="Run a task" close={close}><p className="dialog-description">Give a server, script or application its own PowerShell session.</p><form onSubmit={e => { e.preventDefault(); void submit(); }}><label className="field">Name<input data-autofocus aria-label="Task name" placeholder="e.g. Preview server" maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><label className="field">PowerShell command<textarea className="code-field" aria-label="Task command" placeholder="npm run dev" rows={3} value={command} onChange={e => setCommand(e.target.value)} /></label><label className="field">Folder<div className="input-with-button"><input aria-label="Task folder" value={path} onChange={e => setPath(e.target.value)} /><button type="button" aria-label="Choose task folder" onClick={() => void invoke<string | null>('pick_folder', { initial: path }).then(value => { if (value) setPath(value); })}><FolderOpen size={15} /></button></div></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary" disabled={checking}><Play size={14} />Run in new session</button></div></form></Modal>;
}
`;
fs.writeFileSync(file, app);
file = 'src/Workbench.tsx'; let wb = fs.readFileSync(file, 'utf8');
function wedit(from, to) { if (!wb.includes(from)) throw new Error(from.slice(0, 80)); wb = wb.replace(from, to); }
wedit('<div className="wb-heading-actions">', '<div className="wb-heading-actions">{view === \'processes\' && <button className="primary" onClick={props.createTask}><Plus size={14} />Run a task</button>}');
wedit('inventory?.services.filter(s =>', 'inventory?.services.filter(s =>'); // preserve counts; sort just the displayed rows
wedit("inventory?.services.filter(s => `${s.label}", "inventory?.services.slice().sort((a,b) => Number(!!a.port) - Number(!!b.port)).filter(s => `${s.label}");
wedit("serviceBusy === s.id ? 'Working…' : s.ready ? 'Ready' : s.state", "serviceBusy === s.id ? 'Working…' : s.ready ? 'Ready' : s.state.charAt(0).toUpperCase() + s.state.slice(1)");
wedit('<span className="log-path" title={logPath}>{logPath}</span>', '<span className="log-path" title={logPath}>{logPath}</span>{logUpdated && <span className="log-updated">{logUpdated}</span>}');
fs.writeFileSync(file, wb);
