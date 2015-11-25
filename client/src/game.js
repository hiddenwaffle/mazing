'use strict';

const
    Input       = require('./input'),
    Level       = require('./level'),
    StartScreen = require('./start-screen');

const
    eventBus    = require('./event-bus');

class Game {

    constructor(stage, renderer) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = new Input();
        this._startScreen = new StartScreen(stage, this._input);

        this._level = null;

        this._lastStep = Date.now();

        this._state = 'initialized';
    }

    start() {
        document.body.appendChild(this._renderer.view);

        this._input.start();

        eventBus.register('event.startscreen.end', () => {
            this._switchState('level-in-session');
        });

        this._switchState('startscreen-active');
    }

    stop() {
        this._level.stop();
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

            case 'level-in-session':
                this._level.step(elapsed);
                if (this._level.checkForEndLevelCondition()) {
                    console.log('end of level');
                }
                break;
        }
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

            case 'level-in-session':
                this._levelNumber += 1;
                let currentLevel = this._level;
                if (currentLevel !== null && currentLevel !== undefined) {
                    this._levelNumber = currentLevel.number + 1;
                } else {
                    this._levelNumber = 0;
                }
                this._level = new Level(this._levelNumber, this._input, this._stage);
                this._level.start();
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
}

module.exports = Game;