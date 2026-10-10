use std::{fs, io::Read, process::Command, os::windows::process::CommandExt};
use serde_json::{json, Value};
use windows::Win32::{Foundation::CloseHandle, System::Diagnostics::ToolHelp::*};

fn hidden(exe: &str, args: &[&str]) -> Result<String,String> {
    let result = Command::new(exe).args(args).creation_flags(0x08000000).output().map_err(|e| e.to_string())?;
    if !result.status.success() { return Err(String::from_utf8_lossy(&result.stderr).trim().to_string()); }
    Ok(String::from_utf8_lossy(&result.stdout).into_owned())
}

#[tauri::command]
pub async fn project_details(path: String) -> Result<Value,String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::storage::directory(&path)?;
        let mut tasks = Vec::new();
        let mut kind = "Folder";
        let mut description = String::new();
        let mut manager = "npm";
        if root.join("pnpm-lock.yaml").exists() { manager = "pnpm"; }
        else if root.join("yarn.lock").exists() { manager = "yarn"; }
        else if root.join("bun.lockb").exists() || root.join("bun.lock").exists() { manager = "bun"; }
        if let Ok(f) = fs::File::open(root.join("package.json")) {
            let mut data = String::new();
            f.take(262144).read_to_string(&mut data).map_err(|e| e.to_string())?;
            let package: Value = serde_json::from_str(&data).map_err(|e| format!("Invalid package.json: {e}"))?;
            kind = "Node";
            description = package["description"].as_str().unwrap_or("").to_string();
            if let Some(scripts) = package["scripts"].as_object() {
                for (name, body) in scripts.iter().take(100) {
                    // A script key is shell input too: quote it, never interpolate it unescaped.
                    tasks.push(json!({"name":name,"command":format!("{manager} run {}",crate::storage::quote(name)),"detail":body.as_str().unwrap_or("")}));
                }
            }
        }
        if root.join("Cargo.toml").is_file() {
            kind = if kind == "Node" { "Node + Rust" } else { "Rust" };
            for (name, command) in [("Check Rust","cargo check"),("Test Rust","cargo test"),("Run Rust","cargo run")] {
                tasks.push(json!({"name":name,"command":command,"detail":"Cargo workspace"}));
            }
        }
        if kind == "Folder" && (root.join("pyproject.toml").is_file() || root.join("requirements.txt").is_file()) { kind = "Python"; }
        let git = hidden("git", &["--no-optional-locks","-C",&path,"status","--porcelain=v1","--branch","--untracked-files=no"]);
        let (branch, changes) = match git {
            Ok(output) => (output.lines().next().unwrap_or("").trim_start_matches("## ").to_string(), output.lines().skip(1).count()),
            Err(_) => (String::new(),0)
        };
        Ok(json!({"path":path,"kind":kind,"description":description,"manager":manager,"tasks":tasks,"branch":branch,"changes":changes}))
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn browse_files(path: String) -> Result<Value,String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::storage::directory(&path)?;
        let mut entries = Vec::new();
        for entry in fs::read_dir(&root).map_err(|e|e.to_string())?.flatten().take(2001) {
            let metadata = match entry.metadata() { Ok(m)=>m,Err(_)=>continue };
            entries.push(json!({"name":entry.file_name().to_string_lossy(),"path":entry.path().to_string_lossy(),"directory":metadata.is_dir(),"size":metadata.len()}));
        }
        let truncated = entries.len() > 2000;
        entries.truncate(2000);
        entries.sort_by_key(|v| (!v["directory"].as_bool().unwrap_or(false),v["name"].as_str().unwrap_or("").to_lowercase()));
        Ok(json!({"path":path,"parent":root.parent().map(|p|p.to_string_lossy()),"entries":entries,"truncated":truncated}))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
pub async fn preview_file(path: String) -> Result<Value,String> {
    tauri::async_runtime::spawn_blocking(move || {
        let p = std::path::Path::new(&path);
        if !p.is_absolute() || !p.is_file() { return Err("Choose an accessible file.".into()); }
        let file = fs::File::open(p).map_err(|e|e.to_string())?;
        let length = file.metadata().map_err(|e|e.to_string())?.len();
        let mut bytes = Vec::new();
        file.take(131072).read_to_end(&mut bytes).map_err(|e|e.to_string())?;
        let binary = bytes.iter().take(8192).any(|b| *b == 0);
        let text = if binary { String::new() } else { String::from_utf8_lossy(&bytes).into_owned() };
        Ok(json!({"path":path,"text":text,"binary":binary,"truncated":length > 131072,"size":length}))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
pub async fn process_snapshot() -> Result<Value,String> {
    tauri::async_runtime::spawn_blocking(move || {
        let started = std::time::Instant::now();
        let mut processes = Vec::new();
        unsafe {
            let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS,0).map_err(|e|e.to_string())?;
            let mut entry = PROCESSENTRY32W { dwSize:std::mem::size_of::<PROCESSENTRY32W>() as u32, ..Default::default() };
            if Process32FirstW(snapshot,&mut entry).is_ok() { loop {
                let end = entry.szExeFile.iter().position(|v|*v==0).unwrap_or(entry.szExeFile.len());
                processes.push(json!({"pid":entry.th32ProcessID,"parentPid":entry.th32ParentProcessID,"name":String::from_utf16_lossy(&entry.szExeFile[..end])}));
                if Process32NextW(snapshot,&mut entry).is_err() { break; }
            } }
            let _ = CloseHandle(snapshot);
        }
        let mut ports = Vec::new();
        let (output, warning) = match hidden("netstat.exe", &["-ano","-p","tcp"]) { Ok(s)=>(s,String::new()),Err(e)=>(String::new(),e) };
        for line in output.lines() {
            let parts: Vec<_> = line.split_whitespace().collect();
            if parts.len() == 5 && parts[0] == "TCP" && parts[3] == "LISTENING" {
                if let (Some((address,port)),Ok(pid)) = (parts[1].rsplit_once(':'),parts[4].parse::<u32>()) {
                    if let Ok(port) = port.parse::<u16>() { ports.push(json!({"address":address,"port":port,"pid":pid})); }
                }
            }
        }
        ports.sort_by_key(|p|p["port"].as_u64().unwrap_or(0));
        Ok(json!({"processes":processes,"ports":ports,"durationMs":started.elapsed().as_millis(),"warning":warning}))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
pub fn open_local_url(port: u16) -> Result<(),String> {
    if port == 0 { return Err("Invalid port".into()); }
    // Only a numeric loopback URL can reach the Windows URL handler.
    Command::new("rundll32.exe").args(["url.dll,FileProtocolHandler",&format!("http://localhost:{port}")]).creation_flags(0x08000000).spawn().map_err(|e|e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn script_names_are_literal_powershell_arguments() {
        assert_eq!(crate::storage::quote("dev'; Stop-Process 1; '"), "'dev''; Stop-Process 1; '''");
    }
}
