use sysinfo::System;
use tauri::Manager;
use zip::ZipArchive;
use std::path::{Path};
use std::fs;
use std::io;

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

// Extracts a zip file
#[tauri::command]
fn extract_zip(zip_path: String, dest_dir: String) -> Result<(), String> {
    let file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let out_path = Path::new(&dest_dir).join(entry.mangled_name());

        if entry.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut out_file = fs::File::create(&out_path).map_err(|e| e.to_string())?;
            io::copy(&mut entry, &mut out_file).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
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
            extract_zip,
            log_watcher::get_latest_match_timestamp,
            log_watcher::get_latest_region,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}