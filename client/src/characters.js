const Constants = require('./constants');
const Entity = require('./entity');

let pacman = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    23 * Constants.wallSize,
    'left',
    0.155, // px/ms (this is 80%, 100% is 0.19375)
    0xffff00
);
exports.pacman = pacman;

let ghosts = [];

let blinky = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    11 * Constants.wallSize,
    'left',
    0.1453125, // px/ms (this is 75%)
    0xff0000
);
ghosts.push(blinky);
exports.blinky = blinky;

exports.ghosts = ghosts;