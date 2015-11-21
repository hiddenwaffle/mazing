'use strict';

class Input {

    constructor() {
        this._requestedDirection = 'left';
        this._userHitPauseButton = false;
    }

    start() {
        window.addEventListener('keydown', (e) => {
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
                    this._userHitPauseButton = true;
                    e.preventDefault();
                    break;
                default:
                    // do nothing
                    break;
            }
        });
    }

    switchIfUserHitPauseButton() {
        let value = this._userHitPauseButton;
        this._userHitPauseButton = false;
        return value;
    }

    get requestedDirection() {
        return this._requestedDirection;
    }
}

module.exports = Input;