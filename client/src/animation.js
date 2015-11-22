'use strict';

const
    config          = require('./config');

class Animation {

    constructor(parentGfx, color, frightColor) {
        this._gfx = new PIXI.Container();
        parentGfx.addChild(this._gfx);

        this._primaryColor = new PIXI.Graphics();
        this._primaryColor.beginFill(color, 1);
        this._primaryColor.drawRect(0, 0, config.wallSize, config.wallSize);
        this._primaryColor.endFill();
        this._gfx.addChild(this._primaryColor);

        this._blue = new PIXI.Graphics();
        this._blue.beginFill(frightColor, 1);
        this._blue.drawRect(0, 0, config.wallSize, config.wallSize);
        this._blue.endFill();
        this._blue.visible = false;
        this._gfx.addChild(this._blue);
    }

    step(elapsed) {
        //
    }

    showBlue(visible) {
        this._blue.visible = visible;
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

module.exports = Animation;