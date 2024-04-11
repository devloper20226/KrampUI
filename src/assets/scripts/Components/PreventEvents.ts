export default function () {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", function(e) {
        if (
            e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.metaKey && e.key === "r") ||
            e.key === "F3" || (e.ctrlKey && e.key === "f") || (e.metaKey && e.key === "f") ||
            e.key === "F7" ||
            (e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")
        ) {
            e.preventDefault();
        }
    });
};