import { appWindow } from "@tauri-apps/api/window";
import { exit } from "../main";

export default async () => {
    const minimizeButton = document.querySelector(".tb-button.minimize") as Element;
    const maximazeButton = document.querySelector(".tb-button.maximize") as Element;
    const exitButton = document.querySelector(".tb-button.exit") as Element;
    minimizeButton.addEventListener("click", appWindow.minimize);
    maximazeButton.addEventListener("click", appWindow.maximize);
    exitButton.addEventListener("click", exit);
}