use std::{collections::HashMap, io::{Read,Write}, path::PathBuf, sync::{Arc,Condvar,Mutex}, thread};
use base64::{Engine,engine::general_purpose::STANDARD};
use portable_pty::{native_pty_system,CommandBuilder,PtySize,MasterPty,ChildKiller};
use serde::Serialize;
use tauri::{ipc::Channel, State};
use windows::{core::PCWSTR, Win32::{Foundation::{HANDLE,CloseHandle},System::{JobObjects::*,Threading::{OpenProcess,PROCESS_SET_QUOTA,PROCESS_TERMINATE}}}};

const IN_FLIGHT: usize = 256 * 1024;
#[derive(Default)]
pub struct Sessions { items: Mutex<HashMap<String,Arc<Session>>> }
struct Session {
    master: Mutex<Option<Box<dyn MasterPty + Send>>>,
    writer: Mutex<Box<dyn Write + Send>>,
    killer: Mutex<Box<dyn ChildKiller + Send + Sync>>,
    status: Mutex<Status>,
    flow: Arc<(Mutex<Flow>,Condvar)>,
    job: Job,
    channel: Channel<PtyEvent>,
    token: String,
}
struct Status { cwd: String, ready: bool, dirty: bool, exited: bool }
struct Flow { outstanding: usize, closed: bool }
#[derive(Serialize,Clone)]
#[serde(tag="type",rename_all="camelCase")]
pub enum PtyEvent {
    Output { data: String, bytes: usize },
    Ready { cwd: String, succeeded: bool },
    Exit { code: u32 },
    Error { message: String },
}
#[derive(Serialize)]
#[serde(rename_all="camelCase")]
pub struct SessionInfo { id: String, pid: u32, shell: String, cwd: String, token: String }
#[derive(Serialize)]
pub struct Shell { pub id: String, pub name: String, pub path: String }

struct Job(HANDLE);
unsafe impl Send for Job {}
unsafe impl Sync for Job {}
impl Job {
    fn attach(pid:u32) -> Result<Self,String> { unsafe {
        let h = CreateJobObjectW(None,PCWSTR::null()).map_err(|e| e.to_string())?;
        let job = Self(h);
        let mut limits = JOBOBJECT_EXTENDED_LIMIT_INFORMATION::default();
        limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        SetInformationJobObject(h,JobObjectExtendedLimitInformation,&limits as *const _ as *const _,std::mem::size_of_val(&limits) as u32).map_err(|e| e.to_string())?;
        let process = OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE,false,pid).map_err(|e| e.to_string())?;
        let assigned = AssignProcessToJobObject(h,process);
        let _ = CloseHandle(process);
        assigned.map_err(|e| format!("Cannot contain shell process: {e}"))?;
        Ok(job)
    } }
    fn terminate(&self) { unsafe { let _ = TerminateJobObject(self.0,1); } }
}
impl Drop for Job { fn drop(&mut self) { unsafe { let _ = CloseHandle(self.0); } } }
impl Session {
    fn close(&self) {
        if let Ok(mut f) = self.flow.0.lock() { f.closed = true; self.flow.1.notify_all(); }
        self.job.terminate();
        if let Ok(mut k) = self.killer.lock() { let _ = k.kill(); }
        if let Ok(mut m) = self.master.lock() { m.take(); }
    }
}
impl Sessions {
    fn get(&self,id:&str) -> Result<Arc<Session>,String> { self.items.lock().map_err(|e|e.to_string())?.get(id).cloned().ok_or("Session has closed".into()) }
    pub fn close_all(&self) { if let Ok(mut items) = self.items.lock() { for (_,s) in items.drain() { s.close(); } } }
}
pub fn shells() -> Vec<Shell> {
    let mut result = Vec::new();
    let pf = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into());
    let mut pwsh = vec![PathBuf::from(&pf).join("PowerShell\\7\\pwsh.exe")];
    if let Some(path) = std::env::var_os("PATH") { pwsh.extend(std::env::split_paths(&path).map(|p|p.join("pwsh.exe"))); }
    if let Some(p) = pwsh.into_iter().find(|p|p.is_file()) { result.push(Shell{id:"pwsh".into(),name:"PowerShell 7".into(),path:p.to_string_lossy().to_string()}); }
    let root = std::env::var("SystemRoot").unwrap_or_else(|_|"C:\\Windows".into());
    result.push(Shell{id:"windows".into(),name:"Windows PowerShell".into(),path:format!("{root}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")});
    result
}

#[tauri::command]
pub async fn create_session(cwd:String, shell:String, load_profiles:bool, cols:u16, rows:u16, output:Channel<PtyEvent>, state:State<'_,Sessions>) -> Result<SessionInfo,String> {
    let cwd = crate::storage::directory(&cwd)?.to_string_lossy().to_string();
    if state.items.lock().map_err(|e|e.to_string())?.len() >= 32 { return Err("Relay supports up to 32 simultaneous sessions.".into()); }
    let shells = shells();
    let shell = if shell=="auto" { shells.first() } else { shells.iter().find(|s|s.id==shell) }.ok_or("Selected shell is unavailable")?;
    let shell_path = shell.path.clone();
    let shell_name = shell.name.clone();
    let cwd_spawn = cwd.clone();
    let token = uuid::Uuid::new_v4().to_string();
    let token_spawn = token.clone();
    let (master,writer,mut reader,mut child,job) = tauri::async_runtime::spawn_blocking(move || -> Result<_,String> {
        let pair = native_pty_system().openpty(PtySize{cols:cols.clamp(20,1000),rows:rows.clamp(5,500),pixel_width:0,pixel_height:0}).map_err(|e|e.to_string())?;
        let mut command = CommandBuilder::new(shell_path);
        command.arg("-NoLogo");
        if !load_profiles { command.arg("-NoProfile"); }
        command.arg("-NoExit");
        command.arg("-EncodedCommand");
        // In-memory prompt hook only. Never reads/writes a PowerShell profile.
        let script = include_str!("shell-integration.ps1")
            .replace("__RELAY_TOKEN__", &token_spawn)
            .replace("__RELAY_LOAD_PROFILES__", if load_profiles { "$true" } else { "$false" });
        let bytes: Vec<u8> = script.encode_utf16().flat_map(|u|u.to_le_bytes()).collect();
        command.arg(STANDARD.encode(bytes));
        command.cwd(cwd_spawn);
        command.env("TERM","xterm-256color");
        command.env("COLORTERM","truecolor");
        command.env("TERM_PROGRAM","Relay");
        let mut child = pair.slave.spawn_command(command).map_err(|e|e.to_string())?;
        let pid = child.process_id().ok_or("Shell did not provide a process ID")?;
        let job = match Job::attach(pid) { Ok(job)=>job, Err(e)=>{let _=child.kill();return Err(e)} };
        let reader = pair.master.try_clone_reader().map_err(|e|e.to_string())?;
        let writer = pair.master.take_writer().map_err(|e|e.to_string())?;
        drop(pair.slave);
        Ok((pair.master,writer,reader,child,job))
    }).await.map_err(|e|e.to_string())??;
    let id = uuid::Uuid::new_v4().to_string();
    let pid = child.process_id().unwrap_or(0);
    let session = Arc::new(Session {
        master:Mutex::new(Some(master)),writer:Mutex::new(writer),killer:Mutex::new(child.clone_killer()),
        status:Mutex::new(Status{cwd:cwd.clone(),ready:false,dirty:false,exited:false}),
        flow:Arc::new((Mutex::new(Flow{outstanding:0,closed:false}),Condvar::new())),job,channel:output.clone(),token:token.clone(),
    });
    state.items.lock().map_err(|e|e.to_string())?.insert(id.clone(),session.clone());
    let s = session.clone();
    thread::spawn(move || {
        let mut buffer = [0u8;16384];
        let mut marker = String::new();
        loop {
            let n = match reader.read(&mut buffer) { Ok(0)=>break,Ok(n)=>n,Err(e)=>{let _=output.send(PtyEvent::Error{message:e.to_string()});break} };
            // Prompt markers contain ASCII base64, so arbitrary UTF-8 chunk boundaries do not affect them.
            marker.push_str(&String::from_utf8_lossy(&buffer[..n]));
            let prefix = format!("\x1b]777;{};",s.token);
            while let Some(start) = marker.find(&prefix) {
                let data_start = start+prefix.len();
                let Some(end) = marker[data_start..].find('\x07').map(|i|i+data_start) else { break };
                let payload = &marker[data_start..end];
                let (encoded, success) = payload.split_once(';').unwrap_or((payload,"1"));
                if let Ok(raw) = STANDARD.decode(encoded) {
                    if let Ok(cwd) = String::from_utf8(raw) {
                        if let Ok(mut status)=s.status.lock() {status.cwd=cwd.clone();status.ready=true;status.dirty=false;}
                        let _=output.send(PtyEvent::Ready{cwd,succeeded:success=="1"});
                    }
                }
                marker.drain(..end+1);
            }
            if marker.len()>16384 { let mut cut=marker.len()-8192;while !marker.is_char_boundary(cut){cut+=1} marker.drain(..cut); }
            let (lock,cv)=&*s.flow;
            let mut f=match lock.lock(){Ok(f)=>f,Err(_)=>break};
            while f.outstanding>=IN_FLIGHT && !f.closed { f=match cv.wait(f){Ok(f)=>f,Err(_)=>return}; }
            if f.closed { break; }
            f.outstanding+=n;
            drop(f);
            if output.send(PtyEvent::Output{data:STANDARD.encode(&buffer[..n]),bytes:n}).is_err(){s.close();break}
        }
    });
    let s = session;
    thread::spawn(move || {
        let code = child.wait().map(|e|e.exit_code()).unwrap_or(1);
        if let Ok(mut status)=s.status.lock(){status.exited=true;status.ready=false;}
        // Closing ConPTY unblocks its reader and lets it drain final output.
        if let Ok(mut m)=s.master.lock(){m.take();}
        let _=s.channel.send(PtyEvent::Exit{code});
    });
    Ok(SessionInfo{id,pid,shell:shell_name,cwd,token})
}

#[tauri::command]
pub async fn write_input(id:String,data:String,state:State<'_,Sessions>) -> Result<(),String> {
    if data.len()>1024*1024 {return Err("Paste is too large (maximum 1 MiB).".into())}
    let s=state.get(&id)?;
    tauri::async_runtime::spawn_blocking(move || {
        let mut writer=s.writer.lock().map_err(|e|e.to_string())?;
        {
            let mut status=s.status.lock().map_err(|e|e.to_string())?;
            if status.exited {return Err("The shell has exited. Open a new tab.".into())}
            if data.contains(['\r','\n']) {status.ready=false;status.dirty=false;}
            else if data.contains('\x03') {status.dirty=false;}
            else if !data.is_empty() && !terminal_reply(&data) {status.dirty=true;}
        }
        writer.write_all(data.as_bytes()).and_then(|_|writer.flush()).map_err(|e|e.to_string())
    }).await.map_err(|e|e.to_string())?
}
fn terminal_reply(data:&str) -> bool {
    // Cursor position / device attributes / status replies are generated by xterm,
    // not user edits. In particular PSReadLine queries cursor position at each prompt.
    if let Some(body)=data.strip_prefix("\x1b[") {
        if body=="I" || body=="O" {return true;}
        if let Some(last)=body.chars().last() {
            if matches!(last,'R'|'c'|'n') && body[..body.len()-1].chars().all(|c|c.is_ascii_digit() || matches!(c,';'|'?'|'>'|'=')) {return true;}
        }
    }
    false
}
#[tauri::command]
pub async fn resize_session(id:String,cols:u16,rows:u16,state:State<'_,Sessions>) -> Result<(),String> {
    let s=state.get(&id)?;
    tauri::async_runtime::spawn_blocking(move || {
        let m=s.master.lock().map_err(|e|e.to_string())?;
        if let Some(m)=m.as_ref(){m.resize(PtySize{cols:cols.clamp(20,1000),rows:rows.clamp(5,500),pixel_width:0,pixel_height:0}).map_err(|e|e.to_string())?;}
        Ok(())
    }).await.map_err(|e|e.to_string())?
}
#[tauri::command]
pub fn ack_output(id:String,bytes:usize,state:State<Sessions>) -> Result<(),String> {
    let s=state.get(&id)?;
    let mut f=s.flow.0.lock().map_err(|e|e.to_string())?;
    f.outstanding=f.outstanding.saturating_sub(bytes);
    s.flow.1.notify_one();
    Ok(())
}
#[tauri::command]
pub async fn close_session(id:String,state:State<'_,Sessions>) -> Result<(),String> {
    let s=state.items.lock().map_err(|e|e.to_string())?.remove(&id);
    if let Some(s)=s {tauri::async_runtime::spawn_blocking(move || s.close()).await.map_err(|e|e.to_string())?;}
    Ok(())
}
#[tauri::command]
pub async fn run_action(id:String,command:String,directory:String,execute:bool,state:State<'_,Sessions>) -> Result<(),String> {
    if command.trim().is_empty() || command.len()>32768 || command.contains(['\0','\x1b','\x03']) {return Err("Action contains unsupported input.".into())}
    // GUI actions are intentionally single-line. Literal code is user-authored; paths are data.
    if command.contains(['\r','\n']) {return Err("Saved actions must be one line. Use semicolons between commands.".into())}
    let text=if directory.is_empty(){command}else{
        let path=crate::storage::directory(&directory)?;
        format!("Set-Location -LiteralPath {} -ErrorAction Stop; {}",crate::storage::quote(&path.to_string_lossy()),command)
    };
    let s=state.get(&id)?;
    tauri::async_runtime::spawn_blocking(move || {
        let mut writer=s.writer.lock().map_err(|e|e.to_string())?;
        let mut status=s.status.lock().map_err(|e|e.to_string())?;
        if status.exited || !status.ready {return Err("This session is busy. Wait for its prompt, or press Ctrl+C.".into())}
        if status.dirty {return Err("There is input at the prompt. Submit it or press Ctrl+C before using an action.".into())}
        status.dirty=true;
        if execute{status.ready=false;status.dirty=false;}
        let text=if execute{format!("{text}\r")}else{text};
        writer.write_all(text.as_bytes()).and_then(|_|writer.flush()).map_err(|e|e.to_string())
    }).await.map_err(|e|e.to_string())?
}

#[cfg(test)]
mod tests {
    #[test] fn powershell_literal_paths() {
        assert_eq!(crate::storage::quote("C:\\a'b $x; café"),"'C:\\a''b $x; café'");
        assert!(crate::storage::directory("relative").is_err());
        assert!(crate::storage::directory("C:\\\n").is_err());
    }
    #[test] fn distinguish_terminal_replies_from_input() {
        assert!(super::terminal_reply("\x1b[4;3R"));
        assert!(super::terminal_reply("\x1b[?1;2c"));
        assert!(!super::terminal_reply("\x1b[A"));
        assert!(!super::terminal_reply("hello"));
    }
}
