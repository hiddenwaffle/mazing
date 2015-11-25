'use strict';

class Input {

    constructor() {
        this._requestedDirection = 'left';
        this.enterPressed = false;
        this.anyKeyPressed = false;
    }

    reset() {
        this.enterPressed = false;
        this.anyKeyPressed = false;
    }

    start() {
        window.addEventListener('keydown', (e) => {

            this.anyKeyPressed = true;

            switch (e.keyCode) {
                case 37: // left
                    this._requestedDirection = 'left';
                    e.preventDefault();
                    break;
                case 38: // up
                    this._requestedDirection = 'up';
                    e.preventDefault();
                    break;
                case 39: // right
                    this._requestedDirection = 'right';
                    e.preventDefault();
                    break;
                case 40: // down
                    this._requestedDirection = 'down';
                    e.preventDefault();
                    break;
                case 13: // enter key
                    this.enterPressed = true;
                    e.preventDefault();
                    break;

                // do not count certain keys as being 'any key'
                case 18:    // alt
                case 224:   // apple command (firefox)
                case 17:    // apple command (opera)
                case 91:    // apple command, left (safari/chrome)
                case 93:    // apple command, right (safari/chrome)
                    this.anyKeyPressed = false;
                    break;

                // prevent losing focus via tab
                case 9:
                    this.anyKeyPressed = false;
                    e.preventDefault();
                    break;

                default:
                    // do nothing
                    break;
            }
        });
    }

    get requestedDirection() {
        return this._requestedDirection;
    }
}

module.exports = Input;