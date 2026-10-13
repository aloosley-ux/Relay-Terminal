export interface Action { id: string; name: string; icon: string; description: string; command: string; directory: string; favorite: boolean }
export interface Workspace { id: string; name: string; path: string; sessionKey?: string }
export interface Settings { theme: 'dark' | 'light' | 'system'; fontSize: number; panelOpen: boolean; shell: string; loadProfiles: boolean; favorites: string[]; recents: string[]; workspaces: Workspace[]; actions: Action[]; restoreTabs: boolean; startupTabs: Workspace[]; appearance?: import('./appearance').AppearanceStore; navigatorWidth?: number; terminalOnly?: boolean; composerVisible?: boolean }
export interface Bootstrap { settings: Settings; home: string; roots: string[]; projects: string[]; shells: { id: string; name: string; path: string }[]; settingsPath: string }
export type SessionState = 'starting' | 'ready' | 'busy' | 'exited' | 'error';
export interface Session { key: string; id: string; name: string; cwd: string; shell: string; pid: number; status: SessionState; workspaceId?: string; exitCode?: number; unread: boolean; cols: number; rows: number; lastSuccess?: boolean }
export type PtyEvent = { type: 'output'; data: string; bytes: number } | { type: 'ready'; cwd: string; succeeded: boolean } | { type: 'exit'; code: number } | { type: 'error'; message: string };
export type View = 'terminal' | 'projects' | 'processes' | 'files';
export interface TaskRun { key: string; identity: string; name: string; command: string; path: string; state: 'queued' | 'running' | 'complete' | 'failed' | 'interrupted'; started: number; ended?: number; interrupted?: boolean }
export interface ProjectTask { name: string; command: string; detail: string }
export interface ProjectDetails { path: string; kind: string; description: string; manager: string; tasks: ProjectTask[]; branch: string; changes: number }
export interface ProcessSnapshot { processes: { pid: number; parentPid: number; name: string }[]; ports: { address: string; port: number; pid: number }[]; durationMs: number; warning: string }
export const basename = (path: string) => path.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || path;
export const quote = (path: string) => `'${path.replaceAll("'", "''")}'`;
