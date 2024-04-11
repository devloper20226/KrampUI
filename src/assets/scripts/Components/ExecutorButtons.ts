import { invoke } from "@tauri-apps/api";
import UIManager from "../Managers/UIManager";
import LoaderManager from "../Managers/LoaderManager";

export default async function () {
    const injectButton = document.querySelector(".kr-inject") as HTMLElement;
    const killRobloxButton = document.querySelector(".kr-kill") as HTMLElement;

    injectButton.addEventListener("click", async () => {
        UIManager.updateStatus("Injecting")
        const { success, error } = await LoaderManager.inject();

        if (success) {
            UIManager.updateStatus("Attached")
        } else {
            UIManager.updateStatus("Idle")
            alert(`[KRAMPUS] ${error}`)
        }
    })

    killRobloxButton.addEventListener("click", async function () {
        await invoke("kill_roblox");
    })
}