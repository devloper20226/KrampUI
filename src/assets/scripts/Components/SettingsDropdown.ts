import SettingsManager from "../Managers/SettingsManager";

export default async () => {
    const settingsMap: Record<string, string> = {
        keyToggle: ".kr-dropdown-key-toggle",
        autoLogin: ".kr-dropdown-auto-login",
        autoInject: ".kr-dropdown-auto-inject",
        topMost: ".kr-dropdown-top-most"
    };

    function updateDropdown(settingKey: string, elementSelector: string) {
        const settingValue = SettingsManager.currentSettings?.[settingKey];
        const element = document.querySelector(elementSelector);
        const faElement = element?.querySelector(".fa-solid");

        if (faElement) {
            faElement.className = `fa-solid fa-${settingValue ? "check" : "times"}`;
        }
    }

    async function toggleSetting(settingKey: string) {
        const currentValue = SettingsManager.currentSettings?.[settingKey];
        await SettingsManager.setSetting(settingKey, !currentValue);
        updateDropdown(settingKey, settingsMap[settingKey]);
    }

    Object.entries(settingsMap).forEach(([settingKey, selector]) => {
        const element = document.querySelector(selector) as HTMLElement;
        element.addEventListener("click", () => toggleSetting(settingKey));
        updateDropdown(settingKey, selector);
    });
}
