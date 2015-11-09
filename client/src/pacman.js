let Constants = require('./constants');
let Entity = require('./entity');

let pacman = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    17 * Constants.wallSize,
    'left',
    0.155 // px/ms
);

module.exports = pacman;