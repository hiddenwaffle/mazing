const Constants = require('./constants');
const Entity = require('./entity');
const AI = require('./ai');

let pacman = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    23 * Constants.wallSize,
    'left',
    Constants.topSpeed * 0.8,
    0xffff00,
    AI.doNothing
);

let ghosts = [];

let blinky = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    11 * Constants.wallSize,
    'left',
    Constants.topSpeed * 0.75,
    0xff0000,
    AI.blinky
);
ghosts.push(blinky);

exports.pacman = pacman;
exports.blinky = blinky;
exports.ghosts = ghosts;