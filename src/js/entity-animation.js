'use strict';

//const
    //config = require('./config');

class EntityAnimation {

    constructor(parentGfx, up, down, left, right, frightened, flashing) {
        this._parentGfx = parentGfx;
        this._gfx = new PIXI.Container();
        parentGfx.addChild(this._gfx);

        this._up = up;
        this._gfx.addChild(up);

        this._down = down;
        this._gfx.addChild(down);

        this._left = left;
        this._gfx.addChild(left);

        this._right = right;
        this._gfx.addChild(right);

        this._frightened = frightened;
        this._gfx.addChild(frightened);

        this._flashing = flashing;
        this._gfx.addChild(flashing);

        this._directionals  = [up, down, left, right];
        this._allclips      = [up, down, left, right, frightened, flashing];

        this._frightTime = 0;
        this._frightFlashes = 0;
        this._frightTimeLeft = 0;
    }

    start(frightTime, frightFlashes) {
        this.stopFrightened(); // hide the fright clips when starting

        this._frightTime = frightTime;
        this._frightFlashes = frightFlashes;
    }

    /**
     * Needed to see if the ghost is frightened and needs to start flashing.
     */
    step(elapsed) {
        if (this._frightTimeLeft > 0) {
            this._frightTimeLeft -= elapsed;

            let solidBlueTime = this._frightFlashes * 500;
            if (this._frightTimeLeft <= solidBlueTime && this._flashing.visible == false) {
                this._frightened.visible = false;
                this._frightened.stop();

                this._flashing.visible = true;
                this._flashing.gotoAndPlay(0);
            }
        }
    }

    stop() {
        // TODO: Not sure
    }

    pause() {
        for (let clip of this._allclips) {
            if (clip.playing) {
                clip.stop();
                clip.paused = true;
            }
        }
    }

    resume() {
        for (let clip of this._allclips) {
            if (clip.paused) {
                clip.play();
                clip.paused = false;
            }
        }
    }

    startFrightened() {
        this._frightTimeLeft = this._frightTime;

        this._frightened.visible = true;
        this._frightened.gotoAndPlay(0);

        // Reset flashing just in case it is going for some ghosts.
        this._flashing.visible = false;
        this._flashing.stop();
    }

    stopFrightened() {
        this._frightTimeLeft = 0;

        this._frightened.visible = false;
        this._frightened.stop();

        this._flashing.visible = false;
        this._flashing.stop();
    }

    changeDirection(direction) {
        // Handle stopped.
        if (direction === '') {
            for (let directional of this._directionals) {
                if (directional.playing) {
                    directional.stop();
                    break;
                }
            }

        // Otherwise start the correct clip.
        } else {
            for (let directional of this._directionals) {
                directional.visible = false;
                directional.stop();
            }

            switch (direction) {
                case 'up':
                    this._up.visible = true;
                    this._up.play();
                    break;
                case 'down':
                    this._down.visible = true;
                    this._down.play();
                    break;
                case 'left':
                    this._left.visible = true;
                    this._left.play();
                    break;
                case 'right':
                    this._right.visible = true;
                    this._right.play();
                    break;
                default:
                    break;
            }
        }
    }

    set visible(value) {
        this._gfx.visible = value;
    }

    get x() {
        return this._gfx.x;
    }

    set x(value) {
        this._gfx.x = value;
    }

    get y() {
        return this._gfx.y;
    }

    set y(value) {
        this._gfx.y = value;
    }

    set alpha(value) {
        this._gfx.alpha = value;
    }
}

module.exports = EntityAnimation;