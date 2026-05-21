use std::io::{Read, Seek, SeekFrom, BufRead, BufReader};
use std::fs::OpenOptions;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use sysinfo::System;
mod mods;
mod webserver;

type MonitorFlag = Arc<std::sync::Mutex<Option<Arc<AtomicBool>>>>;

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

/// Scans the entire log file and returns the byte offset of the start of the
/// last line containing "MainMenuMap". The monitor should start from this offset
/// so it only sees events from the most recent session.
/// Returns 0 if no MainMenuMap line is found (fresh log or game never reached menu).
#[tauri::command]
fn find_session_start(path: String) -> Result<u64, String> {
    let mut opts = OpenOptions::new();
    opts.read(true);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::OpenOptionsExt;
        opts.share_mode(7);
    }

    let file = opts.open(&path).map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(file);

    let mut last_offset: u64 = 0;
    let mut current_offset: u64 = 0;
    let mut line = String::new();

    loop {
        line.clear();
        let bytes_read = reader.read_line(&mut line).map_err(|e| e.to_string())?;
        if bytes_read == 0 { break; }

        if line.contains("MainMenuMap") {
            last_offset = current_offset;
        }

        current_offset += bytes_read as u64;
    }

    println!("[log_monitor] Session start offset: {} bytes", last_offset);
    Ok(last_offset)
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
                            if let Some(level) = regex_level(line) {
                                let _ = app.emit("log://level", &level);
                                if level == "MainMenuMap" {
                                    let _ = app.emit("log://match-phase", "EMatchPhase::None");
                                }
                            }
                            if let Some(character) = regex_my_character(line) {
                                let _ = app.emit("log://my-character", character);
                            }
                            if let Some(score) = regex_score(line) {
                                let _ = app.emit("log://score", score);
                            }

                            if let Some(team) = regex_my_team(line) {
                                let _ = app.emit("log://my-team", team);
                            }

                            if let Some(queue) = regex_queue(line) {
                                let _ = app.emit("log://queue", queue);
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
    // New pattern (Faster, used for all in-game phases)
    let prefix = "LogPMGameState: Display: APMGameState::PerformCurrentMatchPhaseEvents - Previous[";
    let current_prefix = "] Current[";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(cur_start) = rest.find(current_prefix) {
            let after_cur = &rest[cur_start + current_prefix.len()..];
            if let Some(end) = after_cur.find(']') {
                return Some(after_cur[..end].to_string());
            }
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

// Extracts Level from the MatchPhase perf stats line
fn regex_level(line: &str) -> Option<String> {
    let prefix = "Level: '";
    if !line.contains("LogPMPerfStatsSubsystem") { return None; }
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(end) = rest.find('\'') {
            return Some(rest[..end].to_string());
        }
    }
    None
}

// Extracts the character name from the CharacterSelect VOD event
// e.g. VOD_Rune_CharacterSelect_02 -> Rune
fn regex_my_character(line: &str) -> Option<String> {
    let prefix = "LogPMPlayerControllerBase: APMPlayerControllerBase::AddVOEvent - Processing event 'VOD_";
    let suffix = "_CharacterIntro_";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(end) = rest.find(suffix) {
            return Some(rest[..end].to_string());
        }
    }
    None
}

// Extracts score changes, emits JSON string { team, from, to }
fn regex_score(line: &str) -> Option<String> {
    let prefix = "LogPMGameState: APMGameState::OnRep_MatchScoreInfo - ";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        let team = if rest.starts_with("TeamOne") {
            "TeamOne"
        } else if rest.starts_with("TeamTwo") {
            "TeamTwo"
        } else {
            return None;
        };
        let from_prefix = "changed from ";
        let to_prefix = " to ";
        if let Some(from_start) = rest.find(from_prefix) {
            let after_from = &rest[from_start + from_prefix.len()..];
            if let Some(to_pos) = after_from.find(to_prefix) {
                let from_str = &after_from[..to_pos];
                let to_str = after_from[to_pos + to_prefix.len()..].trim();
                if let (Ok(from), Ok(to)) = (from_str.parse::<u32>(), to_str.parse::<u32>()) {
                    return Some(format!("{{\"team\":\"{}\",\"from\":{},\"to\":{}}}", team, from, to));
                }
            }
        }
    }
    None
}

// Extracts what team the player is placed on
fn regex_my_team(line: &str) -> Option<String> {
    let prefix = "LogPMPlayerState: StreamTeamLevel Called, OldTeam = EAssignedTeam::";
    let new_prefix = ", NewTeam = EAssignedTeam::";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(new_start) = rest.find(new_prefix) {
            let team = rest[new_start + new_prefix.len()..].trim();
            if team == "TeamOne" || team == "TeamTwo" {
                return Some(team.to_string());
            }
        }
    }
    None
}

// Extracts what game mode the player is queuing for
fn regex_queue(line: &str) -> Option<String> {
    let prefix = "Queue Selection: {\"queue\":\"queue:";
    if let Some(start) = line.find(prefix) {
        let rest = &line[start + prefix.len()..];
        if let Some(end) = rest.find('"') {
            return Some(rest[..end].to_string());
        }
    }
    None
}

// Resets database cleanly
#[tauri::command]
fn reset_local_database(app: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let db_path = app_dir.join("lapis.db");

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
    let monitor_flag: MonitorFlag = Arc::new(std::sync::Mutex::new(None));

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
            read_log_from,
            find_session_start,
            start_log_monitor,
            stop_log_monitor,
            reset_local_database,
            is_process_running,
            mods::validate_game_dir,
            mods::toggle_mod,
            mods::delete_mod,
            mods::download_mod,
            mods::scan_mods_folder,
            mods::extract_zip,
            ]
        )
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Spawn webserver in background
            tauri::async_runtime::spawn(async move {
                webserver::start_webserver(app_handle).await;
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}