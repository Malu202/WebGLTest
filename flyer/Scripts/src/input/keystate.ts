export interface IKeyState {
    left: boolean;
    right: boolean;
    forward: boolean;
    back: boolean;
}

export interface IKeyStateService {
    get(): IKeyState;
}

export class KeyStateService implements IKeyStateService {
    constructor() {
        var keys: IKeyState = this._keyState = { left: false, right: false, forward: false, back: false };

        function handleKeyDown(evt) {
            var tag = evt.target.tagName.toLowerCase();
            if (tag == 'input' || tag == 'textarea')
                return;

            if (evt.keyCode == 65) {//A
                keys.left = true;
            }
            if (evt.keyCode == 68) {//D
                keys.right = true;
            }
            if (evt.keyCode == 87) {//W
                keys.forward = true;
            }
            if (evt.keyCode == 83) {//S
                keys.back = true;
            }
        }

        function handleKeyUp(evt) {
            if (evt.keyCode == 65) {
                keys.left = false;
            }
            if (evt.keyCode == 68) {
                keys.right = false;
            }
            if (evt.keyCode == 87) {
                keys.forward = false;
            }
            if (evt.keyCode == 83) {
                keys.back = false;
            }
        }
        window.addEventListener("keydown", handleKeyDown, false);
        window.addEventListener("keyup", handleKeyUp, false);
    }
    private _keyState: IKeyState;
    get() {
        return this._keyState;
    }
}