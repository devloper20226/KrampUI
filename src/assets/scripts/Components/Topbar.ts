import { appWindow } from "@tauri-apps/api/window";
import { exit } from "../main";
import { open } from "@tauri-apps/api/shell";

export default async function () {
    const minimizeButton = document.querySelector(".tb-button.minimize") as Element;
    const maximazeButton = document.querySelector(".tb-button.maximize") as Element;
    const exitButton = document.querySelector(".tb-button.exit") as Element;
    const helpButton = document.querySelector(".help") as Element;
    minimizeButton.addEventListener("click", appWindow.minimize);
    maximazeButton.addEventListener("click", appWindow.maximize);
    exitButton.addEventListener("click", exit);
    helpButton.addEventListener("click", () => {
        open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    })
}