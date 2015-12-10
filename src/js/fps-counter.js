'use strict';

const
    eventBus = require('./event-bus');

class FpsCounter {

    constructor(stage, input) {
        this._stage = stage;
        this._input = input;

        this._gfx = new PIXI.Container();
        this._gfx.x = 8;
        this._gfx.y = 8;
        this._stage.addChild(this._gfx);

        let style = {
            font: '16px Arial',
            fill: '#eeeeee'
        };

        this._text = new PIXI.Text('logic:', style);
        this._text.visible = false;
        this._gfx.addChild(this._text);

        this._gfxText = new PIXI.Text('draw:', style);
        this._gfxText.x = 96;
        this._gfxText.visible = false;
        this._gfx.addChild(this._gfxText);

        this._elapsed = 0;
        this._counter = 0;
        this._drawCounter = 0;
    }

    start() {
        //
    }

    step(elapsed) {
        this._handleInput();
        this._update(elapsed);
    }

    _handleInput() {
        if (this._input.isDownAndUnhandled('f')) {
            this._text.visible = !this._text.visible;
            this._gfxText.visible = !this._gfxText.visible;
        }
    }

    _update(elapsed) {
        if (this._text.visible) {
            this._elapsed += elapsed;
            this._counter += 1;

            if (this._elapsed >= 1000) {
                this._text.text = 'logic: ' + this._counter.toFixed(2);
                this._gfxText.text = 'draw: ' + this._drawCounter.toFixed(2);

                // Reset same as how the constructor does.
                this._elapsed -= 1000;
                this._counter = 0;
                this._drawCounter = 0;
            }
        }
    }

    stepRender() {
        if (this._gfxText.visible) {
            this._drawCounter += 1;
        }
    }

    /**
     * TODO: Not sure if this will ever be called anyway.
     */
    stop() {
        this._stage.removeChild(this._gfx);
        // TODO: Destroy graphics?
    }
}

module.exports = FpsCounter;