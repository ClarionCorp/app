use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::mpsc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

const DEBOUNCE: Duration = Duration::from_millis(100);

// Each file gets its own function for custom filtering down the line.
// We wanna deal with it here because Rust is a gazillion times faster than TS.
const WATCHED_FILES: &[&str] = &["meta.json", "match.json", "players.json", "postgame.json"];

#[derive(Serialize, Clone)]
pub struct FileChangeEvent {
    pub file: String,
    pub kind: String,
    pub content: String,
}

#[derive(Deserialize)]
struct MetaLastChanged {
    last_changed: String,
}

// Meta has 3 separate update conditions in it, so determine the cause of the update and redirect.
fn handle_meta(app: &AppHandle, file: &str, kind: &str, content: String) {
    let event_name = match serde_json::from_str::<MetaLastChanged>(&content) {
        Ok(meta) => match meta.last_changed.as_str() {
            "state" => "onStateChange",
            "queue" | "party" => "onQueueChange",
            other => {
                eprintln!("meta.json: unknown last_changed value '{other}'");
                return;
            }
        },
        Err(e) => {
            eprintln!("meta.json: failed to parse ({e})");
            return;
        }
    };

    let _ = app.emit(
        event_name,
        FileChangeEvent {
            file: file.to_string(),
            kind: kind.to_string(),
            content,
        },
    );
}

fn handle_match(app: &AppHandle, file: &str, kind: &str, content: String) {
    let _ = app.emit(
        "onMatchUpdate",
        FileChangeEvent {
            file: file.to_string(),
            kind: kind.to_string(),
            content,
        },
    );
}

fn handle_players(app: &AppHandle, file: &str, kind: &str, content: String) {
    let _ = app.emit(
        "onPlayersUpdate",
        FileChangeEvent {
            file: file.to_string(),
            kind: kind.to_string(),
            content,
        },
    );
}

fn handle_postgame(app: &AppHandle, file: &str, kind: &str, content: String) {
    let _ = app.emit(
        "onPostGameUpdate",
        FileChangeEvent {
            file: file.to_string(),
            kind: kind.to_string(),
            content,
        },
    );
}

fn dispatch(app: &AppHandle, file: &str, kind: &str, content: String) {
    match file {
        "meta.json" => handle_meta(app, file, kind, content),
        "match.json" => handle_match(app, file, kind, content),
        "players.json" => handle_players(app, file, kind, content),
        "postgame.json" => handle_postgame(app, file, kind, content),
        _ => {}
    }
}

// Resolves the temp directory the game actually writes to.
// On Windows, this is the normal system temp dir.
// On Linux, the game writes into its Proton prefix's fake windows temp dir instead.
fn resolve_temp_dir() -> PathBuf {
    if cfg!(target_os = "windows") {
        return std::env::temp_dir().join("AiMiApp");
    }

    match std::env::var_os("HOME") {
        Some(home) => PathBuf::from(home).join(
            ".steam/steam/steamapps/compatdata/1869590/pfx/drive_c/users/steamuser/AppData/Local/Temp/AiMiApp",
        ),
        None => {
            eprintln!("HOME environment variable not set, falling back to std::env::temp_dir()");
            std::env::temp_dir().join("AiMiApp")
        }
    }
}

pub fn start_file_watcher(app: AppHandle) {
    let temp_dir = resolve_temp_dir();

    std::thread::spawn(move || {
        let (tx, rx) = mpsc::channel::<notify::Result<Event>>();

        let mut watcher = match RecommendedWatcher::new(tx, Config::default()) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("Failed to create file watcher: {e}");
                return;
            }
        };

        if let Err(e) = watcher.watch(&temp_dir, RecursiveMode::NonRecursive) {
            eprintln!("Failed to watch temp directory: {e}");
            return;
        }

        let mut last_seen: HashMap<String, Instant> = HashMap::new();

        for result in rx {
            match result {
                Ok(event) => {
                    let kind = match event.kind {
                        EventKind::Create(_) => "created",
                        EventKind::Modify(_) => "modified",
                        // Removed files have no content to filter on, so there's
                        // nothing useful to send the frontend - skip entirely.
                        EventKind::Remove(_) => continue,
                        _ => continue,
                    };

                    for path in &event.paths {
                        if let Some(filename) = path.file_name() {
                            let name = filename.to_string_lossy();
                            if !WATCHED_FILES.contains(&name.as_ref()) {
                                continue;
                            }

                            let now = Instant::now();
                            let key = format!("{kind}:{name}");
                            if last_seen.get(&key).map_or(false, |t| now.duration_since(*t) < DEBOUNCE) {
                                continue;
                            }
                            last_seen.insert(key, now);

                            // Also covers the race where the file gets removed
                            // between the event firing and the read below.
                            let Ok(content) = std::fs::read_to_string(path) else {
                                continue;
                            };

                            dispatch(&app, &name, kind, content);
                        }
                    }
                }
                Err(e) => eprintln!("File watcher error: {e}"),
            }
        }
    });
}
