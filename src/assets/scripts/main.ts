import { invoke } from "@tauri-apps/api";
import SettingsManager from "./Managers/SettingsManager";
import FilesystemService from "./Services/FilesystemService";
import TabsManager from "./Managers/TabsManager";
import EditorManager from "./Managers/EditorManager";
import UIManager from "./Managers/UIManager";
import { TabsUIManager } from "./Managers/TabsUIManager";
import LoaderManager from "./Managers/LoaderManager";
import WindowManager from "./Managers/WindowManager";

async function initializeComponents() {
  const components = import.meta.glob("./Components/*.ts", { eager: true });

  Object.values(components).forEach(function (component: any) {
    component.default()
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!(await FilesystemService.exists(""))) {
    await FilesystemService.createDirectory("");
  }

  await UIManager.startRobloxActiveLoop();
  await SettingsManager.initializeSettings();
  await TabsManager.initializeTabs();
  await EditorManager.setupEditor();
  await invoke("init_websocket", { port: LoaderManager.wsPort });
  await LoaderManager.findLoader();
  await initializeComponents();
  TabsUIManager.initializeTabs();
  WindowManager.show();
});