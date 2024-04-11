import { fs, invoke, path } from "@tauri-apps/api";
import { FileEntry } from "@tauri-apps/api/fs";

export default class FilesystemService {
    static async appDirectory(): Promise<string> {
        return await path.appConfigDir();
    }

    static async writeFile(file: string, contents: string, absolute: boolean = false): Promise<boolean> {
        const _path: string = absolute ? file : await path.join(await this.appDirectory(), file);
        return await invoke("write_file", { path: _path, data: contents });
    }

    static async readFile(filePath: string): Promise<string | boolean> {
        try {
            return await fs.readTextFile(filePath, { dir: fs.BaseDirectory.AppConfig })
        } catch {
            return false;
        }
    }

    static async listDirectoryFiles(dirPath: string): Promise<FileEntry[] | boolean> {
        try {
            return await fs.readDir(dirPath, { dir: fs.BaseDirectory.AppConfig })
        } catch {
            return false;
        }
    }

    static async createDirectory(directory: string, absolute: boolean = false): Promise<boolean> {
        const _path: string = absolute ? directory : await path.join(await this.appDirectory(), directory);
        return await invoke("create_directory", { path: _path });
    }

    static async exists(path: string): Promise<boolean> {
        try {
            return await fs.exists(path, { dir: fs.BaseDirectory.AppConfig })
        } catch {
            return false;
        }
    }

    static async deleteDirectory(directory: string, absolute: boolean = false): Promise<boolean> {
        const _path: string = absolute ? directory : await path.join(await this.appDirectory(), directory);
        return await invoke("delete_directory", { path: _path });
    }

    static async deleteFile(file: string, absolute: boolean = false): Promise<boolean> {
        const _path: string = absolute ? file : await path.join(await this.appDirectory(), file);
        return await invoke("delete_file", { path: _path });
    }
    
    static async renameFile(filePath: string, newPath: string): Promise<boolean> {
        try {
            if ((await this.exists(filePath)) === false) return false;
            await fs.renameFile(filePath, newPath, { dir: fs.BaseDirectory.AppConfig })
            return true;
        } catch {
            return false;
        }
    }
}