import TabsManager, { Tab } from "./TabsManager";

export class TabsUIManager {
    private static tabs: HTMLElement | null = document.querySelector(".exploit .main .container .tabs .list");
    private static addTabs: HTMLElement | null = document.querySelector(".kr-add-tab");

    private static createTabDropdown(tab: HTMLElement): HTMLElement {
        const [dropdown, content] = [document.createElement("div"), document.createElement("div")];
        const [execute, executeIcon] = [document.createElement("div"), document.createElement("i")];
        const [rename, renameIcon] = [document.createElement("div"), document.createElement("i")];

        dropdown.className = "kr-dropdown";
        content.className = "kr-dropdown-content";

        execute.innerText = "Execute";
        executeIcon.className = "fa-solid fa-scroll";

        rename.innerText = "Rename";
        renameIcon.className = "fa-solid fa-font";

        execute.append(executeIcon);
        rename.append(renameIcon);
        content.append(execute, rename);
        dropdown.append(tab, content);

        return dropdown;
    }

    private static createTab(tabInfo: Tab, scrollToActive: boolean = false) {
        const tab = document.createElement("div");
        const dropdown = this.createTabDropdown(tab);
        const [icon, editIcon, closeIcon] = [document.createElement("i"), document.createElement("i"), document.createElement("i")];

        const name = TabsManager.getTabName(tabInfo);

        tab.className = "kr-tab";
        tab.spellcheck = false;
        tab.innerText = name || "";
        if (tabInfo.active) tab.classList.add("active");
        tab.setAttribute("kr-id", tabInfo.id);

        icon.className = TabsManager.isFileTab(tabInfo) ? "fa-solid fa-file" : "fa-solid fa-scroll";
        editIcon.className = "fa-solid fa-pencil";
        editIcon.style.order = "-1";
        closeIcon.className = "fa-solid fa-times";
        closeIcon.style.order = "-2";

        tab.append(icon);
        if (TabsManager.isUnsaved(tabInfo)) tab.append(editIcon);
        if ((TabsManager.getTabs()?.length || 0) > 1) tab.append(closeIcon);

        if (!tabInfo.active) tab.addEventListener("click", async function (e) {
            if (tab.contentEditable !== "true" && !(e.target as HTMLElement)?.classList.contains("fa-times")) {
                await TabsManager.setActiveTab(tabInfo);
                TabsUIManager.populateTabs();
            }
        });

        closeIcon.addEventListener("click", async function () { 
            await TabsManager.removeTab(tabInfo);
            TabsUIManager.populateTabs();
        });

        this.tabs?.append(dropdown);
        if (tabInfo.active && scrollToActive) tab.scrollIntoView();
    }

    private static clearTabs() {
        if (!this.tabs) return;
        this.tabs.innerHTML = "";
    }

    static populateTabs(scrollToActive: boolean = false) {
        this.clearTabs();
        TabsManager.getTabs()?.forEach((tab) => this.createTab(tab, scrollToActive));
    }

    static initializeTabs() {
        this.populateTabs(true);
        this.addTabs?.addEventListener("click", async function () {
            await TabsManager.addNewTab();
            TabsUIManager.populateTabs(true);
        });
    }
};