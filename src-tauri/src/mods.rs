// src-tauri/src/mods.rs

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use futures_util::StreamExt;
use serde::{Serialize};
use tauri::{AppHandle, Emitter, Manager};
use zip::ZipArchive;

const DEFAULT_GAME_PATH: &str = r"C:\Program Files (x86)\Steam\steamapps\common\OmegaStrikers";
const PAKS_SUBPATH: &str = r"OmegaStrikers\Content\Paks";

#[derive(Clone, Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: u64,
}

// Path helpers
fn resolve_game_path(game_dir: &str) -> Option<PathBuf> {
    let from_db = PathBuf::from(game_dir);
    if is_valid_game_dir(&from_db) {
        return Some(from_db);
    }
    let default = PathBuf::from(DEFAULT_GAME_PATH);
    if is_valid_game_dir(&default) {
        return Some(default);
    }
    None
}

fn is_valid_game_dir(path: &Path) -> bool {
    path.join(PAKS_SUBPATH).exists()
}

fn paks_dir(game_path: &Path) -> PathBuf {
    game_path.join(PAKS_SUBPATH)
}

fn disabled_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("mods").join("disabled")
}

fn temp_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("mods").join("temp")
}

// Commands
// Called by TS after reading gameDir from the DB
#[tauri::command]
pub fn validate_game_dir(game_dir: String) -> Result<(), String> {
    let path = PathBuf::from(&game_dir);
    if is_valid_game_dir(&path) {
        Ok(())
    } else {
        Err("INVALID_GAME_DIR".to_string())
    }
}

#[tauri::command]
pub fn toggle_mod(
    app: AppHandle,
    game_dir: String,
    file_names: Vec<String>,
    enable: bool,
) -> Result<(), String> {
    let game_path = resolve_game_path(&game_dir).ok_or("GAME_NOT_FOUND")?;

    let (from_dir, to_dir) = if enable {
        (disabled_dir(&app), paks_dir(&game_path))
    } else {
        (paks_dir(&game_path), disabled_dir(&app))
    };

    fs::create_dir_all(&to_dir).map_err(|e| e.to_string())?;

    for file_name in &file_names {
        let from = from_dir.join(file_name);
        let to = to_dir.join(file_name);
        if from.exists() {
            fs::rename(&from, &to).map_err(|e| {
                format!("Failed to move {file_name}: {e}")
            })?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn delete_mod(
    app: AppHandle,
    game_dir: String,
    file_names: Vec<String>,
    enabled: bool,
) -> Result<(), String> {
    let game_path = resolve_game_path(&game_dir).ok_or("GAME_NOT_FOUND")?;
    let dir = if enabled { paks_dir(&game_path) } else { disabled_dir(&app) };

    for file_name in &file_names {
        let path = dir.join(file_name);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| {
                format!("Failed to delete {file_name}: {e}")
            })?;
        }
    }

    Ok(())
}

// Returns the list of pak filenames extracted so TS can store them in the DB
#[tauri::command]
pub async fn download_mod(
    app: AppHandle,
    game_dir: String,
    url: String,
    download_file_name: String, // just used for the temp zip filename
) -> Result<Vec<String>, String> {
    let game_path = resolve_game_path(&game_dir).ok_or("GAME_NOT_FOUND")?;
    let paks = paks_dir(&game_path);
    let temp = temp_dir(&app);

    fs::create_dir_all(&paks).map_err(|e| e.to_string())?;
    fs::create_dir_all(&temp).map_err(|e| e.to_string())?;

    // Download zip to temp
    let zip_path = temp.join(&download_file_name);
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let total = resp.content_length().unwrap_or(0);
    let mut stream = resp.bytes_stream();
    let mut zip_file = fs::File::create(&zip_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        zip_file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        app.emit("mod:download_progress", DownloadProgress { downloaded, total }).ok();
    }
    drop(zip_file);

    // Extract all .pak files from the zip
    let zip_file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(zip_file).map_err(|e| e.to_string())?;
    let mut extracted_paks: Vec<String> = Vec::new();

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        if !entry.name().ends_with(".pak") {
            continue;
        }
        let pak_file_name = Path::new(entry.name())
            .file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();

        let dest = paks.join(&pak_file_name);
        let mut out = fs::File::create(&dest).map_err(|e| e.to_string())?;
        std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
        extracted_paks.push(pak_file_name);
    }

    // Clean up temp zip
    fs::remove_file(&zip_path).ok();

    if extracted_paks.is_empty() {
        return Err("No .pak files found in archive".to_string());
    }

    app.emit("mod:download_complete", &extracted_paks).ok();
    Ok(extracted_paks)
}

#[derive(Debug, Serialize)]
pub struct ScanResult {
    pub file_name: String,
    pub enabled: bool,
}

// Returns all .pak filenames found in the Paks dir and disabled dir
#[tauri::command]
pub fn scan_mods_folder(app: AppHandle, game_dir: String) -> Result<Vec<ScanResult>, String> {
    let game_path = resolve_game_path(&game_dir).ok_or("GAME_NOT_FOUND")?;
    let mut results: Vec<ScanResult> = Vec::new();

    for (dir, enabled) in [
        (paks_dir(&game_path), true),
        (disabled_dir(&app), false),
    ] {
        if !dir.exists() {
            continue;
        }
        for entry in fs::read_dir(&dir).map_err(|e| e.to_string())?.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("pak") {
                continue;
            }
            let file_name = path.file_name().unwrap().to_string_lossy().to_string();
            results.push(ScanResult { file_name, enabled });
        }
    }

    Ok(results)
}