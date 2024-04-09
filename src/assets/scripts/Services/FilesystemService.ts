import { fs } from "@tauri-apps/api";
import { FileEntry } from "@tauri-apps/api/fs";

export default class FilesystemService {

    static async writeFile(filePath: string, content: string): Promise<boolean> {
        try {
            await fs.writeTextFile(filePath, content, { dir: fs.BaseDirectory.AppConfig })
            return true;
        } catch {
            return false;
        }
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

    static async createDirectory(dirPath: string, recursive: boolean = false): Promise<boolean> {
        try {
            await fs.createDir(dirPath, { dir: fs.BaseDirectory.AppConfig, recursive })
            return true;
        } catch (err) {
            return false;
        }
    }

    static async exists(path: string): Promise<boolean> {
        try {
            return await fs.exists(path, { dir: fs.BaseDirectory.AppConfig })
        } catch {
            return false;
        }
    }
}