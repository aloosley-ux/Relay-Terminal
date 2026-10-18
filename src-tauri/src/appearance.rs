use serde_json::Value;
const COLORS: [&str;20]=["background","foreground","cursor","selectionBackground","black","red","green","yellow","blue","magenta","cyan","white","brightBlack","brightRed","brightGreen","brightYellow","brightBlue","brightMagenta","brightCyan","brightWhite"];
fn color(v:&Value)->bool { v.as_str().map(|s|s.len()==7&&s.starts_with('#')&&s[1..].bytes().all(|b|b.is_ascii_hexdigit())).unwrap_or(false) }
fn range(v:&Value,min:f64,max:f64)->bool {v.as_f64().map(|n|n.is_finite()&&n>=min&&n<=max).unwrap_or(false)}
fn one(v:&Value,allowed:&[&str])->bool {v.as_str().map(|s|allowed.contains(&s)).unwrap_or(false)}
fn text(v:&Value,max:usize)->bool {v.as_str().map(|s|!s.is_empty()&&s.len()<=max&&!s.chars().any(char::is_control)).unwrap_or(false)}
pub fn validate_theme(t:&Value)->Result<(),String>{
    if !text(&t["id"],80)||!t["id"].as_str().unwrap_or("").bytes().all(|b|b.is_ascii_alphanumeric()||b==b'-')||!text(&t["name"],240)||!one(&t["mode"],&["dark","light"]) {return Err("Invalid theme identity".into());}
    for k in COLORS {if !color(&t["terminal"][k]) {return Err(format!("Invalid terminal colour: {k}"));}}
    for k in ["background","raised","text","muted","accent","border"] {if !color(&t["app"][k]) {return Err(format!("Invalid application colour: {k}"));}}
    if !text(&t["fontFamily"],200)||t["fontFamily"].as_str().unwrap_or("").contains([';','{','}','<','>'])||!one(&t["cursorStyle"],&["bar","block","underline"])||!t["cursorBlink"].is_boolean() {return Err("Invalid font or cursor".into());}
    for (k,min,max) in [("fontSize",10.,32.),("lineHeight",1.,2.),("letterSpacing",-1.,4.),("padding",4.,48.)] {if !range(&t[k],min,max){return Err(format!("Invalid {k}"));}}
    let b=&t["background"];
    if !one(&b["type"],&["solid","gradient","wallpaper","ambient"])||!color(&b["from"])||!color(&b["to"])||!b["animated"].is_boolean() {return Err("Invalid background".into());}
    for (k,min,max) in [("opacity",0.35,1.),("intensity",0.,1.),("angle",0.,360.),("blur",0.,40.),("speed",10.,120.)] {if !range(&b[k],min,max){return Err(format!("Invalid background {k}"));}}
    for k in ["positionX","positionY"] {if !b[k].is_null()&&!range(&b[k],0.,100.){return Err(format!("Invalid wallpaper {k}"));}}
    let image=b["image"].as_str().ok_or("Invalid wallpaper")?;
    if image.len()>5_600_000 {return Err("Wallpaper exceeds size limit".into());}
    if !image.is_empty()&&image!="/wallpapers/tideland.svg" {
        let valid=["data:image/png;base64,","data:image/jpeg;base64,","data:image/webp;base64,"].iter().any(|p|image.strip_prefix(p).map(|data|!data.is_empty()&&data.bytes().all(|c|c.is_ascii_alphanumeric()||b"+/=".contains(&c))).unwrap_or(false));
        if !valid {return Err("Only embedded raster wallpapers are supported".into());}
    }
    Ok(())
}
fn validate_choice(c:&Value)->Result<(),String> {if !text(&c["appTheme"],80)||!text(&c["terminalTheme"],80){return Err("Invalid theme reference".into());}if let Some(t)=c.get("custom"){validate_theme(t)?;}if let Some(t)=c.get("appCustom"){validate_theme(t)?;}if let Some(identity)=c.get("tabIdentity"){if !color(&identity["color"])||!one(&identity["icon"],&["terminal","folder","code","server","star"]){return Err("Invalid tab identity".into());}}Ok(())}
pub fn validate_store(v:&Value)->Result<(),String> {
    if v["version"]!=1||v.to_string().len()>24_000_000{return Err("Unsupported or oversized appearance settings".into());}
    validate_choice(&v["global"])?;
    let themes=v["themes"].as_array().ok_or("Invalid custom themes")?;if themes.len()>40{return Err("Too many themes".into());}for t in themes {validate_theme(t)?;}
    for key in ["workspaces","sessions"] {let map=v[key].as_object().ok_or("Invalid appearance overrides")?;if map.len()>500{return Err("Too many appearance overrides".into());}for (id,c) in map {if id.len()>200{return Err("Invalid override identifier".into());}validate_choice(c)?;}}
    Ok(())
}
#[tauri::command]
pub async fn export_theme_file(text:String)->Result<Option<String>,String> {
    if text.len()>6_000_000{return Err("Theme exceeds 6 MB".into());}
    let v:Value=serde_json::from_str(&text).map_err(|e|e.to_string())?;
    if v["format"]!="relay-theme"||v["version"]!=1{return Err("Unsupported theme format".into());}validate_theme(&v["theme"])?;
    let file=rfd::AsyncFileDialog::new().set_title("Export Relay theme").add_filter("Relay theme",&["json"]).set_file_name("relay-theme.json").save_file().await;
    if let Some(f)=file {std::fs::write(f.path(),text).map_err(|e|e.to_string())?;return Ok(Some(f.path().to_string_lossy().into_owned()));}Ok(None)
}
#[cfg(test)] mod tests {
    use super::*;
    fn valid_theme()->Value {
        let mut terminal=serde_json::Map::new();
        for key in COLORS {terminal.insert(key.into(),serde_json::json!("#334455"));}
        serde_json::json!({"id":"custom-test","name":"Test theme","mode":"dark","app":{"background":"#334455","raised":"#334455","text":"#334455","muted":"#334455","accent":"#334455","border":"#334455"},"terminal":terminal,"fontFamily":"Consolas, monospace","fontSize":14,"lineHeight":1.2,"letterSpacing":0,"padding":20,"cursorStyle":"bar","cursorBlink":false,"background":{"type":"wallpaper","image":"","from":"#334455","to":"#334455","angle":135,"opacity":0.8,"intensity":0.5,"blur":4,"animated":false,"speed":30,"positionX":17,"positionY":83}})
    }
    #[test] fn rejects_untrusted_backgrounds(){assert!(validate_theme(&serde_json::json!({"background":{"image":"https://bad.invalid/a.svg"}})).is_err());}
    #[test] fn rejects_bad_versions_and_sizes(){assert!(validate_store(&serde_json::json!({"version":2})).is_err());assert!(!range(&serde_json::json!(200),0.,40.));assert!(!color(&serde_json::json!("red;url(x)")));}
    #[test] fn migrates_old_settings(){let s:crate::storage::Settings=serde_json::from_str(r#"{"theme":"light","fontSize":16,"panelOpen":true}"#).unwrap();assert!(s.appearance.is_none());assert_eq!(s.font_size,16);assert_eq!(s.navigator_width,236);assert!(s.panel_open);}
    #[test] fn accepts_wallpaper_position_and_tab_identity_but_rejects_invalid_values(){let theme=valid_theme();assert!(validate_theme(&theme).is_ok());let mut invalid=theme.clone();invalid["background"]["positionX"]=serde_json::json!(101);assert!(validate_theme(&invalid).is_err());let store=serde_json::json!({"version":1,"global":{"appTheme":"custom-app","terminalTheme":"harbor","appCustom":theme,"tabIdentity":{"color":"#AABBCC","icon":"folder"}},"workspaces":{},"sessions":{},"themes":[]});assert!(validate_store(&store).is_ok());let mut invalid_store=store.clone();invalid_store["global"]["tabIdentity"]["icon"]=serde_json::json!("unknown");assert!(validate_store(&invalid_store).is_err());}
}
