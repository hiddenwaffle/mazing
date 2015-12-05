'use strict';

const
    soundLoader = require('./sound-loader');

class Preload {

    constructor() {
        this._sfxLoaded = false;
        this._gfxLoaded = false;
        this._afterFinished = null;
    }

    start(afterFinished) {
        this._afterFinished = afterFinished;

        PIXI.loader.add('assets/pac-test.json').load(() => {
            this._gfxLoaded = true;
            this._handleIfFinished();
        });

        soundLoader.load([
            'assets/punch.m4a',
            'assets/wham1.m4a',
            'assets/wham2.m4a',
            'assets/wham3.m4a',
            'assets/energizer.m4a',
            'assets/happy-energy.m4a',
            'assets/crackles.m4a',
            'assets/atari-st-beat-11.m4a',
            'assets/cool-journey.m4a'
        ], () => {
            this._sfxLoaded = true;
            this._handleIfFinished();
        });
    }

    _handleIfFinished() {
        if ((this._gfxLoaded === true) &&
            (this._sfxLoaded === true)) {

            // Load the rest of the sounds for later use.

            this._afterFinished();
        }
    }
}

let preload = new Preload();
module.exports = preload;