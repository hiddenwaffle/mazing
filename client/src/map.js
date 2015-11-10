let Constants = require('./constants');

function Map () {
    //
}

Map.prototype.tryMove = function (srcx, srcy, destx, desty, width, height) {
    let success = false; // whether or not destx and desty and within a wall
    let finalx = srcx;
    let finaly = srcy;
    let doStop = false;

    let destx2 = destx + width - 1;     // TODO: is -1 the right route?
    let desty2 = desty + height - 1;

    let desttilex   = convertToTileSpace(destx);
    let desttilex2  = convertToTileSpace(destx2);
    let desttiley   = convertToTileSpace(desty);
    let desttiley2  = convertToTileSpace(desty2);

    let topLeftFree = checkWall(desttilex, desttiley);
    let topRightFree = checkWall(desttilex2, desttiley);
    let bottomLeftFree = checkWall(desttilex, desttiley2);
    let bottomRightFree = checkWall(desttilex2, desttiley2);

    // Assumption: Moving either horizontally or vertically, but not both.

    if (topLeftFree && topRightFree && bottomLeftFree && bottomRightFree) {
        success = true;
        finalx = destx;
        finaly = desty;

    } else {
        if (destx != srcx) { // horizontal
            finaly = desty;

            if (destx < srcx) {
                // movement is to the left

                if (desttilex === -1 && desttiley === 14) {
                    finalx = (Constants.wallSize * 27) - 1; // handle wraparound
                } else {
                    finalx = desttilex2 * Constants.wallSize; // get right edge of boundary of the blocking tile
                }

            } else {
                // movement is to the right

                if (desttilex2 === 28 && desttiley === 14) {
                    finalx = 1; // handle wraparound
                } else {
                    finalx = desttilex * Constants.wallSize; // get left edge of boundary of the blocking tile
                }
            }

        } else if (desty != srcy) { // vertical
            finalx = destx;

            if (desty < srcy) {
                // movement is upwards
                // get bottom edge of boundary of the blocking tile
                finaly = desttiley2 * Constants.wallSize;

            } else {
                // movement is downwards
                // get top edge of boundary of the blocking tile
                finaly = desttiley * Constants.wallSize;
            }
        }
    }

    return {
        success: success,
        finalx: finalx,
        finaly: finaly,
        doStop: doStop
    };
};

Map.prototype.convertToTileSpace = convertToTileSpace;

function convertToTileSpace (v) {
    return Math.floor(v / Constants.wallSize);
}

function checkWall(x, y) {
    let row = Constants.walls[y];
    if (row !== undefined) {
        let wall = row[x];
        if (wall !== undefined) {
            if (wall === 0) {
                return true;
            } else if (wall === 1) {
                return false;
            }
        }
    }

    return false;
}

let map = new Map();
module.exports = map;