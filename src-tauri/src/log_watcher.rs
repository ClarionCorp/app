use std::io::{BufRead, BufReader, Read, Seek, SeekFrom};

const START_OF_MATCH: &str = "Previous[EMatchPhase::VersusScreen]";
const SCAN_TAIL_BYTES: u64 = 2 * 1024 * 1024;

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

fn find_latest_region(path: &std::path::Path) -> Option<String> {
    let mut file = std::fs::File::open(path).ok()?;
    let file_size = file.metadata().ok()?.len();

    let mut pos = file_size;
    // Bytes of the incomplete line that started in a later (rightward) chunk.
    let mut right_frag: Vec<u8> = Vec::new();

    while pos > 0 {
        let chunk_size = (64 * 1024 as u64).min(pos) as usize;
        pos -= chunk_size as u64;

        file.seek(SeekFrom::Start(pos)).ok()?;
        let mut buf = vec![0u8; chunk_size];
        file.read_exact(&mut buf).ok()?;

        // Append the fragment from the rightward chunk to complete any split line.
        let mut data = buf;
        data.extend_from_slice(&right_frag);

        // When more file remains to the left, bytes before the first newline are the
        // left half of a line whose right half is in the next leftward chunk.
        let process_from = if pos > 0 {
            match data.iter().position(|&b| b == b'\n') {
                Some(nl) => {
                    right_frag = data[..nl].to_vec();
                    nl + 1
                }
                // No newline yet, keep accumulating into right_frag.
                None => {
                    right_frag = data;
                    continue;
                }
            }
        } else {
            right_frag.clear();
            0
        };

        for line_bytes in data[process_from..].split(|&b| b == b'\n').rev() {
            let s = std::str::from_utf8(line_bytes).unwrap_or("").trim_end_matches('\r');
            if s.contains("UpdateLatenciesForNewRegion") {
                if let Some(bi) = s.rfind("regionName[") {
                    let after = &s[bi + "regionName[".len()..];
                    if let Some(end) = after.find(']') {
                        return Some(after[..end].to_string());
                    }
                }
            }
        }
    }

    None
}

#[tauri::command]
pub fn get_latest_region() -> Option<String> {
    find_latest_region(&log_path()?)
}