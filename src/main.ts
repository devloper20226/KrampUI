import { event, process } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import SettingsManager from "./Managers/SettingsManager";
import FilesystemService from "./Services/FilesystemService";

export async function exit() {
  //TODO: Set unsaved tab data
  await process.exit();
}

event.listen("exit", exit);


async function initializeComponents() {

}

document.addEventListener('DOMContentLoaded', async () => {
  await appWindow.show();
  await appWindow.setFocus();
  document.body.classList.remove("kr-hidden");

  // Check for main config folder, if doesnt exists, create it
  if (!(await FilesystemService.exists(""))) {
    await FilesystemService.createDirectory("");
  }

  await SettingsManager.initializeSettings();

  await initializeComponents();
});