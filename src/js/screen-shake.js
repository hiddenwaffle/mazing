'use strict';

const
    Util = require('./util');

const
    eventBus = require('./event-bus');

const
    START_TIME_LEFT = 200,
    START_INTENSITY = 40;

class ScreenShake {

    constructor() {
        this._shakeTimeLeft = 0;
        this._intensity = 0;

        this._gfx = null;
        this._originalx = 0;
        this._originaly = 0;

        this._onShakeStart = () => {
            this._handleShakingStart();
        };
    }

    start(gfx) {
        this._gfx = gfx;
        this._originalx = this._gfx.x;
        this._originaly = this._gfx.y;

        eventBus.register('event.screenshake.start', this._onShakeStart);
    }

    step(elapsed) {
        if (this._shakeTimeLeft > 0) {
            this._shakeTimeLeft -= elapsed;
            if (this._shakeTimeLeft <= 0) {
                this._shakeTimeLeft = 0;
                this._intensity = 0;
                this._resetPosition();

            } else {
                let pct = 1 - (this._shakeTimeLeft / START_TIME_LEFT);
                let { x, y } = calculateNextPosition(pct, this._intensity, this._originalx, this._originaly);
                this._gfx.x = x;
                this._gfx.y = y;
            }
        }
    }

    stop() {
        this._resetPosition();
        eventBus.unregister('event.screenshake.start', this._onShakeStart);
    }

    _handleShakingStart() {
        this._shakeTimeLeft = START_TIME_LEFT;
        this._intensity = START_INTENSITY;
    }

    _resetPosition() {
        this._gfx.x = this._originalx;
        this._gfx.y = this._originaly;
    }
}

let screenShake = new ScreenShake();
module.exports = screenShake;

/**
 * Pick a random point near the given point
 */
function calculateNextPosition(pct, intensity, originalx, originaly) {

    // TODO: Use a non-linear easing function
    let halfmax = (pct * intensity) / 2;
    let offsetx = Util.getRandomIntInclusive(0 - halfmax, halfmax);
    let offsety = Util.getRandomIntInclusive(0 - halfmax, halfmax);

    let targetx = originalx + offsetx;
    let targety = originaly + offsety;

    return {
        x: targetx,
        y: targety
    };
}