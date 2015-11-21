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
 * @param bx1 second entity, upper left x-coordinate
 * @param by1 second entity, upper left y-coordinate
 * @param bx2 second entity, bottom right x-coordinate
 * @param by2 second entity, bottom right y-coordinate
 *
 * @returns {boolean}
 */
exports.overlap = function(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
};