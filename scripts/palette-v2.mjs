import fs from 'node:fs';
let app=fs.readFileSync('src/App.tsx','utf8');
function edit(from,to){if(!app.includes(from))throw new Error(from.slice(0,90));app=app.replace(from,to);}
edit("type TaskRun, type View }", "type TaskRun, type View, type ProjectDetails }");
edit("  const [tasks, setTasks] = useState<TaskRun[]>([]);", "  const [tasks, setTasks] = useState<TaskRun[]>([]);\n  const [projectDetails, setProjectDetails] = useState<ProjectDetails>();");
edit('current={current} createTask=', 'current={current} reportProject={setProjectDetails} createTask=');
edit('sessions={sessions} selectSession={selectSession} navigate={setView}', 'sessions={sessions} selectSession={selectSession} navigate={setView} project={projectDetails} launchTask={(name, command, path) => void launchTask(name, command, path)}');
edit('sessions, selectSession, navigate }: { sessions:', 'sessions, selectSession, navigate, project, launchTask }: { project?: ProjectDetails; launchTask: (name: string, command: string, path: string) => void; sessions:');
edit("    ...sessions.map(s =>", "    ...(project?.tasks || []).map(t => ({ name: `Run ${basename(project!.path)} / ${t.name}`, group: 'Project task', icon: 'zap', shortcut: '', detail: t.command, run: () => launchTask(`${basename(project!.path)} / ${t.name}`, t.command, project!.path) })),\n    ...sessions.map(s =>");
edit('`${c.name} ${c.group}`.toLowerCase()', "`${c.name} ${c.group} ${'detail' in c ? c.detail : ''}`.toLowerCase()");
edit('<small>{c.group}</small>', "<small>{c.group}{'detail' in c ? ` · ${c.detail}` : ''}</small>");
fs.writeFileSync('src/App.tsx',app);
let wb=fs.readFileSync('src/Workbench.tsx','utf8');
wb=wb.replace('createTask: () => void;', 'reportProject: (project: ProjectDetails) => void; createTask: () => void;');
wb=wb.replace('if (request === projectRequest.current) setDetails(data);', 'if (request === projectRequest.current) { setDetails(data); props.reportProject(data); }');
fs.writeFileSync('src/Workbench.tsx',wb);
