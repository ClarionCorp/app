use sysinfo::System;
use tauri::Manager;
use zip::ZipArchive;
use std::path::{Path};
use std::fs;
use std::io::{self, Write};
use std::time::{SystemTime, UNIX_EPOCH};

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


#[derive(serde::Deserialize)]
struct LogEntryPayload {
    timestamp: String,
    level: String,
    message: String,
    detail: Option<String>,
}

fn secs_to_day(secs: u64) -> u64 {
    secs / 86400
}

fn secs_to_datetime_string(secs: u64) -> String {
    // Civil calendar from days since Unix epoch (Euclidean affine functions algorithm)
    let z = (secs / 86400) as i64 + 719468;
    let era = if z >= 0 { z / 146097 } else { (z - 146096) / 146097 };
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    let h = (secs % 86400) / 3600;
    let min = (secs % 3600) / 60;
    let s = secs % 60;
    format!("{:04}-{:02}-{:02}_{:02}-{:02}-{:02}", y, m, d, h, min, s)
}

fn delete_old_logs(logs_dir: &std::path::Path) {
    let now_secs = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
    let cutoff_day = secs_to_day(now_secs).saturating_sub(7);
    if let Ok(dir_entries) = fs::read_dir(logs_dir) {
        for dir_entry in dir_entries.flatten() {
            let path = dir_entry.path();
            if path.file_name().and_then(|n| n.to_str()) == Some("latest.log") { continue; }
            if path.extension().and_then(|e| e.to_str()) != Some("log") { continue; }
            if let Ok(meta) = path.metadata() {
                if let Ok(modified) = meta.modified() {
                    let file_secs = modified.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
                    if secs_to_day(file_secs) < cutoff_day {
                        let _ = fs::remove_file(&path);
                    }
                }
            }
        }
    }
}

#[tauri::command]
fn write_log_header(app: tauri::AppHandle, version: String) -> Result<(), String> {
    let logs_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?
        .join("logs");
    fs::create_dir_all(&logs_dir).map_err(|e| e.to_string())?;

    // Always archive the previous session's latest.log on startup
    let latest_path = logs_dir.join("latest.log");
    if latest_path.exists() {
        if let Ok(meta) = latest_path.metadata() {
            if let Ok(modified) = meta.modified() {
                let file_secs = modified.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
                let datetime = secs_to_datetime_string(file_secs);
                let _ = fs::rename(&latest_path, logs_dir.join(format!("app_{}.log", datetime)));
            }
        }
    }

    delete_old_logs(&logs_dir);

    // Create a fresh latest.log with the session header
    let mut file = fs::File::create(&latest_path).map_err(|e| e.to_string())?;
    file.write_all(format!("--- Ai.Mi App v{} ---\n\n", version).as_bytes())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn flush_logs(app: tauri::AppHandle, entries: Vec<LogEntryPayload>) -> Result<(), String> {
    if entries.is_empty() {
        return Ok(());
    }

    let logs_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?
        .join("logs");

    let mut content = String::new();
    for entry in &entries {
        content.push_str(&format!("[{}] [{}] {}\n", entry.timestamp, entry.level.to_uppercase(), entry.message));
        if let Some(detail) = &entry.detail {
            for line in detail.lines() {
                content.push_str(&format!("  {}\n", line));
            }
        }
    }
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(logs_dir.join("latest.log"))
        .map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())
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
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // Bring the existing window to focus
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            is_process_running,
            extract_zip,
            write_log_header,
            flush_logs,
            log_watcher::get_latest_match_timestamp,
            log_watcher::get_latest_region,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}