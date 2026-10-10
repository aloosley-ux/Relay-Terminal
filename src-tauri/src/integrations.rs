//! On-demand adapters to existing local controllers. Relay never owns these services.
use base64::Engine;
use serde_json::{json, Value};
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{Read, Seek, SeekFrom},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
#[cfg(windows)]
use std::os::windows::process::CommandExt;

const ROOT: &str = r"C:\AI\Cortana";
const STATUS: &str = r"C:\AI\Cortana\Cortana-Status.ps1";
const CONTROLLER: &str = r"C:\AI\Cortana\Cortana-Service.ps1";
const REGISTRY: &str = r"C:\AI\Cortana\services.json";
const TAIL_LIMIT: usize = 128 * 1024;
const OUTPUT_LIMIT: usize = 256 * 1024;
static CONTROL_LOCK: Mutex<()> = Mutex::new(());

fn valid_identifier(id: &str) -> bool {
    !id.is_empty() && id.len() <= 64
        && id.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
}

fn validate_registry(raw: &str) -> Result<Vec<Value>, String> {
    let values: Vec<Value> = serde_json::from_str(raw).map_err(|e| format!("Invalid Cortana service registry: {e}"))?;
    if values.is_empty() || values.len() > 64 { return Err("Cortana registry must contain 1–64 services.".into()); }
    let mut names = HashSet::new();
    let mut ports = HashSet::new();
    for value in &values {
        let id = value["name"].as_str().unwrap_or_default();
        if !valid_identifier(id) || !names.insert(id.to_ascii_lowercase()) {
            return Err("Cortana registry contains an invalid or duplicate service identifier.".into());
        }
        let port = value["port"].as_u64().unwrap_or_default();
        if !(1..=65535).contains(&port) || !ports.insert(port) {
            return Err("Cortana registry contains an invalid or duplicate primary port.".into());
        }
        if value["label"].as_str().is_none_or(str::is_empty)
            || value["processMatch"].as_str().is_none_or(str::is_empty)
            || !value["required"].is_boolean() {
            return Err(format!("Cortana registry entry '{id}' is missing its identity contract."));
        }
    }
    Ok(values)
}

fn registry() -> Result<Vec<Value>, String> {
    let metadata = fs::metadata(REGISTRY).map_err(|_| "Cortana service registry was not found.".to_string())?;
    if metadata.len() > 256 * 1024 { return Err("Cortana service registry exceeds the size limit.".into()); }
    validate_registry(&fs::read_to_string(REGISTRY).map_err(|e| e.to_string())?)
}

fn lookup(id: &str) -> Result<Value, String> {
    if !valid_identifier(id) { return Err("Invalid service identifier.".into()); }
    registry()?.into_iter().find(|v| v["name"].as_str() == Some(id))
        .ok_or_else(|| "This service is not in the existing Cortana registry.".into())
}

struct ProcessResult { exit_code: i32, stdout: String, stderr: String }

fn collect_output<R: Read + Send + 'static>(mut stream: R) -> (Arc<Mutex<Vec<u8>>>, thread::JoinHandle<()>) {
    let bytes = Arc::new(Mutex::new(Vec::new()));
    let destination = bytes.clone();
    let handle = thread::spawn(move || {
        let mut chunk = [0; 8192];
        while let Ok(count) = stream.read(&mut chunk) {
            if count == 0 { break; }
            if let Ok(mut buffer) = destination.lock() {
                let remaining = OUTPUT_LIMIT.saturating_sub(buffer.len());
                buffer.extend_from_slice(&chunk[..count.min(remaining)]);
            }
        }
    });
    (bytes, handle)
}

fn powershell(script: &str, timeout: Duration) -> Result<ProcessResult, String> {
    // Only fixed scripts and strictly validated registry identifiers enter this command.
    let script = format!("$ErrorActionPreference='Stop'; [Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false); $OutputEncoding=[Console]::OutputEncoding; {script}");
    let bytes: Vec<u8> = script.encode_utf16().flat_map(u16::to_le_bytes).collect();
    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
    let mut command = Command::new("powershell.exe");
    command.args(["-NoLogo", "-NoProfile", "-NonInteractive", "-OutputFormat", "Text", "-ExecutionPolicy", "Bypass", "-EncodedCommand", &encoded])
        .stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped());
    #[cfg(windows)] command.creation_flags(0x08000000);
    let mut child = command.spawn().map_err(|e| format!("Cannot run the existing PowerShell controller: {e}"))?;
    let (out, out_thread) = collect_output(child.stdout.take().ok_or("Missing controller output stream")?);
    let (err, err_thread) = collect_output(child.stderr.take().ok_or("Missing controller error stream")?);
    let deadline = Instant::now() + timeout;
    let status = loop {
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? { break status; }
        if Instant::now() >= deadline {
            let _ = child.kill();
            let _ = child.wait();
            return Err("The existing controller exceeded its time limit. Check service status before retrying; a requested operation may still be completing.".into());
        }
        thread::sleep(Duration::from_millis(40));
    };
    // Avoid hanging if an existing launcher inherited a pipe; only the captured adapter exits.
    let drain_deadline = Instant::now() + Duration::from_millis(300);
    while (!out_thread.is_finished() || !err_thread.is_finished()) && Instant::now() < drain_deadline {
        thread::sleep(Duration::from_millis(10));
    }
    let stdout = String::from_utf8_lossy(&out.lock().map_err(|_| "Controller output lock failed")?).trim_start_matches('\u{feff}').trim().to_string();
    let stderr = String::from_utf8_lossy(&err.lock().map_err(|_| "Controller error lock failed")?).trim().to_string();
    Ok(ProcessResult { exit_code: status.code().unwrap_or(-1), stdout, stderr })
}

fn trusted_logs(id: &str) -> Vec<(String, String, PathBuf, PathBuf)> {
    let root = PathBuf::from(ROOT);
    let named: &[(&str, &str, &str)] = match id {
        "router" => &[("stdout", "Router output", "router.out.log"), ("stderr", "Router errors", "router.err.log")],
        "embeddings" => &[("stdout", "Embeddings output", "embeddings.out.log"), ("stderr", "Embeddings errors", "embeddings.err.log")],
        "paperclip" => &[("output", "Paperclip diagnostics", "stage8-paperclip.out.log")],
        _ => &[],
    };
    let mut paths: Vec<_> = named.iter().map(|(key, label, file)|
        (key.to_string(), label.to_string(), root.join("logs").join(file), root.clone())).collect();
    if id == "cortana-control" {
        if let Some(local) = std::env::var_os("LOCALAPPDATA") {
            let root = PathBuf::from(local).join("CortanaHub").join("Control");
            paths.push(("control".into(), "Control activity".into(), root.join("control.log"), root));
        }
    }
    if id == "desktop-commander" {
        if let Some(home) = std::env::var_os("USERPROFILE") {
            let root = PathBuf::from(home).join(".claude-server-commander");
            paths.push(("activity".into(), "Agent activity".into(), root.join("claude_tool_call.log"), root));
        }
    }
    paths
}

fn log_descriptors(id: &str) -> Vec<Value> {
    trusted_logs(id).into_iter().filter(|(_, _, path, _)| path.is_file()).map(|(key, label, path, _)|
        json!({"id":key,"label":label,"path":path.to_string_lossy(),"modifiedMs":fs::metadata(&path).ok().and_then(|m| m.modified().ok()).and_then(|t| t.duration_since(UNIX_EPOCH).ok()).map(|d| d.as_millis() as u64)})).collect()
}

fn inventory_sync() -> Result<Value, String> {
    let mut issues = Vec::new();
    let mut services = Vec::new();
    let mut timestamp = Value::Null;
    let mut core_state = "unavailable".to_string();
    match registry() {
        Err(error) => issues.push(error),
        Ok(definitions) => {
            let control_available = Path::new(CONTROLLER).is_file();
            if !control_available { issues.push("The canonical Cortana service controller is missing; service actions are unavailable.".into()); }
            let status = if Path::new(STATUS).is_file() {
                match powershell(&format!("& '{STATUS}' -Json -RegistryPath '{REGISTRY}'"), Duration::from_secs(40)) {
                    Ok(result) => match serde_json::from_str::<Value>(&result.stdout) {
                        Ok(value) if value["contractVersion"] == 1 && value["services"].is_object() && value["error"].is_null() => {
                            timestamp = value["timestamp"].clone();
                            core_state = value["state"].as_str().unwrap_or("unavailable").into();
                            Some(value)
                        },
                        Ok(value) => { issues.push(value["error"].as_str().unwrap_or("The canonical status contract is incomplete or unsupported.").into()); None },
                        Err(_) => { issues.push(format!("Canonical status returned invalid JSON (exit {}).", result.exit_code)); None },
                    },
                    Err(error) => { issues.push(error); None },
                }
            } else { issues.push("The canonical Cortana status script is missing.".into()); None };
            for definition in definitions {
                let id = definition["name"].as_str().unwrap_or_default();
                let observed = status.as_ref().and_then(|v| v["services"].get(id));
                let trustworthy = observed.is_some_and(|v| v["name"] == id && v["port"] == definition["port"] && v["state"].is_string());
                let can_control = control_available && trustworthy;
                if status.is_some() && !trustworthy { issues.push(format!("Canonical status omitted or misidentified '{id}'; its actions are unavailable.")); }
                let status = observed.filter(|_| trustworthy).cloned().unwrap_or(Value::Null);
                services.push(json!({
                    "id":id,"name":id,"label":definition["label"],"group":"Cortana","port":definition["port"],"required":definition["required"],
                    "state":status["state"].as_str().unwrap_or("unavailable"),"processIds":status["processIds"].as_array().cloned().unwrap_or_default(),
                    "ready":status["ready"].as_bool().unwrap_or(false),"listening":status["listening"].as_bool().unwrap_or(false),
                    "processRunning":status["processRunning"].as_bool().unwrap_or(false),"portOwnerMatches":status["portOwnerMatches"].as_bool().unwrap_or(false),
                    "detail":status["detail"],"healthUrl":definition["healthUrl"],"controlAvailable":can_control,
                    "actions":if can_control { vec!["Start","Stop","Restart"] } else { vec![] },"logs":log_descriptors(id),
                    "controller":CONTROLLER
                }));
            }
        }
    }
    // Observe existing node/WPF processes without exposing command lines or device credentials.
    let script = r"$p=@(Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'node.exe' -and $_.CommandLine -match '(?i)[\\/]@wonderwhy-er[\\/]desktop-commander[\\/].*dist[\\/](?:index\.js|remote-device[\\/]device\.js)') -or $_.Name -eq 'Cortana.Control.exe' } | Select-Object ProcessId,Name); ConvertTo-Json -InputObject $p -Compress";
    match powershell(script, Duration::from_secs(10)) {
        Ok(result) if result.exit_code == 0 => match serde_json::from_str::<Vec<Value>>(&result.stdout) {
            Ok(processes) => {
                for (id, label, executable, group) in [("desktop-commander", "Remote Desktop Commander", "node.exe", "Applications"), ("cortana-control", "Cortana Control", "Cortana.Control.exe", "Cortana")] {
                    let ids: Vec<Value> = processes.iter().filter(|p| p["Name"] == executable).map(|p| p["ProcessId"].clone()).collect();
                    let running = !ids.is_empty();
                    services.push(json!({"id":id,"name":id,"label":label,"group":group,"port":Value::Null,"required":false,
                        "state":if running {"running"} else {"stopped"},"processIds":ids,"processRunning":running,"ready":false,"listening":false,
                        "portOwnerMatches":false,"controlAvailable":false,"actions":[],"logs":log_descriptors(id),
                        "detail":if id=="desktop-commander" {"Existing agent process observation. Remote connectivity is unverified. Managed by Desktop Commander; Relay leaves its sessions intact."} else {"Existing native application. Its lifecycle is independent of Cortana services."}}));
                }
            },
            Err(_) => issues.push("Application process observation returned invalid JSON.".into()),
        },
        Ok(_) => issues.push("Application process observation failed.".into()),
        Err(error) => issues.push(error),
    }
    Ok(json!({"services":services,"issues":issues,"timestamp":timestamp,"observedAtMs":SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64,"coreState":core_state}))
}

#[tauri::command]
pub async fn service_inventory() -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(inventory_sync).await.map_err(|e| e.to_string())?
}

fn control_sync(id: String, action: String) -> Result<Value, String> {
    let definition = lookup(&id)?;
    let canonical = match action.to_ascii_lowercase().as_str() {
        "start" => "Start", "stop" => "Stop", "restart" => "Restart",
        _ => return Err("Supported service actions are Start, Stop and Restart.".into()),
    };
    let _guard = CONTROL_LOCK.try_lock().map_err(|_| "Another service operation is in progress. Wait for its result before trying again.")?;
    if !Path::new(CONTROLLER).is_file() || !Path::new(STATUS).is_file() {
        return Err("The canonical Cortana controller or status script is missing.".into());
    }
    // The canonical controller performs ownership/readiness validation immediately before mutation.
    // Invoke it directly, never its configured launch script, PTY command or port-based termination.
    let timeout = definition["startupTimeoutSec"].as_u64().unwrap_or(120).clamp(30, 300) + 90;
    let result = powershell(&format!("& '{CONTROLLER}' -RegistryPath '{REGISTRY}' -Action {canonical} -Name '{id}'"), Duration::from_secs(timeout))?;
    let output = if result.stderr.is_empty() { result.stdout } else { format!("{}\n{}", result.stdout, result.stderr).trim().to_string() };
    Ok(json!({"id":id,"action":canonical,"ok":result.exit_code==0,"exitCode":result.exit_code,"output":output}))
}

#[tauri::command]
pub async fn service_control(id: String, action: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || control_sync(id, action)).await.map_err(|e| e.to_string())?
}

fn decode_log(bytes: &[u8], utf16: bool) -> String {
    if utf16 {
        let words: Vec<u16> = bytes.chunks_exact(2).map(|b| u16::from_le_bytes([b[0], b[1]])).collect();
        String::from_utf16_lossy(&words).trim_start_matches('\u{feff}').into()
    } else { String::from_utf8_lossy(bytes).trim_start_matches('\u{feff}').into() }
}

fn tail_file(path: &Path, trusted_root: &Path) -> Result<(String, u64, bool), String> {
    let resolved = path.canonicalize().map_err(|e| format!("Log file is unavailable: {e}"))?;
    let root = trusted_root.canonicalize().map_err(|e| e.to_string())?;
    if !resolved.starts_with(root) { return Err("Log path is outside its trusted integration directory.".into()); }
    let mut file = File::open(resolved).map_err(|e| e.to_string())?;
    let length = file.metadata().map_err(|e| e.to_string())?.len();
    let mut bom = [0; 2];
    let utf16 = file.read(&mut bom).unwrap_or(0) == 2 && bom == [0xff, 0xfe];
    let mut start = length.saturating_sub(TAIL_LIMIT as u64);
    if utf16 { start -= start % 2; }
    file.seek(SeekFrom::Start(start)).map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    file.take(TAIL_LIMIT as u64).read_to_end(&mut bytes).map_err(|e| e.to_string())?;
    Ok((decode_log(&bytes, utf16), length, start > 0))
}

#[tauri::command]
pub async fn read_service_log(id: String, log_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        if id != "cortana-control" && id != "desktop-commander" { lookup(&id)?; }
        let (_, _, path, root) = trusted_logs(&id).into_iter().find(|(key, _, _, _)| *key == log_id).ok_or("This log is not registered for this integration.")?;
        let (text, bytes, truncated) = tail_file(&path, &root)?;
        Ok(json!({"id":id,"logId":log_id,"path":path.to_string_lossy(),"text":text,"bytes":bytes,"truncated":truncated}))
    }).await.map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identifiers_and_duplicate_registry_entries_are_rejected() {
        for value in ["", "router'; Stop-Process", "..", "a/b", "a b"] { assert!(!valid_identifier(value)); }
        let entry = json!({"name":"router","label":"Router","port":1234,"required":true,"processMatch":"router"});
        assert!(validate_registry(&json!([entry.clone()]).to_string()).is_ok());
        assert!(validate_registry(&json!([entry.clone(),entry.clone()]).to_string()).is_err());
        let mut duplicate_port = entry.clone();
        duplicate_port["name"] = json!("other");
        assert!(validate_registry(&json!([entry,duplicate_port]).to_string()).is_err());
    }

    #[test]
    fn unknown_services_cannot_execute_or_read_arbitrary_logs() {
        assert!(lookup("desktop-commander").is_err());
        assert!(trusted_logs("../secrets").is_empty());
        assert_eq!(decode_log(&[0xff,0xfe,b'A',0,b'\n',0], true), "A\n");
    }

    #[test]
    fn log_tail_is_bounded_and_rejects_paths_outside_root() {
        let root = std::env::temp_dir().join(format!("relay-log-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir(&root).unwrap();
        let file = root.join("service.log");
        fs::write(&file, vec![b'x'; TAIL_LIMIT + 100]).unwrap();
        let (text, bytes, truncated) = tail_file(&file, &root).unwrap();
        assert_eq!(text.len(), TAIL_LIMIT);
        assert_eq!(bytes, (TAIL_LIMIT + 100) as u64);
        assert!(truncated);
        let child = root.join("child");
        fs::create_dir(&child).unwrap();
        assert!(tail_file(&file, &child).is_err());
        fs::remove_dir(child).unwrap();
        fs::remove_file(file).unwrap();
        fs::remove_dir(root).unwrap();
    }
}
