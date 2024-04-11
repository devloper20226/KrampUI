import FilesystemService from "../Services/FilesystemService";
import randomString from "../Functions/RandomString";
import { exit } from "../main";

export type ScriptTab = {
    id: string,
    order: number,
    name: string,
    active: boolean,
    scroll: number
};

export type FileTab = {
    id: string,
    order: number,
    path: string,
    active: boolean,
    scroll: number
};

export type UnsavedTab = {
    id: string,
    content: string,
    scroll: number
};

export type Tab = ScriptTab | FileTab;
export type Tabs = Tab[];
export type UnsavedTabs = UnsavedTab[];

// TODO: finish off
export default class TabsManager {
    private static tabs: Tabs | null = null;
    private static unsavedTabs: UnsavedTabs | null = null;

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
        await this.clearUnsavedTabs();
        await this.checkTabs();
        this.announceTabsInitialized();
    }

    static getTabId(): string {
        return randomString(20);
    }

    static getTabs(): Tabs | null {
        return this.tabs;
    }

    static getNextOrder(): number {
        const orders = this.tabs?.map((t) => t.order);

        if (!orders || orders.length === 0) return 1;
        let largest = orders[0];
        
        for (var i = 0; i < orders.length; i++) {
            if (orders[i] > largest) largest = orders[i];
        }
        
        return largest + 1;
    }

    static async checkTabs() {
        if (this.tabs?.length === 0) {
            const defaultTab: ScriptTab = {
                id: this.getTabId(),
                order: this.getNextOrder(),
                name: "Script",
                active: true,
                scroll: 0
            };

            await this.addTab(defaultTab);
        }
    }

    static isFileTab(tab: Tab): tab is FileTab {
        return (tab as FileTab).path !== undefined;
    }
    
    static getActiveTab(): Tab | null {
        return this.tabs?.find((t) => t.active) || null;
    }

    static getActiveUnsavedTab(): UnsavedTab | null {
        const activeTab = this.getActiveTab();
        return this.unsavedTabs?.find((t) => t.id === activeTab?.id) || null;
    }

    static async addTab(tab: Tab) {
        this.tabs?.push(tab);
        await this.saveTabs();
    }

    static async removeTab(tab: Tab) {
        const index = this.tabs?.findIndex((t) => t.id === tab.id);

        if (index) {
            this.tabs?.splice(index, 1);
            await this.saveTabs();
        }
    }

    static async addUnsavedTab(tab: UnsavedTab) {
        this.unsavedTabs?.push(tab);
        await this.saveUnsavedTabs();
    }

    static async removeUnsavedTab(tab: UnsavedTab) {
        const index = this.unsavedTabs?.findIndex((t) => t.id === tab.id);

        if (index) {
            this.unsavedTabs?.splice(index, 1);
            await this.saveUnsavedTabs();
        }
    }

    private static async clearUnsavedTabs() {
        if (this.unsavedTabs) {
            for (const tab of this.unsavedTabs) {
                if (!this.tabs?.find((t) => t.id === tab.id)) {
                    const index = this.unsavedTabs?.findIndex((t) => t.id === tab.id);
                    if (index) this.unsavedTabs?.splice(index, 1);
                }
    
                await this.saveUnsavedTabs();
            }
        }
    }

    private static async saveTabs() {
        await FilesystemService.writeFile("data/tabs.json", JSON.stringify(this.tabs, null, 2));
    }

    private static async saveUnsavedTabs() {
        await FilesystemService.writeFile("data/unsaved-tabs.json", JSON.stringify(this.unsavedTabs, null, 2));
    }
};