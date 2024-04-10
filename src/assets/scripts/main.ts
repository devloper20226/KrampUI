import { event, process } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import SettingsManager from "./Managers/SettingsManager";
import FilesystemService from "./Services/FilesystemService";
import TabsManager from "./Managers/TabsManager";

export async function exit() {
  // TODO: Set unsaved tab data
  await process.exit();
}

event.listen("exit", exit);


async function initializeComponents() {
  const components = import.meta.glob('./Components/*.ts', { eager: true });

  Object.values(components).forEach(function (component: any) {
    component.default()
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  if (!(await FilesystemService.exists(""))) {
    await FilesystemService.createDirectory("");
  }

  await SettingsManager.initializeSettings();
  await TabsManager.initializeTabs();
  await initializeComponents();

  await appWindow.show();
  await appWindow.setFocus();
  document.body.classList.remove("kr-hidden");
});