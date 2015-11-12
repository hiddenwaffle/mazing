const Constants = require('./constants');
const Entity = require('./entity');

let pacman = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    23 * Constants.wallSize,
    'left',
    0.155, // px/ms (this is 80%, 100% is 0.19375)
    0xffff00
);

module.exports = pacman;