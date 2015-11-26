'use strict';

const
    eventBus = require('./event-bus');

const
    TOTAL_GRAY_TRANSITION_TIME = 500, // ms
    GRAY_INTENSITY = 0.75;

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

        this._grayFilter = new PIXI.filters.GrayFilter();
        this._grayFilter.gray = 0;
        this._thingy.filters = [ this._grayFilter ];

        this._timeLeft = TOTAL_GRAY_TRANSITION_TIME;
    }

    step(elapsed) {
        this._timeLeft -= elapsed;

        if (this._timeLeft <= 0) {
            console.log('LevelEnding.step()');

            let idx = this._stage.getChildIndex(this._thingy);
            this._stage.removeChildAt(idx);

            eventBus.fire({name: 'event.level.ending.readyfornext'});

        } else {
            this._grayFilter.gray = GRAY_INTENSITY - (this._timeLeft / TOTAL_GRAY_TRANSITION_TIME);
        }
    }
}

module.exports = LevelEnding;