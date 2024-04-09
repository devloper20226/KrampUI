import { appWindow } from "@tauri-apps/api/window";

await appWindow.show();
await appWindow.setFocus();
document.body.classList.remove("kr-hidden");