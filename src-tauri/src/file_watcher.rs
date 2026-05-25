use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::mpsc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

const DEBOUNCE: Duration = Duration::from_millis(100);

const WATCHED_FILES: &[(&str, &str)] = &[
    ("ue4ss_shown_trainings.json", "ue4ss-trainings-changed"),
    ("ue4ss_players.json", "ue4ss-players-changed"),
    ("ue4ss_gamestate.json", "ue4ss-gamestate-changed"),
    ("PostGameStats.json", "postgame-stats-changed"),
];

#[derive(Serialize, Clone)]
pub struct FileChangeEvent {
    pub file: String,
    pub kind: String,
    pub content: Option<String>,
}

pub fn start_file_watcher(app: AppHandle) {
    let temp_dir = std::env::temp_dir();

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
                        EventKind::Remove(_) => "removed",
                        _ => continue,
                    };

                    for path in &event.paths {
                        if let Some(filename) = path.file_name() {
                            let name = filename.to_string_lossy();
                            if let Some((_, event_name)) = WATCHED_FILES
                                .iter()
                                .find(|(file, _)| *file == name.as_ref())
                            {
                                let now = Instant::now();
                                let key = format!("{kind}:{name}");
                                if last_seen.get(&key).map_or(false, |t| now.duration_since(*t) < DEBOUNCE) {
                                    continue;
                                }
                                last_seen.insert(key, now);
                                let content = if kind != "removed" {
                                    std::fs::read_to_string(path).ok()
                                } else {
                                    None
                                };

                                let _ = app.emit(
                                    event_name,
                                    FileChangeEvent {
                                        file: name.to_string(),
                                        kind: kind.to_string(),
                                        content,
                                    },
                                );
                            }
                        }
                    }
                }
                Err(e) => eprintln!("File watcher error: {e}"),
            }
        }
    });
}
