'use strict';

const
    Input   = require('./input'),
    Level   = require('./level'),
    Pause   = require('./pause');

class Game {

    constructor(stage, renderer) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = new Input();
        this._level = null;

        this._lastStep = Date.now();

        this._pause = new Pause(stage);
    }

    start() {
        document.body.appendChild(this._renderer.view);

        this._input.start();
        this._pause.start();

        // Prepare the first level
        this._level = new Level(0, this._input, this._stage);
        this._level.start();
    }

    step() {
        let elapsed = this._calculateElapsed();

        this._stepPaused(elapsed, this._input.switchIfUserHitPauseButton());

        if (this._pause.active) {
            // TODO: count how many milliseconds paused

        } else {
            this._level.step(elapsed);
        }
    }

    draw() {
        this._renderer.render(this._stage);
    }

    _stepPaused(elapsed, flipPause) {
        if (flipPause) {
            this._pause.flip();
        }

        this._pause.step(elapsed);
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