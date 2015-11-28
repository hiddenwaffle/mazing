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

        this._frightTimeLeft = 0;

        //// For debugging the hitbox
        //let primaryColor = new PIXI.Graphics();
        //primaryColor.beginFill(0xffffff, 1);
        //primaryColor.drawRect(0, 0, config.wallSize, config.wallSize);
        //primaryColor.endFill();
        //this._gfx.addChild(primaryColor);
    }

    start(frightTime, frightFlashes) {
        this._frightTime = frightTime;
        this._frightFlashes = frightFlashes;
    }

    step(elapsed) {
        // TODO: See if frightened needs to transition to flashing or flashing needs to stop
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
        this._frightened.visible = true;
        this._frightened.gotoAndPlay(0);
    }

    stopFrightened() {
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
            if (this._frightened !== null &&
                this._flashing !== null &&
                this._frightTimeLeft != 0) {
                // Do not show a directional animation if frightened/flashing.

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
}

module.exports = EntityAnimation;