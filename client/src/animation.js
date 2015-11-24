'use strict';

const
    config          = require('./config');

class Animation {

    constructor(parentGfx, color, frightColor) {
        this._gfx = new PIXI.Container();
        parentGfx.addChild(this._gfx);

        this._color = color;
        this._frightColor = frightColor;

        let primaryColor = new PIXI.Graphics();
        primaryColor.beginFill(color, 1);
        primaryColor.drawRect(0, 0, config.wallSize, config.wallSize);
        primaryColor.endFill();
        //let primaryTexture = primaryColor.generateTexture();
        this._gfx.addChild(primaryColor);
    }

    start(frightTime, frightFlashes) {
        // TODO: Create up, down, left, right textures
        this._generateBlue(frightTime, frightFlashes);
    }

    step(elapsed) {
        // TODO: Necessary? MovieClips use the requestAnimationFrame timer.
    }

    showBlue(visible) {
        if (visible) {
            this._blue.gotoAndPlay(0);
        } else {
            this._blue.stop();
        }

        this._blue.visible = visible;
    }

    pause() {
        if (this._blue.playing) {
            this._blue.stop();
            this._blue.paused = true;
        }
    }

    resume() {
        if (this._blue.paused) {
            this._blue.play();
            this._blue.paused = false;
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

    _generateBlue(frightTime, frightFlashes) {
        //let testAnim = new PIXI.Graphics();
        //testAnim.beginFill(0xffffff, 1);
        //testAnim.drawRect(0, 0, config.wallSize, config.wallSize);
        //primaryColor.endFill();
        //let testTexture = testAnim.generateTexture();
        //
        //let textureArray = [
        //    { texture: primaryTexture,  time: config.flashSpeed },
        //    { texture: testTexture,     time: config.flashSpeed }
        //];
        //let primaryMovie = new PIXI.extras.MovieClip(textureArray);
        //primaryMovie.play();
        //
        //this._gfx.addChild(primaryMovie);

        let blueGraphics = new PIXI.Graphics();
        blueGraphics.beginFill(this._frightColor, 1);
        blueGraphics.drawRect(0, 0, config.wallSize, config.wallSize);
        blueGraphics.endFill();
        let blueTexture = blueGraphics.generateTexture();

        let solidBlueTime = frightTime - ((frightFlashes - 1) * 500);

        let blueTextureArray = [
            { texture: blueTexture,         time: solidBlueTime }
        ];
        for (let count = 0; count < frightFlashes - 1; count++) {
            blueTextureArray.push({ texture: PIXI.Texture.EMPTY,  time: config.flashSpeed });
            blueTextureArray.push({ texture: blueTexture,         time: config.flashSpeed });
        }

        this._blue = new PIXI.extras.MovieClip(blueTextureArray);
        this.paused = true; // TODO: Not sure of a better way to attach a custom property
        this._blue.loop = false;

        this._gfx.addChild(this._blue);
        this._blue.visible = false;
    }
}

module.exports = Animation;