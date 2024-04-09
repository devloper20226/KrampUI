import onClick from "../Functions/OnClick";

export default function initializeDropdowns() {
    function findDropdown(element: HTMLElement | null): HTMLElement | null {
        if (!element) return null;
        if (element.classList.contains("kr-dropdown")) return element;
        return findDropdown(element.parentElement);
    }

    onClick(document.documentElement, async (button: string, event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const foundDropdown = findDropdown(target);
        const foundDropdownContent = foundDropdown && Array.from(foundDropdown.querySelectorAll<HTMLElement>(".kr-dropdown-content")).find(d => d.parentElement === foundDropdown);
        const dropdowns = Array.from(document.querySelectorAll<HTMLElement>(".kr-dropdown"));

        await Promise.all(dropdowns.map(dropdown => {
            if (dropdown !== foundDropdown) {
                const activeContent = dropdown.querySelector<HTMLElement>(".kr-dropdown-content.active");
                if (activeContent) activeContent.classList.remove("active");
            }
        }));

        if (foundDropdownContent && target.parentElement === foundDropdownContent) {
            foundDropdownContent.classList.remove("active");
        } else if (foundDropdownContent) {
            const shouldToggle = (button === "left" && foundDropdown?.classList.contains("left")) || (button === "right" && !foundDropdown?.classList.contains("left"));
            foundDropdownContent.classList.toggle("active", shouldToggle);

            if (foundDropdownContent.classList.contains("active")) {
                const offsetX = Math.min(event.clientX, window.innerWidth - foundDropdownContent.offsetWidth - 10);
                const offsetY = Math.min(event.clientY + 10, window.innerHeight - foundDropdownContent.offsetHeight - 10);

                foundDropdownContent.style.top = `${offsetY}px`;
                foundDropdownContent.style.left = `${offsetX}px`;
            }
        }
    });
}
