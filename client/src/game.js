'use strict';

const
    Input       = require('./input'),
    Level       = require('./level'),
    StartScreen = require('./start-screen'),
    LevelEnding = require('./level-ending'),
    GameEnding  = require('./game-ending');

const
    stats       = require('./stats'),
    eventBus    = require('./event-bus'),
    sound       = require('./sound');

Window.meow = () => {
    eventBus.fire({ name: 'event.level.end' });
    eventBus.fire({ name: 'event.level.ending.lastlevel' });
};

class Game {

    constructor(stage, renderer) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = new Input();
        this._startScreen = new StartScreen(stage, this._input);
        this._levelEnding = new LevelEnding(stage, renderer, this._input);
        this._gameEnding = new GameEnding(stage);

        this._level = null;
        this._levelNumber = 0;

        this._lastStep = Date.now();

        this._state = 'initialized';
    }

    start() {
        document.body.appendChild(this._renderer.view);

        this._input.start();
        stats.start();
        sound.start();

        eventBus.register('event.startscreen.end', () => {
            this._switchState('level-starting');
        });

        eventBus.register('event.level.end', () => {
            this._switchState('level-ending');
        });

        eventBus.register('event.level.ending.readyfornext', () => {
            this._switchState('level-starting');
        });

        eventBus.register('event.level.ending.lastlevel', () => {
            this._switchState('game-ending');
        });

        this._switchState('startscreen-active');
    }

    stop() {
        this._level.stop();
        stats.stop();
        sound.stop();
    }

    draw() {
        this._renderer.render(this._stage);
    }

    step() {
        let elapsed = this._calculateElapsed();

        switch (this._state) {
            case 'initialized':
                break;

            case 'startscreen-active':
                this._startScreen.step(elapsed);
                break;

            case 'level-starting':
                this._level.step(elapsed);
                if (this._level.checkForEndLevelCondition()) {
                    eventBus.fire({ name: 'event.level.end' });
                }
                break;

            case 'level-ending':
                this._levelEnding.step(elapsed);
                break;

            case 'game-ending':
                this._gameEnding.step(elapsed);
                break;
        }

        this._resortStageChildren();
    }

    _switchState(state) {
        this._state = state;

        switch (state) {
            case 'initialized':
                // Do nothing
                break;

            case 'startscreen-active':
                this._startScreen.start();
                break;

            case 'level-starting':
                // TODO: Determine if that was the final level
                let currentLevel = this._level;
                if (currentLevel !== null && currentLevel !== undefined) {
                    this._levelNumber = currentLevel.number + 1;
                } else {
                    this._levelNumber = 0;
                }
                this._level = new Level(this._levelNumber, this._input, this._stage, this._levelEnding);
                this._level.start();
                break;

            case 'level-ending':
                this._levelEnding.start(this._levelNumber);
                this._level.stop();
                break;

            case 'game-ending':
                this._gameEnding.start();
                break;
        }
    }

    _calculateElapsed() {
        let elapsed = Date.now() - this._lastStep;
        if (elapsed > 1000) {
            elapsed = 1000; // enforce speed limit
        }

        this._lastStep = Date.now();
        return elapsed;
    }

    /**
     * Re-sort the stage children to their z-order, if any.
     * @private
     */
    _resortStageChildren() {
        this._stage.children.sort((a, b) => {
            if (a.z === undefined || a.z === null) {
                return -1;

            } else if (b.z === undefined || b.z === null) {
                return 1;

            } else {
                return b.z - a.z;
            }
        });
    }
}

module.exports = Game;