// Tauri commands for subscription tracker
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    subscriptions: serde_json::Value,
    settings: serde_json::Value,
    #[serde(default)]
    version: String,
    #[serde(default)]
    last_saved: String,
}

// Get app data directory path
fn get_data_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    // Create directory if not exists
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    
    Ok(app_data_dir.join("subscription-data.json"))
}

// Save data to local file
#[tauri::command]
fn save_data(app: tauri::AppHandle, subscriptions: serde_json::Value, settings: serde_json::Value) -> Result<String, String> {
    let path = get_data_file_path(&app)?;
    
    let data = AppData {
        subscriptions,
        settings,
        version: "1.0.0".to_string(),
        last_saved: chrono::Utc::now().to_rfc3339(),
    };
    
    let json = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(path.to_string_lossy().to_string())
}

// Load data from local file
#[tauri::command]
fn load_data(app: tauri::AppHandle) -> Result<AppData, String> {
    let path = get_data_file_path(&app)?;
    
    if !path.exists() {
        return Err("No saved data found".to_string());
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let data: AppData = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse data: {}", e))?;
    
    Ok(data)
}

// Check if data file exists
#[tauri::command]
fn has_saved_data(app: tauri::AppHandle) -> Result<bool, String> {
    let path = get_data_file_path(&app)?;
    Ok(path.exists())
}

// Get data file path for display
#[tauri::command]
fn get_data_path(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_data_file_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            save_data,
            load_data,
            has_saved_data,
            get_data_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
