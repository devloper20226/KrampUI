import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";

export type ScriptTab = {
    id: string,
    name: string,
    order: number,
    active: boolean,
    scroll: number
};

export type FileTab = {
    id: string,
    path: string,
    order: number,
    active: boolean,
    scroll: number
};

export type UnsavedTab = {
    content: string,
    scroll: number
};

export type Tabs = (ScriptTab | FileTab)[];
export type UnsavedTabs = UnsavedTab[];

// TODO: finish off
export default class TabsManager {
    static tabs: Tabs | null = null;
    static unsavedTabs: UnsavedTabs | null = null;

    private static announceTabsInitialized() {
        console.log("Tabs initialized!");
        console.log(this.tabs);
        console.log(this.unsavedTabs);
    }

    static async initializeTabs() {
        if (this.tabs !== null) return;

        const doesTabsDataFolderExist = await FilesystemService.exists("data/tabs-data");
        const doesTabsFileExist = await FilesystemService.exists("data/tabs.json")
        const doesUnsavedTabsFileExist = await FilesystemService.exists("data/unsaved-tabs.json");

        function abort() {
            alert("Failed to initialize Tabs manager! (0x4)");
            exit();
        }

        const defaultTabs: Tabs = [];
        const defaultUnsavedTabs: UnsavedTabs = [];

        if (!doesTabsDataFolderExist) {
            await FilesystemService.createDirectory("data/tabs-data");
        }

        if (!doesTabsFileExist) {
            await FilesystemService.writeFile("data/tabs.json", JSON.stringify(defaultTabs, null, 2));
        }

        if (!doesUnsavedTabsFileExist) {
            await FilesystemService.writeFile("data/unsaved-tabs.json", JSON.stringify(defaultUnsavedTabs));
        }

        const tabsFileContent = await FilesystemService.readFile("data/tabs.json");
        const unsavedTabsFileContent = await FilesystemService.readFile("data/unsaved-tabs.json");

        if (typeof(tabsFileContent) == "boolean" || typeof(unsavedTabsFileContent) == "boolean") {
            return abort();
        };

        let tabs: Tabs;
        let unsavedTabs: UnsavedTabs;
        
        try {
            tabs = JSON.parse(tabsFileContent);
            unsavedTabs = JSON.parse(unsavedTabsFileContent);
        } catch {
            return abort();
        }

        this.tabs = tabs;
        this.unsavedTabs = unsavedTabs;
        this.announceTabsInitialized();
    }

    private static async saveTabs() {
        await FilesystemService.writeFile("data/tabs.json", JSON.stringify(this.tabs, null, 2));
    }

    private static async saveUnsavedTabs() {
        await FilesystemService.writeFile("data/unsaved-tabs.json", JSON.stringify(this.unsavedTabs, null, 2));
    }
};