#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{sync::{Arc, Mutex}, thread::{self, sleep}, time::Duration};
use serde::Serialize;
use sysinfo::System;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
use lazy_static::lazy_static;

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

lazy_static! {
    static ref CONNECTED: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
    static ref WEBSOCKET_INITIALIZED: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
    static ref WEBSOCKET: Arc<Mutex<Option<ws::Sender>>> = Arc::new(Mutex::new(None));
}

#[derive(Clone, Serialize)]
struct PayloadUpdate {
  message: bool,
}


#[tauri::command]
fn init_websocket(window: tauri::Window, port: u16) {
    let mut websocket_initialized = WEBSOCKET_INITIALIZED.lock().unwrap();

    if !*websocket_initialized {
        *websocket_initialized = true;

        struct Server {
            window: tauri::Window
        }

        impl ws::Handler for Server {
            fn on_message(&mut self, data: ws::Message) -> ws::Result<()> {
                let mut connected = CONNECTED.lock().unwrap();
                
                if *connected {
                    return Ok(());
                }

                let data_string = data.to_string();
                let mut parts = data_string.split(",");
                let type_value = match parts.next() {
                    Some(val) => val.trim(),
                    None => return Ok(())
                };

                if type_value == "connect" {
                    self.window.emit("update", PayloadUpdate { message: true }).unwrap();
                    *connected = true;
                }

                return Ok(());
            }

            fn on_close(&mut self, _code: ws::CloseCode, _reason: &str) {
                let mut connected = CONNECTED.lock().unwrap();

                if *connected {
                    self.window.emit("update", PayloadUpdate { message: false }).unwrap();
                    *connected = false;
                }
            }
        }

        thread::spawn(move || {
            ws::listen(format!("127.0.0.1:{}", port), move | out: ws::Sender | { 
                let cloned_window = window.clone();
                *WEBSOCKET.lock().unwrap() = Some(out.clone());
                return Server { window: cloned_window };
            }).ok();
        });
    }
}

#[tauri::command]
fn execute_script(text: &str) {    
    if let Some(websocket) = WEBSOCKET.lock().unwrap().clone() {
        websocket.send(text).unwrap();
    }
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
            kill_roblox,
            init_websocket,
            execute_script
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
