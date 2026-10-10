#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod terminal;
mod storage;
mod workbench;
mod integrations;

use std::{path::PathBuf, process::Command, os::windows::process::CommandExt};
use tauri::{Manager, State};
use storage::{Settings, AppData};

#[tauri::command]
fn bootstrap(state: State<AppData>) -> Result<serde_json::Value, String> {
    let settings = state.load()?;
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into());
    let mut roots = vec![PathBuf::from(&home)];
    // Discover siblings of the application/project, rather than naming particular projects.
    let mut candidates = vec![std::env::current_dir().unwrap_or_default()];
    if let Ok(exe) = std::env::current_exe() { if let Some(p) = exe.parent() { candidates.push(p.to_path_buf()); } }
    for candidate in candidates {
        for ancestor in candidate.ancestors().take(8) {
            if ancestor.file_name().is_some_and(|n| n.to_string_lossy().eq_ignore_ascii_case("AI")) {
                if !roots.contains(&ancestor.to_path_buf()) { roots.push(ancestor.to_path_buf()); }
            }
        }
    }
    // Also offer existing user-selected roots on subsequent launches.
    for path in settings.favorites.iter().chain(settings.recents.iter()) {
        let p = PathBuf::from(path);
        if p.is_dir() && !roots.contains(&p) { roots.push(p); }
    }
    let mut projects = Vec::new();
    for root in roots.iter().filter(|p| p.file_name().is_some_and(|n| n.to_string_lossy().eq_ignore_ascii_case("AI"))) {
        if let Ok(entries) = std::fs::read_dir(root) {
            for entry in entries.flatten().take(200) {
                if entry.file_type().is_ok_and(|t| t.is_dir()) {
                    projects.push(entry.path().to_string_lossy().to_string());
                }
            }
        }
    }
    projects.sort_by_key(|p| p.to_lowercase());
    let shells = terminal::shells();
    Ok(serde_json::json!({"settings":settings,"home":home,"roots":roots,"projects":projects,"shells":shells,"settingsPath":state.path}))
}

#[tauri::command]
fn save_settings(settings: Settings, state: State<AppData>) -> Result<(), String> { state.save(&settings) }

#[tauri::command]
async fn list_folders(path: String) -> Result<serde_json::Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = storage::directory(&path)?;
        let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
        let mut children = Vec::new();
        for entry in entries.flatten() {
            if entry.file_type().is_ok_and(|t| t.is_dir()) {
                let name = entry.file_name().to_string_lossy().to_string();
                if !name.starts_with('.') && name != "$RECYCLE.BIN" && name != "System Volume Information" {
                    children.push(serde_json::json!({"name":name,"path":entry.path().to_string_lossy()}));
                }
            }
            if children.len() >= 2000 { break; }
        }
        children.sort_by_key(|v| v["name"].as_str().unwrap_or_default().to_lowercase());
        Ok(serde_json::json!({"path":path.to_string_lossy(),"parent":path.parent().map(|p| p.to_string_lossy()),"children":children}))
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn pick_folder(initial: Option<String>) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut picker = rfd::FileDialog::new().set_title("Choose a workspace folder");
        if let Some(p) = initial { if let Ok(p) = storage::directory(&p) { picker = picker.set_directory(p); } }
        Ok(picker.pick_folder().map(|p| p.to_string_lossy().to_string()))
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn open_directory(path: String, target: String) -> Result<(), String> {
    let p = storage::directory(&path)?;
    match target.as_str() {
        "explorer" => { Command::new("explorer.exe").arg(p).spawn().map_err(|e| e.to_string())?; }
        "code" => {
            let candidates = [
                std::env::var("LOCALAPPDATA").unwrap_or_default() + "\\Programs\\Microsoft VS Code\\Code.exe",
                "C:\\Program Files\\Microsoft VS Code\\Code.exe".into(),
                "C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe".into(),
            ];
            let exe = candidates.into_iter().find(|c| PathBuf::from(c).is_file()).ok_or("VS Code was not found in its standard installation locations.")?;
            Command::new(exe).arg("--new-window").arg(p).creation_flags(0x08000000).spawn().map_err(|e| e.to_string())?;
        }
        _ => return Err("Unknown application".into()),
    }
    Ok(())
}

#[tauri::command]
fn clipboard_write(text: String) -> Result<(), String> { storage::clipboard_write(&text) }
#[tauri::command]
fn clipboard_read() -> Result<String, String> { storage::clipboard_read() }

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let path = std::env::var_os("RELAY_DATA_DIR").map(PathBuf::from).unwrap_or(app.path().app_config_dir()?);
            app.manage(AppData { path: path.join("settings.json"), lock: std::sync::Mutex::new(()) });
            app.manage(terminal::Sessions::default());
            let mut window = tauri::WebviewWindowBuilder::from_config(app, &app.config().app.windows[0])?;
            // Isolated test/config profiles also isolate WebView2's browser data. This permits
            // release acceptance beside a user's running instance without sharing its browser lock.
            if let Some(directory) = std::env::var_os("RELAY_DATA_DIR") {
                window = window.data_directory(PathBuf::from(directory).join("webview"));
            }
            window.build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![bootstrap,save_settings,list_folders,pick_folder,open_directory,clipboard_write,clipboard_read,
            workbench::project_details,workbench::browse_files,workbench::preview_file,workbench::process_snapshot,workbench::open_local_url,
            integrations::service_inventory,integrations::service_control,integrations::read_service_log,
            terminal::create_session,terminal::write_input,terminal::resize_session,terminal::ack_output,terminal::close_session,terminal::run_action])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event { window.state::<terminal::Sessions>().close_all(); }
        })
        .run(tauri::generate_context!())
        .expect("Unable to launch Relay Terminal");
}
