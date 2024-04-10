import { dialog, path } from "@tauri-apps/api";
import LoaderManager from "../Managers/LoaderManager";
import UIManager from "../Managers/UIManager";
import FilesystemService from "../Services/FilesystemService";

export default async function () {
    const chooseLoaderButton = document.querySelector(".choose-loader-button") as HTMLElement;
    const loaderFound = await LoaderManager.findLoader();

    if (loaderFound) {
        UIManager.executableReady();
        return;
    }

    async function chooseExecutable() {
        alert("Once you select your krampus loader, it will be moved to %appdata%/KrampUI!");
        
        const selectedFile = await dialog.open({
            title: "Select krampus loader",
            defaultPath: await path.downloadDir(),
            filters: [
                {
                    name: "Krampus Loader",
                    extensions: ["exe"]
                }
            ]
        });

        if (selectedFile !== null) {
            await FilesystemService.renameFile(selectedFile as string, "krampus-loader.exe");
            LoaderManager.findLoader();
            UIManager.executableReady();
        }
    }

    chooseLoaderButton.addEventListener("click", chooseExecutable);
}