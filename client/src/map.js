'use strict';

const Util = require('./util');
const Constants = require('./constants');
const Entity = require('./entity');
const pacman = require('./pacman');
const Board = require('./board');

class Map {

    constructor() {

        this._graphics = new PIXI.Container();
        this._graphics.x = 32;
        this._graphics.y = 32;

        this._walls = Board.walls;
        let wallImgs = new PIXI.Container();
        for (let y = 0; y < this._walls.length; y++) {
            let line = this._walls[y];
            for (let x = 0; x < line.length; x++) {
                let wall = this._walls[y][x];

                if (wall === 1) {
                    let wallImg = new PIXI.Graphics();
                    wallImg.beginFill(0x0077ff);
                    wallImg.drawRect(
                        x * Constants.wallSize,
                        y * Constants.wallSize,
                        Constants.wallSize,
                        Constants.wallSize
                    );
                    wallImg.endFill();
                    wallImgs.addChild(wallImg);

                } else if (wall === 2) {
                    let gateImg = new PIXI.Graphics();
                    gateImg.beginFill(0xffaaff);
                    gateImg.drawRect(
                        x * Constants.wallSize,
                        y * Constants.wallSize + (Constants.wallSize / 2),
                        Constants.wallSize,
                        Constants.dotSize
                    );
                    gateImg.endFill();
                    wallImgs.addChild(gateImg);
                }
            }
        }
        this._graphics.addChild(wallImgs);

        this._dots = Board.dots;
        this._dotImgs = new PIXI.Container();
        for (let y = 0; y < this._dots.length; y++) {
            let line = this._dots[y];
            for (let x = 0; x < line.length; x++) {
                let dot = this._dots[y][x];
                switch (dot) {
                    case 1:
                        let dotImg = new PIXI.Graphics();
                        dotImg.beginFill(0xeeeeee);
                        dotImg.drawRect(
                            0, 0,
                            Constants.dotSize, Constants.dotSize
                        );
                        let offset = (Constants.wallSize / 2) - (Constants.dotSize / 2);
                        dotImg.x = x * Constants.wallSize + offset;
                        dotImg.y = y * Constants.wallSize + offset;
                        this._dotImgs.addChild(dotImg);
                        break;
                    default:
                        break;

                }
            }
        }
        this._graphics.addChild(this._dotImgs);

        this._graphics.addChild(pacman.graphics);

        this._ghosts = [];

        let blinky = createBlinky();
        this._graphics.addChild(blinky.graphics);
        this._ghosts.push(blinky);
    }

    step() {
        // https://www.reddit.com/r/todayilearned/comments/2oschi/til_every_time_pacman_eats_a_regular_dot_he_stops/
        if (this._collisionChecks()) {
            // TODO: Check for board clear
        } else {
            pacman.fullstep(this);
        }

        for (let ghost of this._ghosts) {
            ghost.fullstep(this);
        }
    }

    tryMove(srcx, srcy, destx, desty, width, height) {
        let success = false; // whether or not destx and desty and within a wall
        let finalx = srcx;
        let finaly = srcy;
        let doStop = false;

        let destx2 = destx + width - 1;     // TODO: is -1 the right route?
        let desty2 = desty + height - 1;

        let desttilex   = Util.convertToTileSpace(destx);
        let desttilex2  = Util.convertToTileSpace(destx2);
        let desttiley   = Util.convertToTileSpace(desty);
        let desttiley2  = Util.convertToTileSpace(desty2);

        let topLeftFree = this._checkWall(desttilex, desttiley);
        let topRightFree = this._checkWall(desttilex2, desttiley);
        let bottomLeftFree = this._checkWall(desttilex, desttiley2);
        let bottomRightFree = this._checkWall(desttilex2, desttiley2);

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
                        doStop = true;
                    }

                } else {
                    // movement is to the right

                    if (desttilex2 === 28 && desttiley === 14) {
                        finalx = 1; // handle wraparound
                    } else {
                        finalx = desttilex * Constants.wallSize; // get left edge of boundary of the blocking tile
                        doStop = true;
                    }
                }

            } else if (desty != srcy) { // vertical
                finalx = destx;

                if (desty < srcy) {
                    // movement is upwards
                    // get bottom edge of boundary of the blocking tile
                    finaly = desttiley2 * Constants.wallSize;
                    doStop = true;

                } else {
                    // movement is downwards
                    // get top edge of boundary of the blocking tile
                    finaly = desttiley * Constants.wallSize;
                    doStop = true;
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

    get graphics() {
        return this._graphics;
    }

    _checkWall(x, y) {
        let row = this._walls[y];
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

    _collisionChecks() {
        let collision = false;

        for (let idx = this._dotImgs.children.length - 1; idx >= 0; idx--) {
            let dotImg = this._dotImgs.getChildAt(idx);
            if (pacman.overlaps(dotImg)) {
                this._dotImgs.removeChildAt(idx);
                collision = true;
            }
        }

        return collision;
    }
}

let map = new Map();
module.exports = map;

function createBlinky() {
    return new Entity(
        13 * Constants.wallSize + Math.floor(Constants.wallSize / 2),
        11 * Constants.wallSize,
        'left',
        0.1453125, // px/ms (this is 75%)
        0xff0000
    );
}