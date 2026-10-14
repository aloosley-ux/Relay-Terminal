use std::{path::{Path, PathBuf}, sync::Mutex};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub theme: String,
    pub font_size: u16,
    pub panel_open: bool,
    pub shell: String,
    pub load_profiles: bool,
    pub favorites: Vec<String>,
    pub recents: Vec<String>,
    pub workspaces: Vec<Workspace>,
    pub actions: Vec<Action>,
    pub restore_tabs: bool,
    pub startup_tabs: Vec<Workspace>,
    pub appearance: Option<serde_json::Value>,
    pub navigator_width: u16,
    pub terminal_only: bool,
    pub composer_visible: bool,
    pub screen_reader_mode: bool,
    pub active_session: String,
    pub split_session: String,
    pub split_ratio: u16,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct Workspace { pub id: String, pub name: String, pub path: String, #[serde(default, rename="sessionKey", skip_serializing_if="Option::is_none")] pub session_key: Option<String>, #[serde(default, rename="shellId", skip_serializing_if="Option::is_none")] pub shell_id: Option<String> }
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Action { pub id: String, pub name: String, pub icon: String, pub description: String, pub command: String, pub directory: String, pub favorite: bool }
impl Default for Settings {
    fn default() -> Self { Self {
        theme: "dark".into(), font_size: 14, panel_open: false, shell: "auto".into(), load_profiles: false,
        favorites: vec![], recents: vec![], workspaces: vec![], restore_tabs: true, startup_tabs: vec![], appearance: None, navigator_width:236, terminal_only:false, composer_visible:false, screen_reader_mode:false, active_session:String::new(), split_session:String::new(), split_ratio:50,
        actions: vec![
            action("git-status","Git status","git","See changes in this project","git status --short --branch",true),
            action("git-log","Recent commits","git","The last eight commits","git log -8 --oneline",false),
            action("files","List files","folder","Files, folders and hidden items","Get-ChildItem -Force",true),
            action("versions","PowerShell version","terminal","Check the active shell","$PSVersionTable",false),
        ],
    } }
}
fn action(id: &str, name: &str, icon: &str, description: &str, command: &str, favorite: bool) -> Action {
    Action {id:id.into(),name:name.into(),icon:icon.into(),description:description.into(),command:command.into(),directory:String::new(),favorite}
}
pub struct AppData { pub path: PathBuf, pub lock: Mutex<()> }
impl AppData {
    pub fn load(&self) -> Result<Settings,String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        if !self.path.exists() { return Ok(Settings::default()); }
        let data = std::fs::read(&self.path).map_err(|e| e.to_string())?;
        serde_json::from_slice(&data).map_err(|e| format!("Settings could not be read: {e}. The file has been preserved."))
    }
    pub fn save(&self, settings: &Settings) -> Result<(),String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        if settings.actions.len()>500 || settings.favorites.len()>500 || settings.workspaces.len()>500 { return Err("Too many saved items".into()); }
        if let Some(value)=&settings.appearance { crate::appearance::validate_store(value)?; }
        if !(200..=360).contains(&settings.navigator_width) || !(10..=32).contains(&settings.font_size) { return Err("Invalid layout or font size".into()); }
        std::fs::create_dir_all(self.path.parent().ok_or("Invalid settings path")?).map_err(|e| e.to_string())?;
        let data = serde_json::to_vec_pretty(settings).map_err(|e| e.to_string())?;
        let temp = self.path.with_extension("tmp");
        let mut f = std::fs::File::create(&temp).map_err(|e| e.to_string())?;
        use std::io::Write;
        f.write_all(&data).and_then(|_| f.sync_all()).map_err(|e| e.to_string())?;
        drop(f);
        // MoveFileEx is atomic on the same volume and replaces the previous file.
        use std::os::windows::ffi::OsStrExt;
        let src: Vec<u16> = temp.as_os_str().encode_wide().chain(Some(0)).collect();
        let dst: Vec<u16> = self.path.as_os_str().encode_wide().chain(Some(0)).collect();
        unsafe { windows::Win32::Storage::FileSystem::MoveFileExW(windows::core::PCWSTR(src.as_ptr()),windows::core::PCWSTR(dst.as_ptr()),windows::Win32::Storage::FileSystem::MOVEFILE_REPLACE_EXISTING | windows::Win32::Storage::FileSystem::MOVEFILE_WRITE_THROUGH) }.map_err(|e| e.to_string())
    }
}
pub fn directory(path: &str) -> Result<PathBuf,String> {
    if path.contains(['\0','\r','\n']) { return Err("Invalid characters in folder path".into()); }
    let p = Path::new(path);
    if !p.is_absolute() || !p.is_dir() { return Err(format!("Folder does not exist or cannot be accessed: {path}")); }
    Ok(p.to_path_buf())
}
pub fn quote(path: &str) -> String { format!("'{}'",path.replace('\'',"''")) }
pub fn clipboard_write(text: &str) -> Result<(), String> {
    let mut last = String::new();
    for _ in 0..6 { match arboard::Clipboard::new().and_then(|mut c| c.set_text(text)) { Ok(())=>return Ok(()),Err(e)=>last=e.to_string() } std::thread::sleep(std::time::Duration::from_millis(15)); }
    Err(last)
}
pub fn clipboard_read() -> Result<String, String> {
    let mut last = String::new();
    for _ in 0..6 { match arboard::Clipboard::new().and_then(|mut c| c.get_text()) { Ok(text)=>return Ok(text),Err(e)=>last=e.to_string() } std::thread::sleep(std::time::Duration::from_millis(15)); }
    Err(last)
}
