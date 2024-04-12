import { open } from "@tauri-apps/api/shell";
import WindowService from "../Services/WindowService";

export default async function () {
    const minimizeButton = document.querySelector(".tb-button.minimize") as Element;
    const maximize = document.querySelector(".tb-button.maximize") as Element;
    const exitButton = document.querySelector(".tb-button.exit") as Element;
    const helpButton = document.querySelector(".help") as Element;
    minimizeButton.addEventListener("click", () => WindowService.minimize());
    maximize.addEventListener("click", () => WindowService.maximize());
    exitButton.addEventListener("click", () => WindowService.exit());
    helpButton.addEventListener("click", function () {
        open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    });
}