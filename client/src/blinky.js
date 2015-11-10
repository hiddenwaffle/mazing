let Constants = require('./constants');
let Entity = require('./entity');

let blinky = new Entity(
    13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
    11 * Constants.wallSize,
    'left',
    0.1453125, // px/ms (this is 75%)
    0xff0000
);

module.exports = blinky;