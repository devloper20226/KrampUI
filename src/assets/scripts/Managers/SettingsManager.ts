import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";

export type UISettings = {
    autoInject: boolean,
    topMost: boolean,
    keyToggle: boolean,
    [key: string]: boolean
}

export default class SettingsManager {
    static currentSettings: UISettings | null = null

    static async initializeSettings() {
        if (this.currentSettings !== null) return;

        function abort() {
            alert("Failed to initialize Settings manager! (0x2)");
            exit();
        }

        const doesDataFolderExist = await FilesystemService.exists("data");

        const defaultSettings: UISettings = {
            autoInject: false,
            topMost: true,
            keyToggle: false
        }

        if (!doesDataFolderExist) {
            await FilesystemService.createDirectory("data")
            await FilesystemService.writeFile("data/settings.json", JSON.stringify(defaultSettings, null, 2));
            this.currentSettings = defaultSettings;
            return;
        }

        const settingsFileExists = await FilesystemService.exists("data/settings.json")

        if (!settingsFileExists) {
            await FilesystemService.writeFile("data/settings.json", JSON.stringify(defaultSettings, null, 2));
            this.currentSettings = defaultSettings;
            return;
        }

        const settingsFileContent = await FilesystemService.readFile("data/settings.json");

        if (typeof(settingsFileContent) == "boolean") {
            return abort();
        };

        let settings: UISettings;
        
        try {
            settings = JSON.parse(settingsFileContent);
        } catch {
            return abort();
        }

        this.currentSettings = settings;
    }

    private static async saveSettings() {
        await FilesystemService.writeFile("data/settings.json", JSON.stringify(this.currentSettings, null, 2));
    }

    static async setSetting(settingName: string, value: boolean) {
        if (this.currentSettings == null) return;
        if (this.currentSettings[settingName] == null) return;
        this.currentSettings[settingName] = value;
        await this.saveSettings();
    }
}