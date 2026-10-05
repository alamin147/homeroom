use std::{fs, io::ErrorKind, path::PathBuf};

fn matugen_theme_path() -> Result<PathBuf, String> {
    if let Some(config_home) = std::env::var_os("XDG_CONFIG_HOME") {
        return Ok(PathBuf::from(config_home).join("homeroom/matugen-theme.json"));
    }
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join(".config/homeroom/matugen-theme.json"))
        .ok_or_else(|| "configuration directory is unavailable".to_string())
}

#[tauri::command]
pub fn read_matugen_theme() -> Result<Option<String>, String> {
    match fs::read_to_string(matugen_theme_path()?) {
        Ok(theme) => Ok(Some(theme)),
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("failed to read Matugen theme: {error}")),
    }
}
