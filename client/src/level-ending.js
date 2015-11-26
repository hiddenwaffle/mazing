'use strict';

const
    eventBus = require('./event-bus');

const
    totalTime = 3000, // ms
    intensity = 0.75;

class LevelEnding {

    constructor(stage, renderer) {
        this._stage = stage;
        this._renderer = renderer;
        this._timeLeft = 0;
    }

    start() {
        console.log('LevelEnding.start()');

        // The last frame of the level should still be visible
        let snapshotTexture = new PIXI.RenderTexture(this._renderer, this._renderer.width, this._renderer.height);
        snapshotTexture.render(this._stage);
        this._thingy = new PIXI.Sprite(snapshotTexture);
        this._stage.addChild(this._thingy);

        let grayFilter = new PIXI.filters.GrayFilter();
        this._thingy.filters = [ grayFilter ];

        this._timeLeft = totalTime;
    }

    step(elapsed) {
        this._timeLeft -= elapsed;

        if (this._timeLeft <= 0) {
            console.log('LevelEnding.step()');

            let idx = this._stage.getChildIndex(this._thingy);
            this._stage.removeChildAt(idx);

            eventBus.fire({name: 'event.level.ending.readyfornext'});
        }
    }
}

module.exports = LevelEnding;