import { invoke } from "@tauri-apps/api";
import CredentialsManager from "../Managers/CredentialsManager";
import SettingsManager from "../Managers/SettingsManager";
import LoaderManager from "../Managers/LoaderManager";
import UIManager from "../Managers/UIManager";

export default async () => {
    const loginEmail = document.querySelector(".kr-input.email") as HTMLInputElement;
    const loginPassword = document.querySelector(".kr-input.password") as HTMLInputElement;
    const loginForm = document.querySelector(".form") as HTMLElement;
    const loginButton = document.querySelector(".login-button") as HTMLElement;

    async function login(): Promise<boolean> {
        function handleError(error: string) {
            loginButton.classList.add("disabled");
            loginForm.classList.remove("disabled");
            loginButton.innerText = error;

            setTimeout(() => {
                loginButton.innerText = "Authenticate via acedia.gg"
                loginButton.classList.remove("disabled")
            }, 1500)

            return false;
        }

        const email = loginEmail.value;
        const password = loginPassword.value;
        loginForm.classList.add("disabled");

        loginButton.innerText = "Fetching session cookie...";
        const [loginSuccess, loginInfo]: [boolean, string] = await invoke("attempt_login", { email, password });
        if (!loginSuccess) return handleError(loginInfo);

        loginButton.innerText = "Fetching login token...";
        const [tokenSuccess, tokenInfo]: [boolean, string] = await invoke("get_login_token", { sessionToken: loginInfo });
        if (!tokenSuccess) return handleError(tokenInfo);

        loginButton.innerText = "Downloading loader..."
        await LoaderManager.clearExecutables();
        const downloadSuccess: boolean = await invoke("download_loader", { path: "krampus-loader.exe", token: tokenInfo })
        if (!downloadSuccess) return handleError("Failed to download loader!");
        await LoaderManager.findLoader();

        loginButton.innerText = "Sucessfully logged in!";
        await CredentialsManager.updateCredentials(email, password);
        UIManager.loggedIn();

        return true;
    }

    if (SettingsManager.currentSettings?.autoLogin === true && CredentialsManager.currentCredentials !== null) {
        if (CredentialsManager.currentCredentials.email !== "" && CredentialsManager.currentCredentials.password !== "") {
            loginEmail.value = CredentialsManager.currentCredentials.email;
            loginPassword.value = CredentialsManager.currentCredentials.password;
            if ((await login()) === true) return;
        }
    }

    loginButton.addEventListener("click", login);
}