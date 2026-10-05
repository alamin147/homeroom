mod commands;
mod security;
mod services;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;
            let state = state::AppState::load(app.handle()).map_err(std::io::Error::other)?;
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::files::choose_directory,
            commands::files::list_roots,
            commands::files::scan_files,
            commands::files::open_path,
            commands::files::read_text_file,
            commands::files::read_binary_file,
            commands::projects::scan_projects,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Homeroom");
}
