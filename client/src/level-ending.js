'use strict';

const
    eventBus = require('./event-bus');

class LevelEnding {

    constructor() {
        //
    }

    start() {
        console.log('LevelEnding.start()');
    }

    step(elapsed) {
        console.log('LevelEnding.step()');
        eventBus.fire({ name: 'event.level.ending.readyfornext' });
    }
}

module.exports = LevelEnding;