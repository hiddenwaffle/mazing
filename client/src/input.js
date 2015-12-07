'use strict';

class Input {

    constructor() {
        this._keyState = new Map();
        this._keyState.set('left', 'up');
        this._keyState.set('up', 'up');
        this._keyState.set('down', 'up');
        this._keyState.set('enter', 'up');
        this._keyState.set('other', 'up');
    }

    start() {
        window.addEventListener('keydown', (e) => {
            this._eventToState(e, 'down');
        });

        window.addEventListener('keyup', (e) => {
            this._eventToState(e, 'up');
        })
    }

    // TODO: Maybe a reset() method?

    /**
     * Return if given key is 'down'.
     */
    isDown(key) {
        return this._keyState.get(key) === 'down';
    }

    /**
     * Return if given key is 'down'. Also sets the key from 'down' to 'handling'.
     */
    isDownAndUnhandled(key) {
        if (this.isDown(key)) {
            this._keyState.set(key, 'handling');
            return true;
        }
    }

    /**
     * Return if any arrow key is 'down'.
     */
    isArrowKeyDown() {
        return (this._keyState.get('up') === 'down' ||
                this._keyState.get('down') === 'down' ||
                this._keyState.get('left') === 'down' ||
                this._keyState.get('right') === 'down');
    }

    /**
     * Returns if any key is 'down'. Also set all 'down' keys to 'handling'.
     */
    isAnyKeyDownAndUnhandled() {
        let anyKeyDown = false;

        for (let [key, value] of this._keyState) {
            if (value === 'down') {
                this._keyState.set(key, 'handling');
                anyKeyDown = true;
            }
        }

        return anyKeyDown;
    }

    _eventToState(e, state) {
        switch (e.keyCode) {
            case 37: // left
                this._setState('left', state);
                e.preventDefault();
                break;
            case 38: // up
                this._setState('up', state);
                e.preventDefault();
                break;
            case 39: // right
                this._setState('right', state);
                e.preventDefault();
                break;
            case 40: // down
                this._setState('down', state);
                e.preventDefault();
                break;
            case 32: // space   (reroutes to enter)
            case 80: // 'p'     (reroutes to enter)
            case 27: // esc     (reroutes to enter)
            case 13: // enter key
                this._setState('enter', state);
                e.preventDefault();
                break;

            // ignore certain keys
            case 18:    // alt
            case 224:   // apple command (firefox)
            case 17:    // apple command (opera)
            case 91:    // apple command, left (safari/chrome)
            case 93:    // apple command, right (safari/chrome)
                break;

            // prevent losing focus via tab
            case 9:
                e.preventDefault();
                break;

            // all other keys
            default:
                this._setState('other', state);
                break;
        }
    };

    _setState(key, state) {
        // always set 'up'
        if (state === 'up') {
            this._keyState.set(key, 'up');

        // only set 'down' if it is not already handled
        } else if (state === 'down') {
            if (this._keyState.get(key) !== 'handling') {
                this._keyState.set(key, 'down');
            }
        }
    }
}

module.exports = Input;