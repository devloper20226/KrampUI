import { appWindow } from "@tauri-apps/api/window";
import SettingsManager from "./SettingsManager";
import TabsManager from "./TabsManager";
import { invoke, process } from "@tauri-apps/api";

export default class WindowManager {
    static toggleLock: boolean = false;

    static async initKeyEvents() {
        await invoke("init_key_events", { window: appWindow });
    }

    static async minimize() {
        await appWindow.minimize();
    }

    static async maximize() {
        await appWindow.toggleMaximize();
    }

    static async isMaximized(): Promise<boolean> {
        return await appWindow.isMaximized();
    }

    static async isVisible(): Promise<boolean> {
        return await appWindow.isVisible();
    }

    static async show() {
        if (this.toggleLock) return;
        this.toggleLock = true;

        await appWindow.show();
        await appWindow.setFocus();

        document.body.classList.remove("kr-hidden");
        setTimeout(function () {
            WindowManager.toggleLock = false;
        }, 100);
    }

    static async hide(animationOnly: boolean = false) {
        if (this.toggleLock) return;
        this.toggleLock = true;

        document.body.classList.add("kr-hidden");
        if (animationOnly) this.toggleLock = false
        else setTimeout(async function () {
            await appWindow.hide();
            WindowManager.toggleLock = false;
        }, 100);
    }

    static async toggle(force: boolean = false) {
        if (await this.isVisible() && (force || SettingsManager.currentSettings?.keyToggle)) await this.hide();
        else await this.show();
    }

    static async exit() {
        const isToggleLocked = this.toggleLock;
        if (!isToggleLocked) this.hide(true);

        setTimeout(async function () {
            await TabsManager.saveUnsavedTabs();
            await process.exit();
        }, isToggleLocked ? 0 : 100);
    }
};