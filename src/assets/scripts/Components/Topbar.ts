import { open } from "@tauri-apps/api/shell";
import WindowManager from "../Managers/WindowManager";

export default async function () {
    const minimizeButton = document.querySelector(".tb-button.minimize") as Element;
    const maximize = document.querySelector(".tb-button.maximize") as Element;
    const exitButton = document.querySelector(".tb-button.exit") as Element;
    const helpButton = document.querySelector(".help") as Element;
    minimizeButton.addEventListener("click", () => WindowManager.minimize());
    maximize.addEventListener("click", () => WindowManager.maximize());
    exitButton.addEventListener("click", () => WindowManager.exit());
    helpButton.addEventListener("click", function () {
        open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    });
}