use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::sync::mpsc;
use tauri::{AppHandle, Emitter};

const WATCHED_FILES: &[&str] = &[
    "ue4ss_players.json",
    "ue4ss_gamestate.json",
    "PostGameStats.json",
];

#[derive(Serialize, Clone)]
pub struct FileChangeEvent {
    pub file: String,
    pub kind: String,
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
                            if WATCHED_FILES.contains(&name.as_ref()) {
                                let _ = app.emit(
                                    "ue4ss-file-changed",
                                    FileChangeEvent {
                                        file: name.to_string(),
                                        kind: kind.to_string(),
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
