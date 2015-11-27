'use strict';

const
    eventBus = require('./event-bus');

const
    TOTAL_BLUR_TRANSITION_TIME = 1000, // ms
    BLUR_INTENSITY = 7;

class LevelEnding {

    constructor(stage, renderer, input) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = input;

        this._blurTransitionTimeLeft = 0;

        this._statsWindow = new PIXI.Container();
        this._statsWindow.z = 10; // custom property
        this._statsWindow.x = 128;
        this._statsWindow.y = 128;
        this._statsWindow.visible = false;
        this._stage.addChild(this._statsWindow);

        let background = new PIXI.Graphics();
        background.beginFill(0xaaaaaa, 0.75);
        background.drawRect(0, 0, 300, 260);
        this._statsWindow.addChild(background);

        let title = new PIXI.Text('End of Round');
        this._statsWindow.addChild(title);
    }

    start() {
        // The last frame of the level should still be visible
        let snapshotTexture = new PIXI.RenderTexture(this._renderer, this._renderer.width, this._renderer.height);
        snapshotTexture.render(this._stage);
        this._thingy = new PIXI.Sprite(snapshotTexture);
        this._stage.addChild(this._thingy);

        this._blurFilter = new PIXI.filters.BlurFilter();
        this._blurFilter.blur = 0;
        this._thingy.filters = [ this._blurFilter ];

        this._blurTransitionTimeLeft = TOTAL_BLUR_TRANSITION_TIME;
    }

    step(elapsed) {
        this._stepGreyTransition(elapsed);
        this._stepStatsWindow();
    }

    _stepGreyTransition(elapsed) {
        if (this._blurTransitionTimeLeft > 0) {
            this._blurTransitionTimeLeft -= elapsed;

            if (this._blurTransitionTimeLeft < 0) {
                this._blurTransitionTimeLeft = 0;
                this._statsWindow.visible = true;

            } else {
                this._blurFilter.blur = BLUR_INTENSITY - ((this._blurTransitionTimeLeft / TOTAL_BLUR_TRANSITION_TIME) * BLUR_INTENSITY);
            }
        }
    }

    _stepStatsWindow(elapsed) {
        if (this._statsWindow.visible) {
            if (this._input.anyKeyPressed) {
                this._stop();
            }
        }
    }

    _stop() {
        this._statsWindow.visible = false;
        this._input.reset();

        this._thingy.filters = null;

        let idx = this._stage.getChildIndex(this._thingy);
        this._stage.removeChildAt(idx);

        eventBus.fire({ name: 'event.level.ending.readyfornext' });
    }
}

module.exports = LevelEnding;