export default function onClick(element: HTMLElement, cb: (button: string, event: MouseEvent) => void) {
    let down = false;

    element.addEventListener("mousedown", function () {
        down = true;
    });

    element.addEventListener("mouseup", function (e: MouseEvent) {
        if (down && !element?.classList?.contains("disabled")) {
            let button: string;

            switch (e.button) {
                case 0:
                    button = "left";
                    break;
                case 1:
                    button = "middle";
                    break;
                case 2:
                    button = "right";
                    break;
                default:
                    button = "unknown";
            }
            
            cb(button, e);
        }

        down = false;
    });
};