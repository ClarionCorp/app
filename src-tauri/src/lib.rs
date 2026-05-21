use std::sync::Arc;
use tauri::{Manager};
use sysinfo::System;
mod log_mon;

// Resets database cleanly
#[tauri::command]
fn reset_local_database(app: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let db_path = app_dir.join("hyperpop.db");

    if db_path.exists() {
        std::fs::remove_file(&db_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

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
    let monitor_flag: log_mon::MonitorFlag = Arc::new(std::sync::Mutex::new(None));

    tauri::Builder::default()
        .manage(monitor_flag)
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            log_mon::read_log_from,
            log_mon::find_session_start,
            log_mon::start_log_monitor,
            log_mon::stop_log_monitor,
            reset_local_database,
            is_process_running
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}