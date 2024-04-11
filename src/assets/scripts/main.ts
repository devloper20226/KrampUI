import { event, process } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import SettingsManager from "./Managers/SettingsManager";
import FilesystemService from "./Services/FilesystemService";
import TabsManager from "./Managers/TabsManager";
import EditorManager from "./Managers/EditorManager";
import UIManager from "./Managers/UIManager";

export async function exit() {
  await TabsManager.saveUnsavedTabs();
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

  await UIManager.startRobloxActiveLoop();
  await SettingsManager.initializeSettings();
  await TabsManager.initializeTabs();
  await EditorManager.setupEditor();
  await initializeComponents();

  await appWindow.show();
  await appWindow.setFocus();
  document.body.classList.remove("kr-hidden");
});