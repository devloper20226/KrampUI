import { Child, Command } from "@tauri-apps/api/shell";
import FilesystemService from "../Services/FilesystemService";
import { event, path } from "@tauri-apps/api";
import UIManager from "./UIManager";
import WindowManager from "./WindowManager";

export type InjectionResult = {
    success: boolean,
    error: string
}

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

    private static async setupWebsocketListener() {
        event.listen("update", function(event) {
            const isConnected: boolean = (event.payload as any).message || false;
            console.log("Got update: " + isConnected)

            if (UIManager.websocketConnected == isConnected) return;

            UIManager.updateWebsocketConnected(isConnected);
        });
    }

    static async inject(): Promise<InjectionResult> {
        return new Promise(async function (resolve) {
            const loaderCommand = new Command("cmd", ["/c", "start", "/b", "/wait", "krampus-loader.exe"], { cwd: await path.appConfigDir() });
            let loaderChild: Child;
            let robloxKillCheck: number;

            function onOutput(line: string) {
                line = line.trim();
                const errors = ["error:", "redownload", "create a ticket", "make a ticket", "cannot find user", "mismatch", "out of date", "failed to", "no active subscription"];
    
                if (line.toLowerCase().includes("already attached")) {
                    resolve({ success: true, error: "" });
                } else if (errors.some(s => line.toLowerCase().includes(s)) && !line.endsWith(":")) {
                    resolve({ success: false, error: line });
                } else if (line.toLowerCase().includes("success")) {
                    resolve({ success: true, error: "" });
                }
            }
    
            loaderCommand.on("error", function (err) {
                console.error("Unexpected error!", err);
                resolve({ success: false, error: "Unexpected error" });
            });
    
            loaderCommand.stdout.on("data", onOutput);
            loaderCommand.stderr.on("data", onOutput);
    
            try {
                loaderChild = await loaderCommand.spawn();
            } catch (error) {
                resolve({ success: false, error: "Failed to start injector! Check whether the loader is present!" });
            }
    
            robloxKillCheck = setInterval(async () => {
                if (UIManager.isRobloxFound == false) {
                    UIManager.updateStatus("Idle");
                    await loaderChild.kill();
                    resolve({ success: false, error: "Roblox was closed while injecting" })
                }
            }, 501)

            setTimeout(async function () {
                await loaderChild.kill();
                clearInterval(robloxKillCheck);
            }, 10000);
        });
    }

    static async findLoader(): Promise<boolean> {
        function abort() {
            alert("Failed to find loader! (0x1)");
            WindowManager.exit();
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
                this.setupWebsocketListener();
                console.log("Found loader: " + this.loaderPath)
                return true;
            }
        }

        return false;
    }

    static async clearExecutables() {
        function abort() {
            alert("Failed to clear executables! (0x3)");
            WindowManager.exit();
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