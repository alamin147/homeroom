use serde::Serialize;
use std::path::PathBuf;

use crate::security::paths::validate_allowed_path;
use crate::services::filesystem::scan_directories;
use crate::state::AppState;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDirectory {
    pub name: String,
    pub path: PathBuf,
}

#[tauri::command]
pub fn scan_projects(
    root: PathBuf,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ProjectDirectory>, String> {
    let allowed = state
        .allowed_roots
        .read()
        .map_err(|_| "file roots unavailable")?;
    let root = validate_allowed_path(&root, &allowed).map_err(|error| error.to_string())?;
    scan_directories(&root).map_err(|error| error.to_string())
}
