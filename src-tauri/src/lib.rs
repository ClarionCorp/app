use std::io::{Read, Seek, SeekFrom};
use std::fs::OpenOptions;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

type MonitorFlag = Arc<Mutex<Option<Arc<AtomicBool>>>>;

#[tauri::command]
fn read_log_from(path: String, offset: u64) -> Result<(String, u64), String> {
    let mut opts = OpenOptions::new();
    opts.read(true);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::OpenOptionsExt;
        opts.share_mode(7);
    }

    let mut file = opts.open(&path).map_err(|e| e.to_string())?;
    let file_size = file.seek(SeekFrom::End(0)).map_err(|e| e.to_string())?;

    if file_size <= offset {
        return Ok((String::new(), file_size));
    }

    file.seek(SeekFrom::Start(offset)).map_err(|e| e.to_string())?;

    let mut buf = Vec::new();
    file.read_to_end(&mut buf).map_err(|e| e.to_string())?;

    let content = String::from_utf8_lossy(&buf).into_owned();
    Ok((content, file_size))
}

fn read_log_from_offset(path: &str, offset: u64) -> Result<(String, u64), String> {
    let mut opts = OpenOptions::new();
    opts.read(true);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::OpenOptionsExt;
        opts.share_mode(7);
    }

    let mut file = opts.open(path).map_err(|e| e.to_string())?;
    let file_size = file.seek(SeekFrom::End(0)).map_err(|e| e.to_string())?;

    if file_size <= offset {
        return Ok((String::new(), file_size));
    }

    file.seek(SeekFrom::Start(offset)).map_err(|e| e.to_string())?;

    let mut buf = Vec::new();
    file.read_to_end(&mut buf).map_err(|e| e.to_string())?;

    let content = String::from_utf8_lossy(&buf).into_owned();
    Ok((content, file_size))
}

#[tauri::command]
fn start_log_monitor(app: AppHandle, path: String, offset: u64) {
    let state = app.state::<MonitorFlag>();
    let mut lock = state.lock().unwrap();

    // Stop old thread if running
    if let Some(old_flag) = lock.as_ref() {
        old_flag.store(false, Ordering::Relaxed);
        println!("[log_monitor] Stopping old process..");
    }

    // Store new flag
    let running = Arc::new(AtomicBool::new(true));
    *lock = Some(running.clone());
    drop(lock);

    println!("[log_monitor] Start signal sent.");

    thread::spawn(move || {
        let mut current_offset = offset;
        let mut partial = String::new();

        while running.load(Ordering::Relaxed) {
            match read_log_from_offset(&path, current_offset) {
                Ok((content, new_offset)) => {
                    if !content.is_empty() {
                        current_offset = new_offset;

                        let text = format!("{}{}", partial, content);
                        let mut parts: Vec<&str> = text.split('\n').collect();

                        partial = parts.pop().unwrap_or("").to_string();

                        for line in parts {
                            if let Some(phase) = regex_match_phase(line) {
                                let _ = app.emit("log://match-phase", phase);
                            }
                            if let Some(player) = regex_player_registered(line) {
                                let _ = app.emit("log://player-registered", player);
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[log_monitor] Failed to read log: {}", e);
                }
            }

            thread::sleep(Duration::from_secs(1));
        }

        println!("[log_monitor] Monitor stopped.");
    });
}

#[tauri::command]
fn stop_log_monitor(app: AppHandle) {
    let state = app.state::<MonitorFlag>();
    let lock = state.lock().unwrap();
    if let Some(flag) = lock.as_ref() {
        flag.store(false, Ordering::Relaxed);
        println!("[log_monitor] Stop signal sent.");
    }
}

fn regex_match_phase(line: &str) -> Option<String> {
    let prefix = "LogPMPerfStatsSubsystem: Game context: MatchPhase: '";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(end) = rest.find('\'') {
            return Some(rest[..end].to_string());
        }
    }
    None
}

fn regex_player_registered(line: &str) -> Option<String> {
    let prefix = "LogPMPlayerState: Player '";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(end) = rest.find('\'') {
            return Some(rest[..end].to_string());
        }
    }
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let monitor_flag: MonitorFlag = Arc::new(Mutex::new(None));

    tauri::Builder::default()
        .manage(monitor_flag)
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_log_from, start_log_monitor, stop_log_monitor])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}