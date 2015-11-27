'use strict';

class GameEnding {

    constructor(stage) {
        this._stage = stage;

        this._statsWindow = new PIXI.Container();
        this._statsWindow.z = 11; // custom property
        this._statsWindow.x = 128;
        this._statsWindow.y = 128;
        this._statsWindow.visible = false;
        this._stage.addChild(this._statsWindow);

        let background = new PIXI.Graphics();
        background.beginFill(0xbbbbbb, 1);
        background.drawRect(0, 0, 400, 310);
        this._statsWindow.addChild(background);

        let title = new PIXI.Text('End of Game');
        this._statsWindow.addChild(title);
    }

    start() {
        this._statsWindow.visible = true;
    }

    step(elapsed) {
        //
    }
}

module.exports = GameEnding;