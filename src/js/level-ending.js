'use strict';

const
    eventBus    = require('./event-bus'),
    config      = require('./config');

const
    TOTAL_BLUR_TRANSITION_TIME = 1000, // ms
    BLUR_INTENSITY = 100;

class LevelEnding {

    constructor(stage, renderer, input) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = input;

        this._blurTransitionTimeLeft = 0;

        this._gfx = new PIXI.Container();
        this._gfx.z = 10; // custom property
        this._gfx.x = 220;
        this._gfx.y = 96;
        this._gfx.visible = false;
        this._stage.addChild(this._gfx);

        let background = new PIXI.Graphics();
        background.beginFill(0x333333, 0.95);
        background.drawRect(0, 0, 390, 320);
        this._gfx.addChild(background);

        let titleStyle = {
            font: '36px Arial',
            fill: '#eeeeee',
            align: 'center' // TODO: doesn't work?
        };
        this._title = new PIXI.Text('', titleStyle);
        this._title.x = 36;
        this._title.y = 44;
        this._gfx.addChild(this._title);

        let footerStyle = {
            font: '16px Arial',
            fill: '#e0e0e0',
            align: 'center' // TODO: doesn't work?
        };
        this._footer = new PIXI.Text('', footerStyle);
        this._footer.x = 114;
        this._footer.y = 275;
        this._gfx.addChild(this._footer);

        this._scoreboard = null;
    }

    start(levelNumber) {
        this._levelNumber = levelNumber;
        this._title.text = 'Level ' + (levelNumber+1) + ' Final Score';

        this._updateFooter(levelNumber);

        // The last frame of the level should still be visible
        let snapshotTexture = new PIXI.RenderTexture(this._renderer, this._renderer.width, this._renderer.height);
        snapshotTexture.render(this._stage);
        this._snapshotSprite = new PIXI.Sprite(snapshotTexture);
        this._stage.addChild(this._snapshotSprite);

        this._blurFilter = new PIXI.filters.BlurFilter();
        this._blurFilter.blur = 0;
        this._snapshotSprite.filters = [ this._blurFilter ];

        this._blurTransitionTimeLeft = TOTAL_BLUR_TRANSITION_TIME;

        // The last frame of the scoreboard should still be visible
        let scoreboardTexture = new PIXI.RenderTexture(this._renderer, this._renderer.width, this._renderer.height);
        scoreboardTexture.render(this._scoreboard.gfx);
        this._scoreboardSnapshot = new PIXI.Sprite(scoreboardTexture);
        this._scoreboardSnapshot.x = 90;
        this._scoreboardSnapshot.y = 100;
        this._gfx.addChild(this._scoreboardSnapshot);
    }

    step(elapsed) {
        this._stepGreyTransition(elapsed);
        this._stepStatsWindow();
    }

    set scoreboard(value) {
        this._scoreboard = value;
    }

    _stepGreyTransition(elapsed) {
        if (this._blurTransitionTimeLeft > 0) {
            this._blurTransitionTimeLeft -= elapsed;

            if (this._blurTransitionTimeLeft <= 0) {
                this._blurTransitionTimeLeft = 0;
                this._gfx.visible = true;

            } else {
                this._blurFilter.blur = BLUR_INTENSITY - ((this._blurTransitionTimeLeft / TOTAL_BLUR_TRANSITION_TIME) * BLUR_INTENSITY);
            }
        }
    }

    _stepStatsWindow(elapsed) {
        if (this._gfx.visible) {
            if (this._input.isAnyKeyDownAndUnhandled()) {
                this._stop();
            }
        }
    }

    _stop() {
        this._gfx.visible = false;

        this._snapshotSprite.filters = null;

        let idx = this._stage.getChildIndex(this._snapshotSprite);
        this._stage.removeChildAt(idx);

        let idx2 = this._gfx.getChildIndex(this._scoreboardSnapshot);
        this._gfx.removeChildAt(idx2);

        // TODO: destroy graphics?

        if (this._isFinalLevel()) {
            eventBus.fire({ name: 'event.level.ending.lastlevel' });
        } else {
            eventBus.fire({ name: 'event.level.ending.readyfornext' });
        }
    }

    _isFinalLevel() {
        return this._levelNumber === config.lastLevelIndex();
    }

    _updateFooter(levelNumber) {
        let value;

        if (this._isFinalLevel()) {
            value = '';
        } else {
            let remaining = config.levelSpecifications.length - (levelNumber+1);
            if (remaining === 1) {
                value = 'The final level remains...';
            } else {
                value = (config.levelSpecifications.length - (levelNumber+1)) + ' more levels remain...';
            }
        }

        this._footer.text = value;
    }
}

module.exports = LevelEnding;