use std::io::{Read, Seek, SeekFrom};
use std::fs::OpenOptions;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

/// Read new content from a log file starting at `offset` bytes.
/// Returns (new_content, new_offset). Uses FILE_SHARE_WRITE on Windows so the
/// file can be read while the game has it open for writing.
#[tauri::command]
fn read_log_from(path: String, offset: u64) -> Result<(String, u64), String> {
    let mut opts = OpenOptions::new();
    opts.read(true);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::OpenOptionsExt;
        // FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE
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

/// Starts a background thread that polls the log file every 10 seconds.
/// Emits `log://match-phase` and `log://player-registered` events to the frontend.
/// Calling this again while a monitor is already running will stop the old one first.
#[tauri::command]
fn start_log_monitor(app: AppHandle, path: String, offset: u64) {
    // If a monitor is already running, signal it to stop
    if let Some(flag) = app.try_state::<Arc<AtomicBool>>() {
        flag.store(false, Ordering::Relaxed);
    }

    let running = Arc::new(AtomicBool::new(true));
    app.manage(running.clone());

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

                        // Last element may be an incomplete line — save for next poll
                        partial = parts.pop().unwrap_or("").to_string();

                        for line in parts {
                            // Match phase
                            if let Some(caps) = regex_match_phase(line) {
                                let _ = app.emit("log://match-phase", caps);
                            }
                            // Player registration
                            if let Some(caps) = regex_player_registered(line) {
                                let _ = app.emit("log://player-registered", caps);
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("[log_monitor] Failed to read log: {}", e);
                }
            }

            thread::sleep(Duration::from_secs(5));
        }

        println!("[log_monitor] Monitor stopped.");
    });
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
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_log_from, start_log_monitor, stop_log_monitor])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn stop_log_monitor(app: AppHandle) {
    if let Some(flag) = app.try_state::<Arc<AtomicBool>>() {
        flag.store(false, Ordering::Relaxed);
        println!("[log_monitor] Stop signal sent.");
    }
}