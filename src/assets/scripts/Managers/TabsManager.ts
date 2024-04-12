import FilesystemService from "../Services/FilesystemService";
import randomString from "../Functions/RandomString";
import EditorManager from "./EditorManager";
import getDirectory from "../Functions/GetDirectory";
import { roundNumber } from "../Functions/RoundNumber";
import { TabsUIManager } from "./TabsUIManager";
import WindowManager from "./WindowManager";

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
    content: string | null,
    scroll: number
};

export type Tab = ScriptTab | FileTab;
export type Tabs = Tab[];
export type UnsavedTabs = UnsavedTab[];

export default class TabsManager {
    private static tabs: Tabs | null = null;
    private static unsavedTabs: UnsavedTabs | null = null;

    static async initializeTabs() {
        if (this.tabs !== null) return;

        const doesTabsDataFolderExist = await FilesystemService.exists("data/tabs");
        const doesTabsFileExist = await FilesystemService.exists("data/tabs.json")
        const doesUnsavedTabsFileExist = await FilesystemService.exists("data/unsaved-tabs.json");

        function abort() {
            alert("Failed to initialize Tabs manager! (0x4)");
            WindowManager.exit();
        }

        const defaultTabs: Tabs = [];
        const defaultUnsavedTabs: UnsavedTabs = [];

        if (!doesTabsDataFolderExist) {
            await FilesystemService.createDirectory("data/tabs");
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

        this.clearUnsavedTabs();
        await this.checkTabs();
    }

    static getTabs(): Tabs | null {
        return this.tabs;
    }

    private static getTabId(): string {
        return randomString(20);
    }

    static isUnsaved(tab: Tab): boolean {
        const unsavedTab = this.unsavedTabs?.find((t) => t.id === tab.id);
        return unsavedTab ? true : false;
    }

    private static getNextOrder(): number {
        const orders = this.tabs?.map((t) => t.order);

        if (!orders || orders.length === 0) return 1;
        let largest = orders[0];
        
        for (var i = 0; i < orders.length; i++) {
            if (orders[i] > largest) largest = orders[i];
        }
        
        return largest + 1;
    }

    private static async checkTabs() {
        if (this.tabs?.length === 0) {
            await this.addNewTab();
        }
    }

    private static sortTabs() {
        if (!this.tabs) return;

        this.tabs.sort((a, b) => a.order - b.order);
        this.tabs = this.tabs.map(function (tab, index) {
            tab.order = index + 1;
            return tab;
        });
    }

    static isFileTab(tab: Tab): tab is FileTab {
        return (tab as FileTab).path !== undefined;
    }
    
    private static getActiveTab(): Tab | null {
        return this.tabs?.find((t) => t.active) || null;
    }

    private static getActiveUnsavedTab(): UnsavedTab | null {
        const activeTab = this.getActiveTab();
        return this.unsavedTabs?.find((t) => t.id === activeTab?.id) || null;
    }

    static async addTab(tab: Tab): Promise<Tab> {
        const savedTab = this.tabs?.push(tab);
        await this.saveTabs();
        return this.tabs && savedTab ? this.tabs[savedTab - 1] : tab;
    }

    static async removeTabFiles(tab: Tab) {
        if (this.isFileTab(tab)) {
            await FilesystemService.deleteFile(tab.path, true);
        } else {
            await FilesystemService.deleteFile(`data/tabs/${tab.id}.lua`);
        }
    }

    static async getTabContent(tab: Tab, force: boolean = false): Promise<string | null> {
        if (!force) {
            const unsavedTab = this.unsavedTabs?.find((t) => t.id === tab.id);
            if (unsavedTab && unsavedTab.content !== null) return unsavedTab.content;
        }

        if (this.isFileTab(tab)) {
            const text = await FilesystemService.readFile(tab.path);
            return typeof text === "string" ? text : "";
        } else {
            const text = await FilesystemService.readFile(`data/tabs/${tab.id}.lua`);
            return typeof text === "string" ? text : "";
        }
    }

    static async setTabContent(tab: Tab, content: string) {
        if (this.isFileTab(tab)) {
            await FilesystemService.writeFile(tab.path, content, true);
        } else {
            await FilesystemService.writeFile(`data/tabs/${tab.id}.lua`, content);
        }
    }

    static async getActiveTabContent(force: boolean = false): Promise<string> {
        const activeTab = this.getActiveTab();
        if (!activeTab) return "";

        const content = await this.getTabContent(activeTab, force);
        return content || "";
    }

    static getActiveTabScroll(force: boolean = false): number {
        const activeTab = this.getActiveTab();
        if (!activeTab) return 0;

        const scroll = this.getTabScroll(activeTab, force);
        return scroll || 0;
    }

    static async setActiveTabContent(content: string) {
        const tab = this.getActiveTab();
        if (!tab) return;

        const tabContent = await this.getActiveTabContent(true);
        const unsavedTab = this.getActiveUnsavedTab();

        if (content !== tabContent) {
            if (unsavedTab) {
                unsavedTab.content = content;
                unsavedTab.scroll = roundNumber(unsavedTab.scroll || tab.scroll || 0, 10);
            }
            else this.addUnsavedTab({ id: tab.id, content, scroll: roundNumber(tab.scroll || 0, 10) });
            TabsUIManager.populateTabs();
        } else if (unsavedTab && unsavedTab.scroll === roundNumber(tab.scroll, 10)) {
            this.removeUnsavedTab(unsavedTab);
            TabsUIManager.populateTabs();
        }
    }

    static setActiveTabScroll(_scroll: number) {
        const tab = this.getActiveTab();
        if (!tab) return;

        const scroll = roundNumber(_scroll, 10);
        const tabScroll = this.getActiveTabScroll(true);
        const unsavedTab = this.getActiveUnsavedTab();

        if (scroll !== roundNumber(tabScroll, 10)) {
            if (unsavedTab) {
                unsavedTab.content = unsavedTab.content || null;
                unsavedTab.scroll = scroll;
            }
            else this.addUnsavedTab({ id: tab.id, content: null, scroll });
            TabsUIManager.populateTabs();
        } else if (unsavedTab && unsavedTab.content === null) {
            this.removeUnsavedTab(unsavedTab);
            TabsUIManager.populateTabs();
        }
    }

    static getTabName(tab: Tab) {
        if (this.isFileTab(tab)) {
            return tab.path.split(/[\\\/]/).pop();
        } else {
            return tab.name;
        }
    }

    static getTabScroll(tab: Tab, force: boolean = false): number {
        if (!force) {
            const unsavedTab = this.unsavedTabs?.find((t) => t.id === tab.id);
            if (unsavedTab) return unsavedTab.scroll;
        }

        return tab.scroll;
    }

    static async setActiveTab(tab: Tab, force: boolean = false) {
        if (force || !tab.active) {
            const activeTab = this.getActiveTab();
            if (activeTab) activeTab.active = false;

            tab.active = true;
            await this.saveTabs();
            
            const content = await this.getTabContent(tab);
            const scroll = this.getTabScroll(tab);

            if (content !== null) EditorManager.setEditorText(content);
            EditorManager.setEditorScroll(scroll);
            EditorManager.focusEditor();
        }
    }

    private static getNewTab(tab: Tab): Tab | null {
        if (!this.tabs) return null;

        const index = this.tabs.findIndex((t) => t.id === tab.id);
        const newTab = this.tabs[index - 1] || this.tabs[index + 1];

        return newTab;
    }

    static async saveActiveTab() {
        const unsavedTab = this.getActiveUnsavedTab();
        const activeTab = this.getActiveTab();

        if (unsavedTab) {
            if (unsavedTab.content !== null && activeTab) await this.setTabContent(activeTab, unsavedTab.content);
            this.setActiveTabScroll(unsavedTab.scroll);
            this.removeUnsavedTab(unsavedTab);
            if (activeTab) activeTab.scroll = unsavedTab.scroll;
            TabsManager.saveTabs();
            TabsUIManager.populateTabs();
        }
    }

    static async revertActiveTab() {
        const unsavedTab = this.getActiveUnsavedTab();

        if (unsavedTab) {
            const content = await this.getActiveTabContent(true);
            const scroll = this.getActiveTabScroll(true);

            await this.setActiveTabContent(content);
            this.setActiveTabScroll(scroll);

            EditorManager.setEditorText(content, true);
            EditorManager.setEditorScroll(scroll);

            this.removeUnsavedTab(unsavedTab);
            TabsUIManager.populateTabs();
        }
    }

    static async removeTab(tab: Tab) {
        if (this.tabs?.length === 1) return;

        const index = this.tabs?.findIndex((t) => t.id === tab.id);

        if (tab.active) {
            const newTab = this.getNewTab(tab);
            if (newTab) await this.setActiveTab(newTab);
        }

        if (index !== undefined && index >= 0) {
            this.tabs?.splice(index, 1);
            await this.saveTabs();
        }

        await this.removeTabFiles(tab);

        const unsavedTab = this.unsavedTabs?.find((t) => t.id === tab.id);
        if (unsavedTab) await this.removeUnsavedTab(unsavedTab);
    }

    static async renameTab(tab: Tab, newName: string) {
        if (this.isFileTab(tab)) {
            const newPath = `${getDirectory(tab.path)}\\${newName}`;
            await FilesystemService.renameFile(tab.path, newPath);
            tab.path = newPath;
        } else {
            tab.name = newName;
        }

        await this.saveTabs();
    }

    static async moveTab(tab: Tab, newOrder: number) {
        if (!this.tabs) return;
        const order = tab.order;

        this.tabs = this.tabs.map(function (t) {
            if (t.id !== tab.id) {
                if (t.order >= newOrder && t.order < order) {
                    t.order++;
                } else if (t.order <= newOrder && t.order > order) {
                    t.order--;
                }
            } else {
                t.order = newOrder;
            }

            return t;
        });

        await this.saveTabs();
    }

    static async addNewTab(): Promise<Tab> {
        const tab = await this.addTab({
            id: this.getTabId(),
            order: this.getNextOrder(),
            name: "Script",
            active: true,
            scroll: 0
        });

        await this.setActiveTab(tab, true);
        return tab;
    }

    static async addNewFileTab(path: string): Promise<Tab> {
        let tab = this.tabs?.find((t) => this.isFileTab(t) && t.path === path);

        if (tab) {
            await this.setActiveTab(tab);
            return tab;
        }
        else tab = await this.addTab({
            id: this.getTabId(),
            order: this.getNextOrder(),
            path,
            active: true,
            scroll: 0
        });

        await this.setActiveTab(tab, true);
        return tab;
    }

    static addUnsavedTab(tab: UnsavedTab) {
        this.unsavedTabs?.push(tab);
    }

    static removeUnsavedTab(tab: UnsavedTab) {
        const index = this.unsavedTabs?.findIndex((t) => t.id === tab.id);

        if (index !== undefined && index >= 0) {
            this.unsavedTabs?.splice(index, 1);
        }
    }

    private static clearUnsavedTabs() {
        if (this.unsavedTabs) {
            for (const tab of this.unsavedTabs) {
                if (!this.tabs?.find((t) => t.id === tab.id)) {
                    const index = this.unsavedTabs?.findIndex((t) => t.id === tab.id);
                    if (index !== undefined && index >= 0) this.unsavedTabs?.splice(index, 1);
                }
            }
        }
    }

    private static async saveTabs() {
        this.sortTabs();
        await FilesystemService.writeFile("data/tabs.json", JSON.stringify(this.tabs, null, 2));
    }

    static async saveUnsavedTabs() {
        await FilesystemService.writeFile("data/unsaved-tabs.json", JSON.stringify(this.unsavedTabs, null, 2));
    }
};