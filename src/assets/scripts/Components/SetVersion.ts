import { getVersion } from "@tauri-apps/api/app";

export default async function () {
    const version = document.querySelector(".version") as HTMLElement;
    version.innerText = `(${await getVersion()})`;
};