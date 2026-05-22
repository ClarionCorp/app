use serde::Serialize;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

const MATCH_PATTERN: &str = "Previous[EMatchPhase::VersusScreen]";
const SCAN_TAIL_BYTES: u64 = 2 * 1024 * 1024;
const STARTUP_DELAY: Duration = Duration::from_secs(15);
const POLL_INTERVAL: Duration = Duration::from_secs(30);

#[derive(Serialize, Clone)]
pub struct GameStartEvent {
    pub timestamp: String,
}

fn log_path() -> Option<std::path::PathBuf> {
    let local_app_data = std::env::var("LOCALAPPDATA").ok()?;
    Some(
        std::path::PathBuf::from(local_app_data)
            .join("OmegaStrikers")
            .join("Saved")
            .join("Logs")
            .join("OmegaStrikers.log"),
    )
}

fn extract_timestamp(line: &str) -> Option<String> {
    let start = line.find('[')?;
    let rest = &line[start + 1..];
    let end = rest.find(']')?;
    Some(rest[..end].to_string())
}

fn find_latest_match(path: &std::path::Path) -> Option<String> {
    let file = std::fs::File::open(path).ok()?;
    let file_size = file.metadata().ok()?.len();
    let start_pos = file_size.saturating_sub(SCAN_TAIL_BYTES);

    let mut reader = BufReader::new(file);
    reader.seek(SeekFrom::Start(start_pos)).ok()?;

    if start_pos > 0 {
        let mut discard = String::new();
        reader.read_line(&mut discard).ok()?;
    }

    let mut last_match: Option<String> = None;
    for line in reader.lines().flatten() {
        if line.contains(MATCH_PATTERN) {
            last_match = extract_timestamp(&line);
        }
    }
    last_match
}

pub fn start_log_watcher(app: AppHandle) {
    std::thread::spawn(move || {
        let path = match log_path() {
            Some(p) => p,
            None => return,
        };

        std::thread::sleep(STARTUP_DELAY);

        loop {
            if let Some(ts) = find_latest_match(&path) {
                let _ = app.emit("game-match-started", GameStartEvent { timestamp: ts });
            }

            std::thread::sleep(POLL_INTERVAL);
        }
    });
}
