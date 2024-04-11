import { invoke } from "@tauri-apps/api";
import EditorManager from "../Managers/EditorManager";

export default async function () {
    const killRobloxButton = document.querySelector(".kr-kill") as HTMLElement;
    const clearButton = document.querySelector(".kr-clear") as HTMLElement;

    killRobloxButton.addEventListener("click", async function () {
        await invoke("kill_roblox");
    });

    clearButton.addEventListener("click", function () {
        EditorManager.setEditorText("", true);
        EditorManager.setEditorScroll(0);
    });
}