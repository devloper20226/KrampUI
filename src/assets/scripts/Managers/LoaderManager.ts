import { Child, Command } from "@tauri-apps/api/shell";
import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";
import { path } from "@tauri-apps/api";

export default class LoaderManager {
    static loaderPath: string | null = null;
    static wsPort: number = 54349;

    private static async setupWebsocket() {
        const doesAutoExecFolderExit = await FilesystemService.exists("autoexec");

        if (!doesAutoExecFolderExit) {
            await FilesystemService.createDirectory("autoexec");
        }

        const doesWebsocketCodeExist = await FilesystemService.exists("autoexec/__krampui");

        if (!doesWebsocketCodeExist) {
            const code = `
                while not getgenv().KR_READY and task.wait(1) do
                    pcall(function()
                        getgenv().KR_WEBSOCKET = websocket.connect("ws://127.0.0.1:${this.wsPort}")
                        getgenv().KR_WEBSOCKET:Send("connect")
                        getgenv().KR_READY = true

                        getgenv().KR_WEBSOCKET.OnMessage:Connect(function(message)
                            pcall(function()
                                loadstring(message)()
                            end)
                        end)
                    end)
                end
            `.replace(/(--.*$|\/\*[\s\S]*?\*\/)/gm, "").replace(/\s+/g, " ").trim();

            await FilesystemService.writeFile("autoexec/__krampui", code);
        }
    }

    static async inject() {
        const loaderCommand = new Command("cmd", ["/c", "start", "/b", "/wait", "krampus-loader.exe"], { cwd: await path.appConfigDir() });

        let injectionCompleted = false;
        let loaderChild: Child;
        let robloxCheck;

        function onOutput(line: string) {
            line = line ? line.trim() : "";
            console.log(line);
        }

        loaderCommand.on("error", () => {
            console.log("Unexpected error!");
        })

        loaderCommand.stdout.on("data", onOutput);

        try {
            loaderChild = await loaderCommand.spawn();
            console.log("Started")
        } catch {

        }
        
    }   

    static async findLoader(): Promise<boolean> {
        function abort() {
            alert("Failed to find loader! (0x1)");
            exit();
        }

        const dataFiles = await FilesystemService.listDirectoryFiles("");

        if (typeof(dataFiles) == "boolean") {
            abort();
            return false;
        }

        for (const file of dataFiles) {
            if (file.name == "krampus-loader.exe") {
                this.loaderPath = file.path;
                this.setupWebsocket();
                console.log("Found loader: " + this.loaderPath)
                return true;
            }
        }

        return false;
    }

    static async clearExecutables() {
        function abort() {
            alert("Failed to clear executables! (0x3)");
            exit();
        }

        const dataFiles = await FilesystemService.listDirectoryFiles("");

        if (typeof(dataFiles) == "boolean") {
            return abort();
        }

        for (const file of dataFiles) {
            if (file.name == "krampus-loader.exe") {
                FilesystemService.deleteFile(file.path);
                return;
            }
        }
    }
}