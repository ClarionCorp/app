use std::io::{Read, Seek, SeekFrom};
use std::fs::OpenOptions;

/// Moved here since it's MUCH faster than JS. (~75ms to ~12ms).
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_log_from])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
