export default function randomString(length: number) {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    let text = "";

    for (let i = 0; i < length; i++) {
        text += characters.charAt(values[i] % characters.length);
    }

    return text;
}