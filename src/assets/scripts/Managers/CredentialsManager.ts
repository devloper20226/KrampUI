import FilesystemService from "../Services/FilesystemService";
import { exit } from "../main";

export type Credentials = {
    email: string,
    password: string
}

export default class CredentialsManager {
    static currentCredentials: Credentials | null = null;
    static currentLoginToken: string | null = null;

    private static announceCredentialsInitialized() {
        console.log("Credentials initialized!");
        console.log(this.currentCredentials);
    }

    static async intializeCredentials() {
        if (this.currentCredentials !== null || this.currentLoginToken !== null) return;

        // Data folder should be already present, becaucase we will call this after settings manager, which checks it
        const doesCredentialsFileExist = await FilesystemService.exists("data/credentials.json");

        if (!doesCredentialsFileExist) {
            const defaultCredentials: Credentials = {
                email: "",
                password: ""
            }

            this.currentCredentials = defaultCredentials;
            this.currentLoginToken = "";
            await FilesystemService.writeFile("data/credentials.json", JSON.stringify(this.currentCredentials, null, 2));
            this.announceCredentialsInitialized();
            return;
        }

        const credentialsContent = await FilesystemService.readFile("data/credentials.json");
        if (typeof(credentialsContent) == "boolean") { alert("Failed to initialize credentials manager! (0x3)"); exit(); return };
        let parsedContent;
        try {
            parsedContent = JSON.parse(credentialsContent);
        } catch {
            return;
        }

        this.currentCredentials = parsedContent;
        this.currentLoginToken = "";
        this.announceCredentialsInitialized();
    }

    private static async saveCredentials() {
        await FilesystemService.writeFile("data/credentials.json", JSON.stringify(this.currentCredentials, null, 2));
    }

    static async updateCredentials(email: string, password: string) {
        if (this.currentCredentials === null) return;
        this.currentCredentials.email = email;
        this.currentCredentials.password = password;
        await this.saveCredentials();
    }
}