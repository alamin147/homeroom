use std::{
    fs, io,
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};
use walkdir::WalkDir;

use crate::commands::files::{FileCategory, LocalFile};
use crate::commands::projects::ProjectDirectory;

pub fn scan_files(root: &Path, category: FileCategory) -> Result<Vec<LocalFile>, io::Error> {
    let extensions: &[&str] = match category {
        FileCategory::Document => &[
            "pdf", "doc", "docx", "odt", "rtf", "txt", "md", "csv", "xlsx", "pptx",
        ],
        FileCategory::Note => &["md", "txt"],
        FileCategory::Book => &["epub", "pdf", "mobi", "azw", "azw3", "djvu", "cbz", "cbr"],
        FileCategory::Media => &[
            "mp4", "mkv", "avi", "mov", "webm", "m4v", "mp3", "flac", "wav", "m4a", "ogg",
        ],
    };
    let mut files = Vec::new();
    for entry in WalkDir::new(root)
        .max_depth(8)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
    {
        if !entry.file_type().is_file() {
            continue;
        }
        let extension = entry
            .path()
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase();
        if !extensions.contains(&extension.as_str()) {
            continue;
        }
        let metadata = entry.metadata().map_err(io::Error::other)?;
        files.push(LocalFile {
            name: entry
                .path()
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("Untitled")
                .to_owned(),
            path: entry.path().to_path_buf(),
            extension,
            size: metadata.len(),
            modified_at: metadata
                .modified()
                .ok()
                .and_then(|value| value.duration_since(UNIX_EPOCH).ok())
                .map(|value| value.as_secs()),
        });
    }
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

pub fn scan_directories(root: &PathBuf) -> Result<Vec<ProjectDirectory>, io::Error> {
    let mut projects = Vec::new();
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        if entry.file_type()?.is_dir() {
            projects.push(ProjectDirectory {
                name: entry.file_name().to_string_lossy().into_owned(),
                path: entry.path(),
            });
        }
    }
    projects.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(projects)
}
