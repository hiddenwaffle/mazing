'use strict';

const Constants = require('./constants');
const Entity = require('./entity');
const AI = require('./ai');

class CharacterManager {

    constructor() {
        this._pacman = new Entity(
            13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
            23 * Constants.wallSize,
            'left',
            0xffff00,
            AI.doNothing,
            AI.doNothing
        );

        this._ghosts = [];

        this._blinky = new Entity(
            13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
            11 * Constants.wallSize,
            'left',
            0xff0000,
            AI.blinky,
            AI.blinkyScatter
        );
        this._ghosts.push(this._blinky);

        this._pinky = new Entity(
            13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
            11 * Constants.wallSize,
            'left',
            0xffb9ff,
            AI.pinky,
            AI.pinkyScatter
        );
        this._ghosts.push(this._pinky);

        this._inky = new Entity(
            13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
            11 * Constants.wallSize,
            'left',
            0x00ffff,
            AI.inky,
            AI.inkyScatter
        );
        this._ghosts.push(this._inky);

        this._clyde = new Entity(
            13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
            11 * Constants.wallSize,
            'left',
            0xffb950,
            AI.clyde,
            AI.clydeScatter
        );
        this._ghosts.push(this._clyde);
    }

    changeSpeed(pacmanNormal, ghostNormal) {
        this._pacman.speed = Constants.topSpeed * pacmanNormal;
        for (let ghost of this._ghosts) {
            ghost.speed = Constants.topSpeed * ghostNormal;
        }
    }

    get pacman() {
        return this._pacman;
    }

    get blinky() {
        return this._blinky;
    }

    get pinky() {
        return this._pinky;
    }

    get inky() {
        return this._inky;
    }

    get clyde() {
        return this._clyde;
    }

    get ghosts() {
        return this._ghosts;
    }
}

// Have to do these exports this way to band-aid around cyclical dependencies
// (keep that in mind for the next project)
const manager = new CharacterManager();
exports.manager = manager;
exports.pacman = manager.pacman;
exports.blinky = manager.blinky;
exports.pinky = manager.pinky;
exports.inky = manager.inky;
exports.clyde = manager.clyde;
exports.ghosts = manager.ghosts;
