import { event } from "@tauri-apps/api";
import WindowService from "../Services/WindowService";

export default async function () {
    await WindowService.initKeyEvents();

    event.listen("exit", () => WindowService.exit());
    event.listen("toggle", () => WindowService.toggle(true));

    event.listen("key-press", function (e: any) {
        const key = (e?.payload?.message || "")?.toLowerCase();
        if (key === "home") WindowService.toggle();
    });

    window.addEventListener("keyup", function (e) {
        const key = (e?.key || "")?.toLowerCase();
        if (key === "home") WindowService.toggle();
    });
};