'use strict';

class Input {

    constructor() {
        this._requestedDirection = 'left';
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