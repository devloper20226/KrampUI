import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";

export default class LoaderManager {
    static loaderPath: string | null = null;

    static async findLoader() {
        const dataFiles = await FilesystemService.listDirectoryFiles("");
        if (typeof(dataFiles) == "boolean") { alert("Failed to find loader! (0x1)"); exit(); return }

        for (const file of dataFiles) {
            if (file.name == "krampus-loader.exe") {
                this.loaderPath = file.path;
                console.log("Found loader: " + this.loaderPath)
                return;
            }
        }
    }

    static async clearExecutables() {
        const dataFiles = await FilesystemService.listDirectoryFiles("");
        if (typeof(dataFiles) == "boolean") { alert("Failed to clear executables! (0x2)"); exit(); return }

        for (const file of dataFiles) {
            if (file.name == "krampus-loader.exe") {
                FilesystemService.deleteFile(file.path);
                return;
            }
        }
    }
}