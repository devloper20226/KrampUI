import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";

export default class LoaderManager {
    static loaderPath: string | null = null;
    static wsPort: number = 54349;

    private static async setupWebsocket() {
        const doesAutoExecFolderExit = await FilesystemService.exists("autoexec");

        if (!doesAutoExecFolderExit) {
            await FilesystemService.createDirectory("autoexec");
        }

        const doesWebsocketCodeExist = await FilesystemService.exists("autoexec/websocket.lua");

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
            `;

            await FilesystemService.writeFile("autoexec/websocket.lua", code);
        }
    }

    static async findLoader() {
        const dataFiles = await FilesystemService.listDirectoryFiles("");
        if (typeof(dataFiles) == "boolean") { alert("Failed to find loader! (0x1)"); exit(); return }

        for (const file of dataFiles) {
            if (file.name == "krampus-loader.exe") {
                this.loaderPath = file.path;
                this.setupWebsocket();
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