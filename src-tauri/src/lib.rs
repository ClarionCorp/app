use sysinfo::System;
use tauri::Manager;

mod file_watcher;
mod log_watcher;

// Checks for running processes (just for checking if game is running)
#[tauri::command]
fn is_process_running(name: &str) -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();
    sys.processes().values().any(|p| {
        p.name().to_string_lossy().eq_ignore_ascii_case(name)
    })
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir().unwrap();
            app.handle().plugin(
                tauri_plugin_libsql::init_with_config(tauri_plugin_libsql::Config {
                    base_path: Some(data_dir),
                    encryption: None,
                })
            )?;
            file_watcher::start_file_watcher(app.handle().clone());
            Ok(())
        })
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            is_process_running,
            log_watcher::get_latest_match_timestamp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}