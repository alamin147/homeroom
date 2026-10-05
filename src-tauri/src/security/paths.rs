use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PathError {
    #[error("path does not exist")]
    Missing,
    #[error("path is outside configured roots")]
    OutsideAllowedRoots,
}

pub fn validate_allowed_path(path: &Path, allowed_roots: &[PathBuf]) -> Result<PathBuf, PathError> {
    let canonical = path.canonicalize().map_err(|_| PathError::Missing)?;
    if allowed_roots.iter().any(|root| canonical.starts_with(root)) {
        Ok(canonical)
    } else {
        Err(PathError::OutsideAllowedRoots)
    }
}
