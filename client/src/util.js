const
    config = require('./config');

exports.convertToTileSpace = function(v) {
    return Math.floor(v / config.wallSize);
};

/**
 * @param ax1 first rectangle, upper left x-coordinate
 * @param ay1 first rectangle, upper left y-coordinate
 * @param ax2 first rectangle, bottom right x-coordinate
 * @param ay2 first rectangle, bottom right y-coordinate
 * @param bx1 second rectangle, upper left x-coordinate
 * @param by1 second rectangle, upper left y-coordinate
 * @param bx2 second rectangle, bottom right x-coordinate
 * @param by2 second rectangle, bottom right y-coordinate
 *
 * @returns {boolean}
 */
exports.overlap = function(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
exports.getRandomIntInclusive = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Distance formula without the square root.
 * Intended for finding the order of distances without needing the actual distance of each.
 */
exports.qs = function (a, b) {
    return (a * a) + (b * b);
};
