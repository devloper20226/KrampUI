import FilesystemService from "../Services/FilesystemService";

export type UISettings = {
    autoLogin: boolean,
    autoInject: boolean,
    topMost: boolean,
    keyToggle: boolean,
    [key: string]: boolean
}

export default class SettingsManager {
    static currentSettings: UISettings | null = null

    private static announceSettingsInitialize() {
        console.log("Settings initialized!");
        console.log(this.currentSettings);
    }

    static async initializeSettings() {
        if (this.currentSettings !== null) return;
        const doesDataFolderExist = await FilesystemService.exists("data");

        const defaultSettings: UISettings = {
            autoLogin: true,
            autoInject: false,
            topMost: true,
            keyToggle: false
        }

        if (!doesDataFolderExist) {
            await FilesystemService.createDirectory("data")
            await FilesystemService.writeFile("data/settings.json", JSON.stringify(defaultSettings, null, 2));
            this.currentSettings = defaultSettings;
            this.announceSettingsInitialize();
            return;
        }

        const settingsFileExists = await FilesystemService.exists("data/settings.json")

        if (!settingsFileExists) {
            await FilesystemService.writeFile("data/settings.json", JSON.stringify(defaultSettings, null, 2));
            this.currentSettings = defaultSettings;
            this.announceSettingsInitialize();
            return;
        }

        const settingsFileContent = await FilesystemService.readFile("data/settings.json");
        if (typeof(settingsFileContent) == "boolean") return;

        let parsedJson;
        try {
            parsedJson = JSON.parse(settingsFileContent);
        } catch {
            return;
        }

        this.currentSettings = parsedJson;
        this.announceSettingsInitialize();
    }

    private static async saveSettings() {
        await FilesystemService.writeFile("data/settings.json", JSON.stringify(this.currentSettings, null, 2))
    }

    static async setSetting(settingName: string, value: boolean) {
        if (this.currentSettings == null) return;
        if (this.currentSettings[settingName] == null) return;
        this.currentSettings[settingName] = value;
        await this.saveSettings();
    }
}