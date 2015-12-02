'use strict';

const
    Util = require('./util');

const
    eventBus = require('./event-bus');

class Sound {

    constructor() {
        this._punch = new Howl({
            urls: ['assets/punch.m4a']
        });

        this._whams = [
            new Howl({ urls: ['assets/wham1.m4a'] }),
            new Howl({ urls: ['assets/wham2.m4a'] }),
            new Howl({ urls: ['assets/wham3.m4a'] })
        ];
    }

    start() {
        this._playWham = () => {
            let idx = Util.getRandomIntInclusive(0, this._whams.length - 1);
            this._whams[idx].play();
        };
        eventBus.register('event.action.death.pacman', this._playWham);

        this._playPunch = () => {
            this._punch.play();
        };
        eventBus.register('event.action.death.ghost', this._playPunch);
    }

    stop() {
        eventBus.unregister('event.action.death.ghost', this._playWham);
        eventBus.unregister('event.action.death.ghost', this._playPunch);
    }
}

let sound = new Sound();
module.exports = sound;