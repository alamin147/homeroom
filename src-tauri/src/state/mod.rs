use std::{
    fs,
    path::{Path, PathBuf},
    sync::RwLock,
};
use tauri::{AppHandle, Manager};

pub struct AppState {
    pub allowed_roots: RwLock<Vec<PathBuf>>,
    config_path: PathBuf,
}

impl AppState {
    pub fn load(app: &AppHandle) -> Result<Self, String> {
        let config_dir = app
            .path()
            .app_config_dir()
            .map_err(|error| error.to_string())?;
        fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;
        let config_path = config_dir.join("file-roots.json");
        let roots = fs::read_to_string(&config_path)
            .ok()
            .and_then(|content| serde_json::from_str::<Vec<PathBuf>>(&content).ok())
            .unwrap_or_default()
            .into_iter()
            .filter_map(|root| root.canonicalize().ok())
            .filter(|root| root.is_dir())
            .collect();
        Ok(Self {
            allowed_roots: RwLock::new(roots),
            config_path,
        })
    }

    pub fn roots(&self) -> Result<Vec<PathBuf>, String> {
        self.allowed_roots
            .read()
            .map(|roots| roots.clone())
            .map_err(|_| "file roots unavailable".into())
    }

    pub fn add_root(&self, path: &Path) -> Result<PathBuf, String> {
        let canonical = path.canonicalize().map_err(|error| error.to_string())?;
        if !canonical.is_dir() {
            return Err("selected path is not a directory".into());
        }
        let mut roots = self
            .allowed_roots
            .write()
            .map_err(|_| "file roots unavailable")?;
        if !roots.contains(&canonical) {
            roots.push(canonical.clone());
        }
        fs::write(
            &self.config_path,
            serde_json::to_vec_pretty(&*roots).map_err(|error| error.to_string())?,
        )
        .map_err(|error| error.to_string())?;
        Ok(canonical)
    }
}
