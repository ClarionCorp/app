use std::io::{BufRead, BufReader, Seek, SeekFrom};

const START_OF_MATCH: &str = "Previous[EMatchPhase::VersusScreen]";
const SCAN_TAIL_BYTES: u64 = 2 * 1024 * 1024;

#[derive(serde::Serialize)]
pub struct PlayerAwakenings {
    pub username: String,
    pub trainings: Vec<String>,
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
        if line.contains(START_OF_MATCH) {
            last_match = extract_timestamp(&line);
        }
    }
    last_match
}

#[tauri::command]
pub fn get_latest_match_timestamp() -> Option<String> {
    find_latest_match(&log_path()?)
}

fn parse_training_line(line: &str) -> Option<(String, String)> {
    let marker = "LogPMPlayerState: Player '";
    let after_marker = line.find(marker)? + marker.len();
    let rest = &line[after_marker..];

    let name_end = rest.find('\'')?;
    let username = rest[..name_end].to_string();

    let suffix = "' registering training '";
    let after_suffix = rest.find(suffix)? + suffix.len();
    let training_end = rest[after_suffix..].find('\'')?;
    let training = rest[after_suffix..after_suffix + training_end].to_string();

    Some((username, training))
}

fn find_player_awakenings(path: &std::path::Path) -> Vec<PlayerAwakenings> {
    let file = match std::fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return vec![],
    };
    let file_size = match file.metadata() {
        Ok(m) => m.len(),
        Err(_) => return vec![],
    };
    let start_pos = file_size.saturating_sub(SCAN_TAIL_BYTES);

    let mut reader = BufReader::new(file);
    if reader.seek(SeekFrom::Start(start_pos)).is_err() {
        return vec![];
    }

    if start_pos > 0 {
        let mut discard = String::new();
        let _ = reader.read_line(&mut discard);
    }

    let mut players: Vec<(String, Vec<String>)> = Vec::new();

    for line in reader.lines().flatten() {
        if line.contains(START_OF_MATCH) {
            players.clear();
        } else if let Some((username, training)) = parse_training_line(&line) {
            if let Some(entry) = players.iter_mut().find(|(u, _)| u == &username) {
                entry.1.push(training);
            } else {
                players.push((username, vec![training]));
            }
        }
    }

    players
        .into_iter()
        .map(|(username, trainings)| PlayerAwakenings { username, trainings })
        .collect()
}

#[tauri::command]
pub fn get_player_awakenings() -> Vec<PlayerAwakenings> {
    log_path()
        .map(|p| find_player_awakenings(&p))
        .unwrap_or_default()
}
