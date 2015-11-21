'use strict';

const
    Input   = require('./input'),
    Level   = require('./level');

class Game {

    constructor(stage, renderer) {
        this._stage = stage;
        this._renderer = renderer;
        this._input = new Input();
        this._level = null;

        this._lastStep = Date.now();
    }

    start() {
        document.body.appendChild(this._renderer.view);

        this._input.start();

        // Start the first level
        this._level = new Level(0, this._input, this._stage);
        this._level.start();
    }

    step() {
        let elapsed = Date.now() - this._lastStep;
        if (elapsed > 1000) {
            elapsed = 1000; // enforce speed limit
        }
        this._lastStep = Date.now();

        this._level.step(elapsed);
    }

    draw() {
        this._renderer.render(this._stage);
    }
}

module.exports = Game;