import { event, process } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import SettingsManager from "./Managers/SettingsManager";
import FilesystemService from "./Services/FilesystemService";
import CredentialsManager from "./Managers/CredentialsManager";

export async function exit() {
  //TODO: Set unsaved tab data
  await process.exit();
}

event.listen("exit", exit);


async function initializeComponents() {
  const compoments = import.meta.glob('./Components/*.ts', { eager: true });

  Object.values(compoments).forEach((compoment: any) => {
    compoment.default()
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check for main config folder, if doesnt exists, create it
  if (!(await FilesystemService.exists(""))) {
    await FilesystemService.createDirectory("");
  }

  await SettingsManager.initializeSettings();
  await CredentialsManager.intializeCredentials();

  await initializeComponents();

  await appWindow.show();
  await appWindow.setFocus();
  document.body.classList.remove("kr-hidden");
});