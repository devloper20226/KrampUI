import { invoke } from "@tauri-apps/api";
import UIManager from "../Managers/UIManager";
import LoaderManager from "../Managers/LoaderManager";
import EditorManager from "../Managers/EditorManager";

export default async function () {
    const injectButton = document.querySelector(".kr-inject") as HTMLElement;
    const killRobloxButton = document.querySelector(".kr-kill") as HTMLElement;
    const clearButton = document.querySelector(".kr-clear") as HTMLElement;

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
    });

    clearButton.addEventListener("click", function () {
        EditorManager.setEditorText("", true);
        EditorManager.setEditorScroll(0);
    });
}