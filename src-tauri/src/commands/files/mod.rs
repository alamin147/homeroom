use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};

use crate::{security::paths::validate_allowed_path, services::filesystem, state::AppState};

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FileCategory {
    Document,
    Note,
    Book,
    Media,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalFile {
    pub name: String,
    pub path: PathBuf,
    pub extension: String,
    pub size: u64,
    pub modified_at: Option<u64>,
}

#[tauri::command]
pub async fn choose_directory(
    state: tauri::State<'_, AppState>,
) -> Result<Option<PathBuf>, String> {
    let Some(folder) = rfd::AsyncFileDialog::new().pick_folder().await else {
        return Ok(None);
    };
    state.add_root(folder.path()).map(Some)
}

#[tauri::command]
pub fn list_roots(state: tauri::State<'_, AppState>) -> Result<Vec<PathBuf>, String> {
    state.roots()
}

#[tauri::command]
pub fn scan_files(
    root: PathBuf,
    category: FileCategory,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<LocalFile>, String> {
    let allowed = state
        .allowed_roots
        .read()
        .map_err(|_| "file roots unavailable")?;
    let root = validate_allowed_path(&root, &allowed).map_err(|error| error.to_string())?;
    filesystem::scan_files(&root, category).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn open_path(path: PathBuf, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let allowed = state
        .allowed_roots
        .read()
        .map_err(|_| "file roots unavailable")?;
    let path = validate_allowed_path(&path, &allowed).map_err(|error| error.to_string())?;
    open::that(path).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn read_text_file(path: PathBuf, state: tauri::State<'_, AppState>) -> Result<String, String> {
    let allowed = state
        .allowed_roots
        .read()
        .map_err(|_| "file roots unavailable")?;
    let path = validate_allowed_path(&path, &allowed).map_err(|error| error.to_string())?;
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    if !matches!(extension.as_str(), "md" | "txt") {
        return Err("only Markdown and text files can be read inside Homeroom".into());
    }
    let metadata = fs::metadata(&path).map_err(|error| error.to_string())?;
    if metadata.len() > 2_000_000 {
        return Err("text file is larger than 2 MB".into());
    }
    fs::read_to_string(path).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn read_binary_file(
    path: PathBuf,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<u8>, String> {
    let allowed = state
        .allowed_roots
        .read()
        .map_err(|_| "file roots unavailable")?;
    let path = validate_allowed_path(&path, &allowed).map_err(|error| error.to_string())?;
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    if extension != "pdf" {
        return Err("only PDF files can be read as binary data".into());
    }
    let metadata = fs::metadata(&path).map_err(|error| error.to_string())?;
    if metadata.len() > 64 * 1024 * 1024 {
        return Err("PDF is larger than 64 MB; open it in the default app instead".into());
    }
    fs::read(path).map_err(|error| error.to_string())
}
