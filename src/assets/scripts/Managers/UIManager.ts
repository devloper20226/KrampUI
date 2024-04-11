
import { invoke } from "@tauri-apps/api";
export type UIState = "Attached" | "Injecting" | "Idle"

export default class UIManager {
    static currentState: UIState = "Idle"
    static isRobloxFound: boolean = false
    static websocketConnected: boolean = false

    private static UIIndicator = document.querySelector(".kr-titlebar .brand .text") as HTMLElement;
    private static injectButton = document.querySelector(".kr-inject") as HTMLElement;
    private static executeButton = document.querySelector(".kr-execute") as HTMLElement;
    private static killButton = document.querySelector(".kr-kill") as HTMLElement;

    private static updateIndicator() {
        switch (this.currentState) {
            case "Attached":
                this.UIIndicator.style.color = "var(--green)"
                break;
            case "Injecting":
                this.UIIndicator.style.color = "var(--yellow)"
                break
            case "Idle":
                this.UIIndicator.style.color = "var(--text)"
                break
        }
    }

    private static updateButtons() {
        if (this.currentState == "Attached") {
            if (this.websocketConnected == true) {
                this.executeButton.classList.remove("disabled");
            } else {
                this.executeButton.classList.add("disabled");
            }
        } else {
            this.injectButton.classList.add("disabled");
            this.executeButton.classList.add("disabled");
        }

        if (this.isRobloxFound) {
            if (this.currentState !== "Injecting" && this.currentState !== "Attached") {
                this.injectButton.classList.remove("disabled");
            }
            this.killButton.classList.remove("disabled")
        } else {
            this.killButton.classList.add("disabled")
            this.injectButton.classList.add("disabled");
        }
    }

    static updateStatus(newStatus: UIState) {
        if (newStatus === this.currentState) return;
        this.currentState = newStatus;
        this.updateIndicator();
        this.updateButtons();
    }

    static updateRobloxFound(newValue: boolean) {
        if (this.isRobloxFound == newValue) return;
        this.isRobloxFound = newValue;

        if (this.currentState !== "Idle") {
            this.updateStatus("Idle")
        }

        this.updateButtons();
    }

    static updateWebsocketConnected(newValue: boolean) {
        if (this.websocketConnected == newValue) return;
        this.websocketConnected = newValue;
        this.updateButtons();
    }

    static startRobloxActiveLoop() {
        setInterval(async function () {
            const isRobloxRunning: boolean = await invoke("is_roblox_running");
            if (isRobloxRunning == UIManager.isRobloxFound) return;

            UIManager.updateRobloxFound(isRobloxRunning);
        }, 500);
    }
}