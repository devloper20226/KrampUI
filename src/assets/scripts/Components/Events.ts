import { event } from "@tauri-apps/api";
import WindowManager from "../Managers/WindowManager";

export default async function () {
    await WindowManager.initKeyEvents();

    event.listen("exit", () => WindowManager.exit());
    event.listen("toggle", () => WindowManager.toggle(true));

    event.listen("key-press", function (e: any) {
        const key = (e?.payload?.message || "")?.toLowerCase();
        if (key === "home") WindowManager.toggle();
    });

    window.addEventListener("keyup", function (e) {
        const key = (e?.key || "")?.toLowerCase();
        if (key === "home") WindowManager.toggle();
    });
};