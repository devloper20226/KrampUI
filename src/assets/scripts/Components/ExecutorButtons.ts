import { invoke } from "@tauri-apps/api";

export default async function () {
    const killRobloxButton = document.querySelector(".kr-kill") as HTMLElement;

    killRobloxButton.addEventListener("click", async function () {
        await invoke("kill_roblox");
    })
}