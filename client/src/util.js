let Constants = require('./constants');

exports.convertToTileSpace = function(v) {
    return Math.floor(v / Constants.wallSize);
};
