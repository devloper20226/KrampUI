import { invoke } from "@tauri-apps/api";

export default async () => {
    const killRobloxButton = document.querySelector(".kr-kill") as HTMLElement;

    killRobloxButton.addEventListener("click", async () => {
        await invoke("kill_roblox");
    })
}