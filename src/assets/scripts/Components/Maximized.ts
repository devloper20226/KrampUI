import WindowManager from "../Managers/WindowManager";

export default function () {
    async function checkMaximized() {
        const maximized = await WindowManager.isMaximized();
        document.body.classList.toggle("kr-maximized", maximized);
    }

    checkMaximized();
    window.addEventListener("resize", checkMaximized);
};