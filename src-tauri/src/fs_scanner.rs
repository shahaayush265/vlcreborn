use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiscoveredSubtitle {
    pub id: String,
    pub path: String,
    pub filename: String,
    pub label: String,
    pub language: Option<String>,
    pub format: String,
    pub size_bytes: u64,
}

/// Extracts language guess from subtitle filename (e.g. movie.en.srt -> en)
fn guess_language_from_name(filename: &str) -> (String, Option<String>) {
    let lower = filename.to_lowercase();
    let parts: Vec<&str> = lower.split(|c| c == '.' || c == '_' || c == '-').collect();

    let mut detected_lang: Option<String> = None;
    let mut label = filename.to_string();

    for part in parts {
        match part {
            "en" | "eng" | "english" => {
                detected_lang = Some("en".to_string());
                label = "English".to_string();
                break;
            }
            "sdh" => {
                detected_lang = Some("en".to_string());
                label = "English [SDH]".to_string();
                break;
            }
            "es" | "spa" | "spanish" => {
                detected_lang = Some("es".to_string());
                label = "Spanish".to_string();
                break;
            }
            "fr" | "fra" | "french" => {
                detected_lang = Some("fr".to_string());
                label = "French".to_string();
                break;
            }
            "de" | "ger" | "german" => {
                detected_lang = Some("de".to_string());
                label = "German".to_string();
                break;
            }
            "ja" | "jpn" | "japanese" => {
                detected_lang = Some("ja".to_string());
                label = "Japanese".to_string();
                break;
            }
            "it" | "ita" | "italian" => {
                detected_lang = Some("it".to_string());
                label = "Italian".to_string();
                break;
            }
            "zh" | "chi" | "chinese" => {
                detected_lang = Some("zh".to_string());
                label = "Chinese".to_string();
                break;
            }
            "ko" | "kor" | "korean" => {
                detected_lang = Some("ko".to_string());
                label = "Korean".to_string();
                break;
            }
            "pt" | "por" | "portuguese" => {
                detected_lang = Some("pt".to_string());
                label = "Portuguese".to_string();
                break;
            }
            _ => {}
        }
    }

    (label, detected_lang)
}

/// Scans the directory containing `video_path` and common subtitle subdirectories (`Subs/`, `subtitles/`)
/// for subtitles matching the video stem.
#[tauri::command]
pub fn scan_subtitles_for_file(video_path: String) -> Result<Vec<DiscoveredSubtitle>, String> {
    let video_p = Path::new(&video_path);
    let parent_dir = video_p
        .parent()
        .ok_or_else(|| "Invalid video path: no parent directory".to_string())?;

    let video_stem = video_p
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    let subtitle_extensions = ["srt", "vtt", "sub", "ass", "ssa"];
    let mut discovered: Vec<DiscoveredSubtitle> = Vec::new();

    let mut search_dirs: Vec<PathBuf> = vec![parent_dir.to_path_buf()];
    let subs_subfolder = parent_dir.join("Subs");
    let subtitles_subfolder = parent_dir.join("subtitles");
    if subs_subfolder.is_dir() {
        search_dirs.push(subs_subfolder);
    }
    if subtitles_subfolder.is_dir() {
        search_dirs.push(subtitles_subfolder);
    }

    for dir in search_dirs {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                        let ext_lower = ext.to_lowercase();
                        if subtitle_extensions.contains(&ext_lower.as_str()) {
                            let filename = path
                                .file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or("")
                                .to_string();
                            let file_stem_lower = path
                                .file_stem()
                                .and_then(|s| s.to_str())
                                .unwrap_or("")
                                .to_lowercase();

                            // Prioritize matches that share video stem or all subs in Subs/ folder
                            let matches_video = video_stem.is_empty()
                                || file_stem_lower.starts_with(&video_stem)
                                || video_stem.starts_with(&file_stem_lower);

                            let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);
                            let (label, language) = guess_language_from_name(&filename);

                            discovered.push(DiscoveredSubtitle {
                                id: format!("sub-{}", discovered.len() + 1),
                                path: path.to_string_lossy().to_string(),
                                filename: filename.clone(),
                                label: if matches_video {
                                    format!("{} ({})", label, ext_lower.to_uppercase())
                                } else {
                                    format!("{} [{}]", filename, ext_lower.to_uppercase())
                                },
                                language,
                                format: ext_lower,
                                size_bytes,
                            });
                        }
                    }
                }
            }
        }
    }

    Ok(discovered)
}

/// Reads a subtitle file from the filesystem with UTF-8 support
#[tauri::command]
pub fn read_subtitle_file(file_path: String) -> Result<String, String> {
    let bytes = fs::read(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;
    // Graceful UTF-8 conversion with lossy fallback
    String::from_utf8(bytes).or_else(|utf8_err| {
        let lossy = String::from_utf8_lossy(utf8_err.as_bytes()).to_string();
        Ok(lossy)
    })
}

/// Saves modified or resynced subtitle content to disk
#[tauri::command]
pub fn save_subtitle_file(file_path: String, content: String) -> Result<(), String> {
    fs::write(&file_path, content).map_err(|e| format!("Failed to write subtitle file: {}", e))
}

/// Extracts a high-resolution video thumbnail frame using ffmpeg if present on system
#[tauri::command]
pub fn extract_thumbnail_native(file_path: String, seek_time_secs: Option<f64>) -> Result<String, String> {
    let seek_val = seek_time_secs.unwrap_or(1.5).max(0.1);
    let seek_str = format!("{:.2}", seek_val);

    let output = std::process::Command::new("ffmpeg")
        .args([
            "-ss", &seek_str,
            "-i", &file_path,
            "-vframes", "1",
            "-vf", "scale=360:-1",
            "-f", "image2pipe",
            "-vcodec", "mjpeg",
            "-",
        ])
        .output()
        .map_err(|e| format!("ffmpeg execution failed: {}", e))?;

    if output.status.success() && !output.stdout.is_empty() {
        use base64::Engine;
        let b64 = base64::engine::general_purpose::STANDARD.encode(&output.stdout);
        Ok(format!("data:image/jpeg;base64,{}", b64))
    } else {
        Err("ffmpeg exited with non-zero status or empty output".to_string())
    }
}

