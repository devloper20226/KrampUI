import WindowService from "../Services/WindowService";

export default function () {
    async function checkMaximized() {
        const maximized = await WindowService.isMaximized();
        document.body.classList.toggle("kr-maximized", maximized);
    }

    checkMaximized();
    window.addEventListener("resize", checkMaximized);
};