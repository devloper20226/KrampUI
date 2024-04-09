#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{thread::sleep, time::Duration};
use regex::Regex;
use serde_json::{json, Map, Value};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Window, WindowEvent};
use tokio::fs;

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[tauri::command]
fn log(message: String) {
    println!("{}", message);
}

#[tauri::command]
async fn attempt_login(email: String, password: String) -> (bool, String) {
    let mut json_map = Map::new();
    json_map.insert("0".to_string(), json!({
        "json": {
            "emailOrUsername": email,
            "password": password
        }
    }));

    let client = reqwest::Client::new();
    let login_request = client.post("https://api.acedia.gg/trpc/auth.logIn?batch=1")
        .header("Content-Type", "application/json")
        .json(&json_map)
        .timeout(Duration::from_secs(5))
        .send()
        .await;

    return match login_request {
        Ok(login_response) => match login_response.status().is_success() {
            true => {
                let cookies = match login_response.headers().get("Set-Cookie") {
                    Some(cookies) => match cookies.to_str() {
                        Ok(cookie_string) => cookie_string,
                        Err(_) => return (false, "Invalid cookies".to_string())
                    },
                    None => return (false, "No cookies".to_string())
                };
    
                return match Regex::new(r"_session=([^;]+)").unwrap().captures(cookies) {
                    Some(captures) => match captures.get(1) {
                        Some(matched) => (true, matched.as_str().to_string()),
                        None => (false, "Invalid session token".to_string())
                    },
                    None => (false, "Invalid session token".to_string())
                };
            }, false => (false, "Invalid credentials".to_string())
        },
        Err(_) => (false, "Request failed".to_string())
    };
}

#[tauri::command]
async fn get_login_token(session_token: String) -> (bool, String) {
    let client = reqwest::Client::new();
    let info_request = client.get("https://api.acedia.gg/trpc/user.current.get?batch=1&input={}")
        .header("Authorization", format!("Bearer {}", session_token))
        .timeout(Duration::from_secs(5))
        .send()
        .await;

    return match info_request {
        Ok(response) =>  match response.status().is_success() {
            true => {
                let json: Value = match response.json().await {
                    Ok(json) => json,
                    Err(_) => return (false, "Invalid JSON response".to_string())
                };

                return json.get(0)
                    .and_then(|first| first.get("result"))
                    .and_then(|result| result.get("data"))
                    .and_then(|data| data.get("json"))
                    .and_then(|user_data| user_data.get("token").and_then(|elem| elem.as_str()))
                    .map(|login_token| (true, login_token.to_string()))
                    .unwrap_or((false, "Invalid JSON Response".to_string()));
            },
            false => (false, "Invalid session token".to_string())
        },
        Err(_) => (false, "Request failed".to_string())
    };
}

#[tauri::command]
async fn download_loader(window: Window, path: String, token: String) -> (bool, String) {
    let client = reqwest::Client::new();
    let response = client.get(format!("https://api.acedia.gg/download?product=RO-EXEC&login_token={}", token))
        .timeout(Duration::from_secs(10))
        .send()
        .await;

    return match response {
        Ok(response) => match response.status().is_success() {
            true => {
                let app_dir = window.app_handle().path_resolver().app_config_dir().unwrap();
                let path = app_dir.join(path);
                let bytes = match response.bytes().await {
                    Ok(bytes) => bytes,
                    Err(_) => return (false, "Failed to get loader bytes".to_string())
                };

                return match fs::write(&path, &bytes).await {
                    Ok(_) => (true, "".to_string()),
                    Err(_) => (false, "Failed to write loader".to_string())
                };
            },
            false => (false, "Failed to download loader".to_string())
        },
        Err(_) => (false, "Request failed".to_string())
    };
}

#[derive(Clone, serde::Serialize)]
struct SingleInstancePayload {
  args: Vec<String>,
  cwd: String,
}

#[tokio::main]
async fn main() {
    let toggle = CustomMenuItem::new("toggle".to_string(), "Toggle");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray = SystemTrayMenu::new().add_item(toggle).add_item(quit);

    tauri::Builder::default()
        .on_window_event(|e| {
            if let WindowEvent::Resized(_) = e.event() {
                sleep(Duration::from_millis(5));
            }
        })
        .system_tray(SystemTray::new().with_menu(tray))
        .on_system_tray_event(| app, e | match e {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let window = app.get_window("main").unwrap();

                match id.as_str() {
                    "toggle" => window.emit("toggle", Payload { message: "".to_string() }).unwrap(),
                    "quit" => window.emit("exit", Payload { message: "".to_string() }).unwrap(),
                    _ => {}
                }
            }
            _ => {}
        })
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            app.emit_all("single-instance", SingleInstancePayload { args: argv, cwd }).unwrap();
        }))
        .invoke_handler(tauri::generate_handler![
            log,
            attempt_login,
            get_login_token,
            download_loader
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
