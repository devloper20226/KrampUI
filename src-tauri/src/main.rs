#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{thread::sleep, time::Duration};
use sysinfo::System;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[tauri::command]
fn log(message: String) {
    println!("{}", message);
}

#[tauri::command]
fn kill_roblox() -> bool {
    return match System::new_all().processes_by_name("RobloxPlayerBeta.exe").next() {
        Some(process) => process.kill(),
        _ => false
    };
}

#[tauri::command]
fn is_roblox_running() -> bool {
    return System::new_all().processes_by_name("RobloxPlayerBeta.exe").next().is_some();
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
            is_roblox_running,
            kill_roblox
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
